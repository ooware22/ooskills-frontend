"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon as Search,
  PlusIcon as Plus,
  PencilSquareIcon as Edit,
  TrashIcon as Trash,
  EyeIcon as Eye,
  XMarkIcon as X,
  TagIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  // Icon options for categories
  CodeBracketIcon,
  BriefcaseIcon,
  PaintBrushIcon,
  GlobeAltIcon,
  BookOpenIcon,
  MusicalNoteIcon,
  CameraIcon,
  HeartIcon,
  ChartBarIcon,
  CalculatorIcon,
  CpuChipIcon,
  StarIcon,
  AcademicCapIcon,
  LightBulbIcon,
  WrenchScrewdriverIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import AdminHeader from "@/components/admin/AdminHeader";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/store/slices/adminCategoriesSlice";
import type { AdminCategory, AdminCategoryCreatePayload } from "@/services/adminCategoriesApi";

// =============================================================================
// ICON MAP AND HELPERS
// =============================================================================

const ICON_MAP: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  star: StarIcon,
  code: CodeBracketIcon,
  briefcase: BriefcaseIcon,
  palette: PaintBrushIcon,
  globe: GlobeAltIcon,
  book: BookOpenIcon,
  music: MusicalNoteIcon,
  camera: CameraIcon,
  heart: HeartIcon,
  chart: ChartBarIcon,
  calculator: CalculatorIcon,
  cpu: CpuChipIcon,
  academic: AcademicCapIcon,
  lightbulb: LightBulbIcon,
  wrench: WrenchScrewdriverIcon,
  rocket: RocketLaunchIcon,
  shield: ShieldCheckIcon,
  cube: CubeIcon,
};

const ICON_OPTIONS = Object.keys(ICON_MAP);

const CategoryIcon = ({ iconName, className }: { iconName: string; className?: string }) => {
  const IconComp = ICON_MAP[iconName] || StarIcon;
  return <IconComp className={className} />;
};

// =============================================================================
// TYPES
// =============================================================================

type ModalMode = "add" | "edit" | "view" | "delete" | null;

interface CategoryForm {
  nameAr: string;
  nameEn: string;
  nameFr: string;
  slug: string;
  icon: string;
}

const emptyForm: CategoryForm = { nameAr: "", nameEn: "", nameFr: "", slug: "", icon: "star" };

// =============================================================================
// COMPONENT
// =============================================================================

