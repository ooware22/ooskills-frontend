"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, RotateCcw, Check } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";

export default function HeroAdmin() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [formData, setFormData] = useState({
    badge: "#1 E-Learning Platform in Algeria",
    title: "Develop your skills with",
    titleHighlight: "OOSkills",
    subtitle: "Access quality training in IT, office tools, and personal development. Learn at your own pace with experts.",
    ctaPrimary: "Explore Courses",
    ctaSecondary: "Learn More",
    illustrationTitle: "Learn. Practice. Succeed.",
    illustrationSubtitle: "Your journey to excellence starts here",
  });

  const handleSave = async () => {
    setSaving(true);
    // TODO: Replace with actual Django API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setFormData({
      badge: "#1 E-Learning Platform in Algeria",
      title: "Develop your skills with",
      titleHighlight: "OOSkills",
      subtitle: "Access quality training in IT, office tools, and personal development. Learn at your own pace with experts.",
      ctaPrimary: "Explore Courses",
      ctaSecondary: "Learn More",
      illustrationTitle: "Learn. Practice. Succeed.",
      illustrationSubtitle: "Your journey to excellence starts here",
    });
  };

  return (
    <div className="min-h-screen">
      <AdminHeader 
        title="Hero Section" 
        subtitle="Manage the main hero section content" 
      />
      
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10"
        >
          {/* Form Header */}
          <div className="p-6 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-oxford dark:text-white">
                Edit Hero Content
              </h2>
              <p className="text-sm text-silver dark:text-white/50">
                Changes will be reflected on the landing page
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-silver hover:text-oxford dark:hover:text-white border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
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

          {/* Form Fields */}
          <div className="p-6 space-y-6">
            {/* Badge */}
            <div>
              <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                Badge Text
              </label>
              <input
                type="text"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
              />
            </div>

            {/* Title Row */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                  Title (Before Highlight)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                  Title Highlight (Brand Name)
                </label>
                <input
                  type="text"
                  value={formData.titleHighlight}
                  onChange={(e) => setFormData({ ...formData, titleHighlight: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                />
              </div>
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                Subtitle
              </label>
              <textarea
                rows={3}
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all resize-none"
              />
            </div>

            {/* CTA Buttons */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                  Primary CTA Text
                </label>
                <input
                  type="text"
                  value={formData.ctaPrimary}
                  onChange={(e) => setFormData({ ...formData, ctaPrimary: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                  Secondary CTA Text
                </label>
                <input
                  type="text"
                  value={formData.ctaSecondary}
                  onChange={(e) => setFormData({ ...formData, ctaSecondary: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                />
              </div>
            </div>

            {/* Illustration Content */}
            <div className="pt-6 border-t border-gray-200 dark:border-white/10">
              <h3 className="text-sm font-semibold text-oxford dark:text-white mb-4">
                Dashboard Card Content
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                    Card Title
                  </label>
                  <input
                    type="text"
                    value={formData.illustrationTitle}
                    onChange={(e) => setFormData({ ...formData, illustrationTitle: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                    Card Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.illustrationSubtitle}
                    onChange={(e) => setFormData({ ...formData, illustrationSubtitle: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
