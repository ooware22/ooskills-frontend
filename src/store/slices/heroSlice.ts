import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { adminHeroApi } from "@/services/contentApi";
import { getErrorMessage } from "@/lib/axios";
import { CACHE_DURATION, shouldFetch } from "@/lib/cache";
import type { RootState } from "../index";
import type { AdminHeroData, TranslatedField, Locale, HeroUpdatePayload } from "@/types/content";

// =============================================================================
// TYPES
// =============================================================================

export type { Locale } from "@/types/content";

/** Frontend-friendly hero content structure (for a single locale) */
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

/** State structure for hero slice */
export interface HeroState {
  /** The active hero section from backend */
  activeHero: AdminHeroData | null;
  /** Transformed content for each locale (computed from activeHero) */
  content: Record<Locale, HeroContent>;
  /** Is data currently being fetched */
  loading: boolean;
  /** Is data currently being saved */
  saving: boolean;
  /** Error message if any */
  error: string | null;
  /** Timestamp of last successful fetch */
  lastFetched: number | null;
}

// =============================================================================
// HELPERS
// =============================================================================

/** Get value from translated field for a specific locale */
const getTranslation = (field: TranslatedField | undefined, locale: Locale): string => {
  if (!field) return "";
  return field[locale] || field["fr"] || field["en"] || field["ar"] || "";
};

/** Transform backend hero data to frontend content for a specific locale */
const transformHeroToContent = (hero: AdminHeroData | null, locale: Locale): HeroContent => {
  if (!hero) {
    return defaultContent[locale];
  }
  return {
    badge: getTranslation(hero.badge_text, locale),
    title: getTranslation(hero.title, locale),
    titleHighlight: getTranslation(hero.title_highlight, locale),
    subtitle: getTranslation(hero.subtitle, locale),
    ctaPrimary: getTranslation(hero.primary_cta_text, locale),
    ctaSecondary: getTranslation(hero.secondary_cta_text, locale),
    illustrationTitle: getTranslation(hero.card_title, locale),
    illustrationSubtitle: getTranslation(hero.card_subtitle, locale),
  };
};

/** Transform backend hero to content for all locales */
const transformHeroToAllContent = (hero: AdminHeroData | null): Record<Locale, HeroContent> => {
  return {
    en: transformHeroToContent(hero, "en"),
    fr: transformHeroToContent(hero, "fr"),
    ar: transformHeroToContent(hero, "ar"),
  };
};

/** Transform frontend content changes back to backend format */
const transformContentToPayload = (
  locale: Locale,
  content: Partial<HeroContent>,
  existingHero: AdminHeroData | null
): HeroUpdatePayload => {
  const payload: HeroUpdatePayload = {};

  if (content.badge !== undefined) {
    payload.badge_text = { ...existingHero?.badge_text, [locale]: content.badge };
  }
  if (content.title !== undefined) {
    payload.title = { ...existingHero?.title, [locale]: content.title };
  }
  if (content.titleHighlight !== undefined) {
    payload.title_highlight = { ...existingHero?.title_highlight, [locale]: content.titleHighlight };
  }
  if (content.subtitle !== undefined) {
    payload.subtitle = { ...existingHero?.subtitle, [locale]: content.subtitle };
  }
  if (content.ctaPrimary !== undefined) {
    payload.primary_cta_text = { ...existingHero?.primary_cta_text, [locale]: content.ctaPrimary };
  }
  if (content.ctaSecondary !== undefined) {
    payload.secondary_cta_text = { ...existingHero?.secondary_cta_text, [locale]: content.ctaSecondary };
  }
  if (content.illustrationTitle !== undefined) {
    payload.card_title = { ...existingHero?.card_title, [locale]: content.illustrationTitle };
  }
  if (content.illustrationSubtitle !== undefined) {
    payload.card_subtitle = { ...existingHero?.card_subtitle, [locale]: content.illustrationSubtitle };
  }

  return payload;
};

// =============================================================================
// DEFAULT CONTENT (fallback when no data from backend)
// =============================================================================

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

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: HeroState = {
  activeHero: null,
  content: defaultContent,
  loading: false,
  saving: false,
  error: null,
  lastFetched: null,
};

// =============================================================================
// ASYNC THUNKS
// =============================================================================

/**
 * Fetch the active hero section from backend
 */
