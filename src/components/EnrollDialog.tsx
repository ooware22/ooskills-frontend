"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
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

type PaymentMethod = "edahabia" | "cib";
type DialogStep = "choose" | "processing" | "success" | "error";

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

  const [step, setStep] = useState<DialogStep>("choose");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("edahabia");

  const isFree = coursePrice === 0;
  const discount =
    courseOriginalPrice > coursePrice
      ? Math.round(
          ((courseOriginalPrice - coursePrice) / courseOriginalPrice) * 100,
        )
      : 0;

  useEffect(() => {
    if (open) {
      setStep("choose");
      setPaymentMethod("edahabia");
    }
  }, [open]);

  const handleConfirmPayment = async () => {
    setStep("processing");
    try {
      if (isFree) {
        // Free course → direct enrollment
        const res = await dispatch(enrollInCourse(courseId)).unwrap();
        if (res) {
          await dispatch(fetchMyEnrollments());
          setStep("success");
        }
      } else {
        // Paid course → create order → redirect to Chargily
        await dispatch(
          createOrder({ courseIds: [courseId], paymentMethod }),
        ).unwrap();
        // If createOrder succeeds, the browser will redirect to Chargily checkout_url
        // The processing spinner stays visible until the redirect happens
      }
    } catch {
      setStep("error");
    }
  };

  const handleClose = () => {
    setStep("choose");
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
            onClick={step !== "processing" ? handleClose : undefined}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-oxford-light rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 w-full max-w-md overflow-hidden"
          >
            {/* Close */}
            {step !== "processing" && (
              <button
                onClick={handleClose}
                className="absolute top-4 end-4 p-1.5 text-silver hover:text-oxford dark:text-white/40 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors z-10"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}

            <div className="p-6">
              {/* ───── STEP 1: Choose Payment Method ───── */}
              {step === "choose" && (
                <>
                  <h3 className="text-lg font-bold text-oxford dark:text-white mb-1">
                    {isFree
                      ? (t("enrollNow") || "Enroll Now")
                      : (t("payment_checkout") || "Secure Checkout")}
                  </h3>
                  <p className="text-sm text-silver dark:text-gray-400 mb-5 line-clamp-2">
                    {courseTitle}
                  </p>

                  {/* Order summary */}
                  <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 mb-5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-silver dark:text-gray-400">
                        {t("payment_total") || "Total"}
                      </span>
                      <div className="flex items-baseline gap-2">
                        {discount > 0 && (
                          <span className="text-xs text-silver line-through">
                            {courseOriginalPrice.toLocaleString()} {t("currency")}
                          </span>
                        )}
                        <span className="text-2xl font-bold text-oxford dark:text-white">
                          {isFree
                            ? (t("free") || "Free")
                            : `${coursePrice.toLocaleString()} ${t("currency")}`}
                        </span>
                        {discount > 0 && (
                          <span className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-md">
                            -{discount}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Payment methods (paid only) */}
                  {!isFree && (
                    <div className="mb-5">
                      <p className="text-xs font-medium text-silver dark:text-gray-400 uppercase tracking-wider mb-3">
                        {t("payment_method") || "Payment Method"}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {/* EDAHABIA */}
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("edahabia")}
                          className={`relative flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all ${
                            paymentMethod === "edahabia"
                              ? "border-gold bg-gold/5 dark:bg-gold/10"
                              : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"
                          }`}
                        >
                          {paymentMethod === "edahabia" && (
                            <div className="absolute top-2 end-2">
                              <CheckCircleIcon className="w-4 h-4 text-gold" />
                            </div>
                          )}
                          <Image
                            src="/EDAHABIA.png"
                            alt="EDAHABIA"
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <span className="text-xs font-semibold text-oxford dark:text-white">
                            EDAHABIA
                          </span>
                        </button>

                        {/* CIB */}
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("cib")}
                          className={`relative flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all ${
                            paymentMethod === "cib"
                              ? "border-gold bg-gold/5 dark:bg-gold/10"
                              : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"
                          }`}
                        >
                          {paymentMethod === "cib" && (
                            <div className="absolute top-2 end-2">
                              <CheckCircleIcon className="w-4 h-4 text-gold" />
                            </div>
                          )}
                          <Image
                            src="/CIB.png"
                            alt="CIB"
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <span className="text-xs font-semibold text-oxford dark:text-white">
                            CIB
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Powered by Chargily */}
                  {!isFree && (
                    <div className="flex items-center justify-center gap-2 mb-5">
                      <LockClosedIcon className="w-3.5 h-3.5 text-silver dark:text-gray-500" />
                      <span className="text-[11px] text-silver dark:text-gray-500">
                        {t("payment_secured") || "Powered by"}
                      </span>
                      <Image
                        src="/chargili.jpg"
                        alt="Chargily"
                        width={20}
                        height={20}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="text-[11px] font-medium text-silver dark:text-gray-500">
                        Chargily Pay
                      </span>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleClose}
                      className="flex-1 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-oxford dark:text-white font-medium rounded-xl transition-colors text-sm"
                    >
                      {t("cancel") || "Cancel"}
                    </button>
                    <button
                      onClick={handleConfirmPayment}
                      className="flex-1 py-3 bg-gold hover:bg-gold/90 text-oxford font-semibold rounded-xl transition-colors text-sm"
                    >
                      {isFree
                        ? (t("confirmEnroll") || "Confirm Enrollment")
                        : (t("payment_payNow") || "Pay Now")}
                    </button>
                  </div>
                </>
              )}

              {/* ───── STEP 2: Processing ───── */}
              {step === "processing" && (
                <div className="py-8 text-center">
                  <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm text-silver dark:text-gray-400">
                    {isFree
                      ? (t("payment_processing") || "Processing...")
                      : (t("payment_redirecting") || "Redirecting to payment page...")}
                  </p>
                </div>
              )}

              {/* ───── STEP 3: Success (free courses only) ───── */}
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

              {/* ───── STEP 4: Error ───── */}
              {step === "error" && (
                <div className="py-6 text-center">
                  <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-oxford dark:text-white mb-2">
                    {t("payment_failed") || "Payment Failed"}
                  </h3>
                  <p className="text-sm text-silver dark:text-gray-400 mb-6">
                    {enrollError ||
                      orderError ||
                      (t("payment_failedDesc") || "Something went wrong. Please try again.")}
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
                        setStep("choose");
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
