"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DocumentCheckIcon as Save, CheckIcon as Check, EnvelopeIcon as Mail, PhoneIcon as Phone, MapPinIcon as MapPin, GlobeAltIcon as Globe, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { useAdminLanguage, AdminLocale, adminLocaleLabels } from "@/contexts/AdminLanguageContext";
import { useI18n } from "@/lib/i18n";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchContactContent,
  saveContactContent,
  selectContactInfo,
  selectSocialLinks,
  selectContactLoading,
  selectContactSaving,
  selectContactError,
  selectContactLastFetched,
} from "@/store/slices/contactSlice";

// Custom social media icons (Heroicons doesn't include brand icons)
const Facebook = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
);
const Instagram = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
);
const Linkedin = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
);
const Twitter = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);
const Youtube = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
);
import AdminHeader from "@/components/admin/AdminHeader";

type ContactFormLabels = {
  title: string;
  subtitle: string;
  nameLabel: string;
  emailLabel: string;
  subjectLabel: string;
  messageLabel: string;
  buttonText: string;
};

type ContactFormData = {
  formLabels: ContactFormLabels;
};

// Default content per language
const defaultContent: Record<AdminLocale, ContactFormData> = {
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

export default function ContactAdmin() {
  const { editingLocale } = useAdminLanguage();
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  
  // Redux state from contactSlice
  const reduxContactInfo = useAppSelector(selectContactInfo);
  const reduxSocialLinks = useAppSelector(selectSocialLinks);
  const loading = useAppSelector(selectContactLoading);
  const saving = useAppSelector(selectContactSaving);
  const error = useAppSelector(selectContactError);
  const lastFetched = useAppSelector(selectContactLastFetched);
  
  // Local form state
  const [saved, setSaved] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Shared info (same across all languages)
  const [sharedInfo, setSharedInfo] = useState({
    contactInfo: {
      email: "",
      phone: "",
      address: "",
    },
    socialLinks: {
      facebook: "",
      instagram: "",
      linkedin: "",
      twitter: "",
      youtube: "",
    },
  });
  
  // Store content for all languages
  const [allContent, setAllContent] = useState<Record<AdminLocale, ContactFormData>>(defaultContent);
  
  // Current form data based on selected language
  const formData = allContent[editingLocale];

  // Fetch contact info from Redux/backend on mount (with caching)
  useEffect(() => {
    dispatch(fetchContactContent({}));
  }, [dispatch]);

  // Initialize local state from Redux when data is available (after fetch completes)
  useEffect(() => {
    if (lastFetched && !isInitialized && !loading) {
      setSharedInfo({
        contactInfo: {
          email: reduxContactInfo.email || "",
          phone: reduxContactInfo.phone || "",
          address: reduxContactInfo.address || "",
        },
        socialLinks: {
          facebook: reduxSocialLinks.facebook || "",
          instagram: reduxSocialLinks.instagram || "",
          linkedin: reduxSocialLinks.linkedin || "",
          twitter: reduxSocialLinks.twitter || "",
          youtube: reduxSocialLinks.youtube || "",
        },
      });
      setIsInitialized(true);
    }
  }, [lastFetched, reduxContactInfo, reduxSocialLinks, isInitialized, loading]);


  const updateFormLabels = (updates: Partial<ContactFormLabels>) => {
    setAllContent(prev => ({
      ...prev,
      [editingLocale]: {
        ...prev[editingLocale],
        formLabels: { ...prev[editingLocale].formLabels, ...updates }
      }
    }));
  };

  const handleSave = async () => {
    try {
      // Save contact info and social links to backend via Redux
      await dispatch(saveContactContent({
        locale: editingLocale,
        content: formData,
        contactInfo: sharedInfo.contactInfo,
        socialLinks: sharedInfo.socialLinks,
      })).unwrap();
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save contact info:", err);
    }
  };

  // Loading state
  if (loading || !isInitialized) {
    return (
      <div className="min-h-screen">
        <AdminHeader 
          titleKey="admin.contact.title"
          subtitleKey="admin.contact.subtitle"
        />
        <div className="p-6">
          <div className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 p-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
              <p className="text-silver dark:text-white/50">{t("admin.common.loading")}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen">
      <AdminHeader 
        titleKey="admin.contact.title"
        subtitleKey="admin.contact.subtitle"
      />
      
      <div className="p-6 space-y-6">
        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl flex items-start gap-3"
          >
            <ExclamationCircleIcon className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">{t("admin.common.error")}</p>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Contact Information (Shared) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 p-6"
        >
          <h3 className="text-sm font-semibold text-oxford dark:text-white mb-4">{t("admin.contact.contactInfo")}</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                <Mail className="w-4 h-4 inline me-2" />
                {t("admin.contact.email")}
              </label>
              <input
                type="email"
                value={sharedInfo.contactInfo.email}
                onChange={(e) => setSharedInfo({ ...sharedInfo, contactInfo: { ...sharedInfo.contactInfo, email: e.target.value } })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                <Phone className="w-4 h-4 inline me-2" />
                {t("admin.contact.phone")}
              </label>
              <input
                type="tel"
                value={sharedInfo.contactInfo.phone}
                onChange={(e) => setSharedInfo({ ...sharedInfo, contactInfo: { ...sharedInfo.contactInfo, phone: e.target.value } })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                <MapPin className="w-4 h-4 inline me-2" />
                {t("admin.contact.address")}
              </label>
              <input
                type="text"
                value={sharedInfo.contactInfo.address}
                onChange={(e) => setSharedInfo({ ...sharedInfo, contactInfo: { ...sharedInfo.contactInfo, address: e.target.value } })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
              />
            </div>
          </div>
        </motion.div>

        {/* Social Media Links (Shared) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 p-6"
        >
          <h3 className="text-sm font-semibold text-oxford dark:text-white mb-4">{t("admin.contact.socialLinks")}</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                <Facebook className="w-4 h-4 inline me-2 text-blue-600" />
                {t("admin.contact.facebook")}
              </label>
              <input
                type="url"
                value={sharedInfo.socialLinks.facebook}
                onChange={(e) => setSharedInfo({ ...sharedInfo, socialLinks: { ...sharedInfo.socialLinks, facebook: e.target.value } })}
                placeholder="https://facebook.com/..."
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                <Instagram className="w-4 h-4 inline me-2 text-pink-600" />
                {t("admin.contact.instagram")}
              </label>
              <input
                type="url"
                value={sharedInfo.socialLinks.instagram}
                onChange={(e) => setSharedInfo({ ...sharedInfo, socialLinks: { ...sharedInfo.socialLinks, instagram: e.target.value } })}
                placeholder="https://instagram.com/..."
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                <Linkedin className="w-4 h-4 inline me-2 text-blue-700" />
                {t("admin.contact.linkedin")}
              </label>
              <input
                type="url"
                value={sharedInfo.socialLinks.linkedin}
                onChange={(e) => setSharedInfo({ ...sharedInfo, socialLinks: { ...sharedInfo.socialLinks, linkedin: e.target.value } })}
                placeholder="https://linkedin.com/..."
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                <Twitter className="w-4 h-4 inline me-2 text-sky-500" />
                {t("admin.contact.twitter")}
              </label>
              <input
                type="url"
                value={sharedInfo.socialLinks.twitter}
                onChange={(e) => setSharedInfo({ ...sharedInfo, socialLinks: { ...sharedInfo.socialLinks, twitter: e.target.value } })}
                placeholder="https://twitter.com/..."
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                <Youtube className="w-4 h-4 inline me-2 text-red-600" />
                {t("admin.contact.youtube")}
              </label>
              <input
                type="url"
                value={sharedInfo.socialLinks.youtube}
                onChange={(e) => setSharedInfo({ ...sharedInfo, socialLinks: { ...sharedInfo.socialLinks, youtube: e.target.value } })}
                placeholder="https://youtube.com/..."
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
              />
            </div>
          </div>
        </motion.div>

        {/* Contact Form Labels (Language-specific) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10"
        >
          <div className="p-6 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold text-oxford dark:text-white">{t("admin.contact.formLabels")}</h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gold/10 text-gold rounded-full text-xs font-medium">
                  <Globe className="w-3 h-3" />
                  {adminLocaleLabels[editingLocale]}
                </span>
              </div>
              <p className="text-xs text-silver dark:text-white/50">{t("admin.common.editingLanguage")}: {adminLocaleLabels[editingLocale]}</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium bg-gold hover:bg-gold-light text-oxford rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-oxford/30 border-t-oxford rounded-full animate-spin" />
              ) : saved ? (
                <Check className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saved ? t("admin.common.saved") : t("admin.common.save")}
            </button>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                  {t("admin.contact.formTitle")}
                </label>
                <input
                  type="text"
                  value={formData.formLabels.title}
                  onChange={(e) => updateFormLabels({ title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                  dir={editingLocale === "ar" ? "rtl" : "ltr"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                  {t("admin.contact.formSubtitle")}
                </label>
                <input
                  type="text"
                  value={formData.formLabels.subtitle}
                  onChange={(e) => updateFormLabels({ subtitle: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                  dir={editingLocale === "ar" ? "rtl" : "ltr"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                  {t("admin.contact.buttonText")}
                </label>
                <input
                  type="text"
                  value={formData.formLabels.buttonText}
                  onChange={(e) => updateFormLabels({ buttonText: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                  dir={editingLocale === "ar" ? "rtl" : "ltr"}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
