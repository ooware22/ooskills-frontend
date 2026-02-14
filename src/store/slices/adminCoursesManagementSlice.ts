import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import adminCoursesManagementApi from "@/services/adminCoursesManagementApi";
import type {
    AdminCourse,
    AdminCourseCreatePayload,
    AdminCourseUpdatePayload,
    CourseListParams,
} from "@/services/adminCoursesManagementApi";

// =============================================================================
// TYPES
// =============================================================================

interface AdminCoursesManagementState {
    courses: AdminCourse[];
    totalCount: number;
    loading: boolean;
    saving: boolean;
    error: string | null;
    filters: {
        search: string;
        category: string;
        level: string;
    };
}

// =============================================================================
// MOCK DATA
// =============================================================================

const mockCourses: AdminCourse[] = [
    {
        id: "c827b0f2-da2e-48d0-a312-25802c856491",
        title: "الإِسْبَانِيَّةُ الطِّبِّيَّةُ: إِتْقَانُ الْمُصْطَلَحَاتِ",
        slug: "spanish-medical-terminology",
        category: "languages",
        level: "intermediate",
        duration: 18,
        rating: "5.00",
        reviews: 5,
        students: 1300,
        image: "",
        date: "2026-12-02",
        price: 6500,
        originalPrice: 6500,
        description: "أَتْقِنُوا الْمُصْطَلَحَاتِ الطِّبِّيَّةَ بِالْإِسْبَانِيَّةِ مِنَ التَّشْرِيحِ إِلَى الصَّيْدَلَةِ.",
        prerequisites: [
            "مُسْتَوَى مُبْتَدِئٌ فِي الْإِسْبَانِيَّةِ",
            "اهْتِمَامٌ بِالْمَجَالِ الطِّبِّيِّ",
        ],
        whatYouLearn: [
            "تَشْرِيحُ جِسْمِ الْإِنْسَانِ بِالْإِسْبَانِيَّةِ",
            "وَصْفُ الْأَعْرَاضِ وَالْعَلَامَاتِ الْحَيَوِيَّةِ",
            "طَلَبُ الْفُحُوصَاتِ وَتَفْسِيرُ النَّتَائِجِ",
        ],
        modules: [
            {
                id: "be66c5c7-f8ea-4e25-a46d-629ff4ed3779",
                title: "Teaser — الإِسْبَانِيَّةُ الطِّبِّيَّةُ",
                type: "teaser",
                sequence: 1,
                lessons: 1,
                duration: "1min",
            },
            {
                id: "4669025c-7cc1-439f-aa9f-ba0c3a8c870c",
                title: "Anatomía & Cuerpo Humano",
                type: "module",
                sequence: 2,
                lessons: 1,
                duration: "1min",
            },
        ],
        language: "العربية / Español",
        certificate: true,
        lastUpdated: "2026-12-02",
    },
    {
        id: "d938c1e3-eb3f-59e1-b423-36913d967502",
        title: "Python for Data Science",
        slug: "python-data-science",
        category: "programming",
        level: "beginner",
        duration: 24,
        rating: "4.80",
        reviews: 12,
        students: 850,
        image: "",
        date: "2026-11-15",
        price: 4500,
        originalPrice: 7000,
        description: "Learn Python programming from scratch and apply it to data science projects.",
        prerequisites: ["Basic computer skills"],
        whatYouLearn: [
            "Python fundamentals",
            "Data analysis with Pandas",
            "Data visualization with Matplotlib",
        ],
        modules: [
            {
                id: "e5f6a7b8-c9d0-1234-5678-9abcdef01234",
                title: "Introduction to Python",
                type: "module",
                sequence: 1,
                lessons: 5,
                duration: "2h",
            },
        ],
        language: "English",
        certificate: true,
        lastUpdated: "2026-11-15",
    },
    {
        id: "e049d2f4-fc40-6af2-c534-47a24ea78613",
        title: "Marketing Digital Avancé",
        slug: "marketing-digital-avance",
        category: "business",
        level: "advanced",
        duration: 30,
        rating: "4.50",
        reviews: 8,
        students: 420,
        image: "",
        date: "2026-10-20",
        price: 8000,
        originalPrice: 12000,
        description: "Maîtrisez les stratégies avancées du marketing digital.",
        prerequisites: ["Connaissances de base en marketing", "Expérience avec les réseaux sociaux"],
        whatYouLearn: [
            "SEO & SEM avancé",
            "Stratégies de contenu",
            "Analytics et reporting",
        ],
        modules: [
            {
                id: "f6a7b8c9-d0e1-2345-6789-abcdef012345",
                title: "Fondamentaux du Marketing Digital",
                type: "module",
                sequence: 1,
                lessons: 4,
                duration: "3h",
            },
        ],
        language: "Français",
        certificate: true,
        lastUpdated: "2026-10-20",
    },
];

