/**
 * Authentication Redux Slice
 * 
 * Manages auth state including:
 * - User data
 * - Token management
 * - Login/logout/register flows
 * - Session initialization
 */

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authApi } from "@/services/authApi";
import { getErrorMessage } from "@/lib/axios";
import type { RootState } from "../index";
import type {
    User,
    LoginUser,
    AuthTokens,
    AuthState,
    LoginRequest,
    RegisterRequest,
    SocialLoginRequest,
} from "@/types/auth";

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: AuthState = {
    user: null,
    tokens: null,
    isAuthenticated: false,
    isInitialized: false,
    loading: false,
    error: null,
};

// =============================================================================
// ASYNC THUNKS
// =============================================================================

/**
 * Initialize auth state from stored tokens
 * Called on app load to restore session
 */
export const initializeAuth = createAsyncThunk(
    "auth/initialize",
    async (_, { rejectWithValue }) => {
        try {
            // Check if tokens exist in storage
            if (!authApi.hasStoredTokens()) {
                return { user: null, tokens: null };
            }

            // Validate token by fetching profile
            const user = await authApi.getProfile();
            const tokens: AuthTokens = {
                access: authApi.getAccessToken() || "",
                refresh: authApi.getRefreshToken() || "",
            };

            return { user, tokens };
        } catch (error) {
            // Token invalid or expired - clear and return null
            authApi.clearTokens();
            return { user: null, tokens: null };
        }
    }
);

/**
 * Login with email and password
 */
export const login = createAsyncThunk(
    "auth/login",
    async (credentials: LoginRequest, { rejectWithValue }) => {
        try {
            const response = await authApi.login(credentials);

            // Fetch full profile after login
            const fullUser = await authApi.getProfile();

            return {
                user: fullUser,
                tokens: {
                    access: response.access,
                    refresh: response.refresh,
                },
            };
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

/**
 * Register a new user
 */
export const register = createAsyncThunk(
    "auth/register",
    async (data: RegisterRequest, { rejectWithValue }) => {
        try {
            const response = await authApi.register(data);

            return {
                user: response.user,
                tokens: response.tokens,
            };
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

/**
 * Social login with Google or Facebook
 */
export const socialLogin = createAsyncThunk(
    "auth/socialLogin",
    async (data: SocialLoginRequest, { rejectWithValue }) => {
        try {
            const response = await authApi.socialLogin(data);

            // Fetch full profile after social login
            const fullUser = await authApi.getProfile();

            return {
                user: fullUser,
                tokens: response.tokens,
            };
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

/**
 * Logout - clear tokens and state
 */
export const logout = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            await authApi.logout();
            return null;
        } catch (error) {
            // Still clear local state even if API call fails
            authApi.clearTokens();
            return null;
        }
    }
);

/**
 * Refresh user profile data
 */
export const refreshProfile = createAsyncThunk(
    "auth/refreshProfile",
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState() as RootState;
            if (!state.auth.isAuthenticated) {
                return rejectWithValue("Not authenticated");
            }

            const user = await authApi.getProfile();
            return user;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

// =============================================================================
// SLICE
// =============================================================================

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        /**
         * Set credentials directly (for token refresh)
         */
        setCredentials: (
            state,
            action: PayloadAction<{ user: User | null; tokens: AuthTokens | null }>
        ) => {
            state.user = action.payload.user;
            state.tokens = action.payload.tokens;
            state.isAuthenticated = !!action.payload.user && !!action.payload.tokens;
        },

        /**
         * Clear auth state (logout without API call)
         */
        clearCredentials: (state) => {
            state.user = null;
            state.tokens = null;
            state.isAuthenticated = false;
            state.error = null;
            authApi.clearTokens();
        },

        /**
         * Clear error
         */
        clearError: (state) => {
            state.error = null;
        },

        /**
         * Update user data locally
         */
        updateUser: (state, action: PayloadAction<Partial<User>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },
    },
    extraReducers: (builder) => {
        // Initialize Auth
        builder
            .addCase(initializeAuth.pending, (state) => {
                state.loading = true;
            })
            .addCase(initializeAuth.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.tokens = action.payload.tokens;
                state.isAuthenticated = !!action.payload.user;
                state.isInitialized = true;
                state.loading = false;
                state.error = null;
            })
            .addCase(initializeAuth.rejected, (state) => {
                state.user = null;
                state.tokens = null;
                state.isAuthenticated = false;
                state.isInitialized = true;
                state.loading = false;
            });

        // Login
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.tokens = action.payload.tokens;
                state.isAuthenticated = true;
                state.loading = false;
                state.error = null;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Register
        builder
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.tokens = action.payload.tokens;
                state.isAuthenticated = true;
                state.loading = false;
                state.error = null;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Social Login
        builder
            .addCase(socialLogin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(socialLogin.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.tokens = action.payload.tokens;
                state.isAuthenticated = true;
                state.loading = false;
                state.error = null;
            })
            .addCase(socialLogin.rejected, (state, action) => {
                state.error = action.payload as string;
            });

        // Logout
        builder
            .addCase(logout.pending, (state) => {
                state.loading = true;
            })
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.tokens = null;
                state.isAuthenticated = false;
                state.loading = false;
                state.error = null;
            })
            .addCase(logout.rejected, (state) => {
                // Still clear state on logout failure
                state.user = null;
                state.tokens = null;
                state.isAuthenticated = false;
                state.loading = false;
            });

        // Refresh Profile
        builder
            .addCase(refreshProfile.fulfilled, (state, action) => {
                state.user = action.payload;
            });
    },
});

// =============================================================================
// ACTIONS
// =============================================================================

export const { setCredentials, clearCredentials, clearError, updateUser } = authSlice.actions;

// =============================================================================
// SELECTORS
// =============================================================================

export const selectAuthState = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectIsInitialized = (state: RootState) => state.auth.isInitialized;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectUserRole = (state: RootState) => state.auth.user?.role;
export const selectIsAdmin = (state: RootState) => {
    const role = state.auth.user?.role;
    return role === 'SUPER_ADMIN' || role === 'ADMIN';
};

export default authSlice.reducer;
