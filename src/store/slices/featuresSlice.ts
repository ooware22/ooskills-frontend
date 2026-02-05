import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { adminFeaturesApi } from "@/services/contentApi";
import { getErrorMessage } from "@/lib/axios";
import { CACHE_DURATION, shouldFetch } from "@/lib/cache";
import type { RootState } from "../index";
import type {
  AdminFeaturesSectionData,
  AdminFeatureItemData,
  TranslatedField,
  Locale
} from "@/types/content";

// =============================================================================
// TYPES
// =============================================================================

export type { Locale } from "@/types/content";

/** Frontend-friendly feature structure (for a single locale) */
export interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

/** Frontend-friendly features content structure */
export interface FeaturesContent {
  sectionTitle: string;
  sectionSubtitle: string;
  features: Feature[];
}

/** State structure for features slice */
export interface FeaturesState {
  /** The active features section from backend */
  activeSection: AdminFeaturesSectionData | null;
  /** Transformed content for each locale (computed from activeSection) */
  content: Record<Locale, FeaturesContent>;
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

/** Get icon name from backend icon value */
const getIconName = (item: AdminFeatureItemData): string => {
  if (item.icon_display?.type === 'lucide') {
    return item.icon_display.value;
  }
  return item.icon || 'Star';
};

/** Transform backend feature item to frontend feature */
const transformFeatureItem = (item: AdminFeatureItemData, locale: Locale): Feature => ({
  id: String(item.id),
  icon: getIconName(item),
  title: getTranslation(item.title, locale),
  description: getTranslation(item.description, locale),
});

/** Transform backend features section to frontend content for a specific locale */
const transformFeaturesContent = (
  section: AdminFeaturesSectionData | null,
  locale: Locale
): FeaturesContent => {
  if (!section) {
    return defaultContent[locale];
  }
  return {
    sectionTitle: getTranslation(section.title, locale),
    sectionSubtitle: getTranslation(section.subtitle, locale),
    features: section.items
      .filter(item => item.is_active)
      .sort((a, b) => a.order - b.order)
      .map(item => transformFeatureItem(item, locale)),
  };
};

/** Transform backend section to content for all locales */
const transformToAllContent = (
  section: AdminFeaturesSectionData | null
): Record<Locale, FeaturesContent> => ({
  en: transformFeaturesContent(section, "en"),
  fr: transformFeaturesContent(section, "fr"),
  ar: transformFeaturesContent(section, "ar"),
});

// =============================================================================
// DEFAULT CONTENT
// =============================================================================

const defaultContent: Record<Locale, FeaturesContent> = {
  en: {
    sectionTitle: "Why Choose OOSkills?",
    sectionSubtitle: "Everything you need for an exceptional learning experience",
    features: [
      { id: "1", icon: "monitor", title: "Quality Courses", description: "Professionally designed content by industry experts" },
      { id: "2", icon: "users", title: "Expert Instructors", description: "Learn from professionals with real experience" },
      { id: "3", icon: "award", title: "Certificates", description: "Get recognized certificates upon completion" },
      { id: "4", icon: "zap", title: "Learn at Your Pace", description: "Flexible schedules to fit your lifestyle" },
      { id: "5", icon: "clock", title: "24/7 Access", description: "Access your courses anytime, anywhere" },
      { id: "6", icon: "shield", title: "Lifetime Access", description: "Once enrolled, access content forever" },
    ],
  },
  fr: {
    sectionTitle: "Pourquoi choisir OOSkills ?",
    sectionSubtitle: "Tout ce dont vous avez besoin pour une expérience d'apprentissage exceptionnelle",
    features: [
      { id: "1", icon: "monitor", title: "Cours de qualité", description: "Contenu conçu professionnellement par des experts du secteur" },
      { id: "2", icon: "users", title: "Instructeurs experts", description: "Apprenez avec des professionnels expérimentés" },
      { id: "3", icon: "award", title: "Certificats", description: "Obtenez des certificats reconnus à la fin de chaque cours" },
      { id: "4", icon: "zap", title: "Apprenez à votre rythme", description: "Des horaires flexibles adaptés à votre style de vie" },
      { id: "5", icon: "clock", title: "Accès 24/7", description: "Accédez à vos cours à tout moment, n'importe où" },
      { id: "6", icon: "shield", title: "Accès à vie", description: "Une fois inscrit, accédez au contenu pour toujours" },
    ],
  },
  ar: {
    sectionTitle: "لماذا تختار OOSkills؟",
    sectionSubtitle: "كل ما تحتاجه لتجربة تعليمية استثنائية",
    features: [
      { id: "1", icon: "monitor", title: "دورات عالية الجودة", description: "محتوى مصمم باحترافية من قبل خبراء الصناعة" },
      { id: "2", icon: "users", title: "مدربون خبراء", description: "تعلم من محترفين ذوي خبرة حقيقية" },
      { id: "3", icon: "award", title: "شهادات", description: "احصل على شهادات معترف بها عند الانتهاء" },
      { id: "4", icon: "zap", title: "تعلم بالسرعة التي تناسبك", description: "جداول مرنة تتناسب مع نمط حياتك" },
      { id: "5", icon: "clock", title: "وصول على مدار الساعة", description: "الوصول إلى دوراتك في أي وقت ومن أي مكان" },
      { id: "6", icon: "shield", title: "وصول مدى الحياة", description: "بمجرد التسجيل، الوصول إلى المحتوى للأبد" },
    ],
  },
};

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: FeaturesState = {
  activeSection: null,
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
 * Fetch the active features section from backend
 */
export const fetchFeaturesContent = createAsyncThunk(
  "features/fetchContent",
  async (options: { forceRefresh?: boolean } = {}, { rejectWithValue }) => {
    try {
      const data = await adminFeaturesApi.section.getActive();
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (options, { getState }) => {
      if (options?.forceRefresh) return true;
      const { features } = getState() as RootState;
      return shouldFetch(features.lastFetched, features.loading, CACHE_DURATION.MEDIUM);
    },
  }
);

/**
 * Update the features section (title/subtitle)
 */
export const saveFeaturesSection = createAsyncThunk(
  "features/saveSection",
  async (
    { locale, title, subtitle }: { locale: Locale; title: string; subtitle: string },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const activeSection = state.features.activeSection;

      if (!activeSection) {
        return rejectWithValue("No active features section to update");
      }

      const payload = {
        title: { ...activeSection.title, [locale]: title },
        subtitle: { ...activeSection.subtitle, [locale]: subtitle },
      };

      const updated = await adminFeaturesApi.section.update(activeSection.id, payload);
      return updated;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Create a new feature item
 */
export const createFeatureItem = createAsyncThunk(
  "features/createItem",
  async (
    { locale, feature }: { locale: Locale; feature: Omit<Feature, 'id'> },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const activeSection = state.features.activeSection;

      if (!activeSection) {
        return rejectWithValue("No active features section");
      }

      const payload = {
        section: activeSection.id,
        icon: feature.icon,
        title: { [locale]: feature.title },
        description: { [locale]: feature.description },
        order: activeSection.items.length,
        is_active: true,
      };

      const created = await adminFeaturesApi.items.create(payload);
      return created;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Update a feature item
 */
export const updateFeatureItem = createAsyncThunk(
  "features/updateItem",
  async (
    { locale, id, updates }: { locale: Locale; id: number; updates: Partial<Feature> },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const activeSection = state.features.activeSection;
      const existingItem = activeSection?.items.find(i => i.id === id);

      if (!existingItem) {
        return rejectWithValue("Feature item not found");
      }

      const payload: Record<string, unknown> = {};

      if (updates.icon !== undefined) {
        payload.icon = updates.icon;
      }
      if (updates.title !== undefined) {
        payload.title = { ...existingItem.title, [locale]: updates.title };
      }
      if (updates.description !== undefined) {
        payload.description = { ...existingItem.description, [locale]: updates.description };
      }

      const updated = await adminFeaturesApi.items.update(id, payload);
      return updated;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Delete a feature item
 */
export const deleteFeatureItem = createAsyncThunk(
  "features/deleteItem",
  async (id: number, { rejectWithValue }) => {
    try {
      await adminFeaturesApi.items.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Reorder feature items
 */
export const reorderFeatureItems = createAsyncThunk(
  "features/reorderItems",
  async (items: { id: number; order: number }[], { rejectWithValue }) => {
    try {
      await adminFeaturesApi.items.reorder({ items });
      return items;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// =============================================================================
// SLICE
// =============================================================================

const featuresSlice = createSlice({
  name: "features",
  initialState,
  reducers: {
    /** Optimistically update section content locally */
    updateFeaturesSection: (
      state,
      action: PayloadAction<{ locale: Locale; title: string; subtitle: string }>
    ) => {
      const { locale, title, subtitle } = action.payload;
      state.content[locale].sectionTitle = title;
      state.content[locale].sectionSubtitle = subtitle;
    },

    /** Optimistically add a feature locally */
    addFeature: (state, action: PayloadAction<{ locale: Locale; feature: Feature }>) => {
      const { locale, feature } = action.payload;
      state.content[locale].features.push(feature);
    },

    /** Optimistically update a feature locally */
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

    /** Optimistically remove a feature locally */
    removeFeature: (state, action: PayloadAction<{ locale: Locale; id: string }>) => {
      const { locale, id } = action.payload;
      state.content[locale].features = state.content[locale].features.filter((f) => f.id !== id);
    },

    /** Reset content for a locale to values from activeSection */
    resetFeaturesContent: (state, action: PayloadAction<Locale>) => {
      const locale = action.payload;
      state.content[locale] = transformFeaturesContent(state.activeSection, locale);
    },

    /** Clear error state */
    clearError: (state) => {
      state.error = null;
    },

    /** Force cache invalidation */
    invalidateCache: (state) => {
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Features Content
      .addCase(fetchFeaturesContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturesContent.fulfilled, (state, action) => {
        state.loading = false;
        state.activeSection = action.payload;
        state.content = transformToAllContent(action.payload);
        state.lastFetched = Date.now();
      })
      .addCase(fetchFeaturesContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Save Features Section
      .addCase(saveFeaturesSection.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveFeaturesSection.fulfilled, (state, action) => {
        state.saving = false;
        if (state.activeSection) {
          state.activeSection.title = action.payload.title;
          state.activeSection.subtitle = action.payload.subtitle;
        }
        state.content = transformToAllContent(state.activeSection);
      })
      .addCase(saveFeaturesSection.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })

      // Create Feature Item
      .addCase(createFeatureItem.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createFeatureItem.fulfilled, (state, action) => {
        state.saving = false;
        if (state.activeSection) {
          state.activeSection.items.push(action.payload);
          state.content = transformToAllContent(state.activeSection);
        }
      })
      .addCase(createFeatureItem.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })

      // Update Feature Item
      .addCase(updateFeatureItem.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateFeatureItem.fulfilled, (state, action) => {
        state.saving = false;
        if (state.activeSection) {
          const index = state.activeSection.items.findIndex(i => i.id === action.payload.id);
          if (index !== -1) {
            state.activeSection.items[index] = action.payload;
          }
          state.content = transformToAllContent(state.activeSection);
        }
      })
      .addCase(updateFeatureItem.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })

      // Delete Feature Item
      .addCase(deleteFeatureItem.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(deleteFeatureItem.fulfilled, (state, action) => {
        state.saving = false;
        if (state.activeSection) {
          state.activeSection.items = state.activeSection.items.filter(i => i.id !== action.payload);
          state.content = transformToAllContent(state.activeSection);
        }
      })
      .addCase(deleteFeatureItem.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })

      // Reorder Feature Items
      .addCase(reorderFeatureItems.pending, (state) => {
        state.saving = true;
      })
      .addCase(reorderFeatureItems.fulfilled, (state, action) => {
        state.saving = false;
        if (state.activeSection) {
          // Update order in activeSection items
          action.payload.forEach(({ id, order }) => {
            const item = state.activeSection?.items.find(i => i.id === id);
            if (item) item.order = order;
          });
          // Re-sort items
          state.activeSection.items.sort((a, b) => a.order - b.order);
          state.content = transformToAllContent(state.activeSection);
        }
      })
      .addCase(reorderFeatureItems.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });
  },
});

// =============================================================================
// EXPORTS
// =============================================================================

export const {
  updateFeaturesSection,
  addFeature,
  updateFeature,
  removeFeature,
  resetFeaturesContent,
  clearError,
  invalidateCache,
} = featuresSlice.actions;

export default featuresSlice.reducer;

// =============================================================================
// SELECTORS
// =============================================================================

export const selectFeaturesState = (state: RootState) => state.features;
export const selectFeaturesContent = (state: RootState, locale: Locale) =>
  state.features.content[locale];
export const selectActiveSection = (state: RootState) => state.features.activeSection;
export const selectFeaturesLoading = (state: RootState) => state.features.loading;
export const selectFeaturesSaving = (state: RootState) => state.features.saving;
export const selectFeaturesError = (state: RootState) => state.features.error;
