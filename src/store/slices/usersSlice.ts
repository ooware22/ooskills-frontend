/**
 * Admin Users Slice
 *
 * Redux slice for admin user management following the same pattern
 * as featuresSlice.ts / faqSlice.ts.
 */

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import adminUsersApi from "@/services/adminUsersApi";
import type { AdminUser, AdminUserCreatePayload, AdminUserUpdatePayload, UserListParams } from "@/services/adminUsersApi";
import { getErrorMessage } from "@/lib/axios";
import type { RootState } from "@/store";

// =============================================================================
// STATE
// =============================================================================

interface UsersState {
    users: AdminUser[];
    totalCount: number;
    currentPage: number;
    loading: boolean;
    saving: boolean;
    error: string | null;
    lastFetched: number | null;
    filters: {
        search: string;
        role: string;
        status: string;
    };
}

const initialState: UsersState = {
    users: [],
    totalCount: 0,
    currentPage: 1,
    loading: false,
    saving: false,
    error: null,
    lastFetched: null,
    filters: {
        search: "",
        role: "all",
        status: "all",
    },
};

// =============================================================================
// ASYNC THUNKS
// =============================================================================

/** Fetch users list with current filters */
export const fetchUsers = createAsyncThunk(
    "adminUsers/fetchUsers",
    async (params: UserListParams | undefined, { rejectWithValue }) => {
        try {
            const data = await adminUsersApi.list(params);
            return data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

/** Create a new user */
export const createUser = createAsyncThunk(
    "adminUsers/createUser",
    async (payload: AdminUserCreatePayload, { rejectWithValue }) => {
        try {
            const user = await adminUsersApi.create(payload);
            return user;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

/** Update an existing user */
export const updateUser = createAsyncThunk(
    "adminUsers/updateUser",
    async ({ id, data }: { id: string; data: AdminUserUpdatePayload }, { rejectWithValue }) => {
        try {
            const user = await adminUsersApi.update(id, data);
            return user;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

/** Soft delete a user */
export const deleteUser = createAsyncThunk(
    "adminUsers/deleteUser",
    async (id: string, { rejectWithValue }) => {
        try {
            await adminUsersApi.delete(id);
            return id;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

/** Activate a user */
export const activateUser = createAsyncThunk(
    "adminUsers/activateUser",
    async (id: string, { rejectWithValue }) => {
        try {
            const user = await adminUsersApi.activate(id);
            return user;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

/** Suspend a user */
export const suspendUser = createAsyncThunk(
    "adminUsers/suspendUser",
    async (id: string, { rejectWithValue }) => {
        try {
            const user = await adminUsersApi.suspend(id);
            return user;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

/** Promote user to admin */
export const promoteUserAdmin = createAsyncThunk(
    "adminUsers/promoteAdmin",
    async (id: string, { rejectWithValue }) => {
        try {
            const user = await adminUsersApi.promoteAdmin(id);
            return user;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

/** Promote user to instructor */
export const promoteUserInstructor = createAsyncThunk(
    "adminUsers/promoteInstructor",
    async (id: string, { rejectWithValue }) => {
        try {
            const user = await adminUsersApi.promoteInstructor(id);
            return user;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

// =============================================================================
// SLICE
// =============================================================================

const usersSlice = createSlice({
    name: "adminUsers",
    initialState,
    reducers: {
        setFilters(state, action: PayloadAction<Partial<UsersState["filters"]>>) {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch users
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload.results;
                state.totalCount = action.payload.count;
                state.lastFetched = Date.now();
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Create user
        builder
            .addCase(createUser.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(createUser.fulfilled, (state, action) => {
                state.saving = false;
                state.users.unshift(action.payload);
                state.totalCount += 1;
            })
            .addCase(createUser.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload as string;
            });

        // Update user
        builder
            .addCase(updateUser.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.saving = false;
                const idx = state.users.findIndex((u) => u.id === action.payload.id);
                if (idx !== -1) state.users[idx] = action.payload;
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload as string;
            });

        // Delete user
        builder
            .addCase(deleteUser.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.saving = false;
                state.users = state.users.filter((u) => u.id !== action.payload);
                state.totalCount -= 1;
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload as string;
            });

        // Action thunks (activate, suspend, promote) — all update the user in place
        const actionCases = [activateUser, suspendUser, promoteUserAdmin, promoteUserInstructor];
        for (const thunk of actionCases) {
            builder
                .addCase(thunk.pending, (state) => {
                    state.saving = true;
                    state.error = null;
                })
                .addCase(thunk.fulfilled, (state, action) => {
                    state.saving = false;
                    const idx = state.users.findIndex((u) => u.id === action.payload.id);
                    if (idx !== -1) state.users[idx] = action.payload;
                })
                .addCase(thunk.rejected, (state, action) => {
                    state.saving = false;
                    state.error = action.payload as string;
                });
        }
    },
});

export const { setFilters, clearError } = usersSlice.actions;
export default usersSlice.reducer;
