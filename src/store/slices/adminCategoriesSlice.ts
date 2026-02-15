import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import adminCategoriesApi from "@/services/adminCategoriesApi";
import type { AdminCategory, AdminCategoryCreatePayload, AdminCategoryUpdatePayload } from "@/services/adminCategoriesApi";
import { getErrorMessage } from "@/lib/axios";
import { CACHE_DURATION, shouldFetch } from "@/lib/cache";
import type { RootState } from "@/store";

// =============================================================================
// TYPES
// =============================================================================

interface AdminCategoriesState {
    categories: AdminCategory[];
    totalCount: number;
    loading: boolean;
    saving: boolean;
    error: string | null;
    lastFetched: number | null;
}

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: AdminCategoriesState = {
    categories: [],
    totalCount: 0,
    loading: false,
    saving: false,
    error: null,
    lastFetched: null,
};

// =============================================================================
// ASYNC THUNKS
// =============================================================================

export const fetchCategories = createAsyncThunk(
    "adminCategories/fetchAll",
    async (options: { forceRefresh?: boolean } | void, { rejectWithValue }) => {
        try {
            const data = await adminCategoriesApi.list();
            return data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    },
    {
        condition(options, { getState }) {
            const { adminCategories } = getState() as RootState;
            if (options?.forceRefresh) return !adminCategories.loading;
            return shouldFetch(adminCategories.lastFetched, adminCategories.loading, CACHE_DURATION.MEDIUM);
        },
    }
);

export const createCategory = createAsyncThunk(
    "adminCategories/create",
    async (data: AdminCategoryCreatePayload, { rejectWithValue }) => {
        try {
            return await adminCategoriesApi.create(data);
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const updateCategory = createAsyncThunk(
    "adminCategories/update",
    async ({ id, data }: { id: string; data: AdminCategoryUpdatePayload }, { getState, rejectWithValue }) => {
        try {
            // Find the category to get its slug for the API call
            const { adminCategories } = getState() as RootState;
            const category = adminCategories.categories.find((c) => c.id === id);
            const slug = category?.slug || id;
            return await adminCategoriesApi.update(slug, data);
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const deleteCategory = createAsyncThunk(
    "adminCategories/delete",
    async (id: string, { getState, rejectWithValue }) => {
        try {
            // Find the category to get its slug for the API call
            const { adminCategories } = getState() as RootState;
            const category = adminCategories.categories.find((c) => c.id === id);
            const slug = category?.slug || id;
            await adminCategoriesApi.delete(slug);
            return id;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

// =============================================================================
// SLICE
// =============================================================================

const adminCategoriesSlice = createSlice({
    name: "adminCategories",
    initialState,
    reducers: {
        clearError(state) {
            state.error = null;
        },
        invalidateCache(state) {
            state.lastFetched = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = action.payload.results;
                state.totalCount = action.payload.count;
                state.lastFetched = Date.now();
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create
            .addCase(createCategory.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(createCategory.fulfilled, (state, action) => {
                state.saving = false;
                state.categories.push(action.payload);
                state.totalCount += 1;
            })
            .addCase(createCategory.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload as string;
            })
            // Update
            .addCase(updateCategory.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                state.saving = false;
                const idx = state.categories.findIndex((c) => c.id === action.payload.id);
                if (idx !== -1) {
                    state.categories[idx] = action.payload;
                }
            })
            .addCase(updateCategory.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload as string;
            })
            // Delete
            .addCase(deleteCategory.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.saving = false;
                state.categories = state.categories.filter((c) => c.id !== action.payload);
                state.totalCount -= 1;
            })
            .addCase(deleteCategory.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError, invalidateCache } = adminCategoriesSlice.actions;
export default adminCategoriesSlice.reducer;
