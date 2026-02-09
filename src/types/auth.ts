/**
 * Authentication Types
 * 
 * TypeScript interfaces for auth-related data structures
 * matching the Django backend serializers.
 */

// =============================================================================
// USER TYPES
// =============================================================================

/** User role enum matching backend UserRole */
export type UserRole = 'USER' | 'INSTRUCTOR' | 'ADMIN' | 'SUPER_ADMIN';

/** User status enum matching backend UserStatus */
export type UserStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';

/** User data from login/profile responses */
export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name?: string;
    display_name?: string;
    phone?: string;
    wilaya?: string;
    wilaya_name?: string;
    avatar?: string | null;
    avatar_url?: string | null;
    avatar_display_url?: string | null;
    role: UserRole;
    status: UserStatus;
    email_verified?: boolean;
    language?: string;
    newsletter_subscribed?: boolean;
    date_joined?: string;
    last_login?: string;
    referral_code?: string | null;
}

/** Compact user data returned in login response */
export interface LoginUser {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    status: UserStatus;
}

// =============================================================================
// TOKEN TYPES
// =============================================================================

/** JWT token pair */
export interface AuthTokens {
    access: string;
    refresh: string;
}

// =============================================================================
// REQUEST TYPES
// =============================================================================

/** Login request payload */
export interface LoginRequest {
    email: string;
    password: string;
}

/** Registration request payload */
export interface RegisterRequest {
    email: string;
    password: string;
    password_confirm: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    wilaya?: string;
    referral_code?: string;
    newsletter_subscribed?: boolean;
    avatar?: File | null;
}

/** Social login request payload */
export interface SocialLoginRequest {
    provider: 'google' | 'facebook';
    code: string;
    redirect_uri: string;
}

/** Password change request */
export interface ChangePasswordRequest {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
}

/** Profile update request */
export interface ProfileUpdateRequest {
    first_name?: string;
    last_name?: string;
    phone?: string;
    wilaya?: string;
    avatar?: File | null;
    language?: string;
    newsletter_subscribed?: boolean;
}

// =============================================================================
// RESPONSE TYPES
// =============================================================================

/** Login response from /api/auth/login/ */
export interface LoginResponse {
    access: string;
    refresh: string;
    user: LoginUser;
}

/** Registration response from /api/auth/register/ */
export interface RegisterResponse {
    user: User;
    tokens: AuthTokens;
    message: string;
}

/** Token refresh response from /api/auth/token/refresh/ */
export interface TokenRefreshResponse {
    access: string;
    refresh?: string; // Some implementations return new refresh token
}

/** Generic message response */
export interface MessageResponse {
    message: string;
    detail?: string;
}

// =============================================================================
// AUTH STATE TYPES
// =============================================================================

/** Auth state for Redux store */
export interface AuthState {
    user: User | null;
    tokens: AuthTokens | null;
    isAuthenticated: boolean;
    isInitialized: boolean;
    loading: boolean;
    error: string | null;
}

/** Token storage keys */
export const TOKEN_KEYS = {
    ACCESS: 'auth_token',
    REFRESH: 'auth_refresh_token',
} as const;
