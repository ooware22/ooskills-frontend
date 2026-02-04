import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Types
export type Locale = "fr" | "en" | "ar";

export interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface FeaturesContent {
  sectionTitle: string;
  sectionSubtitle: string;
  features: Feature[];
}

export interface FeaturesState {
  content: Record<Locale, FeaturesContent>;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

// Default content
const defaultContent: Record<Locale, FeaturesContent> = {
  en: {
    sectionTitle: "Why Choose OOSkills?",
    sectionSubtitle: "Everything you need for an exceptional learning experience",
    features: [
      { id: "1", icon: "Monitor", title: "Quality Courses", description: "Professionally designed content by industry experts" },
      { id: "2", icon: "Users", title: "Expert Instructors", description: "Learn from professionals with real experience" },
      { id: "3", icon: "Award", title: "Certificates", description: "Get recognized certificates upon completion" },
      { id: "4", icon: "Zap", title: "Learn at Your Pace", description: "Flexible schedules to fit your lifestyle" },
      { id: "5", icon: "Clock", title: "24/7 Access", description: "Access your courses anytime, anywhere" },
      { id: "6", icon: "Shield", title: "Lifetime Access", description: "Once enrolled, access content forever" },
    ],
  },
  fr: {
    sectionTitle: "Pourquoi choisir OOSkills ?",
    sectionSubtitle: "Tout ce dont vous avez besoin pour une expérience d'apprentissage exceptionnelle",
    features: [
      { id: "1", icon: "Monitor", title: "Cours de qualité", description: "Contenu conçu professionnellement par des experts du secteur" },
      { id: "2", icon: "Users", title: "Instructeurs experts", description: "Apprenez avec des professionnels expérimentés" },
      { id: "3", icon: "Award", title: "Certificats", description: "Obtenez des certificats reconnus à la fin de chaque cours" },
      { id: "4", icon: "Zap", title: "Apprenez à votre rythme", description: "Des horaires flexibles adaptés à votre style de vie" },
      { id: "5", icon: "Clock", title: "Accès 24/7", description: "Accédez à vos cours à tout moment, n'importe où" },
      { id: "6", icon: "Shield", title: "Accès à vie", description: "Une fois inscrit, accédez au contenu pour toujours" },
    ],
  },
  ar: {
    sectionTitle: "لماذا تختار OOSkills؟",
    sectionSubtitle: "كل ما تحتاجه لتجربة تعليمية استثنائية",
    features: [
      { id: "1", icon: "Monitor", title: "دورات عالية الجودة", description: "محتوى مصمم باحترافية من قبل خبراء الصناعة" },
      { id: "2", icon: "Users", title: "مدربون خبراء", description: "تعلم من محترفين ذوي خبرة حقيقية" },
      { id: "3", icon: "Award", title: "شهادات", description: "احصل على شهادات معترف بها عند الانتهاء" },
      { id: "4", icon: "Zap", title: "تعلم بالسرعة التي تناسبك", description: "جداول مرنة تتناسب مع نمط حياتك" },
      { id: "5", icon: "Clock", title: "وصول على مدار الساعة", description: "الوصول إلى دوراتك في أي وقت ومن أي مكان" },
      { id: "6", icon: "Shield", title: "وصول مدى الحياة", description: "بمجرد التسجيل، الوصول إلى المحتوى للأبد" },
    ],
  },
};

const initialState: FeaturesState = {
  content: defaultContent,
  loading: false,
  saving: false,
  error: null,
};

// Async thunks
export const fetchFeaturesContent = createAsyncThunk(
  "features/fetchContent",
  async (_, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      return defaultContent;
    } catch (error) {
      return rejectWithValue("Failed to fetch features content");
    }
  }
);

export const saveFeaturesContent = createAsyncThunk(
  "features/saveContent",
  async (
    { locale, content }: { locale: Locale; content: FeaturesContent },
    { rejectWithValue }
  ) => {
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(`[API] Saving features content for ${locale}:`, content);
      return { locale, content };
    } catch (error) {
      return rejectWithValue("Failed to save features content");
    }
  }
);

const featuresSlice = createSlice({
  name: "features",
  initialState,
  reducers: {
    updateFeaturesSection: (
      state,
      action: PayloadAction<{ locale: Locale; title: string; subtitle: string }>
    ) => {
      const { locale, title, subtitle } = action.payload;
      state.content[locale].sectionTitle = title;
      state.content[locale].sectionSubtitle = subtitle;
    },
    addFeature: (state, action: PayloadAction<{ locale: Locale; feature: Feature }>) => {
      const { locale, feature } = action.payload;
      state.content[locale].features.push(feature);
    },
    updateFeature: (
      state,
      action: PayloadAction<{ locale: Locale; id: string; updates: Partial<Feature> }>
    ) => {
      const { locale, id, updates } = action.payload;
      const feature = state.content[locale].features.find((f) => f.id === id);
      if (feature) {
        Object.assign(feature, updates);
      }
    },
    removeFeature: (state, action: PayloadAction<{ locale: Locale; id: string }>) => {
      const { locale, id } = action.payload;
      state.content[locale].features = state.content[locale].features.filter((f) => f.id !== id);
    },
    resetFeaturesContent: (state, action: PayloadAction<Locale>) => {
      state.content[action.payload] = defaultContent[action.payload];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeaturesContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturesContent.fulfilled, (state, action) => {
        state.loading = false;
        state.content = action.payload;
      })
      .addCase(fetchFeaturesContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(saveFeaturesContent.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveFeaturesContent.fulfilled, (state, action) => {
        state.saving = false;
        const { locale, content } = action.payload;
        state.content[locale] = content;
      })
      .addCase(saveFeaturesContent.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });
  },
});

export const { updateFeaturesSection, addFeature, updateFeature, removeFeature, resetFeaturesContent, clearError } = featuresSlice.actions;
export default featuresSlice.reducer;
