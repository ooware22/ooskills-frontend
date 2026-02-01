"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Check, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  isOpen?: boolean;
}

export default function FAQAdmin() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [sectionTitle, setSectionTitle] = useState("Frequently Asked Questions");
  const [sectionSubtitle, setSectionSubtitle] = useState("Find answers to common questions about our platform");
  
  const [faqs, setFaqs] = useState<FAQ[]>([
    { id: "1", question: "How does OOSkills work?", answer: "OOSkills is an online learning platform that offers courses in various fields. After registration, you can browse our catalog, enroll in courses, and learn at your own pace.", isOpen: true },
    { id: "2", question: "Are certificates recognized?", answer: "Yes, our certificates are recognized by employers and can be added to your CV and LinkedIn profile to showcase your skills.", isOpen: false },
    { id: "3", question: "Can I access courses on mobile?", answer: "Absolutely! Our platform is fully responsive and works on all devices - smartphones, tablets, and computers.", isOpen: false },
    { id: "4", question: "What is the refund policy?", answer: "We offer a 30-day money-back guarantee. If you're not satisfied with a course, you can request a full refund within 30 days of purchase.", isOpen: false },
    { id: "5", question: "How do I contact support?", answer: "You can reach our support team via email at support@ooskills.com or through the contact form on our website. We respond within 24 hours.", isOpen: false },
  ]);

  const handleSave = async () => {
    setSaving(true);
    // TODO: Replace with actual Django API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addFaq = () => {
    setFaqs([
      ...faqs,
      { id: Date.now().toString(), question: "New Question?", answer: "Answer here...", isOpen: true }
    ]);
  };

  const removeFaq = (id: string) => {
    setFaqs(faqs.filter(f => f.id !== id));
  };

  const updateFaq = (id: string, field: keyof FAQ, value: string) => {
    setFaqs(faqs.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const toggleFaq = (id: string) => {
    setFaqs(faqs.map(f => f.id === id ? { ...f, isOpen: !f.isOpen } : f));
  };

  return (
    <div className="min-h-screen">
      <AdminHeader 
        title="FAQ" 
        subtitle="Manage frequently asked questions" 
      />
      
      <div className="p-6 space-y-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 p-6"
        >
          <h3 className="text-sm font-semibold text-oxford dark:text-white mb-4">Section Header</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                Section Title
              </label>
              <input
                type="text"
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                Section Subtitle
              </label>
              <input
                type="text"
                value={sectionSubtitle}
                onChange={(e) => setSectionSubtitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
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
              <h3 className="text-sm font-semibold text-oxford dark:text-white">Questions & Answers</h3>
              <p className="text-xs text-silver dark:text-white/50">{faqs.length} items</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={addFaq}
                className="px-3 py-2 text-sm font-medium border border-gray-200 dark:border-white/10 text-oxford dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Question
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
                {saved ? "Saved!" : "Save Changes"}
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-white/10">
            {faqs.map((faq, index) => (
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
                    <span className="text-sm font-medium text-oxford dark:text-white">
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
                      <label className="block text-xs font-medium text-silver mb-1">Question</label>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => updateFaq(faq.id, "question", e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-silver mb-1">Answer</label>
                      <textarea
                        rows={3}
                        value={faq.answer}
                        onChange={(e) => updateFaq(faq.id, "answer", e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold resize-none"
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
