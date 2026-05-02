/**
 * Authentication API Service
 * 
 * Provides typed functions for all auth endpoints.
 * Uses the centralized axios client.
 */

import axiosClient from '@/lib/axios';
import { getAccessToken, setAccessToken, markSessionActive, clearAllTokens, hasSession } from '@/lib/tokenStore';
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
// Security: access token is in memory only; refresh token is in an HttpOnly
// cookie managed exclusively by the backend. JS can never read the refresh
// token, making persistent token theft via XSS impossible.
// =============================================================================

/** Returns the current in-memory access token. */
export { getAccessToken };

/** Store only the access token (in memory). The refresh token is a cookie. */
export const setTokens = (access: string): void => {
    setAccessToken(access);
    markSessionActive();
};

/** Clear the in-memory token and the session marker. */
export const clearTokens = (): void => {
    clearAllTokens();
};

/** True when the user likely has a valid session (marker or live access token). */
export const hasStoredTokens = (): boolean => {
    return !!getAccessToken() || hasSession();
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
    const { access } = response.data;

    // Store access token in memory; refresh token arrives as an HttpOnly cookie.
    setTokens(access);

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

    // Store access token in memory; refresh token arrives as an HttpOnly cookie.
    setTokens(tokens.access);

    return response.data;
};

/**
 * Social login with Google or Facebook
 * Exchanges authorization code for tokens
 */
export const socialLogin = async (data: SocialLoginRequest): Promise<RegisterResponse> => {
    const response = await axiosClient.post<RegisterResponse>(ENDPOINTS.socialLogin, data);
    const { tokens } = response.data;

    // Store access token in memory; refresh token arrives as an HttpOnly cookie.
    setTokens(tokens.access);

    return response.data;
};

/**
 * Refresh the access token.
 * No body is sent — the browser automatically includes the HttpOnly
 * refresh-token cookie. The backend rotates it and returns a new one
 * via Set-Cookie, plus the new access token in the JSON body.
 */
export const refreshAccessToken = async (): Promise<TokenRefreshResponse> => {
    const response = await axiosClient.post<TokenRefreshResponse>(ENDPOINTS.refresh);
    const { access } = response.data;
    setTokens(access);
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
 * Logout: clears in-memory token + session marker, tells backend to
 * blacklist the refresh-token cookie and clear it via Set-Cookie.
 */
export const logout = async (): Promise<void> => {
    try {
        await axiosClient.post(ENDPOINTS.logout);
    } catch {
        // Ignore errors, still clear local state
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
    setTokens,
    clearTokens,
    hasStoredTokens,
};

export default authApi;