// =============================================================================
// ASYNC THUNKS
// =============================================================================

export const fetchAdminCourses = createAsyncThunk(
    "adminCoursesManagement/fetchAll",
    async (params: CourseListParams | undefined, { rejectWithValue }) => {
        try {
            const response = await adminCoursesManagementApi.list(params);
            return response;
        } catch {
            // Fallback to mock data with filtering
            let filtered = [...mockCourses];
            if (params?.search) {
                const s = params.search.toLowerCase();
                filtered = filtered.filter((c) => c.title.toLowerCase().includes(s) || c.slug.toLowerCase().includes(s));
            }
            if (params?.category && params.category !== "all") {
                filtered = filtered.filter((c) => c.category === params.category);
            }
            if (params?.level && params.level !== "all") {
                filtered = filtered.filter((c) => c.level === params.level);
            }
            return { count: filtered.length, next: null, previous: null, results: filtered };
        }
    }
);

export const createAdminCourse = createAsyncThunk(
    "adminCoursesManagement/create",
    async (data: AdminCourseCreatePayload, { rejectWithValue }) => {
        try {
            return await adminCoursesManagementApi.create(data);
        } catch {
            const newCourse: AdminCourse = {
                id: crypto.randomUUID(),
                ...data,
                rating: "0.00",
                reviews: 0,
                students: 0,
                image: data.image || "",
                date: new Date().toISOString().split("T")[0],
                modules: [],
                lastUpdated: new Date().toISOString().split("T")[0],
            };
            return newCourse;
        }
    }
);

export const updateAdminCourse = createAsyncThunk(
    "adminCoursesManagement/update",
    async ({ id, data }: { id: string; data: AdminCourseUpdatePayload }, { rejectWithValue }) => {
        try {
            return await adminCoursesManagementApi.update(id, data);
        } catch {
            return { id, ...data } as AdminCourse;
        }
    }
);

export const deleteAdminCourse = createAsyncThunk(
    "adminCoursesManagement/delete",
    async (id: string, { rejectWithValue }) => {
        try {
            await adminCoursesManagementApi.delete(id);
            return id;
        } catch {
            return id;
        }
    }
);

// =============================================================================
// SLICE
// =============================================================================

const initialState: AdminCoursesManagementState = {
    courses: mockCourses,
    totalCount: mockCourses.length,
    loading: false,
    saving: false,
    error: null,
    filters: {
        search: "",
        category: "all",
        level: "all",
    },
};

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
            })
            .addCase(fetchAdminCourses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create
            .addCase(createAdminCourse.pending, (state) => {
                state.saving = true;
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
            })
            .addCase(updateAdminCourse.fulfilled, (state, action) => {
                state.saving = false;
                const idx = state.courses.findIndex((c) => c.id === action.payload.id);
                if (idx !== -1) {
                    state.courses[idx] = { ...state.courses[idx], ...action.payload };
                }
            })
            .addCase(updateAdminCourse.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload as string;
            })
            // Delete
            .addCase(deleteAdminCourse.pending, (state) => {
                state.saving = true;
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

export const { setFilters, clearError } = adminCoursesManagementSlice.actions;
export default adminCoursesManagementSlice.reducer;
