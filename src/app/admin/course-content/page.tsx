"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon as Plus,
  PencilSquareIcon as Edit,
  TrashIcon as Trash,
  EyeIcon as Eye,
  XMarkIcon as X,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MusicalNoteIcon,
  DocumentTextIcon,
  ArrowUpTrayIcon,
  PlusCircleIcon,
  MinusCircleIcon,
  QuestionMarkCircleIcon,
  BookOpenIcon,
  CodeBracketIcon,
  PencilIcon,
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import AdminHeader from "@/components/admin/AdminHeader";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import {
  fetchSections,
  createSection,
  updateSection,
  deleteSection as deleteSectionThunk,
  createLesson,
  updateLesson,
  deleteLesson as deleteLessonThunk,
  createQuiz,
  updateQuiz,
  deleteQuiz as deleteQuizThunk,
} from "@/store/slices/adminCourseContentSlice";
import { fetchAdminCourses } from "@/store/slices/adminCoursesManagementSlice";
import type {
  AdminSection,
  AdminSectionLesson,
  AdminSectionQuiz,
} from "@/services/adminSectionsApi";
import type {
  Speaker,
  SectionModalMode,
  LessonModalMode,
  QuizModalMode,
} from "./types";
import JsonBulkImport from "./JsonBulkImport";

// =============================================================================
// ID GENERATOR
// =============================================================================
const uid = () => crypto.randomUUID();

type FinalQuizData = {
  id: string;
  title: string;
  num_questions: number;
  pass_threshold: number;
  max_attempts: number;
  xp_reward: number;
};


// =============================================================================
// COMPONENT
// =============================================================================

