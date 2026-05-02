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
import { getAccessToken, setAccessToken, markSessionActive, clearAllTokens, hasSession } from '@/lib/tokenStore';

// Base URL from environment variable
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    // withCredentials is REQUIRED for the browser to send the HttpOnly refresh
    // cookie cross-origin (Vercel → Render). The backend must have
    // CORS_ALLOW_CREDENTIALS=True and the correct CORS_ALLOWED_ORIGINS.
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

/** Timeout for file upload requests (multipart/form-data) — 2 minutes */
export const UPLOAD_TIMEOUT = 120_000;

// =============================================================================
// ACTIVE REQUEST COUNTER
// Used by useServerWakeUp to skip pings when real requests are already in-flight.
// =============================================================================

let _activeRequests = 0;

/** Returns the number of API requests currently in-flight. */
export const getActiveRequestCount = (): number => _activeRequests;

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
    '/auth/forgot-password/',
    '/auth/reset-password/',
    '/auth/token/refresh/',
    '/auth/token/verify/',
    '/auth/social-login/',
    '/public/',
];

const addAuthHeader = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Skip auth header for public endpoints
    const url = config.url || '';
    const isPublic = PUBLIC_ENDPOINTS.some((ep) => url.includes(ep));
    if (isPublic) return config;

    // Attach the in-memory access token to the Authorization header.
    // Never read from localStorage — the token only lives in memory.
    const token = getAccessToken();
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
};

axiosClient.interceptors.request.use(
    (config) => {
        _activeRequests++;
        return addAuthHeader(config);
    },
    (error) => {
        _activeRequests = Math.max(0, _activeRequests - 1);
        return Promise.reject(error);
    }
);

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
    const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
        skipAuthRedirect?: boolean;
    };

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
            // No body — the browser automatically sends the HttpOnly refresh
            // cookie. The backend reads it, rotates it, and returns a new one
            // as a Set-Cookie header along with the new access token in JSON.
            const refreshResponse = await axios.post<{ access: string }>(
                `${API_BASE_URL}/auth/token/refresh/`,
                {},
                { withCredentials: true },
            );

            const { access } = refreshResponse.data;

            // Store only the access token — in memory, never in localStorage.
            setAccessToken(access);
            markSessionActive();

            // Notify all waiting requests
            onTokenRefreshed(access);
            isRefreshing = false;

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${access}`;
            return axiosClient(originalRequest);

        } catch (refreshError) {
            // Refresh failed (cookie expired / invalid) - clear state and redirect
            isRefreshing = false;
            onRefreshFailed();
            clearAllTokens();

            if (typeof window !== 'undefined') {
                const skipAuthRedirect = Boolean(originalRequest?.skipAuthRedirect);
                if (skipAuthRedirect) {
                    return Promise.reject(createEnhancedError(401, data, 'Session expired. Please log in again.'));
                }

                const path = window.location.pathname || '/';
                const query = window.location.search || '';
                const returnUrl = encodeURIComponent(`${path}${query}`);

                const inAdminArea = path.startsWith('/admin');
                const loginPath = inAdminArea ? '/admin/login' : '/auth/signin';
                const alreadyOnLogin =
                    path === '/admin/login' ||
                    path.startsWith('/auth/signin');

                if (!alreadyOnLogin) {
                    window.location.href = `${loginPath}?returnUrl=${returnUrl}`;
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

axiosClient.interceptors.response.use(
    (response) => {
        _activeRequests = Math.max(0, _activeRequests - 1);
        return handleResponseSuccess(response);
    },
    async (error) => {
        _activeRequests = Math.max(0, _activeRequests - 1);
        return handleResponseError(error);
    }
);

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
/**
 * Returns true when the user likely has an active session.
 * Uses the non-secret sessionStorage marker set on login/register.
 * The actual authentication check happens server-side via the HttpOnly cookie.
 */
export const isAuthenticated = (): boolean => {
    return !!getAccessToken() || hasSession();
};

export default axiosClient;
