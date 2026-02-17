"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "@/lib/i18n";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createOrder,
  enrollInCourse,
  fetchMyEnrollments,
  clearEnrollError,
  clearOrderError,
} from "@/store/slices/enrollmentSlice";

interface EnrollDialogProps {
  open: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  coursePrice: number;
  courseOriginalPrice: number;
}

type DialogStep = "confirm" | "loading" | "success" | "error";

export default function EnrollDialog({
  open,
  onClose,
  courseId,
  courseTitle,
  coursePrice,
  courseOriginalPrice,
}: EnrollDialogProps) {
  const t = useTranslations("courseDetail");
  const dispatch = useAppDispatch();
  const { enrollError, orderError } = useAppSelector((s) => s.enrollment);
  const [step, setStep] = useState<DialogStep>("confirm");

  const isFree = coursePrice === 0;

  const handleConfirm = async () => {
    setStep("loading");
    try {
      if (isFree) {
        // Free course — direct enrollment
        const res = await dispatch(enrollInCourse(courseId)).unwrap();
        if (res) {
          await dispatch(fetchMyEnrollments());
          setStep("success");
        }
      } else {
        // Paid course — create order (backend auto-enrolls)
        const res = await dispatch(
          createOrder({ courseIds: [courseId], paymentMethod: "free" }),
        ).unwrap();
        if (res) {
          await dispatch(fetchMyEnrollments());
          setStep("success");
        }
      }
    } catch {
      setStep("error");
    }
  };

  const handleClose = () => {
    setStep("confirm");
    dispatch(clearEnrollError());
    dispatch(clearOrderError());
    onClose();
  };

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
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={step !== "loading" ? handleClose : undefined}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-oxford-light rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 w-full max-w-md overflow-hidden"
          >
            {/* Close button */}
            {step !== "loading" && (
              <button
                onClick={handleClose}
                className="absolute top-4 end-4 p-1.5 text-silver hover:text-oxford dark:text-white/40 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}

            <div className="p-6">
              {/* ── Confirm Step ───────────────────────────────── */}
              {step === "confirm" && (
                <>
                  <h3 className="text-lg font-bold text-oxford dark:text-white mb-2">
                    {isFree ? t("enrollNow") : t("enrollNow")}
                  </h3>
                  <p className="text-sm text-silver dark:text-gray-400 mb-6 line-clamp-2">
                    {courseTitle}
                  </p>

                  {/* Price */}
                  <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 mb-6">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-silver dark:text-gray-400">
                        {t("price") || "Price"}
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-oxford dark:text-white">
                          {isFree
                            ? t("free") || "Free"
                            : `${coursePrice.toLocaleString()} ${t("currency")}`}
                        </span>
                        {!isFree && courseOriginalPrice > coursePrice && (
                          <span className="text-sm text-silver line-through">
                            {courseOriginalPrice.toLocaleString()} {t("currency")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleClose}
                      className="flex-1 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-oxford dark:text-white font-medium rounded-xl transition-colors text-sm"
                    >
                      {t("cancel") || "Cancel"}
                    </button>
                    <button
                      onClick={handleConfirm}
                      className="flex-1 py-3 bg-gold hover:bg-gold/90 text-oxford font-semibold rounded-xl transition-colors text-sm"
                    >
                      {t("confirmEnroll") || "Confirm"}
                    </button>
                  </div>
                </>
              )}

              {/* ── Loading Step ──────────────────────────────── */}
              {step === "loading" && (
                <div className="py-8 text-center">
                  <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm text-silver dark:text-gray-400">
                    {t("processing") || "Processing..."}
                  </p>
                </div>
              )}

              {/* ── Success Step ──────────────────────────────── */}
              {step === "success" && (
                <div className="py-6 text-center">
                  <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircleIcon className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-bold text-oxford dark:text-white mb-2">
                    {t("enrolled") || "Enrolled!"}
                  </h3>
                  <p className="text-sm text-silver dark:text-gray-400 mb-6">
                    {t("enrollSuccess") || "You have been successfully enrolled."}
                  </p>
                  <button
                    onClick={handleClose}
                    className="w-full py-3 bg-gold hover:bg-gold/90 text-oxford font-semibold rounded-xl transition-colors text-sm"
                  >
                    {t("continue") || "Continue"}
                  </button>
                </div>
              )}

              {/* ── Error Step ────────────────────────────────── */}
              {step === "error" && (
                <div className="py-6 text-center">
                  <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-oxford dark:text-white mb-2">
                    {t("error") || "Error"}
                  </h3>
                  <p className="text-sm text-silver dark:text-gray-400 mb-6">
                    {enrollError || orderError || "Something went wrong."}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleClose}
                      className="flex-1 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-oxford dark:text-white font-medium rounded-xl transition-colors text-sm"
                    >
                      {t("cancel") || "Cancel"}
                    </button>
                    <button
                      onClick={() => {
                        dispatch(clearEnrollError());
                        dispatch(clearOrderError());
                        setStep("confirm");
                      }}
                      className="flex-1 py-3 bg-gold hover:bg-gold/90 text-oxford font-semibold rounded-xl transition-colors text-sm"
                    >
                      {t("tryAgain") || "Try Again"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
