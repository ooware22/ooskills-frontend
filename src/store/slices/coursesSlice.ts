import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Types
export type Locale = "fr" | "en" | "ar";

export interface Course {
  id: string;
  image: string;
  title: string;
  category: string;
  duration: string;
  level: string;
}

export interface CoursesContent {
  sectionTitle: string;
  sectionSubtitle: string;
  courses: Course[];
}

export interface CoursesState {
  content: Record<Locale, CoursesContent>;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

// Default content
const defaultContent: Record<Locale, CoursesContent> = {
  en: {
    sectionTitle: "Our Popular Courses",
    sectionSubtitle: "Discover our most requested courses",
    courses: [
      { id: "1", image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&h=400&fit=crop", title: "Excel - From Beginner to Expert", category: "Office", duration: "12 hours", level: "All levels" },
      { id: "2", image: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&h=400&fit=crop", title: "Modern Web Development", category: "IT", duration: "40 hours", level: "Intermediate" },
      { id: "3", image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&h=400&fit=crop", title: "Python for Beginners", category: "Programming", duration: "20 hours", level: "Beginner" },
      { id: "4", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop", title: "Professional Communication", category: "Soft Skills", duration: "8 hours", level: "All levels" },
    ],
  },
  fr: {
    sectionTitle: "Nos cours populaires",
    sectionSubtitle: "Découvrez nos cours les plus demandés",
    courses: [
      { id: "1", image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&h=400&fit=crop", title: "Excel - Du débutant à l'expert", category: "Bureautique", duration: "12 heures", level: "Tous niveaux" },
      { id: "2", image: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&h=400&fit=crop", title: "Développement Web Moderne", category: "Informatique", duration: "40 heures", level: "Intermédiaire" },
      { id: "3", image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&h=400&fit=crop", title: "Python pour débutants", category: "Programmation", duration: "20 heures", level: "Débutant" },
      { id: "4", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop", title: "Communication professionnelle", category: "Soft Skills", duration: "8 heures", level: "Tous niveaux" },
    ],
  },
  ar: {
    sectionTitle: "دوراتنا الشائعة",
    sectionSubtitle: "اكتشف الدورات الأكثر طلبًا",
    courses: [
      { id: "1", image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&h=400&fit=crop", title: "إكسل - من المبتدئين إلى الخبراء", category: "المكتبية", duration: "12 ساعة", level: "جميع المستويات" },
      { id: "2", image: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&h=400&fit=crop", title: "تطوير الويب الحديث", category: "تكنولوجيا المعلومات", duration: "40 ساعة", level: "متوسط" },
      { id: "3", image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&h=400&fit=crop", title: "بايثون للمبتدئين", category: "البرمجة", duration: "20 ساعة", level: "مبتدئ" },
      { id: "4", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop", title: "التواصل المهني", category: "المهارات الناعمة", duration: "8 ساعات", level: "جميع المستويات" },
    ],
  },
};

const initialState: CoursesState = {
  content: defaultContent,
  loading: false,
  saving: false,
  error: null,
};

// Async thunks
export const fetchCoursesContent = createAsyncThunk(
  "courses/fetchContent",
  async (_, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      return defaultContent;
    } catch (error) {
      return rejectWithValue("Failed to fetch courses content");
    }
  }
);

export const saveCoursesContent = createAsyncThunk(
  "courses/saveContent",
  async (
    { locale, content }: { locale: Locale; content: CoursesContent },
    { rejectWithValue }
  ) => {
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(`[API] Saving courses content for ${locale}:`, content);
      return { locale, content };
    } catch (error) {
      return rejectWithValue("Failed to save courses content");
    }
  }
);

const coursesSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    updateCoursesSection: (
      state,
      action: PayloadAction<{ locale: Locale; title: string; subtitle: string }>
    ) => {
      const { locale, title, subtitle } = action.payload;
      state.content[locale].sectionTitle = title;
      state.content[locale].sectionSubtitle = subtitle;
    },
    addCourse: (state, action: PayloadAction<{ locale: Locale; course: Course }>) => {
      const { locale, course } = action.payload;
      state.content[locale].courses.push(course);
    },
    updateCourse: (
      state,
      action: PayloadAction<{ locale: Locale; id: string; updates: Partial<Course> }>
    ) => {
      const { locale, id, updates } = action.payload;
      const course = state.content[locale].courses.find((c) => c.id === id);
      if (course) {
        Object.assign(course, updates);
      }
    },
    removeCourse: (state, action: PayloadAction<{ locale: Locale; id: string }>) => {
      const { locale, id } = action.payload;
      state.content[locale].courses = state.content[locale].courses.filter((c) => c.id !== id);
    },
    resetCoursesContent: (state, action: PayloadAction<Locale>) => {
      state.content[action.payload] = defaultContent[action.payload];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoursesContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoursesContent.fulfilled, (state, action) => {
        state.loading = false;
        state.content = action.payload;
      })
      .addCase(fetchCoursesContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(saveCoursesContent.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveCoursesContent.fulfilled, (state, action) => {
        state.saving = false;
        const { locale, content } = action.payload;
        state.content[locale] = content;
      })
      .addCase(saveCoursesContent.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });
  },
});

export const { updateCoursesSection, addCourse, updateCourse, removeCourse, resetCoursesContent, clearError } = coursesSlice.actions;
export default coursesSlice.reducer;
