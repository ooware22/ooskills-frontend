"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon as Search,
  PlusIcon as Plus,
  PencilSquareIcon as Edit,
  TrashIcon as Trash,
  XMarkIcon as X,
  StarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  AcademicCapIcon,
  BookOpenIcon,
  FlagIcon,
  TrophyIcon,
  SparklesIcon,
  BoltIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { FireIcon } from "@heroicons/react/24/solid";
import AdminHeader from "@/components/admin/AdminHeader";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";

// =============================================================================
// ICON MAP
// =============================================================================

const ICON_MAP: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  AcademicCapIcon: AcademicCapIcon,
  BookOpenIcon: BookOpenIcon,
  FlagIcon: FlagIcon,
  StarIcon: StarIcon,
  TrophyIcon: TrophyIcon,
  SparklesIcon: SparklesIcon,
  BoltIcon: BoltIcon,
  ShieldCheckIcon: ShieldCheckIcon,
  ChatBubbleLeftRightIcon: ChatBubbleLeftRightIcon,
  FireIcon: FireIcon,
};

const ICON_OPTIONS = Object.keys(ICON_MAP);

const CONDITION_TYPES = [
  { value: "lessons_completed", label: "Lessons Completed" },
  { value: "quizzes_passed", label: "Quizzes Passed" },
  { value: "courses_completed", label: "Courses Completed" },
  { value: "streak_days", label: "Streak Days" },
  { value: "total_xp", label: "Total XP Reached" },
  { value: "perfect_quiz", label: "Perfect Quiz Score" },
];

// =============================================================================
// TYPES
// =============================================================================

interface AchievementDef {
  id: string;
  key: string;
  title: { en: string; fr: string; ar: string };
  description: { en: string; fr: string; ar: string };
  icon: string;
  xp_reward: number;
  condition_type: string;
  condition_value: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

type ModalMode = "add" | "edit" | "delete" | null;

interface AchievementForm {
  key: string;
  titleEn: string;
  titleFr: string;
  titleAr: string;
  descEn: string;
  descFr: string;
  descAr: string;
  icon: string;
  xp_reward: number;
  condition_type: string;
  condition_value: number;
  is_active: boolean;
}

const emptyForm: AchievementForm = {
  key: "",
  titleEn: "",
  titleFr: "",
  titleAr: "",
  descEn: "",
  descFr: "",
  descAr: "",
  icon: "TrophyIcon",
  xp_reward: 20,
  condition_type: "lessons_completed",
  condition_value: 1,
  is_active: true,
};

// =============================================================================
// COMPONENT
// =============================================================================

export default function AchievementsAdminPage() {
  const [achievements, setAchievements] = useState<AchievementDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<AchievementDef | null>(null);
  const [formData, setFormData] = useState<AchievementForm>(emptyForm);

  // Fetch achievements
  const fetchAchievements = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/gamification/admin-achievements/");
      setAchievements(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("Failed to fetch achievements:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  // Filtered
  const filtered = achievements.filter((a) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      a.key.toLowerCase().includes(s) ||
      (a.title?.en || "").toLowerCase().includes(s) ||
      (a.title?.fr || "").toLowerCase().includes(s)
    );
  });

  // Toast
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Modal
  const openAdd = () => {
    setFormData(emptyForm);
    setModalMode("add");
  };

  const openEdit = (a: AchievementDef) => {
    setSelected(a);
    setFormData({
      key: a.key,
      titleEn: a.title?.en || "",
      titleFr: a.title?.fr || "",
      titleAr: a.title?.ar || "",
      descEn: a.description?.en || "",
      descFr: a.description?.fr || "",
      descAr: a.description?.ar || "",
      icon: a.icon,
      xp_reward: a.xp_reward,
      condition_type: a.condition_type,
      condition_value: a.condition_value,
      is_active: a.is_active,
    });
    setModalMode("edit");
  };

  const openDelete = (a: AchievementDef) => {
    setSelected(a);
    setModalMode("delete");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelected(null);
    setFormData(emptyForm);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      key: formData.key,
      title: { en: formData.titleEn, fr: formData.titleFr, ar: formData.titleAr },
      description: { en: formData.descEn, fr: formData.descFr, ar: formData.descAr },
      icon: formData.icon,
      xp_reward: formData.xp_reward,
      condition_type: formData.condition_type,
      condition_value: formData.condition_value,
      is_active: formData.is_active,
    };

    try {
      if (modalMode === "add") {
        await api.post("/gamification/admin-achievements/", payload);
        showToast("Achievement created!");
      } else if (modalMode === "edit" && selected) {
        await api.put(`/gamification/admin-achievements/${selected.id}/`, payload);
        showToast("Achievement updated!");
      }
      closeModal();
      fetchAchievements();
    } catch (err: any) {
      const detail = err.response?.data;
      showToast(typeof detail === "string" ? detail : JSON.stringify(detail));
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.delete(`/gamification/admin-achievements/${selected.id}/`);
      showToast("Achievement deleted!");
      closeModal();
      fetchAchievements();
    } catch (err) {
      showToast("Delete failed");
    }
    setSaving(false);
  };

