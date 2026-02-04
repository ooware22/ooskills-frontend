import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Types
export type Locale = "fr" | "en" | "ar";

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  isOpen?: boolean;
}

export interface FAQContent {
  sectionTitle: string;
  sectionSubtitle: string;
  faqs: FAQ[];
}

export interface FAQState {
  content: Record<Locale, FAQContent>;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

// Default content
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

const initialState: FAQState = {
  content: defaultContent,
  loading: false,
  saving: false,
  error: null,
};

// Async thunks
export const fetchFAQContent = createAsyncThunk(
  "faq/fetchContent",
  async (_, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      return defaultContent;
    } catch (error) {
      return rejectWithValue("Failed to fetch FAQ content");
    }
  }
);

export const saveFAQContent = createAsyncThunk(
  "faq/saveContent",
  async (
    { locale, content }: { locale: Locale; content: FAQContent },
    { rejectWithValue }
  ) => {
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(`[API] Saving FAQ content for ${locale}:`, content);
      return { locale, content };
    } catch (error) {
      return rejectWithValue("Failed to save FAQ content");
    }
  }
);

const faqSlice = createSlice({
  name: "faq",
  initialState,
  reducers: {
    updateFAQSection: (
      state,
      action: PayloadAction<{ locale: Locale; title: string; subtitle: string }>
    ) => {
      const { locale, title, subtitle } = action.payload;
      state.content[locale].sectionTitle = title;
      state.content[locale].sectionSubtitle = subtitle;
    },
    addFAQ: (state, action: PayloadAction<{ locale: Locale; faq: FAQ }>) => {
      const { locale, faq } = action.payload;
      state.content[locale].faqs.push(faq);
    },
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
    removeFAQ: (state, action: PayloadAction<{ locale: Locale; id: string }>) => {
      const { locale, id } = action.payload;
      state.content[locale].faqs = state.content[locale].faqs.filter((f) => f.id !== id);
    },
    toggleFAQ: (state, action: PayloadAction<{ locale: Locale; id: string }>) => {
      const { locale, id } = action.payload;
      const faq = state.content[locale].faqs.find((f) => f.id === id);
      if (faq) {
        faq.isOpen = !faq.isOpen;
      }
    },
    resetFAQContent: (state, action: PayloadAction<Locale>) => {
      state.content[action.payload] = defaultContent[action.payload];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFAQContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFAQContent.fulfilled, (state, action) => {
        state.loading = false;
        state.content = action.payload;
      })
      .addCase(fetchFAQContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
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
      });
  },
});

export const { updateFAQSection, addFAQ, updateFAQ, removeFAQ, toggleFAQ, resetFAQContent, clearError } = faqSlice.actions;
export default faqSlice.reducer;