export const fetchHeroContent = createAsyncThunk(
  "hero/fetchContent",
  async (options: { forceRefresh?: boolean } = {}, { rejectWithValue }) => {
    try {
      const data = await adminHeroApi.getActive();
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    // Prevent duplicate requests if data is fresh
    condition: (options, { getState }) => {
      if (options?.forceRefresh) return true;
      const { hero } = getState() as RootState;
      return shouldFetch(hero.lastFetched, hero.loading, CACHE_DURATION.MEDIUM);
    },
  }
);

/**
 * Save hero content for a specific locale
 */
export const saveHeroContent = createAsyncThunk(
  "hero/saveContent",
  async (
    { locale, content }: { locale: Locale; content: HeroContent },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const activeHero = state.hero.activeHero;

      if (!activeHero) {
        return rejectWithValue("No active hero section to update");
      }

      const payload = transformContentToPayload(locale, content, activeHero);
      const updatedHero = await adminHeroApi.update(activeHero.id, payload);

      return { locale, updatedHero };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Update a single field for a specific locale
 */
export const updateHeroField = createAsyncThunk(
  "hero/updateField",
  async (
    { locale, field, value }: { locale: Locale; field: keyof HeroContent; value: string },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const activeHero = state.hero.activeHero;

      if (!activeHero) {
        return rejectWithValue("No active hero section to update");
      }

      const contentUpdate: Partial<HeroContent> = { [field]: value };
      const payload = transformContentToPayload(locale, contentUpdate, activeHero);
      const updatedHero = await adminHeroApi.update(activeHero.id, payload);

      return { locale, updatedHero };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// =============================================================================
// SLICE
// =============================================================================

const heroSlice = createSlice({
  name: "hero",
  initialState,
  reducers: {
    /** Optimistically update hero content locally (before saving) */
    updateHeroContent: (
      state,
      action: PayloadAction<{ locale: Locale; updates: Partial<HeroContent> }>
    ) => {
      const { locale, updates } = action.payload;
      state.content[locale] = { ...state.content[locale], ...updates };
    },

    /** Reset content for a locale to values from activeHero or defaults */
    resetHeroContent: (state, action: PayloadAction<Locale>) => {
      const locale = action.payload;
      state.content[locale] = transformHeroToContent(state.activeHero, locale);
    },

    /** Reset all content to values from activeHero or defaults */
    resetAllHeroContent: (state) => {
      state.content = transformHeroToAllContent(state.activeHero);
    },

    /** Clear error state */
    clearError: (state) => {
      state.error = null;
    },

    /** Force cache invalidation (triggers refetch on next fetchHeroContent) */
    invalidateCache: (state) => {
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Hero Content
      .addCase(fetchHeroContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHeroContent.fulfilled, (state, action) => {
        state.loading = false;
        state.activeHero = action.payload;
        state.content = transformHeroToAllContent(action.payload);
        state.lastFetched = Date.now();
      })
      .addCase(fetchHeroContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Save Hero Content
      .addCase(saveHeroContent.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveHeroContent.fulfilled, (state, action) => {
        state.saving = false;
        state.activeHero = action.payload.updatedHero;
        state.content = transformHeroToAllContent(action.payload.updatedHero);
      })
      .addCase(saveHeroContent.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })

      // Update Hero Field
      .addCase(updateHeroField.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateHeroField.fulfilled, (state, action) => {
        state.saving = false;
        state.activeHero = action.payload.updatedHero;
        state.content = transformHeroToAllContent(action.payload.updatedHero);
      })
      .addCase(updateHeroField.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });
  },
});

// =============================================================================
// EXPORTS
// =============================================================================

export const {
  updateHeroContent,
  resetHeroContent,
  resetAllHeroContent,
  clearError,
  invalidateCache,
} = heroSlice.actions;

export default heroSlice.reducer;

// =============================================================================
// SELECTORS
// =============================================================================

/** Select hero state */
export const selectHeroState = (state: RootState) => state.hero;

/** Select hero content for a specific locale */
export const selectHeroContent = (state: RootState, locale: Locale) =>
  state.hero.content[locale];

/** Select the active hero data (raw from backend) */
export const selectActiveHero = (state: RootState) => state.hero.activeHero;

/** Select loading state */
export const selectHeroLoading = (state: RootState) => state.hero.loading;

/** Select saving state */
export const selectHeroSaving = (state: RootState) => state.hero.saving;

/** Select error state */
export const selectHeroError = (state: RootState) => state.hero.error;