  const AchIcon = ({ name, className }: { name: string; className?: string }) => {
    const Ic = ICON_MAP[name] || TrophyIcon;
    return <Ic className={className} />;
  };

  return (
    <div className="min-h-screen">
      <AdminHeader titleKey="admin.achievements.title" subtitleKey="admin.achievements.subtitle" />

      <div className="p-4 lg:p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total", value: achievements.length, color: "text-gold", bg: "bg-gold/10" },
            { label: "Active", value: achievements.filter((a) => a.is_active).length, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { label: "Inactive", value: achievements.filter((a) => !a.is_active).length, color: "text-red-400", bg: "bg-red-400/10" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-silver dark:text-white/50">{stat.label}</p>
                  <p className="text-2xl font-bold text-oxford dark:text-white mt-1">{stat.value}</p>
                </div>
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", stat.bg)}>
                  <TrophyIcon className={cn("w-5 h-5", stat.color)} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search + Add */}
        <div className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search achievements..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full ps-10 pe-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors"
              />
            </div>
            <button
              onClick={openAdd}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gold text-oxford rounded-lg text-sm font-semibold hover:bg-gold/90 transition-colors shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Add Achievement</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden"
        >
          {loading && (
            <div className="p-12 flex flex-col items-center gap-3">
              <ArrowPathIcon className="w-8 h-8 text-gold animate-spin" />
              <p className="text-sm text-silver dark:text-white/50">Loading achievements...</p>
            </div>
          )}

          {!loading && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-white/10">
                      <th className="text-start px-5 py-4 text-xs font-semibold text-silver dark:text-white/50 uppercase tracking-wider">Icon</th>
                      <th className="text-start px-5 py-4 text-xs font-semibold text-silver dark:text-white/50 uppercase tracking-wider">Key</th>
                      <th className="text-start px-5 py-4 text-xs font-semibold text-silver dark:text-white/50 uppercase tracking-wider">Title (EN)</th>
                      <th className="text-start px-5 py-4 text-xs font-semibold text-silver dark:text-white/50 uppercase tracking-wider">Condition</th>
                      <th className="text-start px-5 py-4 text-xs font-semibold text-silver dark:text-white/50 uppercase tracking-wider">XP</th>
                      <th className="text-start px-5 py-4 text-xs font-semibold text-silver dark:text-white/50 uppercase tracking-wider">Status</th>
                      <th className="text-end px-5 py-4 text-xs font-semibold text-silver dark:text-white/50 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {filtered.map((a, idx) => (
                      <motion.tr
                        key={a.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="px-5 py-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gold/10">
                            <AchIcon name={a.icon} className="w-5 h-5 text-gold" />
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <code className="px-2 py-1 bg-gray-100 dark:bg-white/5 rounded text-xs text-gray-600 dark:text-white/60">{a.key}</code>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-oxford dark:text-white text-sm">{a.title?.en || a.key}</p>
                          <p className="text-xs text-silver dark:text-white/40 mt-0.5">{a.description?.en || ""}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600 dark:text-white/60">
                          {CONDITION_TYPES.find((c) => c.value === a.condition_type)?.label || a.condition_type} ≥ {a.condition_value}
                        </td>
                        <td className="px-5 py-4">
                          <span className="px-2 py-1 bg-gold/10 text-gold text-xs font-bold rounded-lg">+{a.xp_reward} XP</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={cn(
                            "px-2 py-1 text-xs font-medium rounded-lg",
                            a.is_active ? "bg-emerald-500/10 text-emerald-500" : "bg-red-400/10 text-red-400"
                          )}>
                            {a.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEdit(a)} className="p-2 text-gray-400 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => openDelete(a)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filtered.length === 0 && !loading && (
                <div className="p-12 text-center">
                  <TrophyIcon className="w-12 h-12 text-gray-300 dark:text-white/20 mx-auto mb-3" />
                  <p className="text-sm text-silver dark:text-white/50">No achievements found</p>
                  <p className="text-xs text-silver/60 dark:text-white/30 mt-1">Create your first achievement to get started</p>
                </div>
              )}

              <div className="px-5 py-3 border-t border-gray-200 dark:border-white/10">
                <p className="text-xs text-silver dark:text-white/50">
                  {filtered.length} / {achievements.length} achievements
                </p>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* =================== MODALS =================== */}
      <AnimatePresence>
        {modalMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={cn(
                "relative w-full bg-white dark:bg-oxford-light rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden",
                modalMode === "delete" ? "max-w-md" : "max-w-2xl"
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10">
                <h3 className="text-lg font-semibold text-oxford dark:text-white">
                  {modalMode === "add" && "Add Achievement"}
                  {modalMode === "edit" && "Edit Achievement"}
                  {modalMode === "delete" && "Delete Achievement"}
                </h3>
                <button onClick={closeModal} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Delete */}
              {modalMode === "delete" && selected && (
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 rounded-xl">
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800 dark:text-red-300">Are you sure?</p>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">This will permanently delete this achievement definition.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gold/10">
                      <AchIcon name={selected.icon} className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <p className="font-medium text-oxford dark:text-white text-sm">{selected.title?.en || selected.key}</p>
                      <p className="text-xs text-silver dark:text-white/40">{selected.key}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={closeModal} className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-white/10 text-oxford dark:text-white rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleDelete} disabled={saving} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50">
                      {saving ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              )}

              {/* Add / Edit Form */}
              {(modalMode === "add" || modalMode === "edit") && (
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  {/* Key */}
                  <div>
                    <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">Key <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.key}
                      onChange={(e) => setFormData({ ...formData, key: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
                      placeholder="e.g. first_lesson"
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors"
                    />
                  </div>

                  {/* Title i18n */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">Title (EN)</label>
                      <input type="text" value={formData.titleEn} onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">Title (FR)</label>
                      <input type="text" value={formData.titleFr} onChange={(e) => setFormData({ ...formData, titleFr: e.target.value })}
                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">Title (AR)</label>
                      <input type="text" dir="rtl" value={formData.titleAr} onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors" />
                    </div>
                  </div>

                  {/* Description i18n */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">Description (EN)</label>
                      <textarea value={formData.descEn} onChange={(e) => setFormData({ ...formData, descEn: e.target.value })} rows={2}
                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors resize-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">Description (FR)</label>
                      <textarea value={formData.descFr} onChange={(e) => setFormData({ ...formData, descFr: e.target.value })} rows={2}
                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors resize-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">Description (AR)</label>
                      <textarea dir="rtl" value={formData.descAr} onChange={(e) => setFormData({ ...formData, descAr: e.target.value })} rows={2}
                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors resize-none" />
                    </div>
                  </div>

                  {/* Condition + Value + XP */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">Condition Type</label>
                      <select
                        value={formData.condition_type}
                        onChange={(e) => setFormData({ ...formData, condition_type: e.target.value })}
                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors"
                      >
                        {CONDITION_TYPES.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">Threshold Value</label>
                      <input type="number" min={1} value={formData.condition_value} onChange={(e) => setFormData({ ...formData, condition_value: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">XP Reward</label>
                      <input type="number" min={0} value={formData.xp_reward} onChange={(e) => setFormData({ ...formData, xp_reward: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors" />
                    </div>
                  </div>

                  {/* Icon Picker */}
                  <div>
                    <label className="block text-xs font-medium text-silver dark:text-white/50 mb-2">Icon</label>
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                      {ICON_OPTIONS.map((iconName) => (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon: iconName })}
                          className={cn(
                            "p-3 rounded-xl border-2 transition-all flex items-center justify-center",
                            formData.icon === iconName
                              ? "border-gold bg-gold/10 shadow-md"
                              : "border-gray-200 dark:border-white/10 hover:border-gold/50"
                          )}
                          title={iconName}
                        >
                          <AchIcon name={iconName} className={cn("w-5 h-5", formData.icon === iconName ? "text-gold" : "text-gray-500 dark:text-white/50")} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Toggle */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                      className={cn(
                        "relative w-11 h-6 rounded-full transition-colors",
                        formData.is_active ? "bg-emerald-500" : "bg-gray-300 dark:bg-white/20"
                      )}
                    >
                      <div className={cn(
                        "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                        formData.is_active ? "translate-x-[22px]" : "translate-x-0.5"
                      )} />
                    </button>
                    <span className="text-sm text-oxford dark:text-white">{formData.is_active ? "Active" : "Inactive"}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-3">
                    <button onClick={closeModal} className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-white/10 text-oxford dark:text-white rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving || !formData.key}
                      className="flex-1 px-4 py-2.5 bg-gold text-oxford rounded-xl text-sm font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      {saving ? "..." : modalMode === "add" ? "Add Achievement" : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className="fixed bottom-6 left-1/2 z-[60] flex items-center gap-2 px-5 py-3 bg-oxford dark:bg-white text-white dark:text-oxford rounded-xl shadow-2xl border border-white/10 dark:border-gray-200"
          >
            <CheckCircleIcon className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
            <span className="text-sm font-medium">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
