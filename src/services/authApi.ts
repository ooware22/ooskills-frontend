/**
 * Authentication API Service
 * 
 * Provides typed functions for all auth endpoints.
 * Uses the centralized axios client.
 */

import axiosClient from '@/lib/axios';
import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    SocialLoginRequest,
    TokenRefreshResponse,
    User,
    ProfileUpdateRequest,
    ChangePasswordRequest,
    MessageResponse,
    TOKEN_KEYS,
} from '@/types/auth';

// =============================================================================
// API ENDPOINTS
// =============================================================================

const ENDPOINTS = {
    login: '/auth/login/',
    register: '/auth/register/',
    socialLogin: '/auth/social-login/',
    refresh: '/auth/token/refresh/',
    verify: '/auth/token/verify/',
    profile: '/auth/me/',
    changePassword: '/auth/change-password/',
    logout: '/auth/logout/',
    referralCode: '/auth/my-referral-code/',
    referrals: '/auth/my-referrals/',
} as const;

// =============================================================================
// TOKEN MANAGEMENT
// =============================================================================

/** Get stored access token */
export const getAccessToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
};

/** Get stored refresh token */
export const getRefreshToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_refresh_token');
};

/** Store tokens in localStorage */
export const setTokens = (access: string, refresh: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_token', access);
    localStorage.setItem('auth_refresh_token', refresh);
};

/** Clear all tokens from localStorage */
export const clearTokens = (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_refresh_token');
};

/** Check if user has tokens stored */
export const hasStoredTokens = (): boolean => {
    return !!getAccessToken() && !!getRefreshToken();
};

// =============================================================================
// AUTH API FUNCTIONS
// =============================================================================

/**
 * Login with email and password
 * Returns tokens and user data
 */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosClient.post<LoginResponse>(ENDPOINTS.login, credentials);
    const { access, refresh, user } = response.data;

    // Store tokens
    setTokens(access, refresh);

    return response.data;
};

/**
 * Register a new user
 * Returns tokens and user data
 * Always uses FormData since backend only accepts multipart/form-data
 */
export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            if (key === 'newsletter_subscribed') {
                formData.append(key, value ? 'true' : 'false');
            } else {
                formData.append(key, value as string | Blob);
            }
        }
    });

    const response = await axiosClient.post<RegisterResponse>(ENDPOINTS.register, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

    const { tokens } = response.data;

    // Store tokens
    setTokens(tokens.access, tokens.refresh);

    return response.data;
};

/**
 * Social login with Google or Facebook
 * Exchanges authorization code for tokens
 */
export const socialLogin = async (data: SocialLoginRequest): Promise<RegisterResponse> => {
    const response = await axiosClient.post<RegisterResponse>(ENDPOINTS.socialLogin, data);
    const { tokens } = response.data;

    // Store tokens
    setTokens(tokens.access, tokens.refresh);

    return response.data;
};

/**
 * Refresh the access token using refresh token
 * Called automatically by axios interceptor on 401
 */
export const refreshAccessToken = async (refreshToken: string): Promise<TokenRefreshResponse> => {
    const response = await axiosClient.post<TokenRefreshResponse>(
        ENDPOINTS.refresh,
        { refresh: refreshToken }
    );

    const { access, refresh } = response.data;

    // Update stored access token
    if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', access);
        // If backend returns new refresh token, update it
        if (refresh) {
            localStorage.setItem('auth_refresh_token', refresh);
        }
    }

    return response.data;
};

/**
 * Verify if a token is valid
 */
export const verifyToken = async (token: string): Promise<boolean> => {
    try {
        await axiosClient.post(ENDPOINTS.verify, { token });
        return true;
    } catch {
        return false;
    }
};

/**
 * Get current user profile
 */
export const getProfile = async (): Promise<User> => {
    const response = await axiosClient.get<User>(ENDPOINTS.profile);
    return response.data;
};

/**
 * Update current user profile
 */
export const updateProfile = async (data: ProfileUpdateRequest): Promise<User> => {
    // Handle file upload if avatar is a File
    if (data.avatar instanceof File) {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, value as string | Blob);
            }
        });

        const response = await axiosClient.patch<User>(ENDPOINTS.profile, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    }

    const response = await axiosClient.patch<User>(ENDPOINTS.profile, data);
    return response.data;
};

/**
 * Change user password
 */
export const changePassword = async (data: ChangePasswordRequest): Promise<MessageResponse> => {
    const response = await axiosClient.post<MessageResponse>(ENDPOINTS.changePassword, data);
    return response.data;
};

/**
 * Logout (clear tokens client-side)
 * The backend doesn't invalidate JWT tokens (stateless)
 */
export const logout = async (): Promise<void> => {
    try {
        // Notify backend (optional, stateless JWT)
        await axiosClient.post(ENDPOINTS.logout);
    } catch {
        // Ignore errors, still clear tokens
    } finally {
        clearTokens();
    }
};

// =============================================================================
// EXPORT ALL
// =============================================================================

export const authApi = {
    login,
    register,
    socialLogin,
    refreshAccessToken,
    verifyToken,
    getProfile,
    updateProfile,
    changePassword,
    logout,
    // Token helpers
    getAccessToken,
    getRefreshToken,
    setTokens,
    clearTokens,
    hasStoredTokens,
};

export default authApi;
