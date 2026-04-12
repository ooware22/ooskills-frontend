"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon as Search,
  PlusIcon as Plus,
  PencilSquareIcon as Edit,
  TrashIcon as Trash,
  EyeIcon as Eye,
  XMarkIcon as X,
  AcademicCapIcon,
  UserGroupIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PlusCircleIcon,
  MinusCircleIcon,
  ArrowUpTrayIcon,
  PhotoIcon,
  CodeBracketIcon,
  PaperClipIcon,
  DocumentTextIcon,
  DocumentIcon,
  PresentationChartBarIcon,
  VideoCameraIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import AdminHeader from "@/components/admin/AdminHeader";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import axiosClient from "@/lib/axios";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import {
  fetchAdminCourses,
  createAdminCourse,
  updateAdminCourse,
  deleteAdminCourse,
  previewAdminCourseZip,
  importAdminCourseFromZip,
  setFilters,
  invalidateCache,
} from "@/store/slices/adminCoursesManagementSlice";
import { fetchCategories } from "@/store/slices/adminCategoriesSlice";
import type {
  AdminCourse,
  AdminCourseCreatePayload,
  CourseZipPreviewPlan,
} from "@/services/adminCoursesManagementApi";

// =============================================================================
// TYPES
// =============================================================================

type ModalMode = "add" | "edit" | "view" | "delete" | "import-zip" | null;

interface CourseMaterial {
  id: string;
  name: string;
  type: "pdf" | "word" | "slides" | "video" | "other";
  size: string;
  url: string;
}

interface CourseForm {
  title: string;
  slug: string;
  category: string;
  level: string;
  duration: number;
  price: number;
  originalPrice: number;
  discount: number;
  description: string;
  prerequisites: string[];
  whatYouLearn: string[];
  language: string;
  certificate: boolean;
  image: string;
  status: string;
  materials: CourseMaterial[];
}

const emptyForm: CourseForm = {
  title: "",
  slug: "",
  category: "",
  level: "initialisation",
  duration: 0,
  price: 0,
  originalPrice: 0,
  discount: 0,
  description: "",
  prerequisites: [],
  whatYouLearn: [],
  language: "",
  certificate: true,
  image: "",
  status: "draft",
  materials: [],
};

const levelColor = (level: string) => {
  switch (level) {
    case "initialisation":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    case "approfondissement":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
    case "etude_de_cas":
      return "bg-red-500/10 text-red-600 dark:text-red-400";
    default:
      return "bg-gray-500/10 text-gray-600";
  }
};

const statusColor = (status: string) => {
  switch (status) {
    case "published":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    case "draft":
      return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
    case "archived":
      return "bg-gray-500/10 text-gray-500 dark:text-gray-400";
    default:
      return "bg-gray-500/10 text-gray-600";
  }
};

const extractError = (payload: any): string => {
  if (typeof payload === "string") return payload;
  if (payload && typeof payload === "object" && "detail" in payload)
    return String(payload.detail);
  return "An unknown error occurred.";
};

// =============================================================================
// COMPONENT
// =============================================================================

