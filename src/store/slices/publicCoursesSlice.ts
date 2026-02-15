import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import publicCoursesApi, {
    type PublicCourse,
    type PublicCategory,
    type CourseFilterParams,
} from '@/services/publicCoursesApi';

// =============================================================================
// STATE
// =============================================================================

interface PublicCoursesState {
    // List page
    courses: PublicCourse[];
    totalCourses: number;
    categories: PublicCategory[];
    loading: boolean;
    categoriesLoading: boolean;
    error: string | null;
    filters: CourseFilterParams;

    // Detail page
    courseDetail: PublicCourse | null;
    courseDetailLoading: boolean;
    courseDetailError: string | null;
}

const initialState: PublicCoursesState = {
    courses: [],
    totalCourses: 0,
    categories: [],
    loading: false,
    categoriesLoading: false,
    error: null,
    filters: {},

    courseDetail: null,
    courseDetailLoading: false,
    courseDetailError: null,
};

// =============================================================================
// THUNKS
// =============================================================================

export const fetchPublicCourses = createAsyncThunk(
    'publicCourses/fetchCourses',
    async (params: CourseFilterParams | undefined, { rejectWithValue }) => {
        try {
            const { results, count } = await publicCoursesApi.listCourses(params);
            return { courses: results, count };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to fetch courses';
            return rejectWithValue(message);
        }
    },
);

export const fetchPublicCategories = createAsyncThunk(
    'publicCourses/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            const { results } = await publicCoursesApi.listCategories();
            return results;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to fetch categories';
            return rejectWithValue(message);
        }
    },
);

export const fetchCourseDetail = createAsyncThunk(
    'publicCourses/fetchCourseDetail',
    async (slug: string, { rejectWithValue }) => {
        try {
            return await publicCoursesApi.getCourse(slug);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to fetch course';
            return rejectWithValue(message);
        }
    },
);

// =============================================================================
// SLICE
// =============================================================================

const publicCoursesSlice = createSlice({
    name: 'publicCourses',
    initialState,
    reducers: {
        setFilters(state, action) {
            state.filters = action.payload;
        },
        clearCourseDetail(state) {
            state.courseDetail = null;
            state.courseDetailError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // ── Courses list ──────────────────────────────────────────
            .addCase(fetchPublicCourses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPublicCourses.fulfilled, (state, action) => {
                state.loading = false;
                state.courses = action.payload.courses;
                state.totalCourses = action.payload.count;
            })
            .addCase(fetchPublicCourses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // ── Categories ───────────────────────────────────────────
            .addCase(fetchPublicCategories.pending, (state) => {
                state.categoriesLoading = true;
            })
            .addCase(fetchPublicCategories.fulfilled, (state, action) => {
                state.categoriesLoading = false;
                state.categories = action.payload;
            })
            .addCase(fetchPublicCategories.rejected, (state) => {
                state.categoriesLoading = false;
            })

            // ── Course detail ────────────────────────────────────────
            .addCase(fetchCourseDetail.pending, (state) => {
                state.courseDetailLoading = true;
                state.courseDetailError = null;
            })
            .addCase(fetchCourseDetail.fulfilled, (state, action) => {
                state.courseDetailLoading = false;
                state.courseDetail = action.payload;
            })
            .addCase(fetchCourseDetail.rejected, (state, action) => {
                state.courseDetailLoading = false;
                state.courseDetailError = action.payload as string;
            });
    },
});

export const { setFilters, clearCourseDetail } = publicCoursesSlice.actions;
export default publicCoursesSlice.reducer;
