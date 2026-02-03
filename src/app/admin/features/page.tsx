"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DocumentCheckIcon as Save, CheckIcon as Check, PlusIcon as Plus, TrashIcon as Trash2, Bars2Icon as GripVertical } from "@heroicons/react/24/outline";
import AdminHeader from "@/components/admin/AdminHeader";

const iconOptions = [
  "Monitor", "Users", "Award", "Zap", "Clock", "Shield", 
  "Target", "Rocket", "BookOpen", "Star", "Heart", "CheckCircle"
];

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export default function FeaturesAdmin() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [sectionTitle, setSectionTitle] = useState("Why Choose OOSkills?");
  const [sectionSubtitle, setSectionSubtitle] = useState("Everything you need for an exceptional learning experience");
  
  const [features, setFeatures] = useState<Feature[]>([
    { id: "1", icon: "Monitor", title: "Quality Courses", description: "Professionally designed content by industry experts" },
    { id: "2", icon: "Users", title: "Expert Instructors", description: "Learn from professionals with real experience" },
    { id: "3", icon: "Award", title: "Certificates", description: "Get recognized certificates upon completion" },
    { id: "4", icon: "Zap", title: "Learn at Your Pace", description: "Flexible schedules to fit your lifestyle" },
    { id: "5", icon: "Clock", title: "24/7 Access", description: "Access your courses anytime, anywhere" },
    { id: "6", icon: "Shield", title: "Lifetime Access", description: "Once enrolled, access content forever" },
  ]);

  const handleSave = async () => {
    setSaving(true);
    // TODO: Replace with actual Django API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addFeature = () => {
    setFeatures([
      ...features,
      { id: Date.now().toString(), icon: "Star", title: "New Feature", description: "Description here" }
    ]);
  };

  const removeFeature = (id: string) => {
    setFeatures(features.filter(f => f.id !== id));
  };

  const updateFeature = (id: string, field: keyof Feature, value: string) => {
    setFeatures(features.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  return (
    <div className="min-h-screen">
      <AdminHeader 
        title="Features / Why Choose Us" 
        subtitle="Manage the features cards section" 
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

        {/* Features List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10"
        >
          <div className="p-6 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-oxford dark:text-white">Feature Cards</h3>
              <p className="text-xs text-silver dark:text-white/50">{features.length} items</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={addFeature}
                className="px-3 py-2 text-sm font-medium border border-gray-200 dark:border-white/10 text-oxford dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Feature
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
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-2 cursor-grab text-gray-400">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <div className="flex-1 grid md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-silver mb-1">Icon</label>
                      <select
                        value={feature.icon}
                        onChange={(e) => updateFeature(feature.id, "icon", e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold"
                      >
                        {iconOptions.map(icon => (
                          <option key={icon} value={icon}>{icon}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-silver mb-1">Title</label>
                      <input
                        type="text"
                        value={feature.title}
                        onChange={(e) => updateFeature(feature.id, "title", e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-silver mb-1">Description</label>
                      <input
                        type="text"
                        value={feature.description}
                        onChange={(e) => updateFeature(feature.id, "description", e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeFeature(feature.id)}
                    className="mt-6 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
