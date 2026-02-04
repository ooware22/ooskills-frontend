import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

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
  email: "contact@ooskills.com",
  phone: "+213 555 123 456",
  address: "Algiers, Algeria",
};

const defaultSocialLinks: SocialLinks = {
  facebook: "https://facebook.com/ooskills",
  instagram: "https://instagram.com/ooskills",
  linkedin: "https://linkedin.com/company/ooskills",
  twitter: "https://twitter.com/ooskills",
  youtube: "",
};

const initialState: ContactState = {
  content: defaultContent,
  contactInfo: defaultContactInfo,
  socialLinks: defaultSocialLinks,
  loading: false,
  saving: false,
  error: null,
};

// Async thunks
export const fetchContactContent = createAsyncThunk(
  "contact/fetchContent",
  async (_, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        content: defaultContent,
        contactInfo: defaultContactInfo,
        socialLinks: defaultSocialLinks,
      };
    } catch (error) {
      return rejectWithValue("Failed to fetch contact content");
    }
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
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(`[API] Saving contact content for ${locale}:`, { content, contactInfo, socialLinks });
      return { locale, content, contactInfo, socialLinks };
    } catch (error) {
      return rejectWithValue("Failed to save contact content");
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
} = contactSlice.actions;
export default contactSlice.reducer;
