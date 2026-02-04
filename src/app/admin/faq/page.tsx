"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DocumentCheckIcon as Save, CheckIcon as Check, PlusIcon as Plus, TrashIcon as Trash2, ChevronDownIcon as ChevronDown, ChevronUpIcon as ChevronUp, GlobeAltIcon as Globe } from "@heroicons/react/24/outline";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminLanguage, AdminLocale, adminLocaleLabels } from "@/contexts/AdminLanguageContext";
import { useI18n } from "@/lib/i18n";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  isOpen?: boolean;
}

type FAQFormData = {
  sectionTitle: string;
  sectionSubtitle: string;
  faqs: FAQ[];
};

// Default content per language
const defaultContent: Record<AdminLocale, FAQFormData> = {
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

export default function FAQAdmin() {
  const { editingLocale } = useAdminLanguage();
  const { t } = useI18n();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Store content for all languages
  const [allContent, setAllContent] = useState<Record<AdminLocale, FAQFormData>>(defaultContent);
  
  // Current form data based on selected language
  const formData = allContent[editingLocale];

  const updateSectionTitle = (value: string) => {
    setAllContent(prev => ({
      ...prev,
      [editingLocale]: { ...prev[editingLocale], sectionTitle: value }
    }));
  };

  const updateSectionSubtitle = (value: string) => {
    setAllContent(prev => ({
      ...prev,
      [editingLocale]: { ...prev[editingLocale], sectionSubtitle: value }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    console.log(`Saving ${editingLocale} content:`, formData);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addFaq = () => {
    setAllContent(prev => ({
      ...prev,
      [editingLocale]: {
        ...prev[editingLocale],
        faqs: [
          ...prev[editingLocale].faqs,
          { id: Date.now().toString(), question: "New Question?", answer: "Answer here...", isOpen: true }
        ]
      }
    }));
  };

  const removeFaq = (id: string) => {
    setAllContent(prev => ({
      ...prev,
      [editingLocale]: {
        ...prev[editingLocale],
        faqs: prev[editingLocale].faqs.filter(f => f.id !== id)
      }
    }));
  };

  const updateFaq = (id: string, field: keyof FAQ, value: string) => {
    setAllContent(prev => ({
      ...prev,
      [editingLocale]: {
        ...prev[editingLocale],
        faqs: prev[editingLocale].faqs.map(f => f.id === id ? { ...f, [field]: value } : f)
      }
    }));
  };

  const toggleFaq = (id: string) => {
    setAllContent(prev => ({
      ...prev,
      [editingLocale]: {
        ...prev[editingLocale],
        faqs: prev[editingLocale].faqs.map(f => f.id === id ? { ...f, isOpen: !f.isOpen } : f)
      }
    }));
  };

  return (
    <div className="min-h-screen">
      <AdminHeader 
        titleKey="admin.faq.title"
        subtitleKey="admin.faq.subtitle"
      />
      
      <div className="p-6 space-y-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-sm font-semibold text-oxford dark:text-white">{t("admin.common.sectionTitle")}</h3>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gold/10 text-gold rounded-full text-xs font-medium">
              <Globe className="w-3 h-3" />
              {adminLocaleLabels[editingLocale]}
            </span>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                {t("admin.common.sectionTitle")}
              </label>
              <input
                type="text"
                value={formData.sectionTitle}
                onChange={(e) => updateSectionTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                dir={editingLocale === "ar" ? "rtl" : "ltr"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                {t("admin.common.sectionSubtitle")}
              </label>
              <input
                type="text"
                value={formData.sectionSubtitle}
                onChange={(e) => updateSectionSubtitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                dir={editingLocale === "ar" ? "rtl" : "ltr"}
              />
            </div>
          </div>
        </motion.div>

        {/* FAQ List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10"
        >
          <div className="p-6 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold text-oxford dark:text-white">{t("admin.faq.questionsAnswers")}</h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gold/10 text-gold rounded-full text-xs font-medium">
                  <Globe className="w-3 h-3" />
                  {adminLocaleLabels[editingLocale]}
                </span>
              </div>
              <p className="text-xs text-silver dark:text-white/50">{formData.faqs.length} {t("admin.features.items")}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={addFaq}
                className="px-3 py-2 text-sm font-medium border border-gray-200 dark:border-white/10 text-oxford dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t("admin.faq.addQuestion")}
              </button>
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
          </div>

          <div className="divide-y divide-gray-200 dark:divide-white/10">
            {formData.faqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4"
              >
                {/* Question Header */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-6 h-6 bg-gold/10 rounded text-gold text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="flex-1 flex items-center justify-between text-start"
                  >
                    <span className="text-sm font-medium text-oxford dark:text-white" dir={editingLocale === "ar" ? "rtl" : "ltr"}>
                      {faq.question || "Untitled Question"}
                    </span>
                    {faq.isOpen ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => removeFaq(faq.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Expanded Content */}
                {faq.isOpen && (
                  <div className="ms-9 space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-silver mb-1">{t("admin.faq.question")}</label>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => updateFaq(faq.id, "question", e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold"
                        dir={editingLocale === "ar" ? "rtl" : "ltr"}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-silver mb-1">{t("admin.faq.answer")}</label>
                      <textarea
                        rows={3}
                        value={faq.answer}
                        onChange={(e) => updateFaq(faq.id, "answer", e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold resize-none"
                        dir={editingLocale === "ar" ? "rtl" : "ltr"}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
