/**
 * Central Axios Client Configuration
 * 
 * This module provides a pre-configured Axios instance with:
 * - Base URL from environment
 * - Request interceptor for Authorization header
 * - Response interceptor for error handling
 * - Automatic token refresh on 401 errors
 */

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Base URL from environment variable
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// =============================================================================
// TOKEN REFRESH STATE
// =============================================================================

// Prevent multiple refresh calls
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
    refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
    refreshSubscribers.forEach((cb) => cb(token));
    refreshSubscribers = [];
};

const onRefreshFailed = () => {
    refreshSubscribers = [];
};

// =============================================================================
// REQUEST INTERCEPTOR
// =============================================================================

const PUBLIC_ENDPOINTS = [
    '/auth/login/',
    '/auth/register/',
    '/auth/verify-email/',
    '/auth/resend-verification/',
    '/auth/token/refresh/',
    '/auth/token/verify/',
    '/public/',
];

const addAuthHeader = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Skip auth header for public endpoints
    const url = config.url || '';
    const isPublic = PUBLIC_ENDPOINTS.some((ep) => url.includes(ep));
    if (isPublic) return config;

    // Get auth token from localStorage (only on client side)
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
};

axiosClient.interceptors.request.use(addAuthHeader, (error) => Promise.reject(error));

// =============================================================================
// RESPONSE INTERCEPTOR
// =============================================================================

interface ApiErrorResponse {
    detail?: string;
    message?: string;
    error?: string;
    errors?: Record<string, string[]>;
}

const handleResponseSuccess = (response: AxiosResponse): AxiosResponse => {
    return response;
};

const handleResponseError = async (error: AxiosError<ApiErrorResponse>): Promise<AxiosResponse | never> => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Network error (no response)
    if (!error.response) {
        throw new Error('Network error. Please check your connection.');
    }

    const { status, data } = error.response;

    // Handle 401 Unauthorized - attempt token refresh
    if (status === 401 && !originalRequest._retry) {
        // Skip refresh for auth endpoints to prevent loops
        const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
            originalRequest.url?.includes('/auth/register') ||
            originalRequest.url?.includes('/auth/token/refresh');

        if (isAuthEndpoint) {
            return Promise.reject(createEnhancedError(status, data, 'Authentication failed.'));
        }

        if (isRefreshing) {
            // Wait for the ongoing refresh
            return new Promise((resolve, reject) => {
                subscribeTokenRefresh((newToken: string) => {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    originalRequest._retry = true;
                    resolve(axiosClient(originalRequest));
                });
            });
        }

        isRefreshing = true;
        originalRequest._retry = true;

        try {
            const refreshToken = typeof window !== 'undefined'
                ? localStorage.getItem('auth_refresh_token')
                : null;

            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            // Call refresh endpoint directly (avoid circular import)
            const refreshResponse = await axios.post<{ access: string; refresh?: string }>(
                `${API_BASE_URL}/auth/token/refresh/`,
                { refresh: refreshToken }
            );

            const { access, refresh } = refreshResponse.data;

            // Update stored tokens
            if (typeof window !== 'undefined') {
                localStorage.setItem('auth_token', access);
                if (refresh) {
                    localStorage.setItem('auth_refresh_token', refresh);
                }
            }

            // Notify all waiting requests
            onTokenRefreshed(access);
            isRefreshing = false;

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${access}`;
            return axiosClient(originalRequest);

        } catch (refreshError) {
            // Refresh failed - clear tokens and redirect to login
            isRefreshing = false;
            onRefreshFailed();

            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_refresh_token');

                // Redirect to login only if not already there
                if (!window.location.pathname.includes('/admin/login')) {
                    window.location.href = '/admin/login';
                }
            }

            return Promise.reject(createEnhancedError(401, data, 'Session expired. Please log in again.'));
        }
    }

    // Extract error message from various response formats
    let errorMessage = 'An unexpected error occurred.';

    if (data?.detail) {
        errorMessage = data.detail;
    } else if (data?.message) {
        errorMessage = data.message;
    } else if (data?.error) {
        errorMessage = data.error;
    } else if (data?.errors) {
        // Handle DRF validation errors
        const firstError = Object.values(data.errors)[0];
        errorMessage = Array.isArray(firstError) ? firstError[0] : String(firstError);
    }

    // Handle specific HTTP status codes
    switch (status) {
        case 400:
            // Bad request - validation error
            break;
        case 403:
            errorMessage = errorMessage || 'You do not have permission to perform this action.';
            break;
        case 404:
            errorMessage = errorMessage || 'Resource not found.';
            break;
        case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
    }

    throw createEnhancedError(status, data, errorMessage);
};

const createEnhancedError = (
    status: number,
    data: ApiErrorResponse,
    message: string
): Error & { status: number; data: ApiErrorResponse } => {
    const enhancedError = new Error(message) as Error & {
        status: number;
        data: ApiErrorResponse;
    };
    enhancedError.status = status;
    enhancedError.data = data;
    return enhancedError;
};

axiosClient.interceptors.response.use(handleResponseSuccess, handleResponseError);

// =============================================================================
// RETRY LOGIC WRAPPER
// =============================================================================

interface RetryConfig {
    maxRetries?: number;
    retryDelay?: number;
    retryCondition?: (error: AxiosError) => boolean;
}

const defaultRetryCondition = (error: AxiosError): boolean => {
    // Retry on network errors or 5xx server errors (not 401 which is handled by refresh)
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
};

export const withRetry = async <T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    config: RetryConfig = {}
): Promise<AxiosResponse<T>> => {
    const { maxRetries = 3, retryDelay = 1000, retryCondition = defaultRetryCondition } = config;

    let lastError: AxiosError | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await requestFn();
        } catch (error) {
            lastError = error as AxiosError;

            if (attempt < maxRetries && retryCondition(lastError)) {
                // Wait before retrying with exponential backoff
                await new Promise((resolve) => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
            } else {
                throw lastError;
            }
        }
    }

    throw lastError;
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Type guard to check if an error is an Axios error
 */
export const isAxiosError = axios.isAxiosError;

/**
 * Extract error message from any error type
 */
export const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.detail || error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unexpected error occurred.';
};

/**
 * Check if user is authenticated (has valid token)
 */
export const isAuthenticated = (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('auth_token');
};

export default axiosClient;
