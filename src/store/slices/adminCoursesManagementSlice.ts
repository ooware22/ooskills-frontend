import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import adminCoursesManagementApi from "@/services/adminCoursesManagementApi";
import type {
    AdminCourse,
    AdminCourseCreatePayload,
    AdminCourseUpdatePayload,
    CourseListParams,
} from "@/services/adminCoursesManagementApi";
import { getErrorMessage } from "@/lib/axios";
import { CACHE_DURATION, shouldFetch } from "@/lib/cache";
import type { RootState } from "@/store";

// =============================================================================
// TYPES
// =============================================================================

interface AdminCoursesManagementState {
    courses: AdminCourse[];
    totalCount: number;
    loading: boolean;
    saving: boolean;
    error: string | null;
    lastFetched: number | null;
    filters: {
        search: string;
        category: string;
        level: string;
    };
}

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: AdminCoursesManagementState = {
    courses: [],
    totalCount: 0,
    loading: false,
    saving: false,
    error: null,
    lastFetched: null,
    filters: {
        search: "",
        category: "all",
        level: "all",
    },
};

// =============================================================================
// ASYNC THUNKS
// =============================================================================

export const fetchAdminCourses = createAsyncThunk(
    "adminCoursesManagement/fetchAll",
    async (params: CourseListParams | void, { rejectWithValue }) => {
        try {
            const data = await adminCoursesManagementApi.list(params || undefined);
            return data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    },
    {
        condition(params, { getState }) {
            const { adminCoursesManagement } = getState() as RootState;
            return shouldFetch(adminCoursesManagement.lastFetched, adminCoursesManagement.loading, CACHE_DURATION.MEDIUM);
        },
    }
);

export const createAdminCourse = createAsyncThunk(
    "adminCoursesManagement/create",
    async (data: AdminCourseCreatePayload, { rejectWithValue }) => {
        try {
            return await adminCoursesManagementApi.create(data);
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const updateAdminCourse = createAsyncThunk(
    "adminCoursesManagement/update",
    async ({ id, data }: { id: string; data: AdminCourseUpdatePayload }, { getState, rejectWithValue }) => {
        try {
            // Resolve slug from state (backend uses slug as lookup)
            const { adminCoursesManagement } = getState() as RootState;
            const course = adminCoursesManagement.courses.find((c) => c.id === id);
            const slug = course?.slug || id;
            return await adminCoursesManagementApi.update(slug, data);
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const deleteAdminCourse = createAsyncThunk(
    "adminCoursesManagement/delete",
    async (id: string, { getState, rejectWithValue }) => {
        try {
            // Resolve slug from state (backend uses slug as lookup)
            const { adminCoursesManagement } = getState() as RootState;
            const course = adminCoursesManagement.courses.find((c) => c.id === id);
            const slug = course?.slug || id;
            await adminCoursesManagementApi.delete(slug);
            return id;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

// =============================================================================
// SLICE
// =============================================================================

const adminCoursesManagementSlice = createSlice({
    name: "adminCoursesManagement",
    initialState,
    reducers: {
        setFilters(state, action: PayloadAction<Partial<AdminCoursesManagementState["filters"]>>) {
            state.filters = { ...state.filters, ...action.payload };
        },
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
            .addCase(fetchAdminCourses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAdminCourses.fulfilled, (state, action) => {
                state.loading = false;
                state.courses = action.payload.results;
                state.totalCount = action.payload.count;
                state.lastFetched = Date.now();
            })
            .addCase(fetchAdminCourses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create
            .addCase(createAdminCourse.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(createAdminCourse.fulfilled, (state, action) => {
                state.saving = false;
                state.courses.push(action.payload);
                state.totalCount += 1;
            })
            .addCase(createAdminCourse.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload as string;
            })
            // Update
            .addCase(updateAdminCourse.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(updateAdminCourse.fulfilled, (state, action) => {
                state.saving = false;
                const idx = state.courses.findIndex((c) => c.id === action.payload.id);
                if (idx !== -1) {
                    state.courses[idx] = action.payload;
                }
            })
            .addCase(updateAdminCourse.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload as string;
            })
            // Delete
            .addCase(deleteAdminCourse.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(deleteAdminCourse.fulfilled, (state, action) => {
                state.saving = false;
                state.courses = state.courses.filter((c) => c.id !== action.payload);
                state.totalCount -= 1;
            })
            .addCase(deleteAdminCourse.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload as string;
            });
    },
});

export const { setFilters, clearError, invalidateCache } = adminCoursesManagementSlice.actions;
export default adminCoursesManagementSlice.reducer;
