import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Types
export type Locale = "fr" | "en" | "ar";

export interface HeroContent {
  badge: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  illustrationTitle: string;
  illustrationSubtitle: string;
}

export interface HeroState {
  content: Record<Locale, HeroContent>;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

// Default content
const defaultContent: Record<Locale, HeroContent> = {
  en: {
    badge: "#1 E-Learning Platform in Algeria",
    title: "Develop your skills with",
    titleHighlight: "OOSkills",
    subtitle: "Access quality training in IT, office tools, and personal development. Learn at your own pace with experts.",
    ctaPrimary: "Explore Courses",
    ctaSecondary: "Learn More",
    illustrationTitle: "Learn. Practice. Succeed.",
    illustrationSubtitle: "Your journey to excellence starts here",
  },
  fr: {
    badge: "#1 Plateforme E-Learning en Algérie",
    title: "Développez vos compétences avec",
    titleHighlight: "OOSkills",
    subtitle: "Accédez à des formations de qualité en informatique, bureautique et développement personnel. Apprenez à votre rythme avec des experts.",
    ctaPrimary: "Explorer les cours",
    ctaSecondary: "En savoir plus",
    illustrationTitle: "Apprendre. Pratiquer. Réussir.",
    illustrationSubtitle: "Votre parcours vers l'excellence commence ici",
  },
  ar: {
    badge: "#1 منصة التعليم الإلكتروني في الجزائر",
    title: "طوّر مهاراتك مع",
    titleHighlight: "OOSkills",
    subtitle: "احصل على تدريب عالي الجودة في تكنولوجيا المعلومات وأدوات المكتب والتنمية الشخصية. تعلم بالسرعة التي تناسبك مع الخبراء.",
    ctaPrimary: "استكشف الدورات",
    ctaSecondary: "اعرف المزيد",
    illustrationTitle: "تعلم. تدرب. انجح.",
    illustrationSubtitle: "رحلتك نحو التميز تبدأ هنا",
  },
};

const initialState: HeroState = {
  content: defaultContent,
  loading: false,
  saving: false,
  error: null,
};

// Async thunks for API calls
// TODO: Replace these with actual API endpoints when backend is ready

export const fetchHeroContent = createAsyncThunk(
  "hero/fetchContent",
  async (_, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch("/api/admin/hero");
      // return await response.json();
      
      // For now, simulate API delay and return default content
      await new Promise((resolve) => setTimeout(resolve, 500));
      return defaultContent;
    } catch (error) {
      return rejectWithValue("Failed to fetch hero content");
    }
  }
);

export const saveHeroContent = createAsyncThunk(
  "hero/saveContent",
  async (
    { locale, content }: { locale: Locale; content: HeroContent },
    { rejectWithValue }
  ) => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/admin/hero/${locale}`, {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(content),
      // });
      // return await response.json();
      
      // For now, simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(`[API] Saving hero content for ${locale}:`, content);
      return { locale, content };
    } catch (error) {
      return rejectWithValue("Failed to save hero content");
    }
  }
);

const heroSlice = createSlice({
  name: "hero",
  initialState,
  reducers: {
    updateHeroContent: (
      state,
      action: PayloadAction<{ locale: Locale; updates: Partial<HeroContent> }>
    ) => {
      const { locale, updates } = action.payload;
      state.content[locale] = { ...state.content[locale], ...updates };
    },
    resetHeroContent: (state, action: PayloadAction<Locale>) => {
      state.content[action.payload] = defaultContent[action.payload];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchHeroContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHeroContent.fulfilled, (state, action) => {
        state.loading = false;
        state.content = action.payload;
      })
      .addCase(fetchHeroContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Save
      .addCase(saveHeroContent.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveHeroContent.fulfilled, (state, action) => {
        state.saving = false;
        const { locale, content } = action.payload;
        state.content[locale] = content;
      })
      .addCase(saveHeroContent.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });
  },
});

export const { updateHeroContent, resetHeroContent, clearError } = heroSlice.actions;
export default heroSlice.reducer;
