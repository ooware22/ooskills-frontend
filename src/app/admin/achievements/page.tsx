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
  RocketLaunchIcon,
  HeartIcon,
  GlobeAltIcon,
  LightBulbIcon,
  MusicalNoteIcon,
  PuzzlePieceIcon,
  HandThumbUpIcon,
  ClockIcon,
  CpuChipIcon,
  BeakerIcon,
  WrenchScrewdriverIcon,
  PaintBrushIcon,
  CameraIcon,
  MicrophoneIcon,
  CommandLineIcon,
  CubeIcon,
  EyeIcon,
  GiftIcon,
  MapPinIcon,
  MegaphoneIcon,
  UserGroupIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import { FireIcon } from "@heroicons/react/24/solid";
import AdminHeader from "@/components/admin/AdminHeader";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";

// =============================================================================
// ICON MAP & CATEGORIES
// =============================================================================

const ICON_MAP: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  // Education
  AcademicCapIcon,
  BookOpenIcon,
  LightBulbIcon,
  BeakerIcon,
  DocumentTextIcon,
  CommandLineIcon,
  // Gaming & Achievement
  TrophyIcon,
  StarIcon,
  SparklesIcon,
  FireIcon,
  BoltIcon,
  RocketLaunchIcon,
  FlagIcon,
  GiftIcon,
  ArrowTrendingUpIcon,
  // Social
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  HeartIcon,
  HandThumbUpIcon,
  MegaphoneIcon,
  MicrophoneIcon,
  // Creative & Tech
  PaintBrushIcon,
  CameraIcon,
  MusicalNoteIcon,
  PuzzlePieceIcon,
  CpuChipIcon,
  WrenchScrewdriverIcon,
  CubeIcon,
  // Misc
  ShieldCheckIcon,
  GlobeAltIcon,
  ClockIcon,
  EyeIcon,
  MapPinIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
};

const ICON_CATEGORIES: { label: string; icons: string[] }[] = [
  { label: "Education", icons: ["AcademicCapIcon", "BookOpenIcon", "LightBulbIcon", "BeakerIcon", "DocumentTextIcon", "CommandLineIcon"] },
  { label: "Achievement", icons: ["TrophyIcon", "StarIcon", "SparklesIcon", "FireIcon", "BoltIcon", "RocketLaunchIcon", "FlagIcon", "GiftIcon", "ArrowTrendingUpIcon"] },
  { label: "Social", icons: ["ChatBubbleLeftRightIcon", "UserGroupIcon", "HeartIcon", "HandThumbUpIcon", "MegaphoneIcon", "MicrophoneIcon"] },
  { label: "Creative", icons: ["PaintBrushIcon", "CameraIcon", "MusicalNoteIcon", "PuzzlePieceIcon", "CpuChipIcon", "WrenchScrewdriverIcon", "CubeIcon"] },
  { label: "Misc", icons: ["ShieldCheckIcon", "GlobeAltIcon", "ClockIcon", "EyeIcon", "MapPinIcon", "ChartBarIcon", "CurrencyDollarIcon", "CalendarDaysIcon"] },
];

const ICON_OPTIONS = Object.keys(ICON_MAP);

