"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  SpeakerWaveIcon,
  PresentationChartBarIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "@/lib/i18n";

interface LessonPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  lessonTitle: string;
  audioUrl?: string;
  slidesUrl?: string;
}

export default function LessonPreviewDialog({
  open,
  onClose,
  lessonTitle,
  audioUrl,
  slidesUrl,
}: LessonPreviewDialogProps) {
  const t = useTranslations("courseDetail");
  const [slidesImageError, setSlidesImageError] = useState(false);

  useEffect(() => {
    if (open) setSlidesImageError(false);
  }, [open, slidesUrl]);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-oxford-light rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 w-full max-w-5xl max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-4 end-4 p-1.5 bg-white/80 dark:bg-oxford-light/80 backdrop-blur text-silver hover:text-oxford dark:text-white/40 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors z-10"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <div className="p-6 space-y-4">
              <h3 className="text-base font-bold text-oxford dark:text-white pe-8 line-clamp-2">
                {lessonTitle}
              </h3>

              {/* Slides */}
              {slidesUrl && !slidesImageError && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={slidesUrl}
                  alt={lessonTitle}
                  onError={() => setSlidesImageError(true)}
                  className="w-full h-auto rounded-xl border border-gray-200 dark:border-white/10"
                />
              )}

              {slidesUrl && slidesImageError && (
                <a
                  href={slidesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <PresentationChartBarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-oxford dark:text-white">
                      {t("previewSlidesTab")}
                    </p>
                    <p className="text-xs text-silver dark:text-gray-400">
                      {t("previewOpenInNewTab")}
                    </p>
                  </div>
                  <ArrowTopRightOnSquareIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </a>
              )}

              {/* Audio */}
              {audioUrl && (
                <div className="bg-gold/5 border border-gold/20 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 mb-2.5 text-xs font-semibold text-gold">
                    <SpeakerWaveIcon className="w-3.5 h-3.5" />
                    {t("previewAudioTab")}
                  </div>
                  <audio controls autoPlay className="w-full" src={audioUrl}>
                    <track kind="captions" />
                  </audio>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