export default function CategoryManagementPage() {
  const { t } = useI18n();
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const { categories, totalCount, loading, saving } = useSelector(
    (state: RootState) => state.adminCategories
  );

  // Local UI state
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedCategory, setSelectedCategory] = useState<AdminCategory | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState("");
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Form state
  const [formData, setFormData] = useState<CategoryForm>(emptyForm);

  // Translation helper
  const tc = (key: string) => t(`admin.categoryManagement.${key}`);

  // Fetch on mount
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Debounced search (client-side filter)
  const handleSearchChange = (val: string) => {
    setLocalSearch(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setLocalSearch(val);
    }, 400);
  };

  // Client-side filtered
  const filteredCategories = categories.filter((cat) => {
    if (!localSearch) return true;
    const s = localSearch.toLowerCase();
    return (
      cat.name.en.toLowerCase().includes(s) ||
      cat.name.fr.toLowerCase().includes(s) ||
      cat.name.ar.toLowerCase().includes(s) ||
      cat.slug.toLowerCase().includes(s)
    );
  });

  // Toast
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Modal CRUD
  const resetForm = () => setFormData(emptyForm);

  const openAdd = () => {
    resetForm();
    setModalMode("add");
  };

  const openEdit = (cat: AdminCategory) => {
    setSelectedCategory(cat);
    setFormData({
      nameAr: cat.name.ar,
      nameEn: cat.name.en,
      nameFr: cat.name.fr,
      slug: cat.slug,
      icon: cat.icon,
    });
    setModalMode("edit");
  };

  const openView = (cat: AdminCategory) => {
    setSelectedCategory(cat);
    setModalMode("view");
  };

  const openDelete = (cat: AdminCategory) => {
    setSelectedCategory(cat);
    setModalMode("delete");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedCategory(null);
    resetForm();
  };

  const handleSave = async () => {
    const payload: AdminCategoryCreatePayload = {
      name: { ar: formData.nameAr, en: formData.nameEn, fr: formData.nameFr },
      slug: formData.slug,
      icon: formData.icon,
    };

    if (modalMode === "add") {
      const result = await dispatch(createCategory(payload));
      if (createCategory.fulfilled.match(result)) {
        showToast(tc("categoryAdded"));
        closeModal();
      }
    } else if (modalMode === "edit" && selectedCategory) {
      const result = await dispatch(updateCategory({ id: selectedCategory.id, data: payload }));
      if (updateCategory.fulfilled.match(result)) {
        showToast(tc("categoryUpdated"));
        closeModal();
      }
    }
  };

  const handleDelete = async () => {
    if (selectedCategory) {
      const result = await dispatch(deleteCategory(selectedCategory.id));
      if (deleteCategory.fulfilled.match(result)) {
        showToast(tc("categoryDeleted"));
        closeModal();
      }
    }
  };

  return (
    <div className="min-h-screen">
      <AdminHeader titleKey="admin.categoryManagement.title" subtitleKey="admin.categoryManagement.subtitle" />

      <div className="p-4 lg:p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: tc("totalCategories"), value: totalCount, icon: TagIcon, color: "text-purple-500", bg: "bg-purple-500/10" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-silver dark:text-white/50">{stat.label}</p>
                  <p className="text-2xl font-bold text-oxford dark:text-white mt-1">{stat.value}</p>
                </div>
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", stat.bg)}>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 p-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={tc("searchPlaceholder") !== `admin.categoryManagement.searchPlaceholder` ? tc("searchPlaceholder") : t("admin.common.search")}
                value={localSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full ps-10 pe-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors"
              />
            </div>

            {/* Add Category Button */}
            <button
              onClick={openAdd}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gold text-oxford rounded-lg text-sm font-semibold hover:bg-gold/90 transition-colors shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>{tc("addCategory")}</span>
            </button>
          </div>
        </div>

        {/* Categories Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden"
        >
          {/* Loading State */}
          {loading && (
            <div className="p-12 flex flex-col items-center gap-3">
              <ArrowPathIcon className="w-8 h-8 text-gold animate-spin" />
              <p className="text-sm text-silver dark:text-white/50">Loading categories...</p>
            </div>
          )}

          {!loading && (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-white/10">
                      <th className="text-start px-5 py-4 text-xs font-semibold text-silver dark:text-white/50 uppercase tracking-wider">
                        {tc("icon")}
                      </th>
                      <th className="text-start px-5 py-4 text-xs font-semibold text-silver dark:text-white/50 uppercase tracking-wider">
                        {tc("nameEn")}
                      </th>
                      <th className="text-start px-5 py-4 text-xs font-semibold text-silver dark:text-white/50 uppercase tracking-wider">
                        {tc("nameFr")}
                      </th>
                      <th className="text-start px-5 py-4 text-xs font-semibold text-silver dark:text-white/50 uppercase tracking-wider">
                        {tc("nameAr")}
                      </th>
                      <th className="text-start px-5 py-4 text-xs font-semibold text-silver dark:text-white/50 uppercase tracking-wider">
                        {tc("slug")}
                      </th>
                      <th className="text-end px-5 py-4 text-xs font-semibold text-silver dark:text-white/50 uppercase tracking-wider">
                        {t("admin.common.actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {filteredCategories.map((cat, idx) => (
                      <motion.tr
                        key={cat.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="px-5 py-4">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-purple-500/10")}>
                            <CategoryIcon iconName={cat.icon} className="w-5 h-5 text-purple-500" />
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-oxford dark:text-white text-sm">{cat.name.en}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600 dark:text-white/60">
                          {cat.name.fr}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600 dark:text-white/60" dir="rtl">
                          {cat.name.ar}
                        </td>
                        <td className="px-5 py-4">
                          <code className="px-2 py-1 bg-gray-100 dark:bg-white/5 rounded text-xs text-gray-600 dark:text-white/60">{cat.slug}</code>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openView(cat)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors" title={tc("viewCategory")}>
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => openEdit(cat)} className="p-2 text-gray-400 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors" title={tc("editCategory")}>
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => openDelete(cat)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title={tc("deleteCategory")}>
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-gray-100 dark:divide-white/5">
                {filteredCategories.map((cat) => (
                  <div key={cat.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center bg-purple-500/10")}>
                          <CategoryIcon iconName={cat.icon} className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                          <p className="font-medium text-oxford dark:text-white text-sm">{cat.name.en}</p>
                          <p className="text-xs text-silver dark:text-white/40">{cat.slug}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openView(cat)} className="p-2 text-gray-400 hover:text-blue-500 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEdit(cat)} className="p-2 text-gray-400 hover:text-gold rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => openDelete(cat)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors">
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-white/40">FR: {cat.name.fr}</span>
                      <span className="text-xs text-gray-500 dark:text-white/40" dir="rtl">AR: {cat.name.ar}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {filteredCategories.length === 0 && !loading && (
                <div className="p-12 text-center">
                  <TagIcon className="w-12 h-12 text-gray-300 dark:text-white/20 mx-auto mb-3" />
                  <p className="text-sm text-silver dark:text-white/50">{tc("noCategoriesFound")}</p>
                </div>
              )}

              {/* Footer */}
              <div className="px-5 py-3 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
                <p className="text-xs text-silver dark:text-white/50">
                  {filteredCategories.length} / {totalCount} {tc("totalCategories").toLowerCase()}
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
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={cn(
                "relative w-full bg-white dark:bg-oxford-light rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden",
                modalMode === "delete" ? "max-w-md" : "max-w-lg"
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10">
                <h3 className="text-lg font-semibold text-oxford dark:text-white">
                  {modalMode === "add" && tc("addCategory")}
                  {modalMode === "edit" && tc("editCategory")}
                  {modalMode === "view" && tc("viewCategory")}
                  {modalMode === "delete" && tc("deleteCategory")}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Delete Confirmation */}
              {modalMode === "delete" && selectedCategory && (
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 rounded-xl">
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800 dark:text-red-300">{tc("confirmDelete")}</p>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">{tc("confirmDeleteDesc")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-purple-500/10")}>
                      <CategoryIcon iconName={selectedCategory.icon} className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-medium text-oxford dark:text-white text-sm">{selectedCategory.name.en}</p>
                      <p className="text-xs text-silver dark:text-white/40">{selectedCategory.slug}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={closeModal} className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-white/10 text-oxford dark:text-white rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      {t("admin.common.cancel")}
                    </button>
                    <button onClick={handleDelete} disabled={saving} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50">
                      {saving ? "..." : t("admin.common.delete")}
                    </button>
                  </div>
                </div>
              )}

              {/* View Category */}
              {modalMode === "view" && selectedCategory && (
                <div className="p-6 space-y-5">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center bg-purple-500/10 ring-2 ring-gray-100 dark:ring-white/10")}>
                      <CategoryIcon iconName={selectedCategory.icon} className="w-8 h-8 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-oxford dark:text-white">{selectedCategory.name.en}</p>
                      <code className="text-xs text-silver dark:text-white/40">{selectedCategory.slug}</code>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: tc("nameEn"), value: selectedCategory.name.en },
                      { label: tc("nameFr"), value: selectedCategory.name.fr },
                      { label: tc("nameAr"), value: selectedCategory.name.ar },
                      { label: tc("slug"), value: selectedCategory.slug },
                      { label: tc("icon"), value: selectedCategory.icon },
                    ].map((item) => (
                      <div key={item.label} className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl overflow-hidden min-w-0">
                        <p className="text-xs text-silver dark:text-white/40 mb-1">{item.label}</p>
                        <p className="text-sm font-medium text-oxford dark:text-white truncate" title={item.value}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add / Edit Form */}
              {(modalMode === "add" || modalMode === "edit") && (
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  {/* Name EN */}
                  <div>
                    <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">{tc("nameEn")} <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors"
                    />
                  </div>

                  {/* Name FR */}
                  <div>
                    <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">{tc("nameFr")} <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.nameFr}
                      onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })}
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors"
                    />
                  </div>

                  {/* Name AR */}
                  <div>
                    <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">{tc("nameAr")} <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      dir="rtl"
                      value={formData.nameAr}
                      onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">{tc("slug")} <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors"
                    />
                  </div>

                  {/* Icon Picker */}
                  <div>
                    <label className="block text-xs font-medium text-silver dark:text-white/50 mb-2">{tc("icon")}</label>
                    <div className="grid grid-cols-6 gap-2">
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
                          <CategoryIcon iconName={iconName} className={cn("w-5 h-5", formData.icon === iconName ? "text-gold" : "text-gray-500 dark:text-white/50")} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-3">
                    <button
                      onClick={closeModal}
                      className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-white/10 text-oxford dark:text-white rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      {t("admin.common.cancel")}
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving || !formData.nameEn || !formData.slug}
                      className="flex-1 px-4 py-2.5 bg-gold text-oxford rounded-xl text-sm font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      {saving ? "..." : modalMode === "add" ? tc("addCategory") : t("admin.common.save")}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
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
