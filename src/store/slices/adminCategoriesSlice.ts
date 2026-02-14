import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import adminCategoriesApi from "@/services/adminCategoriesApi";
import type { AdminCategory, AdminCategoryCreatePayload, AdminCategoryUpdatePayload } from "@/services/adminCategoriesApi";

// =============================================================================
// TYPES
// =============================================================================

interface AdminCategoriesState {
    categories: AdminCategory[];
    totalCount: number;
    loading: boolean;
    saving: boolean;
    error: string | null;
}

// =============================================================================
// MOCK DATA
// =============================================================================

const mockCategories: AdminCategory[] = [
    {
        id: "51877b61-8a37-49cf-ae7d-6447be37a768",
        name: { ar: "اللغات", en: "Languages", fr: "Langues" },
        slug: "languages",
        icon: "star",
    },
    {
        id: "a2b3c4d5-e6f7-8901-2345-6789abcdef01",
        name: { ar: "البرمجة", en: "Programming", fr: "Programmation" },
        slug: "programming",
        icon: "code",
    },
    {
        id: "b3c4d5e6-f7a8-9012-3456-789abcdef012",
        name: { ar: "الأعمال", en: "Business", fr: "Affaires" },
        slug: "business",
        icon: "briefcase",
    },
    {
        id: "c4d5e6f7-a8b9-0123-4567-89abcdef0123",
        name: { ar: "التصميم", en: "Design", fr: "Design" },
        slug: "design",
        icon: "palette",
    },
];

// =============================================================================
// ASYNC THUNKS
// =============================================================================

export const fetchCategories = createAsyncThunk(
    "adminCategories/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const response = await adminCategoriesApi.list();
            return response;
        } catch {
            // Fallback to mock data
            return { count: mockCategories.length, next: null, previous: null, results: mockCategories };
        }
    }
);

export const createCategory = createAsyncThunk(
    "adminCategories/create",
    async (data: AdminCategoryCreatePayload, { rejectWithValue }) => {
        try {
            return await adminCategoriesApi.create(data);
        } catch {
            // Mock: add locally
            const newCat: AdminCategory = {
                id: crypto.randomUUID(),
                ...data,
            };
            return newCat;
        }
    }
);

export const updateCategory = createAsyncThunk(
    "adminCategories/update",
    async ({ id, data }: { id: string; data: AdminCategoryUpdatePayload }, { rejectWithValue }) => {
        try {
            return await adminCategoriesApi.update(id, data);
        } catch {
            return { id, ...data } as AdminCategory;
        }
    }
);

export const deleteCategory = createAsyncThunk(
    "adminCategories/delete",
    async (id: string, { rejectWithValue }) => {
        try {
            await adminCategoriesApi.delete(id);
            return id;
        } catch {
            // Mock: allow delete locally
            return id;
        }
    }
);

// =============================================================================
// SLICE
// =============================================================================

const initialState: AdminCategoriesState = {
    categories: mockCategories,
    totalCount: mockCategories.length,
    loading: false,
    saving: false,
    error: null,
};

const adminCategoriesSlice = createSlice({
    name: "adminCategories",
    initialState,
    reducers: {
        clearError(state) {
            state.error = null;
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
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create
            .addCase(createCategory.pending, (state) => {
                state.saving = true;
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

export const { clearError } = adminCategoriesSlice.actions;
export default adminCategoriesSlice.reducer;
