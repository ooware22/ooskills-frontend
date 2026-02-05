import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { adminSettingsApi } from "@/services/contentApi";
import { getErrorMessage } from "@/lib/axios";
import { CACHE_DURATION, shouldFetch } from "@/lib/cache";
import type { RootState } from "../index";

// Types
export type Locale = "fr" | "en" | "ar";

export interface ContactFormLabels {
  title: string;
  subtitle: string;
  nameLabel: string;
  emailLabel: string;
  subjectLabel: string;
  messageLabel: string;
  buttonText: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
}

export interface SocialLinks {
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter: string;
  youtube: string;
}

export interface ContactContent {
  formLabels: ContactFormLabels;
}

export interface ContactState {
  content: Record<Locale, ContactContent>;
  contactInfo: ContactInfo;
  socialLinks: SocialLinks;
  loading: boolean;
  saving: boolean;
  error: string | null;
  lastFetched: number | null;
}

// Default content
const defaultContent: Record<Locale, ContactContent> = {
  en: {
    formLabels: {
      title: "Get in Touch",
      subtitle: "Have a question? We'd love to hear from you.",
      nameLabel: "Your Name",
      emailLabel: "Email Address",
      subjectLabel: "Subject",
      messageLabel: "Message",
      buttonText: "Send Message",
    },
  },
  fr: {
    formLabels: {
      title: "Contactez-nous",
      subtitle: "Vous avez une question ? Nous serions ravis de vous entendre.",
      nameLabel: "Votre nom",
      emailLabel: "Adresse email",
      subjectLabel: "Sujet",
      messageLabel: "Message",
      buttonText: "Envoyer le message",
    },
  },
  ar: {
    formLabels: {
      title: "تواصل معنا",
      subtitle: "هل لديك سؤال؟ نحب أن نسمع منك.",
      nameLabel: "اسمك",
      emailLabel: "عنوان البريد الإلكتروني",
      subjectLabel: "الموضوع",
      messageLabel: "الرسالة",
      buttonText: "إرسال الرسالة",
    },
  },
};

const defaultContactInfo: ContactInfo = {
  email: "",
  phone: "",
  address: "",
};

const defaultSocialLinks: SocialLinks = {
  facebook: "",
  instagram: "",
  linkedin: "",
  twitter: "",
  youtube: "",
};

const initialState: ContactState = {
  content: defaultContent,
  contactInfo: defaultContactInfo,
  socialLinks: defaultSocialLinks,
  loading: false,
  saving: false,
  error: null,
  lastFetched: null,
};

// Async thunks
export const fetchContactContent = createAsyncThunk(
  "contact/fetchContent",
  async (options: { forceRefresh?: boolean } = {}, { rejectWithValue }) => {
    try {
      const data = await adminSettingsApi.get();
      return {
        content: defaultContent, // Form labels stay as defaults (frontend-only)
        contactInfo: {
          email: data.contact_email || "",
          phone: data.contact_phone || "",
          address: data.contact_address || "",
        },
        socialLinks: {
          facebook: data.facebook_url || "",
          instagram: data.instagram_url || "",
          linkedin: data.linkedin_url || "",
          twitter: data.twitter_url || "",
          youtube: data.youtube_url || "",
        },
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (options, { getState }) => {
      if (options?.forceRefresh) return true;
      const { contact } = getState() as RootState;
      return shouldFetch(contact.lastFetched, contact.loading, CACHE_DURATION.LONG);
    },
  }
);

export const saveContactContent = createAsyncThunk(
  "contact/saveContent",
  async (
    {
      locale,
      content,
      contactInfo,
      socialLinks,
    }: {
      locale: Locale;
      content: ContactContent;
      contactInfo: ContactInfo;
      socialLinks: SocialLinks;
    },
    { rejectWithValue }
  ) => {
    try {
      // Save contact info and social links to backend
      await adminSettingsApi.update({
        contact_email: contactInfo.email,
        contact_phone: contactInfo.phone,
        contact_address: contactInfo.address,
        facebook_url: socialLinks.facebook,
        instagram_url: socialLinks.instagram,
        linkedin_url: socialLinks.linkedin,
        twitter_url: socialLinks.twitter,
        youtube_url: socialLinks.youtube,
      });
      return { locale, content, contactInfo, socialLinks };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const contactSlice = createSlice({
  name: "contact",
  initialState,
  reducers: {
    updateFormLabels: (
      state,
      action: PayloadAction<{ locale: Locale; updates: Partial<ContactFormLabels> }>
    ) => {
      const { locale, updates } = action.payload;
      state.content[locale].formLabels = { ...state.content[locale].formLabels, ...updates };
    },
    updateContactInfo: (state, action: PayloadAction<Partial<ContactInfo>>) => {
      state.contactInfo = { ...state.contactInfo, ...action.payload };
    },
    updateSocialLinks: (state, action: PayloadAction<Partial<SocialLinks>>) => {
      state.socialLinks = { ...state.socialLinks, ...action.payload };
    },
    resetContactContent: (state, action: PayloadAction<Locale>) => {
      state.content[action.payload] = defaultContent[action.payload];
    },
    resetContactInfo: (state) => {
      state.contactInfo = defaultContactInfo;
    },
    resetSocialLinks: (state) => {
      state.socialLinks = defaultSocialLinks;
    },
    clearError: (state) => {
      state.error = null;
    },
    invalidateCache: (state) => {
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContactContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContactContent.fulfilled, (state, action) => {
        state.loading = false;
        state.content = action.payload.content;
        state.contactInfo = action.payload.contactInfo;
        state.socialLinks = action.payload.socialLinks;
        state.lastFetched = Date.now();
      })
      .addCase(fetchContactContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(saveContactContent.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveContactContent.fulfilled, (state, action) => {
        state.saving = false;
        const { locale, content, contactInfo, socialLinks } = action.payload;
        state.content[locale] = content;
        state.contactInfo = contactInfo;
        state.socialLinks = socialLinks;
      })
      .addCase(saveContactContent.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  updateFormLabels,
  updateContactInfo,
  updateSocialLinks,
  resetContactContent,
  resetContactInfo,
  resetSocialLinks,
  clearError,
  invalidateCache,
} = contactSlice.actions;
export default contactSlice.reducer;

// Selectors
export const selectContactState = (state: RootState) => state.contact;
export const selectContactContent = (state: RootState, locale: Locale) => state.contact.content[locale];
export const selectContactInfo = (state: RootState) => state.contact.contactInfo;
export const selectSocialLinks = (state: RootState) => state.contact.socialLinks;
export const selectContactLoading = (state: RootState) => state.contact.loading;
export const selectContactSaving = (state: RootState) => state.contact.saving;
export const selectContactError = (state: RootState) => state.contact.error;
export const selectContactLastFetched = (state: RootState) => state.contact.lastFetched;

