"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon as X,
  CodeBracketIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useAppDispatch } from "@/store/hooks";
import { createSection, createLesson } from "@/store/slices/adminCourseContentSlice";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ParsedLesson {
  title: string;
  slide_type: string;
  duration_seconds: number;
  visual_content: Record<string, unknown>;
  narration_script: { mode: string; speakers: { text: string; emotion: string; speaker: string }[] };
}

interface ParsedSection {
  title: string;
  type: "teaser" | "introduction" | "module" | "conclusion";
  lessons: ParsedLesson[];
}

interface Props {
  courseId: string;
  existingSectionsCount: number;
  onComplete: (msg: string) => void;
  onClose: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function JsonBulkImport({ courseId, existingSectionsCount, onComplete, onClose }: Props) {
  const { t } = useI18n();
  const tc = (key: string) => t(`admin.courseContent.${key}`);
  const dispatch = useAppDispatch();

  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedSection | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  // ── Parse JSON ──────────────────────────────────────────────────────────

  const parseJson = useCallback(() => {
    try {
      const raw = JSON.parse(jsonText);

      // Auto-detect type from top-level key
      let type: ParsedSection["type"] = "module";
      let data = raw;
      if (raw.teaser) { type = "teaser"; data = raw.teaser; }
      else if (raw.introduction) { type = "introduction"; data = raw.introduction; }
      else if (raw.module) { type = "module"; data = raw.module; }
      else if (raw.conclusion) { type = "module"; data = raw; }

      const slides = data.slides || [];
      if (!slides.length) { setJsonError("No slides found in JSON"); return; }

      const lessons: ParsedLesson[] = slides.map((s: Record<string, unknown>) => ({
        title: (s.title as string) || "Untitled",
        slide_type: (s.slide_type as string) || "bullet_points",
        duration_seconds: (s.duration_seconds as number) || 0,
        visual_content: (s.visual_content as Record<string, unknown>) || {},
        narration_script: (s.narration_script as ParsedLesson["narration_script"]) || { mode: "multi_speaker", speakers: [] },
      }));

      setParsed({ title: data.title || data.module_title || "Untitled", type, lessons });
      setJsonError(null);
    } catch (err) {
      setJsonError((err as Error).message);
      setParsed(null);
    }
  }, [jsonText]);

  // ── Import all ──────────────────────────────────────────────────────────

  const importAll = useCallback(async () => {
    if (!parsed) return;
    setImporting(true);
    setProgress({ current: 0, total: parsed.lessons.length });

    try {
      // 1. Create the section
      const sectionResult = await dispatch(createSection({
        course: courseId,
        title: parsed.title,
        type: parsed.type,
        sequence: existingSectionsCount + 1,
      }));

      if (!createSection.fulfilled.match(sectionResult)) {
        setJsonError("Failed to create section");
        setImporting(false);
        return;
      }

      const sectionId = sectionResult.payload.id;

      // 2. Create lessons sequentially
      for (let i = 0; i < parsed.lessons.length; i++) {
        const lesson = parsed.lessons[i];
        await dispatch(createLesson({
          section: sectionId,
          title: lesson.title,
          type: "audio",
          sequence: i,
          duration_seconds: lesson.duration_seconds,
          slide_type: lesson.slide_type,
          content: {
            visual_content: lesson.visual_content,
            narration_script: lesson.narration_script,
          },
        }));
        setProgress({ current: i + 1, total: parsed.lessons.length });
      }

      onComplete(
        `${tc("importComplete") || "Import complete"} — 1 ${tc("previewSection") || "section"}, ${parsed.lessons.length} ${tc("previewLessons") || "lessons"}`
      );
    } catch {
      setJsonError("Import failed — check console for details");
    } finally {
      setImporting(false);
    }
  }, [parsed, courseId, existingSectionsCount, dispatch, onComplete, tc]);

  // ── Render ──────────────────────────────────────────────────────────────

  const typeBadge = (type: string) => {
    const colors: Record<string, string> = {
      teaser: "bg-purple-500/10 text-purple-500",
      introduction: "bg-blue-500/10 text-blue-500",
      module: "bg-gold/10 text-gold",
      conclusion: "bg-emerald-500/10 text-emerald-500",
    };
    return colors[type] || colors.module;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-white dark:bg-oxford-light rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center">
              <CodeBracketIcon className="w-5 h-5 text-gold" />
            </div>
            <h3 className="text-lg font-semibold text-oxford dark:text-white">
              {tc("bulkImport") || "JSON Bulk Import"}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {!parsed ? (
              /* ── Step 1: Paste JSON ── */
              <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                <p className="text-xs text-silver dark:text-white/50">
                  {tc("bulkImportHint") || "Paste a teaser, introduction, or module JSON. It will create the section and all its lessons automatically."}
                </p>
                <textarea
                  rows={14}
                  value={jsonText}
                  onChange={(e) => { setJsonText(e.target.value); setJsonError(null); }}
                  placeholder={'{\n  "module": {\n    "title": "...",\n    "slides": [...]\n  }\n}'}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-oxford dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors resize-none"
                />
                <label className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-dashed border-gray-300 dark:border-white/20 rounded-xl text-sm font-medium text-silver dark:text-white/50 hover:border-gold hover:text-gold cursor-pointer transition-colors">
                  <ArrowUpTrayIcon className="w-4 h-4" />
                  {tc("importFile") || "Import File"}
                  <input type="file" accept=".json" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) { const r = new FileReader(); r.onload = () => { setJsonText(r.result as string); setJsonError(null); }; r.readAsText(file); }
                    e.target.value = "";
                  }} />
                </label>
                {jsonError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 rounded-xl text-xs text-red-600 dark:text-red-400">
                    <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
                    {jsonError}
                  </div>
                )}
              </motion.div>
            ) : (
              /* ── Step 2: Preview ── */
              <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                {/* Section preview */}
                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase", typeBadge(parsed.type))}>
                      {parsed.type}
                    </span>
                    <span className="text-sm font-semibold text-oxford dark:text-white">{parsed.title}</span>
                  </div>
                  <p className="text-xs text-silver dark:text-white/40">
                    {parsed.lessons.length} {tc("previewLessons") || "lessons"} •{" "}
                    {Math.round(parsed.lessons.reduce((s, l) => s + l.duration_seconds, 0) / 60)} min
                  </p>
                </div>

                {/* Lessons list */}
                <div className="space-y-1.5 max-h-52 overflow-y-auto">
                  {parsed.lessons.map((lesson, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10">
                      <span className="w-6 h-6 rounded-full bg-gold/10 text-gold text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-oxford dark:text-white truncate">{lesson.title}</p>
                        <p className="text-[10px] text-silver dark:text-white/40">
                          {lesson.slide_type} • {lesson.duration_seconds}s • {lesson.narration_script.speakers.length} speakers
                        </p>
                      </div>
                      {importing && progress.current > i && (
                        <CheckCircleIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                {importing && (
                  <div className="space-y-1">
                    <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gold rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(progress.current / progress.total) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className="text-xs text-center text-silver dark:text-white/40">
                      {tc("importing") || "Importing"} {progress.current}/{progress.total}
                    </p>
                  </div>
                )}

                {jsonError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 rounded-xl text-xs text-red-600 dark:text-red-400">
                    <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
                    {jsonError}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-white/10">
          {!parsed ? (
            <>
              <button onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                {tc("cancel") || "Cancel"}
              </button>
              <button
                onClick={parseJson}
                disabled={!jsonText.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-gold text-oxford text-sm font-semibold rounded-xl hover:bg-gold-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowUpTrayIcon className="w-4 h-4" />
                {tc("parsePreview") || "Parse & Preview"}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setParsed(null); setJsonError(null); }}
                disabled={importing}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors disabled:opacity-40"
              >
                {tc("back") || "Back"}
              </button>
              <button
                onClick={importAll}
                disabled={importing}
                className="flex items-center gap-2 px-5 py-2.5 bg-gold text-oxford text-sm font-semibold rounded-xl hover:bg-gold-light disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {importing ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                    {tc("importing") || "Importing"}...
                  </>
                ) : (
                  <>
                    <ArrowUpTrayIcon className="w-4 h-4" />
                    {tc("importAll") || "Import All"}
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
