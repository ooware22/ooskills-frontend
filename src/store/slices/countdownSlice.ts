import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Types
export type Locale = "fr" | "en" | "ar";

export interface CountdownContent {
  title: string;
  subtitle: string;
  ctaText: string;
}

export interface CountdownSettings {
  launchDate: string;
  launchTime: string;
  isActive: boolean;
}

export interface CountdownState {
  content: Record<Locale, CountdownContent>;
  settings: CountdownSettings;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

// Default content
const defaultContent: Record<Locale, CountdownContent> = {
  en: {
    title: "Platform Launching Soon",
    subtitle: "Get ready for an exceptional learning experience",
    ctaText: "Notify Me at Launch",
  },
  fr: {
    title: "Lancement de la plateforme bientôt",
    subtitle: "Préparez-vous pour une expérience d'apprentissage exceptionnelle",
    ctaText: "Me notifier au lancement",
  },
  ar: {
    title: "انطلاقة المنصة قريباً",
    subtitle: "استعدوا لتجربة تعليمية استثنائية",
    ctaText: "أخبرني عند الإطلاق",
  },
};

const defaultSettings: CountdownSettings = {
  launchDate: "2026-05-01",
  launchTime: "09:00",
  isActive: true,
};

const initialState: CountdownState = {
  content: defaultContent,
  settings: defaultSettings,
  loading: false,
  saving: false,
  error: null,
};

// Async thunks
export const fetchCountdownContent = createAsyncThunk(
  "countdown/fetchContent",
  async (_, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { content: defaultContent, settings: defaultSettings };
    } catch (error) {
      return rejectWithValue("Failed to fetch countdown content");
    }
  }
);

export const saveCountdownContent = createAsyncThunk(
  "countdown/saveContent",
  async (
    { locale, content, settings }: { locale: Locale; content: CountdownContent; settings: CountdownSettings },
    { rejectWithValue }
  ) => {
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(`[API] Saving countdown content for ${locale}:`, content, settings);
      return { locale, content, settings };
    } catch (error) {
      return rejectWithValue("Failed to save countdown content");
    }
  }
);

const countdownSlice = createSlice({
  name: "countdown",
  initialState,
  reducers: {
    updateCountdownContent: (
      state,
      action: PayloadAction<{ locale: Locale; updates: Partial<CountdownContent> }>
    ) => {
      const { locale, updates } = action.payload;
      state.content[locale] = { ...state.content[locale], ...updates };
    },
    updateCountdownSettings: (
      state,
      action: PayloadAction<Partial<CountdownSettings>>
    ) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    resetCountdownContent: (state, action: PayloadAction<Locale>) => {
      state.content[action.payload] = defaultContent[action.payload];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCountdownContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCountdownContent.fulfilled, (state, action) => {
        state.loading = false;
        state.content = action.payload.content;
        state.settings = action.payload.settings;
      })
      .addCase(fetchCountdownContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(saveCountdownContent.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveCountdownContent.fulfilled, (state, action) => {
        state.saving = false;
        const { locale, content, settings } = action.payload;
        state.content[locale] = content;
        state.settings = settings;
      })
      .addCase(saveCountdownContent.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });
  },
});

export const { updateCountdownContent, updateCountdownSettings, resetCountdownContent, clearError } = countdownSlice.actions;
export default countdownSlice.reducer;