export default function CourseContentPage() {
  const { t } = useI18n();
  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId") || "";

  // Resolve course slug from courses state
  const courseSlug = useSelector((state: RootState) => {
    const course = state.adminCoursesManagement.courses.find((c) => c.id === courseId);
    return course?.slug || "";
  });

  // Redux state for sections (includes nested lessons)
  const { sections, loading, saving, error } = useSelector(
    (state: RootState) => state.adminCourseContent
  );

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showBulkImport, setShowBulkImport] = useState(false);

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  // Translation helper
  const tc = (key: string) => t(`admin.courseContent.${key}`);

  // Fetch courses on mount (needed for slug resolution after page refresh)
  useEffect(() => {
    dispatch(fetchAdminCourses({}));
  }, [dispatch]);

  // Fetch sections when course slug resolves
  useEffect(() => {
    if (courseSlug) {
      dispatch(fetchSections(courseSlug));
    }
  }, [dispatch, courseSlug]);

  // Fetch final quiz config when courseId resolves
  useEffect(() => {
    if (!courseId) return;
    setFinalQuizLoading(true);
    import("@/lib/axios").then(({ default: api }) => {
      api.get(`/formation/final-quiz/admin/get/?course_id=${courseId}`)
        .then(res => setFinalQuiz(res.data))
        .catch(() => setFinalQuiz(null))
        .finally(() => setFinalQuizLoading(false));
    });
  }, [courseId]);

  // ─── SECTION MODALS ───
  const [sectionModal, setSectionModal] = useState<SectionModalMode>(null);
  const [selectedSection, setSelectedSection] = useState<AdminSection | null>(null);
  const [sectionForm, setSectionForm] = useState({ title: "", type: "module" as "teaser" | "introduction" | "module" | "conclusion" });

  // ─── LESSON MODALS ───
  const [lessonModal, setLessonModal] = useState<LessonModalMode>(null);
  const [selectedLesson, setSelectedLesson] = useState<AdminSectionLesson | null>(null);
  const [lessonParentId, setLessonParentId] = useState<string>("");
  const [lessonForm, setLessonForm] = useState({
    title: "", type: "audio" as "slide" | "video" | "text" | "audio", duration_seconds: 0, slide_type: "bullet_points",
    speakers: [] as Speaker[],
  });
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);

  // Narrator input mode: manual (one-by-one) or json (paste array)
  const [narratorMode, setNarratorMode] = useState<"manual" | "json">("manual");
  const [narratorJson, setNarratorJson] = useState("");
  const [narratorJsonError, setNarratorJsonError] = useState<string | null>(null);

  // ─── QUIZ MODALS ───
  const [quizModal, setQuizModal] = useState<QuizModalMode>(null);
  const [quizParentId, setQuizParentId] = useState<string>("");
  const [quizForm, setQuizForm] = useState<AdminSectionQuiz>({
    id: "", title: "", intro_text: "", questions: [], pass_threshold: 70, max_attempts: 3, xp_reward: 10,
  });
  const [quizJsonMode, setQuizJsonMode] = useState(false);
  const [quizJsonText, setQuizJsonText] = useState("");
  const [quizJsonError, setQuizJsonError] = useState<string | null>(null);

  // ─── FINAL QUIZ STATE ───
  const [finalQuiz, setFinalQuiz] = useState<FinalQuizData | null>(null);
  const [finalQuizLoading, setFinalQuizLoading] = useState(false);
  const [fqModal, setFqModal] = useState<"edit" | "delete" | null>(null);
  const [fqSaving, setFqSaving] = useState(false);
  const [fqForm, setFqForm] = useState({ title: "Final Quiz", num_questions: 10, pass_threshold: 70, max_attempts: 3, xp_reward: 50 });

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION CRUD
  // ═══════════════════════════════════════════════════════════════════════════

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const openAddSection = () => { setSectionForm({ title: "", type: "module" }); setSectionModal("add"); };

  const openEditSection = (s: AdminSection) => {
    setSelectedSection(s); setSectionForm({ title: s.title, type: s.type }); setSectionModal("edit");
  };

  const openDeleteSection = (s: AdminSection) => { setSelectedSection(s); setSectionModal("delete"); };

  const closeSectionModal = () => { setSectionModal(null); setSelectedSection(null); };

  const saveSection = async () => {
    if (sectionModal === "add") {
      const result = await dispatch(createSection({
        course: courseId,
        title: sectionForm.title,
        type: sectionForm.type,
        sequence: sections.length + 1,
      }));
      if (createSection.fulfilled.match(result)) {
        showToast(tc("sectionAdded"));
      }
    } else if (sectionModal === "edit" && selectedSection) {
      const result = await dispatch(updateSection({
        id: selectedSection.id,
        data: { title: sectionForm.title, type: sectionForm.type },
      }));
      if (updateSection.fulfilled.match(result)) {
        showToast(tc("sectionUpdated"));
      }
    }
    closeSectionModal();
  };

  const handleDeleteSection = async () => {
    if (selectedSection) {
      const result = await dispatch(deleteSectionThunk(selectedSection.id));
      if (deleteSectionThunk.fulfilled.match(result)) {
        showToast(tc("sectionDeleted"));
      }
    }
    closeSectionModal();
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // LESSON CRUD
  // ═══════════════════════════════════════════════════════════════════════════

  const openAddLesson = (sectionId: string) => {
    setLessonParentId(sectionId);
    setLessonForm({ title: "", type: "audio", duration_seconds: 0, slide_type: "bullet_points", speakers: [] });
    setAudioFile(null); setAudioPreview(null);
    setNarratorMode("manual"); setNarratorJson(""); setNarratorJsonError(null);
    setLessonModal("add");
  };

  const openEditLesson = (sectionId: string, lesson: AdminSectionLesson) => {
    setLessonParentId(sectionId); setSelectedLesson(lesson);
    const speakers = lesson.content?.narration_script?.speakers || [];
    setLessonForm({
      title: lesson.title, type: lesson.type, duration_seconds: lesson.duration_seconds,
      slide_type: lesson.slide_type, speakers,
    });
    setAudioFile(null); setAudioPreview(lesson.audioUrl);
    setNarratorMode("manual"); setNarratorJson(speakers.length ? JSON.stringify(speakers, null, 2) : ""); setNarratorJsonError(null);
    setLessonModal("edit");
  };

  const openViewLesson = (sectionId: string, lesson: AdminSectionLesson) => {
    setLessonParentId(sectionId); setSelectedLesson(lesson); setLessonModal("view");
  };

  const openDeleteLesson = (sectionId: string, lesson: AdminSectionLesson) => {
    setLessonParentId(sectionId); setSelectedLesson(lesson); setLessonModal("delete");
  };

  const closeLessonModal = () => { setLessonModal(null); setSelectedLesson(null); setAudioFile(null); setAudioPreview(null); };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setAudioFile(file); setAudioPreview(URL.createObjectURL(file)); }
  };

  const saveLesson = async () => {
    const section = sections.find((s) => s.id === lessonParentId);
    const content = {
      visual_content: selectedLesson?.content.visual_content || {},
      narration_script: { mode: "multi_speaker", speakers: lessonForm.speakers },
    };

    if (lessonModal === "add") {
      const result = await dispatch(createLesson({
        section: lessonParentId,
        title: lessonForm.title,
        type: lessonForm.type,
        sequence: section ? section.lessons_list.length : 0,
        duration_seconds: lessonForm.duration_seconds,
        slide_type: lessonForm.slide_type,
        content,
        audioFile: audioFile || undefined,
      }));
      if (createLesson.fulfilled.match(result)) {
        showToast(tc("lessonAdded"));
      }
    } else if (lessonModal === "edit" && selectedLesson) {
      const result = await dispatch(updateLesson({
        id: selectedLesson.id,
        data: {
          title: lessonForm.title,
          type: lessonForm.type,
          duration_seconds: lessonForm.duration_seconds,
          slide_type: lessonForm.slide_type,
          content,
          audioFile: audioFile || undefined,
        },
      }));
      if (updateLesson.fulfilled.match(result)) {
        showToast(tc("lessonUpdated"));
      }
    }
    closeLessonModal();
  };

  const handleDeleteLesson = async () => {
    if (selectedLesson) {
      const result = await dispatch(deleteLessonThunk({ id: selectedLesson.id, sectionId: lessonParentId }));
      if (deleteLessonThunk.fulfilled.match(result)) {
        showToast(tc("lessonDeleted"));
      }
    }
    closeLessonModal();
  };

  // Speaker helpers
  const addSpeaker = () => setLessonForm({ ...lessonForm, speakers: [...lessonForm.speakers, { text: "", emotion: "", speaker: "" }] });
  const updateSpeaker = (idx: number, field: keyof Speaker, val: string) => {
    const s = [...lessonForm.speakers]; s[idx] = { ...s[idx], [field]: val }; setLessonForm({ ...lessonForm, speakers: s });
  };
  const removeSpeaker = (idx: number) => setLessonForm({ ...lessonForm, speakers: lessonForm.speakers.filter((_, i) => i !== idx) });

  // JSON narrator helpers
  const handleNarratorJsonChange = (raw: string) => {
    setNarratorJson(raw);
    if (!raw.trim()) { setNarratorJsonError(null); setLessonForm({ ...lessonForm, speakers: [] }); return; }
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) { setNarratorJsonError("Must be a JSON array"); return; }
      const valid = parsed.every((s: Record<string, unknown>) => typeof s.text === "string" && typeof s.speaker === "string");
      if (!valid) { setNarratorJsonError('Each item needs at least "text" and "speaker" fields'); return; }
      const speakers: Speaker[] = parsed.map((s: Record<string, string>) => ({ text: s.text || "", emotion: s.emotion || "", speaker: s.speaker || "" }));
      setNarratorJsonError(null);
      setLessonForm({ ...lessonForm, speakers });
    } catch {
      setNarratorJsonError("Invalid JSON syntax");
    }
  };

  const switchNarratorMode = (mode: "manual" | "json") => {
    if (mode === "json" && narratorMode === "manual" && lessonForm.speakers.length > 0) {
      setNarratorJson(JSON.stringify(lessonForm.speakers, null, 2));
    }
    setNarratorJsonError(null);
    setNarratorMode(mode);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // QUIZ CRUD (stays local — no separate API)
  // ═══════════════════════════════════════════════════════════════════════════

  const openQuizEditor = (sectionId: string, quiz: AdminSectionQuiz | null) => {
    setQuizParentId(sectionId);
    if (quiz) {
      setQuizForm({ ...quiz }); setQuizModal("edit");
    } else {
      setQuizForm({ id: uid(), title: "", intro_text: "", questions: [], pass_threshold: 70, max_attempts: 3, xp_reward: 10 });
      setQuizModal("add");
    }
  };

  const closeQuizModal = () => { setQuizModal(null); };

  const saveQuiz = async () => {
    // For new quizzes, strip client-generated ids from questions
    const isAdd = quizModal === "add";
    const questions = quizForm.questions.map((q, i) => ({
      ...(!isAdd && q.id ? { id: q.id } : {}),
      type: q.type,
      question: q.question,
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      difficulty: q.difficulty,
      category: q.category,
      sequence: i,
    }));

    if (isAdd) {
      const result = await dispatch(createQuiz({
        quiz: {
          section: quizParentId,
          title: quizForm.title,
          intro_text: quizForm.intro_text,
          pass_threshold: quizForm.pass_threshold,
          max_attempts: quizForm.max_attempts,
          xp_reward: quizForm.xp_reward,
        },
        questions,
      }));
      if (createQuiz.fulfilled.match(result)) {
        showToast(tc("quizAdded"));
        closeQuizModal();
      }
    } else if (quizModal === "edit" && quizForm.id) {
      const result = await dispatch(updateQuiz({
        id: quizForm.id,
        data: {
          title: quizForm.title,
          intro_text: quizForm.intro_text,
          pass_threshold: quizForm.pass_threshold,
          max_attempts: quizForm.max_attempts,
          xp_reward: quizForm.xp_reward,
        },
        questions,
      }));
      if (updateQuiz.fulfilled.match(result)) {
        showToast(tc("quizUpdated"));
        closeQuizModal();
      }
    }
  };

  const handleDeleteQuiz = async (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (section?.quiz) {
      const result = await dispatch(deleteQuizThunk({ id: section.quiz.id, sectionId }));
      if (deleteQuizThunk.fulfilled.match(result)) {
        showToast(tc("quizDeleted"));
      }
    }
  };

  // ── Final Quiz helpers ──────────────────────────────────────────────────────

  const openFqModal = (mode: "edit") => {
    setFqForm({
      title: finalQuiz?.title || "Final Quiz",
      num_questions: finalQuiz?.num_questions ?? 10,
      pass_threshold: finalQuiz?.pass_threshold ?? 70,
      max_attempts: finalQuiz?.max_attempts ?? 3,
      xp_reward: finalQuiz?.xp_reward ?? 50,
    });
    setFqModal(mode);
  };

  const saveFinalQuiz = async () => {
    if (!courseId) return;
    setFqSaving(true);
    try {
      const { default: api } = await import("@/lib/axios");
      const res = await api.post("/formation/final-quiz/admin/upsert/", { course_id: courseId, ...fqForm });
      setFinalQuiz(res.data);
      showToast(finalQuiz ? "Final quiz updated!" : "Final quiz created!");
      setFqModal(null);
    } catch {
      showToast("Failed to save final quiz.");
    } finally {
      setFqSaving(false);
    }
  };

  const deleteFinalQuiz = async () => {
    if (!courseId) return;
    setFqSaving(true);
    try {
      const { default: api } = await import("@/lib/axios");
      await api.delete(`/formation/final-quiz/admin/delete/?course_id=${courseId}`);
      setFinalQuiz(null);
      showToast("Final quiz removed.");
      setFqModal(null);
    } catch {
      showToast("Failed to delete final quiz.");
    } finally {
      setFqSaving(false);
    }
  };

  // Question helpers
  const addQuestion = (questionType: string = "multiple_choice") => {
    const defaultOptions: Record<string, string[]> = {
      multiple_choice: ["", "", "", ""],
      true_false: ["Vrai", "Faux"],
      scenario: ["", "", ""],
    };
    setQuizForm({
      ...quizForm, questions: [...quizForm.questions, {
        id: uid(), type: questionType, question: "", options: defaultOptions[questionType] || ["", "", "", ""],
        correct_answer: 1, explanation: "", difficulty: "easy", category: "general",
      }],
    });
  };

  const changeQuestionType = (qIdx: number, newType: string) => {
    const defaultOptions: Record<string, string[]> = {
      multiple_choice: ["", "", "", ""],
      true_false: ["Vrai", "Faux"],
      scenario: ["", "", ""],
    };
    const q = [...quizForm.questions];
    q[qIdx] = { ...q[qIdx], type: newType, options: defaultOptions[newType] || ["", "", "", ""], correct_answer: 1 };
    setQuizForm({ ...quizForm, questions: q });
  };

  const updateQuestion = (idx: number, field: string, val: unknown) => {
    const q = [...quizForm.questions]; q[idx] = { ...q[idx], [field]: val }; setQuizForm({ ...quizForm, questions: q });
  };

  const updateOption = (qIdx: number, oIdx: number, val: string) => {
    const q = [...quizForm.questions]; const opts = [...q[qIdx].options]; opts[oIdx] = val; q[qIdx] = { ...q[qIdx], options: opts };
    setQuizForm({ ...quizForm, questions: q });
  };

  const removeQuestion = (idx: number) => setQuizForm({ ...quizForm, questions: quizForm.questions.filter((_, i) => i !== idx) });

  // Quiz JSON import
  const parseQuizJson = () => {
    try {
      const raw = JSON.parse(quizJsonText);
      const data = raw.quiz || raw;
      const questions = (data.questions || []).map((q: Record<string, unknown>) => ({
        id: uid(),
        type: (q.type as string) || "multiple_choice",
        question: (q.question as string) || "",
        options: (q.options as string[]) || ["", "", "", ""],
        correct_answer: (q.correct_answer as number) ?? 0,
        explanation: (q.explanation as string) || "",
        difficulty: (q.difficulty as string) || "easy",
        category: (q.category as string) || "general",
      }));
      setQuizForm({
        ...quizForm,
        title: (data.title as string) || quizForm.title,
        intro_text: (data.intro_text as string) || quizForm.intro_text,
        questions,
      });
      setQuizJsonError(null);
      setQuizJsonMode(false);
      showToast(tc("quizJsonApplied") || `JSON applied — ${questions.length} questions loaded`);
    } catch (err) {
      setQuizJsonError((err as Error).message);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  const InputClass = "w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors";
  const LabelClass = "block text-xs font-medium text-silver dark:text-white/50 mb-1.5";

  return (
    <div className="min-h-screen">
      <AdminHeader titleKey="admin.courseContent.title" subtitleKey="admin.courseContent.subtitle" />

      <div className="p-4 lg:p-6 space-y-6">
        {/* Back + Add Section */}
        <div className="flex items-center justify-between">
          <Link href="/admin/course-management" className="flex items-center gap-2 text-sm text-silver dark:text-white/50 hover:text-gold transition-colors">
            <ArrowLeftIcon className="w-4 h-4" /> {tc("backToCourses")}
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowBulkImport(true)} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-white/5 text-oxford dark:text-white border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium hover:border-gold/50 transition-colors">
              JSON
            </button>
            <button onClick={openAddSection} className="flex items-center gap-2 px-5 py-2.5 bg-gold text-oxford rounded-lg text-sm font-semibold hover:bg-gold/90 transition-colors shadow-md hover:shadow-lg">
              <Plus className="w-4 h-4" /> {tc("addSection")}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 p-12 flex flex-col items-center gap-3">
            <ArrowPathIcon className="w-8 h-8 text-gold animate-spin" />
            <p className="text-sm text-silver dark:text-white/50">Loading sections...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-200 dark:border-red-500/20 p-4 flex items-center gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && sections.length === 0 && !error && (
          <div className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 p-12 text-center">
            <BookOpenIcon className="w-12 h-12 text-gray-300 dark:text-white/20 mx-auto mb-3" />
            <p className="text-sm text-silver dark:text-white/50">{tc("noSections")}</p>
          </div>
        )}

        {/* Sections */}
        {!loading && sections.map((section, sIdx) => {
          const isExpanded = expandedSections.has(section.id);
          return (
            <motion.div key={section.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: sIdx * 0.05 }}
              className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden"
            >
              {/* Section Header */}
              <div className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors" onClick={() => toggleSection(section.id)}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-xs font-bold text-gold">{section.sequence}</span>
                  <div className="min-w-0">
                    <p className="font-medium text-oxford dark:text-white text-sm truncate">{section.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn("inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium", section.type === "teaser" ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500")}>
                        {section.type}
                      </span>
                      <span className="text-xs text-silver dark:text-white/40">{section.lessons_list.length} lessons • {section.duration}</span>
                      {section.quiz && <span className="text-xs text-emerald-500">✓ Quiz</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={(e) => { e.stopPropagation(); openEditSection(section); }} className="p-2 text-gray-400 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); openDeleteSection(section); }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash className="w-4 h-4" />
                  </button>
                  {isExpanded ? <ChevronUpIcon className="w-5 h-5 text-gray-400" /> : <ChevronDownIcon className="w-5 h-5 text-gray-400" />}
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="px-5 pb-5 space-y-4 border-t border-gray-200 dark:border-white/10 pt-4">
                      {/* Lessons Header */}
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-silver dark:text-white/50 uppercase tracking-wider">{tc("lessons")} ({section.lessons_list.length})</p>
                        <button onClick={() => openAddLesson(section.id)} className="flex items-center gap-1.5 text-xs text-gold hover:text-gold/80 font-medium">
                          <PlusCircleIcon className="w-4 h-4" /> {tc("addLesson")}
                        </button>
                      </div>

                      {/* Lessons List */}
                      {section.lessons_list.length === 0 ? (
                        <p className="text-xs text-silver dark:text-white/40 text-center py-3">{tc("noLessons")}</p>
                      ) : (
                        <div className="space-y-2">
                          {section.lessons_list.map((lesson) => (
                            <div key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/[0.03] rounded-xl group">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", lesson.type === "audio" ? "bg-blue-500/10" : "bg-amber-500/10")}>
                                  {lesson.type === "audio" ? <MusicalNoteIcon className="w-4 h-4 text-blue-500" /> : <DocumentTextIcon className="w-4 h-4 text-amber-500" />}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-oxford dark:text-white truncate">{lesson.title}</p>
                                  <div className="flex items-center gap-2">
                                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", lesson.type === "audio" ? "bg-blue-500/10 text-blue-500" : "bg-amber-500/10 text-amber-500")}>{lesson.type}</span>
                                    <span className="text-xs text-silver dark:text-white/40">{lesson.duration_seconds}s</span>
                                    {lesson.audioUrl && <span className="text-xs text-emerald-500">♪ Audio</span>}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openViewLesson(section.id, lesson)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                                <button onClick={() => openEditLesson(section.id, lesson)} className="p-1.5 text-gray-400 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                                <button onClick={() => openDeleteLesson(section.id, lesson)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash className="w-3.5 h-3.5" /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Quiz Section */}
                      <div className="border-t border-gray-100 dark:border-white/5 pt-4">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-silver dark:text-white/50 uppercase tracking-wider">{tc("quiz")}</p>
                          {!section.quiz ? (
                            <button onClick={() => openQuizEditor(section.id, null)} className="flex items-center gap-1.5 text-xs text-gold hover:text-gold/80 font-medium">
                              <PlusCircleIcon className="w-4 h-4" /> {tc("addQuiz")}
                            </button>
                          ) : (
                            <div className="flex items-center gap-1">
                              <button onClick={() => openQuizEditor(section.id, section.quiz)} className="p-1.5 text-gray-400 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                              <button onClick={() => handleDeleteQuiz(section.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash className="w-3.5 h-3.5" /></button>
                            </div>
                          )}
                        </div>
                        {section.quiz && (
                          <div className="mt-2 p-3 bg-emerald-500/5 rounded-xl">
                            <p className="text-sm font-medium text-oxford dark:text-white">{section.quiz.title}</p>
                            <p className="text-xs text-silver dark:text-white/40 mt-0.5">{section.quiz.questions.length} questions • Pass: {section.quiz.pass_threshold}% • XP: {section.quiz.xp_reward}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {/* ═══════════ FINAL QUIZ PANEL ═══════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <AcademicCapIcon className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <p className="font-semibold text-oxford dark:text-white text-sm">Final Quiz</p>
                <p className="text-xs text-silver dark:text-white/40">Certificate exam — drawn from section quizzes</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {finalQuiz ? (
                <>
                  <button onClick={() => openFqModal("edit")} className="p-1.5 text-gray-400 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => setFqModal("delete")} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash className="w-4 h-4" /></button>
                </>
              ) : !finalQuizLoading && (
                <button onClick={() => openFqModal("edit")} className="flex items-center gap-1.5 text-xs text-purple-500 hover:text-purple-400 font-medium">
                  <PlusCircleIcon className="w-4 h-4" /> Add Final Quiz
                </button>
              )}
            </div>
          </div>
          <div className="px-5 py-4">
            {finalQuizLoading ? (
              <div className="flex items-center gap-2 text-sm text-silver dark:text-white/40">
                <ArrowPathIcon className="w-4 h-4 animate-spin" /> Loading...
              </div>
            ) : finalQuiz ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { label: "Title", value: finalQuiz.title },
                  { label: "Questions", value: finalQuiz.num_questions },
                  { label: "Pass threshold", value: `${finalQuiz.pass_threshold}%` },
                  { label: "Max attempts", value: finalQuiz.max_attempts },
                  { label: "XP reward", value: finalQuiz.xp_reward },
                ].map(item => (
                  <div key={item.label} className="p-3 bg-purple-500/5 rounded-xl">
                    <p className="text-[10px] text-silver dark:text-white/40 uppercase tracking-wider mb-0.5">{item.label}</p>
                    <p className="text-sm font-semibold text-oxford dark:text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <ClipboardDocumentCheckIcon className="w-10 h-10 text-gray-200 dark:text-white/10" />
                <p className="text-sm text-silver dark:text-white/40">No final quiz configured yet</p>
                <button onClick={() => openFqModal("edit")} className="mt-1 flex items-center gap-1.5 px-4 py-2 bg-purple-500/10 text-purple-500 rounded-lg text-xs font-semibold hover:bg-purple-500/20 transition-colors">
                  <PlusCircleIcon className="w-4 h-4" /> Create Final Quiz
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ═══════════ FINAL QUIZ MODAL ═══════════ */}
      <AnimatePresence>
        {fqModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setFqModal(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={cn("relative w-full bg-white dark:bg-oxford-light rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden", fqModal === "delete" ? "max-w-md" : "max-w-lg")}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10">
                <h3 className="text-lg font-semibold text-oxford dark:text-white">
                  {fqModal === "delete" ? "Remove Final Quiz" : finalQuiz ? "Edit Final Quiz" : "Create Final Quiz"}
                </h3>
                <button onClick={() => setFqModal(null)} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
              </div>

              {fqModal === "delete" ? (
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 rounded-xl">
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-500 flex-shrink-0" />
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">This will permanently remove the final quiz for this course. Students who haven&apos;t taken it yet won&apos;t be able to get a certificate.</p>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setFqModal(null)} className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-white/10 text-oxford dark:text-white rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Cancel</button>
                    <button onClick={deleteFinalQuiz} disabled={fqSaving} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50">{fqSaving ? "..." : "Remove"}</button>
                  </div>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  <div>
                    <label className={LabelClass}>Title</label>
                    <input type="text" value={fqForm.title} onChange={e => setFqForm({ ...fqForm, title: e.target.value })} className={InputClass} placeholder="Final Quiz" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={LabelClass}>Questions drawn per attempt</label>
                      <input type="number" min={1} value={fqForm.num_questions} onChange={e => setFqForm({ ...fqForm, num_questions: Number(e.target.value) })} className={InputClass} />
                    </div>
                    <div>
                      <label className={LabelClass}>Pass threshold (%)</label>
                      <input type="number" min={0} max={100} value={fqForm.pass_threshold} onChange={e => setFqForm({ ...fqForm, pass_threshold: Number(e.target.value) })} className={InputClass} />
                    </div>
                    <div>
                      <label className={LabelClass}>Max attempts</label>
                      <input type="number" min={1} value={fqForm.max_attempts} onChange={e => setFqForm({ ...fqForm, max_attempts: Number(e.target.value) })} className={InputClass} />
                    </div>
                    <div>
                      <label className={LabelClass}>XP reward</label>
                      <input type="number" min={0} value={fqForm.xp_reward} onChange={e => setFqForm({ ...fqForm, xp_reward: Number(e.target.value) })} className={InputClass} />
                    </div>
                  </div>
                  <p className="text-xs text-silver dark:text-white/40">
                    The questions will be randomly drawn from all section quizzes in this course.
                  </p>
                  <div className="flex gap-3 pt-3">
                    <button onClick={() => setFqModal(null)} className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-white/10 text-oxford dark:text-white rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Cancel</button>
                    <button onClick={saveFinalQuiz} disabled={fqSaving} className="flex-1 px-4 py-2.5 bg-purple-500 text-white rounded-xl text-sm font-semibold hover:bg-purple-600 transition-colors disabled:opacity-50 shadow-md">
                      {fqSaving ? "Saving..." : finalQuiz ? "Update" : "Create"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ SECTION MODAL ═══════════ */}
      <AnimatePresence>
        {sectionModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeSectionModal} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={cn("relative w-full bg-white dark:bg-oxford-light rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden", sectionModal === "delete" ? "max-w-md" : "max-w-lg")}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10">
                <h3 className="text-lg font-semibold text-oxford dark:text-white">
                  {sectionModal === "add" && tc("addSection")}
                  {sectionModal === "edit" && tc("editSection")}
                  {sectionModal === "delete" && tc("deleteSection")}
                </h3>
                <button onClick={closeSectionModal} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
              </div>

              {sectionModal === "delete" && selectedSection ? (
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 rounded-xl">
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800 dark:text-red-300">{tc("confirmDeleteSection")}</p>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">{tc("confirmDeleteSectionDesc")}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={closeSectionModal} className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-white/10 text-oxford dark:text-white rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">{t("admin.common.cancel")}</button>
                    <button onClick={handleDeleteSection} disabled={saving} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50">{saving ? "..." : t("admin.common.delete")}</button>
                  </div>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  <div><label className={LabelClass}>{tc("sectionTitle")} <span className="text-red-500">*</span></label>
                    <input type="text" value={sectionForm.title} onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })} className={InputClass} /></div>
                  <div><label className={LabelClass}>{tc("sectionType")}</label>
                    <select value={sectionForm.type} onChange={(e) => setSectionForm({ ...sectionForm, type: e.target.value as "teaser" | "introduction" | "module" | "conclusion" })}
                      className={cn(InputClass, "cursor-pointer")}>
                      <option value="module" className="text-black">Module</option><option value="teaser" className="text-black">Teaser</option><option value="introduction" className="text-black">Introduction</option><option value="conclusion" className="text-black">Conclusion</option>
                    </select></div>
                  <div className="flex gap-3 pt-3">
                    <button onClick={closeSectionModal} className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-white/10 text-oxford dark:text-white rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">{t("admin.common.cancel")}</button>
                    <button onClick={saveSection} disabled={!sectionForm.title || saving} className="flex-1 px-4 py-2.5 bg-gold text-oxford rounded-xl text-sm font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50 shadow-md">
                      {saving ? "..." : (sectionModal === "add" ? tc("addSection") : t("admin.common.save"))}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ LESSON MODAL ═══════════ */}
      <AnimatePresence>
        {lessonModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeLessonModal} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={cn("relative w-full bg-white dark:bg-oxford-light rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden", lessonModal === "delete" ? "max-w-md" : "max-w-2xl")}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10">
                <h3 className="text-lg font-semibold text-oxford dark:text-white">
                  {lessonModal === "add" && tc("addLesson")}
                  {lessonModal === "edit" && tc("editLesson")}
                  {lessonModal === "view" && tc("viewLesson")}
                  {lessonModal === "delete" && tc("deleteLesson")}
                </h3>
                <button onClick={closeLessonModal} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
              </div>

              {/* Delete Lesson */}
              {lessonModal === "delete" && selectedLesson && (
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 rounded-xl">
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-500 flex-shrink-0" />
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">{tc("confirmDeleteLesson")}</p>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", selectedLesson.type === "audio" ? "bg-blue-500/10" : "bg-amber-500/10")}>
                      {selectedLesson.type === "audio" ? <MusicalNoteIcon className="w-5 h-5 text-blue-500" /> : <DocumentTextIcon className="w-5 h-5 text-amber-500" />}
                    </div>
                    <p className="font-medium text-oxford dark:text-white text-sm">{selectedLesson.title}</p>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={closeLessonModal} className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-white/10 text-oxford dark:text-white rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">{t("admin.common.cancel")}</button>
                    <button onClick={handleDeleteLesson} disabled={saving} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50">{saving ? "..." : t("admin.common.delete")}</button>
                  </div>
                </div>
              )}

              {/* View Lesson */}
              {lessonModal === "view" && selectedLesson && (
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: tc("lessonTitle"), value: selectedLesson.title },
                      { label: tc("lessonType"), value: selectedLesson.type },
                      { label: tc("duration"), value: `${selectedLesson.duration_seconds}s` },
                      { label: tc("slideType"), value: selectedLesson.slide_type },
                    ].map((item) => (
                      <div key={item.label} className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                        <p className="text-xs text-silver dark:text-white/40 mb-1">{item.label}</p>
                        <p className="text-sm font-medium text-oxford dark:text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  {selectedLesson.audioUrl && (
                    <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                      <p className="text-xs text-silver dark:text-white/40 mb-2">{tc("audioFile")}</p>
                      <audio controls src={selectedLesson.audioUrl} className="w-full" />
                    </div>
                  )}
                  {selectedLesson.content?.narration_script?.speakers?.length > 0 && (
                    <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                      <p className="text-xs text-silver dark:text-white/40 mb-2">{tc("narrationScript")}</p>
                      <div className="space-y-2">
                        {selectedLesson.content.narration_script.speakers.map((sp, i) => (
                          <div key={i} className="flex gap-2 text-sm">
                            <span className="font-semibold text-gold whitespace-nowrap">{sp.speaker}:</span>
                            <span className="text-oxford dark:text-white/80">{sp.text}</span>
                            <span className="text-xs text-silver dark:text-white/30 italic whitespace-nowrap">({sp.emotion})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Add/Edit Lesson Form */}
              {(lessonModal === "add" || lessonModal === "edit") && (
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={LabelClass}>{tc("lessonTitle")} <span className="text-red-500">*</span></label>
                      <input type="text" value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} className={InputClass} /></div>
                    <div><label className={LabelClass}>{tc("lessonType")}</label>
                      <select value={lessonForm.type} onChange={(e) => setLessonForm({ ...lessonForm, type: e.target.value as "slide" | "video" | "text" | "audio" })} className={cn(InputClass, "cursor-pointer")}>
                        <option value="audio" className="text-black">Audio</option><option value="slide" className="text-black">Slide</option><option value="video" className="text-black">Video</option><option value="text" className="text-black">Text</option>
                      </select></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={LabelClass}>{tc("duration")} (s)</label>
                      <input type="number" min={0} value={lessonForm.duration_seconds} onChange={(e) => setLessonForm({ ...lessonForm, duration_seconds: Number(e.target.value) })} className={InputClass} /></div>
                    <div><label className={LabelClass}>{tc("slideType")}</label>
                      <input type="text" value={lessonForm.slide_type} onChange={(e) => setLessonForm({ ...lessonForm, slide_type: e.target.value })} className={InputClass} /></div>
                  </div>

                  {/* Audio Upload */}
                  <div>
                    <label className={LabelClass}>{tc("audioFile")}</label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 border border-dashed border-gray-300 dark:border-white/20 rounded-xl">
                      <button type="button" onClick={() => audioInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-gold/10 text-gold rounded-lg text-xs font-semibold hover:bg-gold/20 transition-colors">
                        <ArrowUpTrayIcon className="w-4 h-4" /> {tc("uploadAudio")}
                      </button>
                      <span className="text-xs text-silver dark:text-white/40 truncate">{audioFile?.name || audioPreview || tc("noFileSelected")}</span>
                      <input ref={audioInputRef} type="file" accept="audio/*" onChange={handleAudioChange} className="hidden" />
                    </div>
                    {audioPreview && <audio controls src={audioPreview} className="w-full mt-2" />}
                  </div>

                  {/* Narration Script */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className={LabelClass}>{tc("narrationScript")}</label>
                      <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 rounded-lg p-0.5">
                        <button type="button" onClick={() => switchNarratorMode("manual")}
                          className={cn("flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                            narratorMode === "manual" ? "bg-white dark:bg-white/10 text-gold shadow-sm" : "text-silver dark:text-white/40 hover:text-oxford dark:hover:text-white/70"
                          )}>
                          <PencilIcon className="w-3.5 h-3.5" /> Manual
                        </button>
                        <button type="button" onClick={() => switchNarratorMode("json")}
                          className={cn("flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                            narratorMode === "json" ? "bg-white dark:bg-white/10 text-gold shadow-sm" : "text-silver dark:text-white/40 hover:text-oxford dark:hover:text-white/70"
                          )}>
                          <CodeBracketIcon className="w-3.5 h-3.5" /> JSON
                        </button>
                      </div>
                    </div>

                    {narratorMode === "manual" ? (
                      /* ── Manual mode ── */
                      <>
                        <div className="flex justify-end mb-2">
                          <button type="button" onClick={addSpeaker} className="flex items-center gap-1 text-xs text-gold hover:text-gold/80 font-medium"><PlusCircleIcon className="w-4 h-4" /> {tc("addSpeaker")}</button>
                        </div>
                        <div className="space-y-3">
                          {lessonForm.speakers.map((sp, i) => (
                            <div key={i} className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl space-y-2">
                              <div className="flex items-center gap-2">
                                <input placeholder={tc("speakerName")} value={sp.speaker} onChange={(e) => updateSpeaker(i, "speaker", e.target.value)} className={cn(InputClass, "flex-1")} />
                                <input placeholder={tc("emotion")} value={sp.emotion} onChange={(e) => updateSpeaker(i, "emotion", e.target.value)} className={cn(InputClass, "w-32")} />
                                <button onClick={() => removeSpeaker(i)} className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><MinusCircleIcon className="w-4 h-4" /></button>
                              </div>
                              <textarea rows={2} placeholder={tc("speakerText")} value={sp.text} onChange={(e) => updateSpeaker(i, "text", e.target.value)} className={cn(InputClass, "resize-none")} />
                            </div>
                          ))}
                          {lessonForm.speakers.length === 0 && (
                            <p className="text-xs text-silver dark:text-white/30 text-center py-4">No speakers yet. Click &quot;Add Speaker&quot; or switch to JSON mode to paste data.</p>
                          )}
                        </div>
                      </>
                    ) : (
                      /* ── JSON mode ── */
                      <div className="space-y-2">
                        <textarea
                          rows={10}
                          value={narratorJson}
                          onChange={(e) => handleNarratorJsonChange(e.target.value)}
                          placeholder={`[\n  {\n    "speaker": "أَسْمَاءْ",\n    "text": "مَرْحَبًا بِكُمْ...",\n    "emotion": "enthousiaste"\n  },\n  {\n    "speaker": "نَبِيلْ",\n    "text": "التَّوَاصُلُ الْفَعَّالُ...",\n    "emotion": "pédagogue"\n  }\n]`}
                          className={cn(InputClass, "resize-none font-mono text-xs !leading-relaxed", narratorJsonError && "!border-red-400 !ring-red-400/50")}
                        />
                        {narratorJsonError && (
                          <div className="flex items-center gap-1.5 text-xs text-red-500">
                            <ExclamationTriangleIcon className="w-3.5 h-3.5 flex-shrink-0" />
                            {narratorJsonError}
                          </div>
                        )}
                        {!narratorJsonError && narratorJson.trim() && (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-500">
                            <CheckCircleIcon className="w-3.5 h-3.5 flex-shrink-0" />
                            {lessonForm.speakers.length} speaker(s) parsed successfully
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button onClick={closeLessonModal} className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-white/10 text-oxford dark:text-white rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">{t("admin.common.cancel")}</button>
                    <button onClick={saveLesson} disabled={!lessonForm.title || saving} className="flex-1 px-4 py-2.5 bg-gold text-oxford rounded-xl text-sm font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50 shadow-md">
                      {saving ? "..." : (lessonModal === "add" ? tc("addLesson") : t("admin.common.save"))}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ QUIZ MODAL ═══════════ */}
      <AnimatePresence>
        {quizModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeQuizModal} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl bg-white dark:bg-oxford-light rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10">
                <h3 className="text-lg font-semibold text-oxford dark:text-white">{quizModal === "add" ? tc("addQuiz") : tc("editQuiz")}</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setQuizJsonMode(!quizJsonMode); setQuizJsonError(null); }}
                    className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors", quizJsonMode ? "bg-gold text-oxford" : "bg-gray-100 dark:bg-white/5 text-silver dark:text-white/50 hover:text-oxford dark:hover:text-white")}
                  >JSON</button>
                  <button onClick={closeQuizModal} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
                </div>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Quiz JSON Paste */}
                {quizJsonMode && (
                  <div className="space-y-2 pb-3 mb-3 border-b border-gray-200 dark:border-white/10">
                    <p className="text-xs text-silver dark:text-white/50">{tc("quizJsonHint") || "Paste a quiz JSON. It will fill the title, intro, and all questions."}</p>
                    <textarea
                      rows={8}
                      value={quizJsonText}
                      onChange={(e) => { setQuizJsonText(e.target.value); setQuizJsonError(null); }}
                      placeholder='{"quiz": { "title": "...", "questions": [...] }}'
                      className={cn(InputClass, "font-mono resize-none")}
                    />
                    {quizJsonError && (
                      <div className="flex items-center gap-1.5 text-xs text-red-500">
                        <ExclamationTriangleIcon className="w-3.5 h-3.5 flex-shrink-0" />{quizJsonError}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-gray-300 dark:border-white/20 rounded-lg text-sm font-medium text-silver dark:text-white/50 hover:border-gold hover:text-gold cursor-pointer transition-colors">
                        <ArrowUpTrayIcon className="w-4 h-4" />
                        {tc("importFile") || "Import File"}
                        <input type="file" accept=".json" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) { const r = new FileReader(); r.onload = () => { setQuizJsonText(r.result as string); setQuizJsonError(null); }; r.readAsText(file); }
                          e.target.value = "";
                        }} />
                      </label>
                      <button onClick={parseQuizJson} disabled={!quizJsonText.trim()} className="flex-1 px-4 py-2 bg-gold text-oxford rounded-lg text-sm font-semibold hover:bg-gold/90 disabled:opacity-40 transition-colors">
                        {tc("applyQuizJson") || "Apply JSON"}
                      </button>
                    </div>
                  </div>
                )}
                <div><label className={LabelClass}>{tc("quizTitle")} <span className="text-red-500">*</span></label>
                  <input type="text" value={quizForm.title} onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} className={InputClass} /></div>
                <div><label className={LabelClass}>{tc("introText")}</label>
                  <input type="text" value={quizForm.intro_text} onChange={(e) => setQuizForm({ ...quizForm, intro_text: e.target.value })} className={InputClass} /></div>
                <div className="grid grid-cols-3 gap-4">
                  <div><label className={LabelClass}>{tc("passThreshold")} (%)</label>
                    <input type="number" min={0} max={100} value={quizForm.pass_threshold} onChange={(e) => setQuizForm({ ...quizForm, pass_threshold: Number(e.target.value) })} className={InputClass} /></div>
                  <div><label className={LabelClass}>{tc("maxAttempts")}</label>
                    <input type="number" min={1} value={quizForm.max_attempts} onChange={(e) => setQuizForm({ ...quizForm, max_attempts: Number(e.target.value) })} className={InputClass} /></div>
                  <div><label className={LabelClass}>{tc("xpReward")}</label>
                    <input type="number" min={0} value={quizForm.xp_reward} onChange={(e) => setQuizForm({ ...quizForm, xp_reward: Number(e.target.value) })} className={InputClass} /></div>
                </div>

                {/* Questions */}
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs font-semibold text-silver dark:text-white/50 uppercase tracking-wider">{tc("questions")} ({quizForm.questions.length})</p>
                  <button type="button" onClick={() => addQuestion()} className="flex items-center gap-1 text-xs text-gold hover:text-gold/80 font-medium"><PlusCircleIcon className="w-4 h-4" /> {tc("addQuestion")}</button>
                </div>
                <div className="space-y-4">
                  {quizForm.questions.map((q, qIdx) => (
                    <div key={q.id} className="p-4 bg-gray-50 dark:bg-white/[0.03] rounded-xl space-y-3 border border-gray-200 dark:border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-silver dark:text-white/50">Q{qIdx + 1}</span>
                        <div className="flex items-center gap-2">
                          <select value={q.type} onChange={(e) => changeQuestionType(qIdx, e.target.value)} className="px-2 py-1 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded text-xs text-oxford dark:text-white">
                            <option value="multiple_choice" className="text-black">QCM</option>
                            <option value="true_false" className="text-black">Vrai / Faux</option>
                            <option value="scenario" className="text-black">Scénario</option>
                          </select>
                          <select value={q.difficulty} onChange={(e) => updateQuestion(qIdx, "difficulty", e.target.value)} className="px-2 py-1 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded text-xs text-oxford dark:text-white">
                            <option value="easy" className="text-black">Easy</option><option value="medium" className="text-black">Medium</option><option value="hard" className="text-black">Hard</option><option value="expert" className="text-black">Expert</option>
                          </select>
                          <button onClick={() => removeQuestion(qIdx)} className="p-1 text-red-400 hover:text-red-500 transition-colors"><MinusCircleIcon className="w-4 h-4" /></button>
                        </div>
                      </div>

                      {/* Question text */}
                      <div><label className={LabelClass}>{q.type === "scenario" ? tc("scenarioDescription") || "Scenario Description" : tc("questionText")}</label>
                        {q.type === "scenario" ? (
                          <textarea rows={3} value={q.question} onChange={(e) => updateQuestion(qIdx, "question", e.target.value)} className={cn(InputClass, "resize-none")} placeholder="Describe the scenario situation..." />
                        ) : (
                          <input type="text" value={q.question} onChange={(e) => updateQuestion(qIdx, "question", e.target.value)} className={InputClass} />
                        )}
                      </div>

                      {/* Options — adapt to question type */}
                      {q.type === "true_false" ? (
                        <div className="grid grid-cols-2 gap-2">
                          {["Vrai", "Faux"].map((label, oIdx) => (
                            <button key={oIdx} type="button" onClick={() => updateQuestion(qIdx, "correct_answer", oIdx + 1)}
                              className={cn("px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all",
                                q.correct_answer === oIdx + 1
                                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : "border-gray-200 dark:border-white/10 text-oxford dark:text-white hover:border-gray-300 dark:hover:border-white/20"
                              )}>
                              {q.correct_answer === oIdx + 1 && <CheckCircleIcon className="w-4 h-4 inline mr-1.5" />}
                              {label}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className="relative">
                              <input type="text" value={opt} onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                                className={cn(InputClass, q.correct_answer === oIdx + 1 && "ring-2 ring-emerald-500/50 border-emerald-500")} placeholder={q.type === "scenario" ? `Response ${oIdx + 1}` : `Option ${oIdx + 1}`} />
                              <button type="button" onClick={() => updateQuestion(qIdx, "correct_answer", oIdx + 1)}
                                className={cn("absolute end-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                                  q.correct_answer === oIdx + 1 ? "border-emerald-500 bg-emerald-500" : "border-gray-300 dark:border-white/20 hover:border-emerald-400"
                                )}>
                                {q.correct_answer === oIdx + 1 && <CheckCircleIcon className="w-3 h-3 text-white" />}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div><label className={LabelClass}>{tc("explanation")}</label>
                        <input type="text" value={q.explanation} onChange={(e) => updateQuestion(qIdx, "explanation", e.target.value)} className={InputClass} /></div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-3">
                  <button onClick={closeQuizModal} className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-white/10 text-oxford dark:text-white rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">{t("admin.common.cancel")}</button>
                  <button onClick={saveQuiz} disabled={!quizForm.title || saving} className="flex-1 px-4 py-2.5 bg-gold text-oxford rounded-xl text-sm font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50 shadow-md">
                    {saving ? "..." : (quizModal === "add" ? tc("addQuiz") : t("admin.common.save"))}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Import Modal */}
      <AnimatePresence>
        {showBulkImport && (
          <JsonBulkImport
            courseId={courseId}
            existingSectionsCount={sections.length}
            onComplete={(msg) => {
              setShowBulkImport(false);
              showToast(msg);
              if (courseSlug) dispatch(fetchSections(courseSlug));
            }}
            onClose={() => setShowBulkImport(false)}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 50, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: 50, x: "-50%" }}
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
