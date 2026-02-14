"use client";

import { useState, useRef } from "react";
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
} from "@heroicons/react/24/outline";
import AdminHeader from "@/components/admin/AdminHeader";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MOCK_SECTIONS } from "./mockData";
import type {
  AdminSection,
  AdminLesson,
  AdminQuiz,
  QuizQuestion,
  Speaker,
  SectionModalMode,
  LessonModalMode,
  QuizModalMode,
} from "./types";

// =============================================================================
// ID GENERATOR
// =============================================================================
const uid = () => crypto.randomUUID();

// =============================================================================
// COMPONENT
// =============================================================================

export default function CourseContentPage() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId") || "";

  // Sections state (fully local)
  const [sections, setSections] = useState<AdminSection[]>(MOCK_SECTIONS);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  // Translation helper
  const tc = (key: string) => t(`admin.courseContent.${key}`);

  // ─── SECTION MODALS ───
  const [sectionModal, setSectionModal] = useState<SectionModalMode>(null);
  const [selectedSection, setSelectedSection] = useState<AdminSection | null>(null);
  const [sectionForm, setSectionForm] = useState({ title: "", type: "module" as "teaser" | "module" });

  // ─── LESSON MODALS ───
  const [lessonModal, setLessonModal] = useState<LessonModalMode>(null);
  const [selectedLesson, setSelectedLesson] = useState<AdminLesson | null>(null);
  const [lessonParentId, setLessonParentId] = useState<string>("");
  const [lessonForm, setLessonForm] = useState({
    title: "", type: "audio" as "slide" | "audio", duration_seconds: 0, slide_type: "bullet_points",
    speakers: [] as Speaker[],
  });
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);

  // ─── QUIZ MODALS ───
  const [quizModal, setQuizModal] = useState<QuizModalMode>(null);
  const [quizParentId, setQuizParentId] = useState<string>("");
  const [quizForm, setQuizForm] = useState<AdminQuiz>({
    id: "", title: "", intro_text: "", questions: [], pass_threshold: 70, max_attempts: 3, xp_reward: 10,
  });

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

  const saveSection = () => {
    if (sectionModal === "add") {
      const newSection: AdminSection = {
        id: uid(), title: sectionForm.title, type: sectionForm.type,
        sequence: sections.length + 1, audioFileIndex: sections.length + 1,
        lessons: 0, duration: "0min", lessons_list: [], quiz: null,
      };
      setSections([...sections, newSection]);
      showToast(tc("sectionAdded"));
    } else if (sectionModal === "edit" && selectedSection) {
      setSections(sections.map((s) => s.id === selectedSection.id ? { ...s, title: sectionForm.title, type: sectionForm.type } : s));
      showToast(tc("sectionUpdated"));
    }
    closeSectionModal();
  };

  const deleteSection = () => {
    if (selectedSection) {
      setSections(sections.filter((s) => s.id !== selectedSection.id));
      showToast(tc("sectionDeleted"));
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
    setLessonModal("add");
  };

  const openEditLesson = (sectionId: string, lesson: AdminLesson) => {
    setLessonParentId(sectionId); setSelectedLesson(lesson);
    setLessonForm({
      title: lesson.title, type: lesson.type, duration_seconds: lesson.duration_seconds,
      slide_type: lesson.slide_type, speakers: lesson.content.narration_script?.speakers || [],
    });
    setAudioFile(null); setAudioPreview(lesson.audioUrl);
    setLessonModal("edit");
  };

  const openViewLesson = (sectionId: string, lesson: AdminLesson) => {
    setLessonParentId(sectionId); setSelectedLesson(lesson); setLessonModal("view");
  };

  const openDeleteLesson = (sectionId: string, lesson: AdminLesson) => {
    setLessonParentId(sectionId); setSelectedLesson(lesson); setLessonModal("delete");
  };

  const closeLessonModal = () => { setLessonModal(null); setSelectedLesson(null); setAudioFile(null); setAudioPreview(null); };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setAudioFile(file); setAudioPreview(URL.createObjectURL(file)); }
  };

  const saveLesson = () => {
    const newLesson: AdminLesson = {
      id: lessonModal === "edit" && selectedLesson ? selectedLesson.id : uid(),
      title: lessonForm.title, type: lessonForm.type, sequence: 0,
      duration_seconds: lessonForm.duration_seconds,
      audioUrl: audioPreview, slide_type: lessonForm.slide_type,
      content: {
        visual_content: selectedLesson?.content.visual_content || {},
        narration_script: { mode: "multi_speaker", speakers: lessonForm.speakers },
      },
    };

    setSections(sections.map((s) => {
      if (s.id !== lessonParentId) return s;
      let list: AdminLesson[];
      if (lessonModal === "add") {
        list = [...s.lessons_list, { ...newLesson, sequence: s.lessons_list.length }];
      } else {
        list = s.lessons_list.map((l) => l.id === newLesson.id ? newLesson : l);
      }
      return { ...s, lessons_list: list, lessons: list.length };
    }));
    showToast(lessonModal === "add" ? tc("lessonAdded") : tc("lessonUpdated"));
    closeLessonModal();
  };

  const deleteLesson = () => {
    if (selectedLesson) {
      setSections(sections.map((s) => {
        if (s.id !== lessonParentId) return s;
        const list = s.lessons_list.filter((l) => l.id !== selectedLesson.id);
        return { ...s, lessons_list: list, lessons: list.length };
      }));
      showToast(tc("lessonDeleted"));
    }
    closeLessonModal();
  };

  // Speaker helpers
  const addSpeaker = () => setLessonForm({ ...lessonForm, speakers: [...lessonForm.speakers, { text: "", emotion: "", speaker: "" }] });
  const updateSpeaker = (idx: number, field: keyof Speaker, val: string) => {
    const s = [...lessonForm.speakers]; s[idx] = { ...s[idx], [field]: val }; setLessonForm({ ...lessonForm, speakers: s });
  };
  const removeSpeaker = (idx: number) => setLessonForm({ ...lessonForm, speakers: lessonForm.speakers.filter((_, i) => i !== idx) });

  // ═══════════════════════════════════════════════════════════════════════════
  // QUIZ CRUD
  // ═══════════════════════════════════════════════════════════════════════════

  const openQuizEditor = (sectionId: string, quiz: AdminQuiz | null) => {
    setQuizParentId(sectionId);
    if (quiz) {
      setQuizForm({ ...quiz }); setQuizModal("edit");
    } else {
      setQuizForm({ id: uid(), title: "", intro_text: "", questions: [], pass_threshold: 70, max_attempts: 3, xp_reward: 10 });
      setQuizModal("add");
    }
  };

  const closeQuizModal = () => { setQuizModal(null); };

  const saveQuiz = () => {
    setSections(sections.map((s) => s.id === quizParentId ? { ...s, quiz: { ...quizForm } } : s));
    showToast(quizModal === "add" ? tc("quizAdded") : tc("quizUpdated"));
    closeQuizModal();
  };

  const deleteQuiz = (sectionId: string) => {
    setSections(sections.map((s) => s.id === sectionId ? { ...s, quiz: null } : s));
    showToast(tc("quizDeleted"));
  };

  // Question helpers
  const addQuestion = () => setQuizForm({
    ...quizForm, questions: [...quizForm.questions, {
      id: uid(), type: "multiple_choice", question: "", options: ["", "", "", ""],
      correct_answer: 1, explanation: "", difficulty: "easy", category: "general",
    }],
  });

  const updateQuestion = (idx: number, field: string, val: unknown) => {
    const q = [...quizForm.questions]; q[idx] = { ...q[idx], [field]: val }; setQuizForm({ ...quizForm, questions: q });
  };

  const updateOption = (qIdx: number, oIdx: number, val: string) => {
    const q = [...quizForm.questions]; const opts = [...q[qIdx].options]; opts[oIdx] = val; q[qIdx] = { ...q[qIdx], options: opts };
    setQuizForm({ ...quizForm, questions: q });
  };

  const removeQuestion = (idx: number) => setQuizForm({ ...quizForm, questions: quizForm.questions.filter((_, i) => i !== idx) });

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
          <button onClick={openAddSection} className="flex items-center gap-2 px-5 py-2.5 bg-gold text-oxford rounded-lg text-sm font-semibold hover:bg-gold/90 transition-colors shadow-md hover:shadow-lg">
            <Plus className="w-4 h-4" /> {tc("addSection")}
          </button>
        </div>

        {/* Empty State */}
        {sections.length === 0 && (
          <div className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 p-12 text-center">
            <BookOpenIcon className="w-12 h-12 text-gray-300 dark:text-white/20 mx-auto mb-3" />
            <p className="text-sm text-silver dark:text-white/50">{tc("noSections")}</p>
          </div>
        )}

        {/* Sections */}
        {sections.map((section, sIdx) => {
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
                              <button onClick={() => deleteQuiz(section.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash className="w-3.5 h-3.5" /></button>
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
      </div>

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
                    <button onClick={deleteSection} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors">{t("admin.common.delete")}</button>
                  </div>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  <div><label className={LabelClass}>{tc("sectionTitle")} <span className="text-red-500">*</span></label>
                    <input type="text" value={sectionForm.title} onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })} className={InputClass} /></div>
                  <div><label className={LabelClass}>{tc("sectionType")}</label>
                    <select value={sectionForm.type} onChange={(e) => setSectionForm({ ...sectionForm, type: e.target.value as "teaser" | "module" })}
                      className={cn(InputClass, "cursor-pointer")}>
                      <option value="module" className="text-black">Module</option><option value="teaser" className="text-black">Teaser</option>
                    </select></div>
                  <div className="flex gap-3 pt-3">
                    <button onClick={closeSectionModal} className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-white/10 text-oxford dark:text-white rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">{t("admin.common.cancel")}</button>
                    <button onClick={saveSection} disabled={!sectionForm.title} className="flex-1 px-4 py-2.5 bg-gold text-oxford rounded-xl text-sm font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50 shadow-md">
                      {sectionModal === "add" ? tc("addSection") : t("admin.common.save")}
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
                    <button onClick={deleteLesson} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors">{t("admin.common.delete")}</button>
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
                  {selectedLesson.content.narration_script?.speakers?.length > 0 && (
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
                      <select value={lessonForm.type} onChange={(e) => setLessonForm({ ...lessonForm, type: e.target.value as "slide" | "audio" })} className={cn(InputClass, "cursor-pointer")}>
                        <option value="audio" className="text-black">Audio</option><option value="slide" className="text-black">Slide</option>
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
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={LabelClass}>{tc("narrationScript")}</label>
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
                    </div>
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button onClick={closeLessonModal} className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-white/10 text-oxford dark:text-white rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">{t("admin.common.cancel")}</button>
                    <button onClick={saveLesson} disabled={!lessonForm.title} className="flex-1 px-4 py-2.5 bg-gold text-oxford rounded-xl text-sm font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50 shadow-md">
                      {lessonModal === "add" ? tc("addLesson") : t("admin.common.save")}
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
                <button onClick={closeQuizModal} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
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
                  <button type="button" onClick={addQuestion} className="flex items-center gap-1 text-xs text-gold hover:text-gold/80 font-medium"><PlusCircleIcon className="w-4 h-4" /> {tc("addQuestion")}</button>
                </div>
                <div className="space-y-4">
                  {quizForm.questions.map((q, qIdx) => (
                    <div key={q.id} className="p-4 bg-gray-50 dark:bg-white/[0.03] rounded-xl space-y-3 border border-gray-200 dark:border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-silver dark:text-white/50">Q{qIdx + 1}</span>
                        <div className="flex items-center gap-2">
                          <select value={q.difficulty} onChange={(e) => updateQuestion(qIdx, "difficulty", e.target.value)} className="px-2 py-1 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded text-xs text-oxford dark:text-white">
                            <option value="easy" className="text-black">Easy</option><option value="medium" className="text-black">Medium</option><option value="hard" className="text-black">Hard</option>
                          </select>
                          <button onClick={() => removeQuestion(qIdx)} className="p-1 text-red-400 hover:text-red-500 transition-colors"><MinusCircleIcon className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <div><label className={LabelClass}>{tc("questionText")}</label>
                        <input type="text" value={q.question} onChange={(e) => updateQuestion(qIdx, "question", e.target.value)} className={InputClass} /></div>
                      <div className="grid grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="relative">
                            <input type="text" value={opt} onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                              className={cn(InputClass, q.correct_answer === oIdx + 1 && "ring-2 ring-emerald-500/50 border-emerald-500")} placeholder={`Option ${oIdx + 1}`} />
                            <button type="button" onClick={() => updateQuestion(qIdx, "correct_answer", oIdx + 1)}
                              className={cn("absolute end-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                                q.correct_answer === oIdx + 1 ? "border-emerald-500 bg-emerald-500" : "border-gray-300 dark:border-white/20 hover:border-emerald-400"
                              )}>
                              {q.correct_answer === oIdx + 1 && <CheckCircleIcon className="w-3 h-3 text-white" />}
                            </button>
                          </div>
                        ))}
                      </div>
                      <div><label className={LabelClass}>{tc("explanation")}</label>
                        <input type="text" value={q.explanation} onChange={(e) => updateQuestion(qIdx, "explanation", e.target.value)} className={InputClass} /></div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-3">
                  <button onClick={closeQuizModal} className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-white/10 text-oxford dark:text-white rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">{t("admin.common.cancel")}</button>
                  <button onClick={saveQuiz} disabled={!quizForm.title} className="flex-1 px-4 py-2.5 bg-gold text-oxford rounded-xl text-sm font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50 shadow-md">
                    {quizModal === "add" ? tc("addQuiz") : t("admin.common.save")}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
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
