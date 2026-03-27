"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  GiftIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/outline";
import { giftApi } from "@/services/promoGiftApi";

interface GiftDialogProps {
  open: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
}

type GiftStep = "form" | "sending" | "success" | "error";

export default function GiftDialog({
  open,
  onClose,
  courseId,
  courseTitle,
}: GiftDialogProps) {
  const [step, setStep] = useState<GiftStep>("form");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [giftCode, setGiftCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSend = async () => {
    if (!email.trim()) return;
    setStep("sending");
    setErrorMsg("");
    try {
      const res = await giftApi.send(courseId, email.trim(), message);
      setGiftCode(res.gift_code);
      setStep("success");
    } catch (err: any) {
      setErrorMsg(err?.message || err?.data?.detail || "Une erreur est survenue.");
      setStep("error");
    }
  };

  const handleClose = () => {
    setStep("form");
    setEmail("");
    setMessage("");
    setGiftCode("");
    setErrorMsg("");
    onClose();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(giftCode);
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
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={step !== "sending" ? handleClose : undefined}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-oxford-light rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 w-full max-w-md overflow-hidden"
          >
            {step !== "sending" && (
              <button
                onClick={handleClose}
                className="absolute top-4 end-4 p-1.5 text-silver hover:text-oxford dark:text-white/40 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors z-10"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}

            <div className="p-6">
              {/* ── Form ── */}
              {step === "form" && (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center">
                      <GiftIcon className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-oxford dark:text-white">
                        Offrir ce cours
                      </h3>
                      <p className="text-xs text-silver dark:text-gray-400 line-clamp-1">
                        {courseTitle}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-5">
                    <div className="relative">
                      <EnvelopeIcon className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver dark:text-gray-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email du destinataire"
                        className="w-full ps-9 pe-3 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-oxford dark:text-white placeholder-silver dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                      />
                    </div>

                    <div className="relative">
                      <ChatBubbleBottomCenterTextIcon className="absolute start-3 top-3 w-4 h-4 text-silver dark:text-gray-500" />
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Message personnel (optionnel)"
                        rows={3}
                        className="w-full ps-9 pe-3 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-oxford dark:text-white placeholder-silver dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleClose}
                      className="flex-1 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-oxford dark:text-white font-medium rounded-xl transition-colors text-sm"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={!email.trim()}
                      className="flex-1 py-3 bg-gold hover:bg-gold/90 text-oxford font-semibold rounded-xl transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <GiftIcon className="w-4 h-4" />
                      Envoyer le cadeau
                    </button>
                  </div>
                </>
              )}

              {/* ── Sending ── */}
              {step === "sending" && (
                <div className="py-8 text-center">
                  <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm text-silver dark:text-gray-400">
                    Envoi du cadeau en cours...
                  </p>
                </div>
              )}

              {/* ── Success ── */}
              {step === "success" && (
                <div className="py-6 text-center">
                  <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircleIcon className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-bold text-oxford dark:text-white mb-2">
                    Cadeau envoyé ! 🎉
                  </h3>
                  <p className="text-sm text-silver dark:text-gray-400 mb-4">
                    Le destinataire peut réclamer le cours avec ce code :
                  </p>
                  <div
                    onClick={handleCopyCode}
                    className="cursor-pointer bg-gray-50 dark:bg-white/5 border-2 border-dashed border-gold/40 rounded-xl p-4 mb-4 group hover:border-gold transition-colors"
                  >
                    <p className="text-xl font-mono font-bold text-gold tracking-wider">
                      {giftCode}
                    </p>
                    <p className="text-[10px] text-silver dark:text-gray-500 mt-1 group-hover:text-gold transition-colors">
                      Cliquez pour copier
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-full py-3 bg-gold hover:bg-gold/90 text-oxford font-semibold rounded-xl transition-colors text-sm"
                  >
                    Fermer
                  </button>
                </div>
              )}

              {/* ── Error ── */}
              {step === "error" && (
                <div className="py-6 text-center">
                  <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XMarkIcon className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-oxford dark:text-white mb-2">
                    Erreur
                  </h3>
                  <p className="text-sm text-silver dark:text-gray-400 mb-6">
                    {errorMsg}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleClose}
                      className="flex-1 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-oxford dark:text-white font-medium rounded-xl transition-colors text-sm"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => setStep("form")}
                      className="flex-1 py-3 bg-gold hover:bg-gold/90 text-oxford font-semibold rounded-xl transition-colors text-sm"
                    >
                      Réessayer
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