export default function CourseManagementPage() {
  const { t } = useI18n();
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const { courses, totalCount, loading, saving, filters } = useSelector(
    (state: RootState) => state.adminCoursesManagement,
  );
  const { categories } = useSelector(
    (state: RootState) => state.adminCategories,
  );

  // Local UI state
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedCourse, setSelectedCourse] = useState<AdminCourse | null>(
    null,
  );
  const [toast, setToast] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState(filters.search);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Form state
  const [formData, setFormData] = useState<CourseForm>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // JSON import state (only used in "add" mode)
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [listJson, setListJson] = useState({
    prerequisites: "",
    whatYouLearn: "",
  });
  const [listJsonError, setListJsonError] = useState<
    Partial<Record<"prerequisites" | "whatYouLearn", string>>
  >({});

  // ZIP import state
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [zipPreviewPlan, setZipPreviewPlan] =
    useState<CourseZipPreviewPlan | null>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  // Save error — shown inside the modal
  const [saveError, setSaveError] = useState<string | null>(null);

  // Translation helper
  const tc = (key: string) => t(`admin.courseManagement.${key}`);

  // Fetch on mount
  useEffect(() => {
    dispatch(fetchAdminCourses(undefined));
    dispatch(fetchCategories());
  }, [dispatch]);

  // Debounced search
  const handleSearchChange = (val: string) => {
    setLocalSearch(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      dispatch(setFilters({ search: val }));
    }, 400);
  };

  // Client-side filtered courses
  const filteredCourses = useMemo(() => {
    let result = [...courses];
    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(s) || c.slug.toLowerCase().includes(s),
      );
    }
    if (filters.category && filters.category !== "all") {
      result = result.filter((c) => c.category === filters.category);
    }
    if (filters.level && filters.level !== "all") {
      result = result.filter((c) => c.level === filters.level);
    }
    return result;
  }, [courses, filters]);

  // Stats
  const totalStudents = courses.reduce((sum, c) => sum + c.students, 0);
  const publishedCount = courses.filter((c) => c.status === "published").length;

  // Toast
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case "initialisation":
        return tc("levelInitialisation");
      case "approfondissement":
        return tc("levelApprofondissement");
      case "etude_de_cas":
        return tc("levelEtudeDeCas");
      default:
        return level;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "draft":
        return tc("statusDraft");
      case "published":
        return tc("statusPublished");
      case "archived":
        return tc("statusArchived");
      default:
        return status;
    }
  };

  // Modal CRUD
  const resetForm = () => {
    setFormData(emptyForm);
    setImageFile(null);
    setImagePreview(null);
  };

  const openAdd = () => {
    resetForm();
    setJsonMode(false);
    setJsonText("");
    setJsonError(null);
    setSaveError(null);
    setModalMode("add");
  };

  const openImportZip = () => {
    resetForm();
    setZipFile(null);
    setZipPreviewPlan(null);
    setSaveError(null);
    setModalMode("import-zip");
  };

  /** Parse pasted JSON and populate the form. Image is always left empty (null). */
  const parseJsonInput = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const origPrice = parsed.originalPrice ?? parsed.original_price ?? 0;
      const disc = parsed.discount ?? 0;
      const computedPrice =
        parsed.price ?? Math.round(origPrice * (1 - disc / 100));
      setFormData({
        title: parsed.title || "",
        slug: (parsed.slug || parsed.title || "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
        category: parsed.category || "",
        level: parsed.level || "initialisation",
        duration:
          parsed.duration ??
          (parsed.modules?.reduce(
            (sum: number, m: { duration_minutes?: number }) =>
              sum + (m.duration_minutes || 0),
            0,
          ) ?? 0) / 60,
        price: computedPrice,
        originalPrice: origPrice,
        discount: disc,
        description: parsed.description || parsed.subtitle || "",
        prerequisites: Array.isArray(parsed.prerequisites)
          ? typeof parsed.prerequisites[0] === "string"
            ? parsed.prerequisites
            : []
          : typeof parsed.prerequisites === "string" && parsed.prerequisites
            ? [parsed.prerequisites]
            : [],
        whatYouLearn: Array.isArray(parsed.whatYouLearn || parsed.objectives)
          ? parsed.whatYouLearn || parsed.objectives
          : [],
        language: parsed.language || "",
        certificate: parsed.certificate ?? true,
        image: "",
        status: parsed.status || "draft",
        materials: [],
      });
      setImageFile(null);
      setImagePreview(null);
      setJsonError(null);
      setJsonMode(false); // switch back to form view so user can review
      showToast(tc("jsonApplied") || "JSON applied — review and save");
    } catch (err) {
      setJsonError((err as Error).message);
    }
  };

  const openEdit = (course: AdminCourse) => {
    setSelectedCourse(course);
    setFormData({
      title: course.title,
      slug: course.slug,
      category: course.category,
      level: course.level,
      duration: course.duration,
      price: course.price,
      originalPrice: course.originalPrice,
      discount: course.discount || 0,
      description: course.description,
      prerequisites: [...course.prerequisites],
      whatYouLearn: [...course.whatYouLearn],
      language: course.language,
      certificate: course.certificate,
      image: course.image,
      status: course.status || "draft",
      materials: (course as any).materials || [],
    });
    setImageFile(null);
    setImagePreview(course.image || null);
    setListJson({
      prerequisites: JSON.stringify(course.prerequisites || [], null, 2),
      whatYouLearn: JSON.stringify(course.whatYouLearn || [], null, 2),
    });
    setListJsonError({});
    setModalMode("edit");
  };

  const openView = (course: AdminCourse) => {
    setSelectedCourse(course);
    setModalMode("view");
  };

  const openDelete = (course: AdminCourse) => {
    setSelectedCourse(course);
    setModalMode("delete");
  };

  const handleZipFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setZipFile(file);
    setSaveError(null);
    setZipPreviewPlan(null);

    const result = await dispatch(previewAdminCourseZip(file));
    if (previewAdminCourseZip.fulfilled.match(result)) {
      const plan = result.payload as CourseZipPreviewPlan;
      setZipPreviewPlan(plan);
      // Auto-select category if there is a match in slug or name
      const matchedCat = categories.find(
        (c) =>
          c.slug === plan.category ||
          c.name.en === plan.category ||
          c.name.fr === plan.category,
      );
      setFormData((prev) => ({
        ...prev,
        title: plan.title,
        category: matchedCat ? matchedCat.slug : prev.category,
      }));
    } else {
      setSaveError(extractError(result.payload));
      setZipFile(null);
      if (zipInputRef.current) zipInputRef.current.value = "";
    }
  };

  const handleImportZipConfirm = async () => {
    if (!zipFile) return;
    setSaveError(null);

    const catId = categories.find((c) => c.slug === formData.category)?.id;

    const result = await dispatch(
      importAdminCourseFromZip({
        file: zipFile,
        categoryId: catId,
      }),
    );

    if (importAdminCourseFromZip.fulfilled.match(result)) {
      showToast(tc("courseAdded") || "Course imported successfully from ZIP");
      closeModal();
      setZipFile(null);
      setZipPreviewPlan(null);
      // Backend automatically adds the course to the list via Redux fulfilled matcher
    } else {
      setSaveError(extractError(result.payload));
    }
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedCourse(null);

    setSaveError(null);
    resetForm();
  };

  // List item helpers
  const addListItem = (field: "prerequisites" | "whatYouLearn") => {
    const next = [...formData[field], ""];
    setFormData({ ...formData, [field]: next });
    setListJson((prev) => ({
      ...prev,
      [field]: JSON.stringify(next, null, 2),
    }));
  };

  const updateListItem = (
    field: "prerequisites" | "whatYouLearn",
    idx: number,
    value: string,
  ) => {
    const updated = [...formData[field]];
    updated[idx] = value;
    setFormData({ ...formData, [field]: updated });
    setListJson((prev) => ({
      ...prev,
      [field]: JSON.stringify(updated, null, 2),
    }));
  };

  const removeListItem = (
    field: "prerequisites" | "whatYouLearn",
    idx: number,
  ) => {
    const next = formData[field].filter((_, i) => i !== idx);
    setFormData({
      ...formData,
      [field]: next,
    });
    setListJson((prev) => ({
      ...prev,
      [field]: JSON.stringify(next, null, 2),
    }));
  };

  const applyListJson = (field: "prerequisites" | "whatYouLearn") => {
    try {
      const parsed = JSON.parse(listJson[field] || "[]");
      if (!Array.isArray(parsed)) {
        throw new Error("Value must be a JSON array");
      }
      const normalized = parsed
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean);
      setFormData((prev) => ({ ...prev, [field]: normalized }));
      setListJson((prev) => ({
        ...prev,
        [field]: JSON.stringify(normalized, null, 2),
      }));
      setListJsonError((prev) => ({ ...prev, [field]: "" }));
      showToast(tc("jsonApplied") || "JSON applied");
    } catch (err) {
      setListJsonError((prev) => ({
        ...prev,
        [field]: (err as Error).message,
      }));
    }
  };

  const handleSave = async () => {
    setSaveError(null);
    const payload: AdminCourseCreatePayload = {
      title: formData.title,
      slug: formData.slug,
      category: formData.category,
      level: formData.level,
      duration: formData.duration,
      originalPrice: formData.originalPrice,
      discount: formData.discount,
      description: formData.description,
      prerequisites: formData.prerequisites.filter(Boolean),
      whatYouLearn: formData.whatYouLearn.filter(Boolean),
      language: formData.language,
      certificate: formData.certificate,
      status: formData.status,
    };
    // Only include image when a new file is selected
    if (imageFile) {
      payload.image = imageFile;
    }

    /** Extract a human-readable error string from a thunk rejected payload */
    const extractError = (payload: unknown): string => {
      if (typeof payload === "string") return payload;
      if (payload && typeof payload === "object") {
        const p = payload as Record<string, unknown>;
        // Django REST Framework field errors: { field: ["msg", ...], ... }
        const fieldErrors = Object.entries(p)
          .filter(([k]) => k !== "non_field_errors" && k !== "detail")
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join(" | ");
        if (fieldErrors) return fieldErrors;
        // detail or non_field_errors
        if (p.detail) return String(p.detail);
        if (Array.isArray(p.non_field_errors))
          return (p.non_field_errors as string[]).join(", ");
        return JSON.stringify(payload);
      }
      return "An unknown error occurred.";
    };

    if (modalMode === "add") {
      const result = await dispatch(createAdminCourse(payload));
      if (createAdminCourse.fulfilled.match(result)) {
        showToast(tc("courseAdded"));
        closeModal();
        dispatch(invalidateCache());
        dispatch(fetchAdminCourses());
      } else {
        setSaveError(extractError(result.payload));
      }
    } else if (modalMode === "edit" && selectedCourse) {
      const result = await dispatch(
        updateAdminCourse({ id: selectedCourse.id, data: payload }),
      );
      if (updateAdminCourse.fulfilled.match(result)) {
        showToast(tc("courseUpdated"));
        closeModal();
        dispatch(invalidateCache());
        dispatch(fetchAdminCourses());
      } else {
        setSaveError(extractError(result.payload));
      }
    }
  };

  const handleDelete = async () => {
    if (selectedCourse) {
      setSaveError(null);
      const result = await dispatch(deleteAdminCourse(selectedCourse.id));
      if (deleteAdminCourse.fulfilled.match(result)) {
        showToast(tc("courseDeleted"));
        closeModal();
      } else {
        const errMsg =
          typeof result.payload === "string"
            ? result.payload
            : result.payload &&
                typeof result.payload === "object" &&
                "detail" in (result.payload as Record<string, unknown>)
              ? String((result.payload as Record<string, unknown>).detail)
              : tc("deleteError") ||
                "Failed to delete course. It may have existing orders or enrollments.";
        setSaveError(errMsg);
        showToast(errMsg);
      }
    }
  };

  // Select dropdown arrow style (matches Users page)
  const selectArrowStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%239ca3af'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E")`,
    backgroundPosition: "right 0.75rem center",
  };

  return (
    <div className="min-h-screen">
      <AdminHeader
        titleKey="admin.courseManagement.title"
        subtitleKey="admin.courseManagement.subtitle"
      />

      <div className="p-4 lg:p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: tc("totalCourses"),
              value: totalCount,
              icon: AcademicCapIcon,
              color: "text-blue-500",
              bg: "bg-blue-500/10",
            },
            {
              label: tc("publishedCourses"),
              value: publishedCount,
              icon: BookOpenIcon,
              color: "text-emerald-500",
              bg: "bg-emerald-500/10",
            },
            {
              label: tc("totalStudents"),
              value: totalStudents.toLocaleString(),
              icon: UserGroupIcon,
              color: "text-gold",
              bg: "bg-gold/10",
            },
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
                  <p className="text-sm text-silver dark:text-white/50">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-oxford dark:text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center",
                    stat.bg,
                  )}
                >
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
                placeholder={tc("searchPlaceholder")}
                value={localSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full ps-10 pe-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors"
              />
            </div>

            {/* Level Filter */}
            <select
              value={filters.level}
              onChange={(e) => dispatch(setFilters({ level: e.target.value }))}
              className="px-4 py-2.5 pr-10 appearance-none bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors cursor-pointer bg-no-repeat bg-[length:16px_16px]"
              style={selectArrowStyle}
            >
              <option value="all" className="text-black">
                {tc("allLevels")}
              </option>
              <option value="initialisation" className="text-black">
                {tc("levelInitialisation")}
              </option>
              <option value="approfondissement" className="text-black">
                {tc("levelApprofondissement")}
              </option>
              <option value="etude_de_cas" className="text-black">
                {tc("levelEtudeDeCas")}
              </option>
            </select>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) =>
                dispatch(setFilters({ category: e.target.value }))
              }
              className="px-4 py-2.5 pr-10 appearance-none bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors cursor-pointer bg-no-repeat bg-[length:16px_16px]"
              style={selectArrowStyle}
            >
              <option value="all" className="text-black">
                {tc("allCategories")}
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug} className="text-black">
                  {cat.name.en}
                </option>
              ))}
            </select>

            {/* Import ZIP Button */}
            <button
              onClick={openImportZip}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 rounded-lg text-sm font-semibold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors shadow-sm"
              title={
                tc("importZip") || "Import an entire course via ZIP format"
              }
            >
              <ArrowUpTrayIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Import ZIP</span>
            </button>

            {/* Add Course Button */}
            <button
              onClick={openAdd}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gold text-oxford rounded-lg text-sm font-semibold hover:bg-gold/90 transition-colors shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>{tc("addCourse")}</span>
            </button>
          </div>
        </div>

        {/* Courses Table */}
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
              <p className="text-sm text-silver dark:text-white/50">
                Loading courses...
              </p>
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
                        {tc("courseTitle")}
                      </th>
                      <th className="text-start px-5 py-4 text-xs font-semibold text-silver dark:text-white/50 uppercase tracking-wider">
                        {tc("category")}
                      </th>
                      <th className="text-start px-5 py-4 text-xs font-semibold text-silver dark:text-white/50 uppercase tracking-wider">
                        {tc("level")}
                      </th>
                      <th className="text-start px-5 py-4 text-xs font-semibold text-silver dark:text-white/50 uppercase tracking-wider">
                        {tc("price")}
                      </th>
                      <th className="text-start px-5 py-4 text-xs font-semibold text-silver dark:text-white/50 uppercase tracking-wider">
                        {tc("students")}
                      </th>
                      <th className="text-start px-5 py-4 text-xs font-semibold text-silver dark:text-white/50 uppercase tracking-wider">
                        {tc("lessons")}
                      </th>
                      <th className="text-start px-5 py-4 text-xs font-semibold text-silver dark:text-white/50 uppercase tracking-wider">
                        {t("admin.common.status")}
                      </th>
                      <th className="text-end px-5 py-4 text-xs font-semibold text-silver dark:text-white/50 uppercase tracking-wider">
                        {t("admin.common.actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {filteredCourses.map((course, idx) => (
                      <motion.tr
                        key={course.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="px-5 py-4 max-w-[280px]">
                          <p className="font-medium text-oxford dark:text-white text-sm truncate">
                            {course.title}
                          </p>
                          <p className="text-xs text-silver dark:text-white/40">
                            {course.slug}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            {course.category}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={cn(
                              "inline-flex px-2.5 py-1 rounded-full text-xs font-medium",
                              levelColor(course.level),
                            )}
                          >
                            {getLevelLabel(course.level)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div>
                            <span className="text-sm font-semibold text-oxford dark:text-white">
                              {course.price.toLocaleString()} DA
                            </span>
                            {course.originalPrice > course.price && (
                              <span className="ml-1.5 text-xs line-through text-silver dark:text-white/30">
                                {course.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600 dark:text-white/60">
                          {course.students.toLocaleString()}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600 dark:text-white/60">
                          {course.totalSlides ?? 0}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={cn(
                              "inline-flex px-2.5 py-1 rounded-full text-xs font-medium",
                              statusColor(course.status),
                            )}
                          >
                            {getStatusLabel(course.status)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link
                              href={`/admin/course-content?courseId=${course.id}`}
                              className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                              title={tc("manageContent")}
                            >
                              <BookOpenIcon className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => openView(course)}
                              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                              title={tc("viewCourse")}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEdit(course)}
                              className="p-2 text-gray-400 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors"
                              title={tc("editCourse")}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDelete(course)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                              title={tc("deleteCourse")}
                            >
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
                {filteredCourses.map((course) => (
                  <div key={course.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className={cn(
                            "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-500/10",
                          )}
                        >
                          <AcademicCapIcon className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-oxford dark:text-white text-sm truncate">
                            {course.title}
                          </p>
                          <p className="text-xs text-silver dark:text-white/40">
                            {course.slug}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/admin/course-content?courseId=${course.id}`}
                          className="p-2 text-gray-400 hover:text-emerald-500 rounded-lg transition-colors"
                        >
                          <BookOpenIcon className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openView(course)}
                          className="p-2 text-gray-400 hover:text-blue-500 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(course)}
                          className="p-2 text-gray-400 hover:text-gold rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDelete(course)}
                          className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        {course.category}
                      </span>
                      <span
                        className={cn(
                          "inline-flex px-2.5 py-1 rounded-full text-xs font-medium",
                          levelColor(course.level),
                        )}
                      >
                        {getLevelLabel(course.level)}
                      </span>
                      <span
                        className={cn(
                          "inline-flex px-2.5 py-1 rounded-full text-xs font-medium",
                          statusColor(course.status),
                        )}
                      >
                        {getStatusLabel(course.status)}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-oxford dark:text-white">
                      {course.price.toLocaleString()} DA
                      {course.originalPrice > course.price && (
                        <span className="ml-1.5 text-xs line-through text-silver dark:text-white/30 font-normal">
                          {course.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </p>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {filteredCourses.length === 0 && !loading && (
                <div className="p-12 text-center">
                  <AcademicCapIcon className="w-12 h-12 text-gray-300 dark:text-white/20 mx-auto mb-3" />
                  <p className="text-sm text-silver dark:text-white/50">
                    {tc("noCoursesFound")}
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="px-5 py-3 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
                <p className="text-xs text-silver dark:text-white/50">
                  {filteredCourses.length} / {totalCount}{" "}
                  {tc("totalCourses").toLowerCase()}
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
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closeModal}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={cn(
                "relative w-full bg-white dark:bg-oxford-light rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden",
                modalMode === "delete" ? "max-w-md" : "max-w-2xl",
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-oxford dark:text-white">
                    {modalMode === "add" && tc("addCourse")}
                    {modalMode === "edit" && tc("editCourse")}
                    {modalMode === "view" && tc("viewCourse")}
                    {modalMode === "delete" && tc("deleteCourse")}
                  </h3>
                  {/* JSON toggle — only in add mode */}
                  {modalMode === "add" && (
                    <button
                      type="button"
                      onClick={() => {
                        setJsonMode(!jsonMode);
                        setJsonError(null);
                      }}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                        jsonMode
                          ? "bg-gold text-oxford"
                          : "bg-gold/10 text-gold hover:bg-gold/20",
                      )}
                      title={tc("importJson") || "Import from JSON"}
                    >
                      <CodeBracketIcon className="w-3.5 h-3.5" />
                      JSON
                    </button>
                  )}
                </div>
                <button
                  onClick={closeModal}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Delete Confirmation */}
              {modalMode === "delete" && selectedCourse && (
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 rounded-xl">
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800 dark:text-red-300">
                        {tc("confirmDelete")}
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        {tc("confirmDeleteDesc")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/10",
                      )}
                    >
                      <AcademicCapIcon className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-oxford dark:text-white text-sm truncate">
                        {selectedCourse.title}
                      </p>
                      <p className="text-xs text-silver dark:text-white/40">
                        {selectedCourse.slug}
                      </p>
                    </div>
                  </div>
                  {/* Delete error message */}
                  {saveError && (
                    <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
                      <p className="text-xs text-red-700 dark:text-red-300">
                        {saveError}
                      </p>
                    </div>
                  )}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={closeModal}
                      className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-white/10 text-oxford dark:text-white rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      {t("admin.common.cancel")}
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={saving}
                      className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {saving ? "..." : t("admin.common.delete")}
                    </button>
                  </div>
                </div>
              )}

              {/* Import ZIP */}
              {modalMode === "import-zip" && (
                <div className="p-6 space-y-5">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-oxford dark:text-white">
                      ZIP File Upload
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-lg mb-2">
                      Upload a completed ZIP archive containing manifest.json,
                      formation.json, audios, and slides. This will auto-create
                      the course structure.
                    </p>
                    <div className="flex items-center justify-center w-full relative">
                      <label
                        className={cn(
                          "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-200 bg-gray-50 dark:bg-white/5",
                          zipFile
                            ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-400/5 text-emerald-500"
                            : "border-gray-300 dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/10",
                        )}
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FolderIcon
                            className={cn(
                              "w-10 h-10 mb-3",
                              zipFile
                                ? "text-emerald-500"
                                : "text-gray-400 dark:text-gray-500",
                            )}
                          />
                          {zipFile ? (
                            <p className="mb-2 text-sm font-semibold">
                              {zipFile.name}
                            </p>
                          ) : (
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                              <span className="font-semibold">
                                Click to upload
                              </span>{" "}
                              or drag and drop
                            </p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            ZIP up to ~500MB
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept=".zip,application/zip"
                          ref={zipInputRef}
                          onChange={handleZipFileChange}
                          disabled={saving}
                        />
                      </label>
                    </div>
                  </div>

                  {saveError && (
                    <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl mt-4">
                      <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                        Error Occurred:
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {saveError}
                      </p>
                    </div>
                  )}

                  {zipPreviewPlan && (
                    <div className="bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4 mt-4 animate-in fade-in slide-in-from-bottom-2">
                      <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2 border-b border-blue-200 dark:border-blue-500/20 pb-2">
                        Plan Preview
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-blue-600 dark:text-blue-400 font-medium text-xs">
                            Title:{" "}
                          </span>
                          <span className="text-oxford dark:text-white">
                            {zipPreviewPlan.title}
                          </span>
                        </div>
                        <div>
                          <span className="text-blue-600 dark:text-blue-400 font-medium text-xs">
                            Structure:{" "}
                          </span>
                          <span className="text-oxford dark:text-white">
                            {zipPreviewPlan.sections_count} Modules,{" "}
                            {zipPreviewPlan.lessons_count} Lessons
                          </span>
                        </div>
                      </div>

                      {/* We need Category assignment to create the Course */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-oxford dark:text-white mb-1.5 flex gap-1">
                          {tc("category")}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              category: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 bg-white dark:bg-oxford border border-gray-200 dark:border-white/10 rounded-xl text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors"
                        >
                          <option value="" disabled>
                            {t("admin.common.selectAction")}
                          </option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.slug}>
                              {cat.name.en}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={closeModal}
                      className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-white/10 text-oxford dark:text-white rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      {t("admin.common.cancel")}
                    </button>
                    <button
                      onClick={handleImportZipConfirm}
                      disabled={saving || !zipPreviewPlan || !formData.category}
                      className="flex-1 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
                    >
                      {saving
                        ? "Importing, Please Wait..."
                        : "Confirm & Import"}
                    </button>
                  </div>
                </div>
              )}

              {/* View Course */}
              {modalMode === "view" && selectedCourse && (
                <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center bg-blue-500/10 ring-2 ring-gray-100 dark:ring-white/10",
                      )}
                    >
                      <AcademicCapIcon className="w-8 h-8 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-oxford dark:text-white">
                        {selectedCourse.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={cn(
                            "inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400",
                          )}
                        >
                          {selectedCourse.category}
                        </span>
                        <span
                          className={cn(
                            "inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium",
                            levelColor(selectedCourse.level),
                          )}
                        >
                          {getLevelLabel(selectedCourse.level)}
                        </span>
                        <span
                          className={cn(
                            "inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium",
                            statusColor(selectedCourse.status),
                          )}
                        >
                          {getStatusLabel(selectedCourse.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        label: tc("price"),
                        value: `${selectedCourse.price.toLocaleString()} DA`,
                      },
                      {
                        label: tc("duration"),
                        value: `${selectedCourse.duration}h`,
                      },
                      {
                        label: tc("students"),
                        value: selectedCourse.students.toLocaleString(),
                      },
                      {
                        label: tc("rating"),
                        value: `⭐ ${selectedCourse.rating} (${selectedCourse.reviews})`,
                      },
                      { label: tc("language"), value: selectedCourse.language },
                      {
                        label: tc("certificate"),
                        value: selectedCourse.certificate ? "✓ Yes" : "✗ No",
                      },
                      {
                        label: tc("lastUpdated"),
                        value: selectedCourse.lastUpdated,
                      },
                      {
                        label: tc("lessons"),
                        value: String(selectedCourse.totalSlides ?? 0),
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl overflow-hidden min-w-0"
                      >
                        <p className="text-xs text-silver dark:text-white/40 mb-1">
                          {item.label}
                        </p>
                        <p
                          className="text-sm font-medium text-oxford dark:text-white truncate"
                          title={item.value}
                        >
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Description */}
                  <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                    <p className="text-xs text-silver dark:text-white/40 mb-1">
                      {tc("description")}
                    </p>
                    <p className="text-sm text-oxford dark:text-white/80">
                      {selectedCourse.description}
                    </p>
                  </div>

                  {/* Prerequisites */}
                  {(selectedCourse.prerequisites?.length ?? 0) > 0 && (
                    <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                      <p className="text-xs text-silver dark:text-white/40 mb-1">
                        {tc("prerequisites")}
                      </p>
                      <ul className="list-disc list-inside text-sm text-oxford dark:text-white/80 space-y-0.5">
                        {selectedCourse.prerequisites?.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* What You'll Learn */}
                  {(selectedCourse.whatYouLearn?.length ?? 0) > 0 && (
                    <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                      <p className="text-xs text-silver dark:text-white/40 mb-1">
                        {tc("whatYouLearn")}
                      </p>
                      <ul className="list-disc list-inside text-sm text-oxford dark:text-white/80 space-y-0.5">
                        {selectedCourse.whatYouLearn?.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Modules */}
                  {(selectedCourse.modules?.length ?? 0) > 0 && (
                    <div>
                      <p className="text-xs text-silver dark:text-white/40 mb-2">
                        {tc("modules")} ({selectedCourse.modules?.length ?? 0})
                      </p>
                      <div className="space-y-2">
                        {selectedCourse.modules?.map((mod) => (
                          <div
                            key={mod.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl text-sm"
                          >
                            <div>
                              <span className="font-medium text-oxford dark:text-white">
                                {mod.title}
                              </span>
                              <span className="ml-2 text-xs text-silver dark:text-white/40">
                                ({mod.type})
                              </span>
                            </div>
                            <div className="text-xs text-silver dark:text-white/40">
                              {mod.lessons} lessons • {mod.duration}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* JSON Import Panel (add mode only) */}
              {modalMode === "add" && jsonMode && (
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  <p className="text-xs text-silver dark:text-white/50">
                    {tc("jsonHint") ||
                      "Paste your course JSON below. The image field will stay empty — you can upload it later."}
                  </p>
                  <textarea
                    rows={18}
                    value={jsonText}
                    onChange={(e) => {
                      setJsonText(e.target.value);
                      setJsonError(null);
                    }}
                    placeholder='{\n  "title": "...",\n  "category": "...",\n  "level": "initialisation",\n  ...\n}'
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-oxford dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors resize-none"
                  />
                  {jsonError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 rounded-xl text-xs text-red-600 dark:text-red-400">
                      <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
                      <span>{jsonError}</span>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 dark:border-white/20 rounded-xl text-sm font-medium text-silver dark:text-white/50 hover:border-gold hover:text-gold cursor-pointer transition-colors">
                      <ArrowUpTrayIcon className="w-4 h-4" />
                      {tc("importFile") || "Import File"}
                      <input
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const r = new FileReader();
                            r.onload = () => {
                              setJsonText(r.result as string);
                              setJsonError(null);
                            };
                            r.readAsText(file);
                          }
                          e.target.value = "";
                        }}
                      />
                    </label>
                    <button
                      onClick={() => setJsonMode(false)}
                      className="px-4 py-2.5 border border-gray-200 dark:border-white/10 text-oxford dark:text-white rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      {t("admin.common.cancel")}
                    </button>
                    <button
                      onClick={parseJsonInput}
                      disabled={!jsonText.trim()}
                      className="flex-1 px-4 py-2.5 bg-gold text-oxford rounded-xl text-sm font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      {tc("applyJson") || "Apply JSON"}
                    </button>
                  </div>
                </div>
              )}

              {/* Add / Edit Form */}
              {(modalMode === "add" || modalMode === "edit") && !jsonMode && (
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  {/* Title & Slug */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">
                        {tc("courseTitle")}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">
                        {tc("slug")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            slug: e.target.value
                              .toLowerCase()
                              .replace(/\s+/g, "-"),
                          })
                        }
                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Category & Level */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">
                        {tc("category")} <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors cursor-pointer"
                      >
                        <option value="" className="text-black">
                          --
                        </option>
                        {categories.map((cat) => (
                          <option
                            key={cat.id}
                            value={cat.slug}
                            className="text-black"
                          >
                            {cat.name.en}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">
                        {tc("level")} <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.level}
                        onChange={(e) =>
                          setFormData({ ...formData, level: e.target.value })
                        }
                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors cursor-pointer"
                      >
                        <option value="initialisation" className="text-black">
                          {tc("levelInitialisation")}
                        </option>
                        <option
                          value="approfondissement"
                          className="text-black"
                        >
                          {tc("levelApprofondissement")}
                        </option>
                        <option value="etude_de_cas" className="text-black">
                          {tc("levelEtudeDeCas")}
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">
                      {tc("status")}
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors cursor-pointer"
                    >
                      <option value="draft" className="text-black">
                        {tc("statusDraft")}
                      </option>
                      <option value="published" className="text-black">
                        {tc("statusPublished")}
                      </option>
                      <option value="archived" className="text-black">
                        {tc("statusArchived")}
                      </option>
                    </select>
                  </div>

                  {/* Duration & Language */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">
                        {tc("duration")}
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={formData.duration}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            duration: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">
                        {tc("language")}
                      </label>
                      <input
                        type="text"
                        value={formData.language}
                        onChange={(e) =>
                          setFormData({ ...formData, language: e.target.value })
                        }
                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Price & Discount */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">
                        {tc("originalPrice")}
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={formData.originalPrice}
                        onChange={(e) => {
                          const orig = Number(e.target.value);
                          const computed = Math.round(
                            orig * (1 - formData.discount / 100),
                          );
                          setFormData({
                            ...formData,
                            originalPrice: orig,
                            price: computed,
                          });
                        }}
                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">
                        {tc("discount")} (%)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={formData.discount}
                        onChange={(e) => {
                          const disc = Math.min(
                            100,
                            Math.max(0, Number(e.target.value)),
                          );
                          const computed = Math.round(
                            formData.originalPrice * (1 - disc / 100),
                          );
                          setFormData({
                            ...formData,
                            discount: disc,
                            price: computed,
                          });
                        }}
                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">
                        {tc("price")}
                      </label>
                      <div className="w-full px-3 py-2.5 bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-semibold text-oxford dark:text-white">
                        {formData.price.toLocaleString()} DA
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">
                      {tc("description")}
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors resize-none"
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">
                      {tc("image")}
                    </label>
                    <div className="space-y-3">
                      {/* Preview */}
                      {imagePreview && (
                        <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImageFile(null);
                              setImagePreview(null);
                              setFormData({ ...formData, image: "" });
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg hover:bg-black/80 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      {/* Upload Button */}
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 border border-dashed border-gray-300 dark:border-white/20 rounded-xl">
                        <button
                          type="button"
                          onClick={() => imageInputRef.current?.click()}
                          className="flex items-center gap-2 px-4 py-2 bg-gold/10 text-gold rounded-lg text-xs font-semibold hover:bg-gold/20 transition-colors"
                        >
                          <ArrowUpTrayIcon className="w-4 h-4" />
                          {imagePreview
                            ? tc("changeImage") || "Change Image"
                            : tc("uploadImage") || "Upload Image"}
                        </button>
                        <span className="text-xs text-silver dark:text-white/40 truncate">
                          {imageFile?.name ||
                            (imagePreview
                              ? "Current image"
                              : "No file selected")}
                        </span>
                        <input
                          ref={imageInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setImageFile(file);
                              setImagePreview(URL.createObjectURL(file));
                            }
                          }}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Certificate */}
                  <div className="space-y-3 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.certificate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            certificate: e.target.checked,
                          })
                        }
                        className="w-4 h-4 rounded border-gray-300 text-gold focus:ring-gold"
                      />
                      <span className="text-sm text-oxford dark:text-white">
                        {tc("certificate")}
                      </span>
                    </label>
                  </div>

                  {/* Prerequisites */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-silver dark:text-white/50">
                        {tc("prerequisites")}
                      </label>
                      <button
                        type="button"
                        onClick={() => addListItem("prerequisites")}
                        className="flex items-center gap-1 text-xs text-gold hover:text-gold/80 font-medium"
                      >
                        <PlusCircleIcon className="w-4 h-4" />
                        {tc("addPrerequisite")}
                      </button>
                    </div>
                    <div className="mb-2">
                      <textarea
                        rows={4}
                        value={listJson.prerequisites}
                        onChange={(e) => {
                          setListJson((prev) => ({
                            ...prev,
                            prerequisites: e.target.value,
                          }));
                          setListJsonError((prev) => ({
                            ...prev,
                            prerequisites: "",
                          }));
                        }}
                        placeholder={'["item 1", "item 2"]'}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-xs text-oxford dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-gold/50"
                      />
                      {listJsonError.prerequisites && (
                        <p className="mt-1 text-xs text-red-500">
                          {listJsonError.prerequisites}
                        </p>
                      )}
                      <div className="mt-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => applyListJson("prerequisites")}
                          className="px-2.5 py-1 text-xs font-semibold rounded-md bg-gold/10 text-gold hover:bg-gold/20"
                        >
                          {tc("applyJson") || "Apply JSON"}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {formData.prerequisites.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) =>
                              updateListItem(
                                "prerequisites",
                                idx,
                                e.target.value,
                              )
                            }
                            className="flex-1 px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50"
                          />
                          <button
                            type="button"
                            onClick={() => removeListItem("prerequisites", idx)}
                            className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <MinusCircleIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* What You'll Learn */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-silver dark:text-white/50">
                        {tc("whatYouLearn")}
                      </label>
                      <button
                        type="button"
                        onClick={() => addListItem("whatYouLearn")}
                        className="flex items-center gap-1 text-xs text-gold hover:text-gold/80 font-medium"
                      >
                        <PlusCircleIcon className="w-4 h-4" />
                        {tc("addLearningPoint")}
                      </button>
                    </div>
                    <div className="mb-2">
                      <textarea
                        rows={4}
                        value={listJson.whatYouLearn}
                        onChange={(e) => {
                          setListJson((prev) => ({
                            ...prev,
                            whatYouLearn: e.target.value,
                          }));
                          setListJsonError((prev) => ({
                            ...prev,
                            whatYouLearn: "",
                          }));
                        }}
                        placeholder={'["point 1", "point 2"]'}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-xs text-oxford dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-gold/50"
                      />
                      {listJsonError.whatYouLearn && (
                        <p className="mt-1 text-xs text-red-500">
                          {listJsonError.whatYouLearn}
                        </p>
                      )}
                      <div className="mt-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => applyListJson("whatYouLearn")}
                          className="px-2.5 py-1 text-xs font-semibold rounded-md bg-gold/10 text-gold hover:bg-gold/20"
                        >
                          {tc("applyJson") || "Apply JSON"}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {formData.whatYouLearn.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) =>
                              updateListItem(
                                "whatYouLearn",
                                idx,
                                e.target.value,
                              )
                            }
                            className="flex-1 px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50"
                          />
                          <button
                            type="button"
                            onClick={() => removeListItem("whatYouLearn", idx)}
                            className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <MinusCircleIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ═══════ Course Materials ═══════ */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-silver dark:text-white/50 flex items-center gap-1.5">
                        <PaperClipIcon className="w-3.5 h-3.5" />{" "}
                        {t("admin.courseManagement.courseMaterials")}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const newMat: CourseMaterial = {
                            id: `mat-${Date.now()}`,
                            name: "",
                            type: "pdf",
                            size: "—",
                            url: "#",
                          };
                          setFormData({
                            ...formData,
                            materials: [...formData.materials, newMat],
                          });
                        }}
                        className="flex items-center gap-1 text-xs text-gold hover:text-gold/80 font-medium"
                      >
                        <PlusCircleIcon className="w-4 h-4" />
                        {t("admin.courseManagement.addMaterial")}
                      </button>
                    </div>
                    {formData.materials.length === 0 && (
                      <p className="text-xs text-silver dark:text-white/30 italic py-2">
                        {t("admin.courseManagement.noMaterialsYet")}
                      </p>
                    )}
                    <div className="space-y-2">
                      {formData.materials.map((mat, idx) => {
                        const TypeIcon =
                          {
                            pdf: DocumentTextIcon,
                            word: DocumentIcon,
                            slides: PresentationChartBarIcon,
                            video: VideoCameraIcon,
                            other: FolderIcon,
                          }[mat.type] || FolderIcon;
                        const typeColor =
                          {
                            pdf: "text-red-500 bg-red-500/10",
                            word: "text-blue-500 bg-blue-500/10",
                            slides: "text-orange-500 bg-orange-500/10",
                            video: "text-purple-500 bg-purple-500/10",
                            other: "text-gray-500 bg-gray-500/10",
                          }[mat.type] || "text-gray-500 bg-gray-500/10";
                        return (
                          <div
                            key={mat.id}
                            className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10"
                          >
                            <span
                              className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeColor}`}
                            >
                              <TypeIcon className="w-4 h-4" />
                            </span>
                            <input
                              type="text"
                              placeholder={t(
                                "admin.courseManagement.materialName",
                              )}
                              value={mat.name}
                              onChange={(e) => {
                                const updated = [...formData.materials];
                                updated[idx] = {
                                  ...updated[idx],
                                  name: e.target.value,
                                };
                                setFormData({
                                  ...formData,
                                  materials: updated,
                                });
                              }}
                              className="flex-1 px-2.5 py-1.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50"
                            />
                            <select
                              value={mat.type}
                              onChange={(e) => {
                                const updated = [...formData.materials];
                                updated[idx] = {
                                  ...updated[idx],
                                  type: e.target
                                    .value as CourseMaterial["type"],
                                };
                                setFormData({
                                  ...formData,
                                  materials: updated,
                                });
                              }}
                              className="px-2 py-1.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-xs text-oxford dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold/50"
                            >
                              <option value="pdf" className="text-black">
                                {t("admin.courseManagement.materialTypePdf")}
                              </option>
                              <option value="word" className="text-black">
                                {t("admin.courseManagement.materialTypeWord")}
                              </option>
                              <option value="slides" className="text-black">
                                {t("admin.courseManagement.materialTypeSlides")}
                              </option>
                              <option value="video" className="text-black">
                                {t("admin.courseManagement.materialTypeVideo")}
                              </option>
                              <option value="other" className="text-black">
                                {t("admin.courseManagement.materialTypeOther")}
                              </option>
                            </select>
                            <label className="flex items-center gap-1 px-2.5 py-1.5 bg-gold/10 text-gold rounded-lg text-xs font-semibold hover:bg-gold/20 transition-colors cursor-pointer">
                              <ArrowUpTrayIcon className="w-3.5 h-3.5" />
                              {t("admin.courseManagement.uploadFile")}
                              <input
                                type="file"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  // Update name from filename if empty
                                  const updated = [...formData.materials];
                                  if (!updated[idx].name) {
                                    updated[idx] = {
                                      ...updated[idx],
                                      name: file.name.replace(/\.[^/.]+$/, ""),
                                    };
                                  }
                                  // Compute human-readable size
                                  const sizeKB = file.size / 1024;
                                  const sizeStr =
                                    sizeKB > 1024
                                      ? `${(sizeKB / 1024).toFixed(1)} MB`
                                      : `${Math.round(sizeKB)} KB`;
                                  updated[idx] = {
                                    ...updated[idx],
                                    size: sizeStr,
                                  };
                                  setFormData({
                                    ...formData,
                                    materials: updated,
                                  });
                                  // Upload via API if we have a course ID (edit mode)
                                  if (selectedCourse?.id) {
                                    try {
                                      const fd = new FormData();
                                      fd.append("course", selectedCourse.id);
                                      fd.append(
                                        "name",
                                        updated[idx].name || file.name,
                                      );
                                      fd.append("type", updated[idx].type);
                                      fd.append("size", sizeStr);
                                      fd.append("file", file);
                                      fd.append("sequence", String(idx));
                                      const res = await axiosClient.post(
                                        "/formation/course-materials/",
                                        fd,
                                        {
                                          headers: {
                                            "Content-Type":
                                              "multipart/form-data",
                                          },
                                        },
                                      );
                                      // Update local state with backend response
                                      const finalUpdated = [
                                        ...formData.materials,
                                      ];
                                      finalUpdated[idx] = {
                                        ...finalUpdated[idx],
                                        id: res.data.id,
                                        url:
                                          res.data.download_url ||
                                          res.data.url ||
                                          res.data.file ||
                                          "#",
                                        size: res.data.size || sizeStr,
                                      };
                                      setFormData({
                                        ...formData,
                                        materials: finalUpdated,
                                      });
                                    } catch (err) {
                                      console.error(
                                        "Failed to upload material:",
                                        err,
                                      );
                                    }
                                  }
                                  e.target.value = "";
                                }}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={async () => {
                                // If the material has a real backend ID (not a temp ID), delete from server
                                if (mat.id && !mat.id.startsWith("mat-")) {
                                  try {
                                    await axiosClient.delete(
                                      `/formation/course-materials/${mat.id}/`,
                                    );
                                  } catch (err) {
                                    console.error(
                                      "Failed to delete material:",
                                      err,
                                    );
                                    showToast(
                                      tc("deleteError") ||
                                        "Failed to delete material",
                                    );
                                    return;
                                  }
                                }
                                setFormData({
                                  ...formData,
                                  materials: formData.materials.filter(
                                    (_, i) => i !== idx,
                                  ),
                                });
                              }}
                              className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <MinusCircleIcon className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Save Error */}
                  {saveError && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl"
                    >
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-0.5">
                          Failed to save course
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-300 break-words">
                          {saveError}
                        </p>
                      </div>
                    </motion.div>
                  )}

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
                      disabled={saving || !formData.title || !formData.slug}
                      className="flex-1 px-4 py-2.5 bg-gold text-oxford rounded-xl text-sm font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      {saving
                        ? "..."
                        : modalMode === "add"
                          ? tc("addCourse")
                          : t("admin.common.save")}
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