const CONDITION_TYPES = [
  { value: "lessons_completed", label: "Lessons Completed", icon: BookOpenIcon, color: "text-blue-400" },
  { value: "quizzes_passed", label: "Quizzes Passed", icon: CheckCircleIcon, color: "text-emerald-400" },
  { value: "courses_completed", label: "Courses Completed", icon: AcademicCapIcon, color: "text-purple-400" },
  { value: "streak_days", label: "Streak Days", icon: FireIcon, color: "text-orange-400" },
  { value: "total_xp", label: "Total XP Reached", icon: BoltIcon, color: "text-yellow-400" },
  { value: "perfect_quiz", label: "Perfect Quiz Score", icon: StarIcon, color: "text-pink-400" },
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
                modalMode === "delete" ? "max-w-md" : "max-w-3xl"
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10 bg-gradient-to-r from-transparent via-gold/5 to-transparent">
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    modalMode === "delete" ? "bg-red-500/10" : "bg-gold/10"
                  )}>
                    {modalMode === "delete" ? (
                      <Trash className="w-4 h-4 text-red-500" />
                    ) : modalMode === "edit" ? (
                      <Edit className="w-4 h-4 text-gold" />
                    ) : (
                      <TrophyIcon className="w-4 h-4 text-gold" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-oxford dark:text-white">
                      {modalMode === "add" && "Add Achievement"}
                      {modalMode === "edit" && "Edit Achievement"}
                      {modalMode === "delete" && "Delete Achievement"}
                    </h3>
                    <p className="text-[10px] text-silver dark:text-white/40">
                      {modalMode === "add" && "Create a new achievement for students"}
                      {modalMode === "edit" && "Modify achievement settings"}
                      {modalMode === "delete" && "Remove this achievement permanently"}
                    </p>
                  </div>
                </div>
                <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all hover:rotate-90 duration-200">
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
                <div className="max-h-[80vh] overflow-y-auto">
                  {/* Live Preview Banner */}
                  <div className="px-6 py-5 bg-gradient-to-r from-gold/5 via-gold/10 to-gold/5 dark:from-gold/10 dark:via-gold/15 dark:to-gold/10 border-b border-gold/20">
                    <p className="text-[10px] uppercase tracking-widest text-gold/70 font-semibold mb-3">Live Preview</p>
                    <div className="flex items-center gap-4 p-4 bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-white/50 dark:border-white/10 shadow-sm">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 shadow-inner">
                          <AchIcon name={formData.icon} className="w-7 h-7 text-gold" />
                        </div>
                        {formData.is_active && (
                          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-oxford-light" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-oxford dark:text-white text-sm truncate">
                          {formData.titleEn || formData.key || "Achievement Name"}
                        </h4>
                        <p className="text-xs text-silver dark:text-white/40 truncate mt-0.5">
                          {formData.descEn || "Achievement description will appear here"}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gold/10 text-gold text-[10px] font-bold rounded-md">
                            <BoltIcon className="w-3 h-3" /> +{formData.xp_reward} XP
                          </span>
                          <span className="text-[10px] text-silver dark:text-white/30">
                            {CONDITION_TYPES.find(c => c.value === formData.condition_type)?.label} ≥ {formData.condition_value}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-5">
                    {/* ── Section: Identity ── */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <CommandLineIcon className="w-3.5 h-3.5 text-blue-500" />
                        </div>
                        <h4 className="text-xs font-semibold text-oxford dark:text-white uppercase tracking-wider">Identity</h4>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">Unique Key <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <CommandLineIcon className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={formData.key}
                            onChange={(e) => setFormData({ ...formData, key: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
                            placeholder="e.g. first_lesson"
                            className="w-full ps-10 pe-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-oxford dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-white/5" />

                    {/* ── Section: Localization ── */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center">
                          <GlobeAltIcon className="w-3.5 h-3.5 text-purple-500" />
                        </div>
                        <h4 className="text-xs font-semibold text-oxford dark:text-white uppercase tracking-wider">Localization</h4>
                      </div>

                      {/* Titles */}
                      <p className="text-[10px] uppercase tracking-wider text-silver dark:text-white/30 font-semibold mb-2">Titles</p>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div>
                          <label className="block text-[10px] font-medium text-silver dark:text-white/40 mb-1">English</label>
                          <input type="text" value={formData.titleEn} onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                            placeholder="Title in English"
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-silver dark:text-white/40 mb-1">French</label>
                          <input type="text" value={formData.titleFr} onChange={(e) => setFormData({ ...formData, titleFr: e.target.value })}
                            placeholder="Titre en français"
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-silver dark:text-white/40 mb-1">Arabic</label>
                          <input type="text" dir="rtl" value={formData.titleAr} onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                            placeholder="العنوان بالعربية"
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all" />
                        </div>
                      </div>

                      {/* Descriptions */}
                      <p className="text-[10px] uppercase tracking-wider text-silver dark:text-white/30 font-semibold mb-2">Descriptions</p>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-medium text-silver dark:text-white/40 mb-1">English</label>
                          <textarea value={formData.descEn} onChange={(e) => setFormData({ ...formData, descEn: e.target.value })} rows={2}
                            placeholder="Describe the achievement..."
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all resize-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-silver dark:text-white/40 mb-1">French</label>
                          <textarea value={formData.descFr} onChange={(e) => setFormData({ ...formData, descFr: e.target.value })} rows={2}
                            placeholder="Décrivez le succès..."
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all resize-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-silver dark:text-white/40 mb-1">Arabic</label>
                          <textarea dir="rtl" value={formData.descAr} onChange={(e) => setFormData({ ...formData, descAr: e.target.value })} rows={2}
                            placeholder="وصف الإنجاز..."
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all resize-none" />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-white/5" />

                    {/* ── Section: Conditions & Rewards ── */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center">
                          <BoltIcon className="w-3.5 h-3.5 text-amber-500" />
                        </div>
                        <h4 className="text-xs font-semibold text-oxford dark:text-white uppercase tracking-wider">Conditions & Rewards</h4>
                      </div>

                      {/* Condition Type as cards */}
                      <label className="block text-xs font-medium text-silver dark:text-white/50 mb-2">Condition Type</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                        {CONDITION_TYPES.map((c) => {
                          const CondIcon = c.icon;
                          return (
                            <button
                              key={c.value}
                              type="button"
                              onClick={() => setFormData({ ...formData, condition_type: c.value })}
                              className={cn(
                                "flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-start transition-all text-xs font-medium",
                                formData.condition_type === c.value
                                  ? "border-gold bg-gold/10 text-oxford dark:text-white shadow-sm"
                                  : "border-gray-200 dark:border-white/10 text-silver dark:text-white/50 hover:border-gold/40"
                              )}
                            >
                              <CondIcon className={cn("w-4 h-4 flex-shrink-0", formData.condition_type === c.value ? "text-gold" : c.color)} />
                              {c.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Value + XP */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">Threshold Value</label>
                          <div className="relative">
                            <FlagIcon className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="number" min={1} value={formData.condition_value} onChange={(e) => setFormData({ ...formData, condition_value: parseInt(e.target.value) || 1 })}
                              className="w-full ps-10 pe-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">XP Reward</label>
                          <div className="relative">
                            <BoltIcon className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold" />
                            <input type="number" min={0} value={formData.xp_reward} onChange={(e) => setFormData({ ...formData, xp_reward: parseInt(e.target.value) || 0 })}
                              className="w-full ps-10 pe-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-white/5" />

                    {/* ── Section: Icon Picker ── */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-lg bg-pink-500/10 flex items-center justify-center">
                          <SparklesIcon className="w-3.5 h-3.5 text-pink-500" />
                        </div>
                        <h4 className="text-xs font-semibold text-oxford dark:text-white uppercase tracking-wider">Icon</h4>
                        <span className="text-[10px] text-silver dark:text-white/30 ms-auto">
                          {formData.icon.replace("Icon", "").replace(/([A-Z])/g, " $1").trim()}
                        </span>
                      </div>

                      <div className="space-y-3 max-h-[200px] overflow-y-auto ps-2 pe-1 scrollbar-thin">
                        {ICON_CATEGORIES.map((cat) => (
                          <div key={cat.label}>
                            <p className="text-[10px] uppercase tracking-wider text-silver dark:text-white/30 font-semibold mb-1.5">{cat.label}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {cat.icons.map((iconName) => (
                                <button
                                  key={iconName}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, icon: iconName })}
                                  className={cn(
                                    "w-10 h-10 rounded-xl border-2 transition-all flex items-center justify-center group",
                                    formData.icon === iconName
                                      ? "border-gold bg-gold/15 shadow-md shadow-gold/20 scale-110"
                                      : "border-gray-200 dark:border-white/10 hover:border-gold/50 hover:bg-gold/5 hover:scale-105"
                                  )}
                                  title={iconName.replace("Icon", "").replace(/([A-Z])/g, " $1").trim()}
                                >
                                  <AchIcon name={iconName} className={cn("w-5 h-5 transition-colors", formData.icon === iconName ? "text-gold" : "text-gray-400 dark:text-white/40 group-hover:text-gold/70")} />
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-white/5" />

                    {/* ── Status Toggle ── */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/[0.03] rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                          formData.is_active ? "bg-emerald-500/10" : "bg-gray-200 dark:bg-white/10"
                        )}>
                          <CheckCircleIcon className={cn("w-4 h-4 transition-colors", formData.is_active ? "text-emerald-500" : "text-gray-400")} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-oxford dark:text-white">{formData.is_active ? "Active" : "Inactive"}</p>
                          <p className="text-[10px] text-silver dark:text-white/30">{formData.is_active ? "Students can earn this achievement" : "Hidden from students"}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                        className={cn(
                          "relative w-12 h-7 rounded-full transition-colors",
                          formData.is_active ? "bg-emerald-500" : "bg-gray-300 dark:bg-white/20"
                        )}
                      >
                        <motion.div
                          layout
                          className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md"
                          animate={{ x: formData.is_active ? 22 : 2 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      </button>
                    </div>
                  </div>

                  {/* ── Footer Actions ── */}
                  <div className="flex gap-3 px-6 py-4 border-t border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]">
                    <button onClick={closeModal} className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-white/10 text-oxford dark:text-white rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving || !formData.key}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gold to-gold/80 text-oxford rounded-xl text-sm font-semibold hover:from-gold/90 hover:to-gold/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    >
                      {saving ? (
                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          {modalMode === "add" ? <Plus className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                          {modalMode === "add" ? "Add Achievement" : "Save Changes"}
                        </>
                      )}
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
