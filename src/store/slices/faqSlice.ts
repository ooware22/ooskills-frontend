import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { adminFAQApi } from "@/services/contentApi";
import { getErrorMessage } from "@/lib/axios";
import { CACHE_DURATION, shouldFetch } from "@/lib/cache";
import type { RootState } from "../index";
import type { AdminFAQItemData, TranslatedField, Locale } from "@/types/content";

// =============================================================================
// TYPES
// =============================================================================

export type { Locale } from "@/types/content";

/** Frontend-friendly FAQ structure (for a single locale) */
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  isOpen?: boolean;
}

/** Frontend-friendly FAQ content structure */
export interface FAQContent {
  sectionTitle: string;
  sectionSubtitle: string;
  faqs: FAQ[];
}

/** State structure for FAQ slice */
export interface FAQState {
  /** All FAQ items from backend */
  items: AdminFAQItemData[];
  /** Transformed content for each locale */
  content: Record<Locale, FAQContent>;
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

/** Transform backend FAQ item to frontend FAQ */
const transformFAQItem = (item: AdminFAQItemData, locale: Locale, isFirst: boolean): FAQ => ({
  id: String(item.id),
  question: getTranslation(item.question, locale),
  answer: getTranslation(item.answer, locale),
  isOpen: isFirst, // First FAQ is open by default
});

/** Transform backend FAQ items to frontend content for a specific locale */
const transformFAQContent = (items: AdminFAQItemData[], locale: Locale): FAQContent => {
  const activeItems = items
    .filter(item => item.is_active)
    .sort((a, b) => a.order - b.order);

  return {
    // These section titles could come from a separate settings endpoint if needed
    sectionTitle: defaultSectionTitles[locale].title,
    sectionSubtitle: defaultSectionTitles[locale].subtitle,
    faqs: activeItems.map((item, index) => transformFAQItem(item, locale, index === 0)),
  };
};

/** Transform items to content for all locales */
const transformToAllContent = (items: AdminFAQItemData[]): Record<Locale, FAQContent> => ({
  en: transformFAQContent(items, "en"),
  fr: transformFAQContent(items, "fr"),
  ar: transformFAQContent(items, "ar"),
});

// =============================================================================
// DEFAULT SECTION TITLES
// =============================================================================

const defaultSectionTitles: Record<Locale, { title: string; subtitle: string }> = {
  en: {
    title: "Frequently Asked Questions",
    subtitle: "Find answers to common questions about our platform",
  },
  fr: {
    title: "Questions fréquemment posées",
    subtitle: "Trouvez des réponses aux questions courantes sur notre plateforme",
  },
  ar: {
    title: "الأسئلة الشائعة",
    subtitle: "اعثر على إجابات للأسئلة الشائعة حول منصتنا",
  },
};

// =============================================================================
// DEFAULT CONTENT
// =============================================================================

const defaultContent: Record<Locale, FAQContent> = {
  en: {
    sectionTitle: "Frequently Asked Questions",
    sectionSubtitle: "Find answers to common questions about our platform",
    faqs: [
      { id: "1", question: "How does OOSkills work?", answer: "OOSkills is an online learning platform that offers courses in various fields. After registration, you can browse our catalog, enroll in courses, and learn at your own pace.", isOpen: true },
      { id: "2", question: "Are certificates recognized?", answer: "Yes, our certificates are recognized by employers and can be added to your CV and LinkedIn profile to showcase your skills.", isOpen: false },
      { id: "3", question: "Can I access courses on mobile?", answer: "Absolutely! Our platform is fully responsive and works on all devices - smartphones, tablets, and computers.", isOpen: false },
      { id: "4", question: "What is the refund policy?", answer: "We offer a 30-day money-back guarantee. If you're not satisfied with a course, you can request a full refund within 30 days of purchase.", isOpen: false },
      { id: "5", question: "How do I contact support?", answer: "You can reach our support team via email at support@ooskills.com or through the contact form on our website. We respond within 24 hours.", isOpen: false },
    ],
  },
  fr: {
    sectionTitle: "Questions fréquemment posées",
    sectionSubtitle: "Trouvez des réponses aux questions courantes sur notre plateforme",
    faqs: [
      { id: "1", question: "Comment fonctionne OOSkills ?", answer: "OOSkills est une plateforme d'apprentissage en ligne qui propose des cours dans divers domaines. Après inscription, vous pouvez parcourir notre catalogue, vous inscrire à des cours et apprendre à votre rythme.", isOpen: true },
      { id: "2", question: "Les certificats sont-ils reconnus ?", answer: "Oui, nos certificats sont reconnus par les employeurs et peuvent être ajoutés à votre CV et profil LinkedIn pour mettre en valeur vos compétences.", isOpen: false },
      { id: "3", question: "Puis-je accéder aux cours sur mobile ?", answer: "Absolument ! Notre plateforme est entièrement responsive et fonctionne sur tous les appareils - smartphones, tablettes et ordinateurs.", isOpen: false },
      { id: "4", question: "Quelle est la politique de remboursement ?", answer: "Nous offrons une garantie de remboursement de 30 jours. Si vous n'êtes pas satisfait d'un cours, vous pouvez demander un remboursement complet dans les 30 jours suivant l'achat.", isOpen: false },
      { id: "5", question: "Comment contacter le support ?", answer: "Vous pouvez joindre notre équipe de support par email à support@ooskills.com ou via le formulaire de contact sur notre site web. Nous répondons sous 24 heures.", isOpen: false },
    ],
  },
  ar: {
    sectionTitle: "الأسئلة الشائعة",
    sectionSubtitle: "اعثر على إجابات للأسئلة الشائعة حول منصتنا",
    faqs: [
      { id: "1", question: "كيف يعمل OOSkills؟", answer: "OOSkills هي منصة تعليم إلكتروني تقدم دورات في مجالات متعددة. بعد التسجيل، يمكنك تصفح الكتالوج الخاص بنا والتسجيل في الدورات والتعلم بالسرعة التي تناسبك.", isOpen: true },
      { id: "2", question: "هل الشهادات معترف بها؟", answer: "نعم، شهاداتنا معترف بها من قبل أرباب العمل ويمكن إضافتها إلى سيرتك الذاتية وملفك الشخصي على LinkedIn لإظهار مهاراتك.", isOpen: false },
      { id: "3", question: "هل يمكنني الوصول إلى الدورات من الجوال؟", answer: "بالتأكيد! منصتنا متجاوبة تمامًا وتعمل على جميع الأجهزة - الهواتف الذكية والأجهزة اللوحية وأجهزة الكمبيوتر.", isOpen: false },
      { id: "4", question: "ما هي سياسة الاسترداد؟", answer: "نقدم ضمان استرداد الأموال لمدة 30 يومًا. إذا لم تكن راضيًا عن دورة ما، يمكنك طلب استرداد كامل خلال 30 يومًا من الشراء.", isOpen: false },
      { id: "5", question: "كيف أتواصل مع الدعم؟", answer: "يمكنك الوصول إلى فريق الدعم لدينا عبر البريد الإلكتروني على support@ooskills.com أو من خلال نموذج الاتصال على موقعنا. نرد خلال 24 ساعة.", isOpen: false },
    ],
  },
};

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: FAQState = {
  items: [],
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
 * Fetch all FAQ items from backend
 */
export const fetchFAQContent = createAsyncThunk(
  "faq/fetchContent",
  async (options: { forceRefresh?: boolean } = {}, { rejectWithValue }) => {
    try {
      const data = await adminFAQApi.items.list();
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (options, { getState }) => {
      if (options?.forceRefresh) return true;
      const { faq } = getState() as RootState;
      return shouldFetch(faq.lastFetched, faq.loading, CACHE_DURATION.MEDIUM);
    },
  }
);

/**
 * Create a new FAQ item
 */
export const createFAQItem = createAsyncThunk(
  "faq/createItem",
  async (
    { locale, faq, sectionId }: { locale: Locale; faq: Omit<FAQ, 'id' | 'isOpen'>; sectionId?: number },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const payload: Record<string, unknown> = {
        question: { [locale]: faq.question },
        answer: { [locale]: faq.answer },
        order: state.faq.items.length,
        is_active: true,
      };

      // Include section ID if provided
      if (sectionId) {
        payload.section = sectionId;
      }

      const created = await adminFAQApi.items.create(payload);
      return created;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Update a FAQ item
 */
export const updateFAQItem = createAsyncThunk(
  "faq/updateItem",
  async (
    { locale, id, updates }: { locale: Locale; id: number; updates: Partial<FAQ> },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const existingItem = state.faq.items.find(i => i.id === id);

      if (!existingItem) {
        return rejectWithValue("FAQ item not found");
      }

      const payload: Record<string, unknown> = {};

      if (updates.question !== undefined) {
        payload.question = { ...existingItem.question, [locale]: updates.question };
      }
      if (updates.answer !== undefined) {
        payload.answer = { ...existingItem.answer, [locale]: updates.answer };
      }

      const updated = await adminFAQApi.items.update(id, payload);
      return updated;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Delete a FAQ item
 */
export const deleteFAQItem = createAsyncThunk(
  "faq/deleteItem",
  async (id: number, { rejectWithValue }) => {
    try {
      await adminFAQApi.items.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Reorder FAQ items
 */
export const reorderFAQItems = createAsyncThunk(
  "faq/reorderItems",
  async (items: { id: number; order: number }[], { rejectWithValue }) => {
    try {
      await adminFAQApi.items.reorder({ items });
      return items;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Save FAQ section title/subtitle to backend
 */
export const saveFAQSection = createAsyncThunk(
  "faq/saveSection",
  async (
    { sectionId, locale, title, subtitle }: { sectionId: number; locale: Locale; title: string; subtitle: string },
    { rejectWithValue }
  ) => {
    try {
      const payload = {
        title: { [locale]: title },
        subtitle: { [locale]: subtitle },
      };
      const updated = await adminFAQApi.section.update(sectionId, payload);
      return { sectionId, locale, title, subtitle, data: updated };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Save FAQ content for a locale (full save for backwards compatibility)
 */
export const saveFAQContent = createAsyncThunk(
  "faq/saveContent",
  async (
    { locale, content }: { locale: Locale; content: FAQContent },
    { rejectWithValue }
  ) => {
    try {
      // This is a batch update - we update each FAQ item
      // For now, we just return the content as a compatibility layer
      console.log(`[API] Saving FAQ content for ${locale}:`, content);
      return { locale, content };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// =============================================================================
// SLICE
// =============================================================================

const faqSlice = createSlice({
  name: "faq",
  initialState,
  reducers: {
    /** Update section titles locally */
    updateFAQSection: (
      state,
      action: PayloadAction<{ locale: Locale; title: string; subtitle: string }>
    ) => {
      const { locale, title, subtitle } = action.payload;
      state.content[locale].sectionTitle = title;
      state.content[locale].sectionSubtitle = subtitle;
    },

    /** Optimistically add a FAQ locally */
    addFAQ: (state, action: PayloadAction<{ locale: Locale; faq: FAQ }>) => {
      const { locale, faq } = action.payload;
      state.content[locale].faqs.push(faq);
    },

    /** Optimistically update a FAQ locally */
    updateFAQ: (
      state,
      action: PayloadAction<{ locale: Locale; id: string; updates: Partial<FAQ> }>
    ) => {
      const { locale, id, updates } = action.payload;
      const faq = state.content[locale].faqs.find((f) => f.id === id);
      if (faq) {
        Object.assign(faq, updates);
      }
    },

    /** Optimistically remove a FAQ locally */
    removeFAQ: (state, action: PayloadAction<{ locale: Locale; id: string }>) => {
      const { locale, id } = action.payload;
      state.content[locale].faqs = state.content[locale].faqs.filter((f) => f.id !== id);
    },

    /** Toggle FAQ open/closed state (UI only, not persisted) */
    toggleFAQ: (state, action: PayloadAction<{ locale: Locale; id: string }>) => {
      const { locale, id } = action.payload;
      const faq = state.content[locale].faqs.find((f) => f.id === id);
      if (faq) {
        faq.isOpen = !faq.isOpen;
      }
    },

    /** Reset content for a locale to values from items */
    resetFAQContent: (state, action: PayloadAction<Locale>) => {
      const locale = action.payload;
      state.content[locale] = transformFAQContent(state.items, locale);
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
      // Fetch FAQ Content
      .addCase(fetchFAQContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFAQContent.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.content = transformToAllContent(action.payload);
        state.lastFetched = Date.now();
      })
      .addCase(fetchFAQContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Save FAQ Content (backwards compatibility)
      .addCase(saveFAQContent.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveFAQContent.fulfilled, (state, action) => {
        state.saving = false;
        const { locale, content } = action.payload;
        state.content[locale] = content;
      })
      .addCase(saveFAQContent.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })

      // Create FAQ Item
      .addCase(createFAQItem.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createFAQItem.fulfilled, (state, action) => {
        state.saving = false;
        state.items.push(action.payload);
        state.content = transformToAllContent(state.items);
      })
      .addCase(createFAQItem.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })

      // Update FAQ Item
      .addCase(updateFAQItem.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateFAQItem.fulfilled, (state, action) => {
        state.saving = false;
        const index = state.items.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.content = transformToAllContent(state.items);
      })
      .addCase(updateFAQItem.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })

      // Delete FAQ Item
      .addCase(deleteFAQItem.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(deleteFAQItem.fulfilled, (state, action) => {
        state.saving = false;
        state.items = state.items.filter(i => i.id !== action.payload);
        state.content = transformToAllContent(state.items);
      })
      .addCase(deleteFAQItem.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })

      // Reorder FAQ Items
      .addCase(reorderFAQItems.pending, (state) => {
        state.saving = true;
      })
      .addCase(reorderFAQItems.fulfilled, (state, action) => {
        state.saving = false;
        action.payload.forEach(({ id, order }) => {
          const item = state.items.find(i => i.id === id);
          if (item) item.order = order;
        });
        state.items.sort((a, b) => a.order - b.order);
        state.content = transformToAllContent(state.items);
      })
      .addCase(reorderFAQItems.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });
  },
});

// =============================================================================
// EXPORTS
// =============================================================================

export const {
  updateFAQSection,
  addFAQ,
  updateFAQ,
  removeFAQ,
  toggleFAQ,
  resetFAQContent,
  clearError,
  invalidateCache,
} = faqSlice.actions;

export default faqSlice.reducer;

// =============================================================================
// SELECTORS
// =============================================================================

export const selectFAQState = (state: RootState) => state.faq;
export const selectFAQContent = (state: RootState, locale: Locale) => state.faq.content[locale];
export const selectFAQItems = (state: RootState) => state.faq.items;
export const selectFAQLoading = (state: RootState) => state.faq.loading;
export const selectFAQSaving = (state: RootState) => state.faq.saving;
export const selectFAQError = (state: RootState) => state.faq.error;
