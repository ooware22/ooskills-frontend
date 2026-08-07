"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  XMarkIcon,
  GiftIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  ChatBubbleBottomCenterTextIcon,
  LockClosedIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "@/lib/i18n";
import { useAppSelector } from "@/store/hooks";
import { giftApi, promoApi, type PromoValidateResponse } from "@/services/promoGiftApi";

interface GiftDialogProps {
  open: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  coursePrice?: number;
  courseOriginalPrice?: number;
  isCampaignActive?: boolean;
  campaignDiscount?: number;
  isWelcomeApplied?: boolean;
  welcomeDiscountPercentage?: number;
}

type PaymentMethod = "edahabia" | "cib";
type GiftStep = "form" | "sending" | "success" | "error";

export default function GiftDialog({
  open,
  onClose,
  courseId,
  courseTitle,
  coursePrice = 0,
  courseOriginalPrice = 0,
  isCampaignActive = false,
  campaignDiscount = 0,
  isWelcomeApplied = false,
  welcomeDiscountPercentage = 20,
}: GiftDialogProps) {
  const t = useTranslations("courseDetail");
  const { user } = useAppSelector((s) => s.auth);

  const walletBalance = user?.referral_balance
    ? parseFloat(String(user.referral_balance))
    : 0;

  const [step, setStep] = useState<GiftStep>("form");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("edahabia");
  const [giftCode, setGiftCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoResult, setPromoResult] = useState<PromoValidateResponse | null>(null);
  const [promoError, setPromoError] = useState("");

  // Wallet state
  const [useWallet, setUseWallet] = useState(false);

  // Price calculations
  const afterPromo = promoResult?.valid ? promoResult.final_price : coursePrice;
  const walletApplied = useWallet ? Math.min(walletBalance, afterPromo) : 0;
  const effectivePrice = Math.max(0, afterPromo - walletApplied);
  const isFree = effectivePrice === 0;
  const discount =
    courseOriginalPrice > effectivePrice
      ? Math.round(
          ((courseOriginalPrice - effectivePrice) / courseOriginalPrice) * 100,
        )
      : 0;

  useEffect(() => {
    if (open) {
      setStep("form");
      setEmail("");
      setMessage("");
      setPaymentMethod("edahabia");
      setGiftCode("");
      setErrorMsg("");
      setPromoCode("");
      setPromoResult(null);
      setPromoError("");
      setUseWallet(false);
    }
  }, [open]);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError("");
    setPromoResult(null);
    try {
      const result = await promoApi.validate(promoCode.trim(), courseId);
      setPromoResult(result);
    } catch (err: any) {
      const msg = err?.data?.detail || err?.data?.message || err?.message || "Code invalide.";
      setPromoError(msg);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode("");
    setPromoResult(null);
    setPromoError("");
  };

  const extractErrorMessage = (err: any): string => {
    if (!err) return "Une erreur est survenue. Veuillez vérifier les informations et réessayer.";
    if (typeof err === "string") return err;
    const data = err.data || err.response?.data || err;
    if (data?.detail) return String(data.detail);
    if (data?.message) return String(data.message);
    if (data?.error) return String(data.error);
    if (data?.recipient_email) {
      const val = data.recipient_email;
      return `Email du destinataire : ${Array.isArray(val) ? val[0] : val}`;
    }
    if (data && typeof data === "object") {
      const keys = Object.keys(data).filter((k) => k !== "status");
      if (keys.length > 0) {
        const firstKey = keys[0];
        const val = data[firstKey];
        const msg = Array.isArray(val) ? val[0] : val;
        if (typeof msg === "string") {
          return firstKey === "detail" || firstKey === "message" ? msg : `${firstKey}: ${msg}`;
        }
      }
    }
    if (err.message && !err.message.includes("Server error")) {
      return err.message;
    }
    return "Une erreur est survenue lors de la commande. Veuillez vérifier les informations et réessayer.";
  };

  const handleSend = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg("Veuillez entrer l'email du destinataire.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMsg("Veuillez entrer une adresse email valide (ex: ami@exemple.com).");
      return;
    }

    if (user?.email && trimmedEmail.toLowerCase() === user.email.toLowerCase()) {
      setErrorMsg("Vous ne pouvez pas vous offrir un cours à vous-même.");
      return;
    }

    setStep("sending");
    setErrorMsg("");
    try {
      const res = await giftApi.send({
        courseId,
        recipientEmail: trimmedEmail,
        message: message.trim(),
        paymentMethod,
        promoCode: promoResult?.valid ? promoResult.code : undefined,
        useWallet,
      });

      if (res.checkout_url) {
        // Paid gift order → redirect to Chargily payment checkout
        window.location.href = res.checkout_url;
      } else {
        // Free gift order → complete immediately
        setGiftCode(res.gift_code || "");
        setStep("success");
      }
    } catch (err: any) {
      setErrorMsg(extractErrorMessage(err));
      setStep("form");
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
    if (giftCode) {
      navigator.clipboard.writeText(giftCode);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={step !== "sending" ? handleClose : undefined}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-oxford-light rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 w-full max-w-lg my-8 overflow-hidden z-10"
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
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center shrink-0">
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

                  {/* Recipient Details */}
                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-silver dark:text-gray-400 mb-1">
                        Email du destinataire *
                      </label>
                      <div className="relative">
                        <EnvelopeIcon className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver dark:text-gray-500" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="ami@exemple.com"
                          className="w-full ps-9 pe-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-oxford dark:text-white placeholder-silver dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-silver dark:text-gray-400 mb-1">
                        Message personnel (optionnel)
                      </label>
                      <div className="relative">
                        <ChatBubbleBottomCenterTextIcon className="absolute start-3 top-3 w-4 h-4 text-silver dark:text-gray-500" />
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Joyeux anniversaire ! Je t'offre cette formation..."
                          rows={2}
                          className="w-full ps-9 pe-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-oxford dark:text-white placeholder-silver dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Order Summary & Pricing */}
                  <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 mb-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-silver dark:text-gray-400">
                        {t("payment_total") || "Total à payer"}
                      </span>
                      <div className="flex items-baseline gap-2">
                        {discount > 0 && courseOriginalPrice > 0 && (
                          <span className="text-xs text-silver line-through">
                            {courseOriginalPrice.toLocaleString()} {t("currency")}
                          </span>
                        )}
                        <span className="text-2xl font-bold text-oxford dark:text-white">
                          {isFree
                            ? (t("free") || "Gratuit")
                            : `${effectivePrice.toLocaleString()} ${t("currency")}`}
                        </span>
                        {discount > 0 && (
                          <span className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-md">
                            -{discount}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Campaign/Welcome Discounts */}
                    {(isCampaignActive || isWelcomeApplied) && (
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-white/10 space-y-1">
                        {isCampaignActive && campaignDiscount > 0 && (
                          <div className="flex justify-between items-center text-xs text-emerald-600 dark:text-emerald-400">
                            <span className="flex items-center gap-1">✨ {t("payment_flashSale") || "Vente Flash"} (-{campaignDiscount}%)</span>
                            <span>{t("payment_applied") || "Appliqué"}</span>
                          </div>
                        )}
                        {isWelcomeApplied && (
                          <div className="flex justify-between items-center text-xs text-emerald-600 dark:text-emerald-400">
                            <span className="flex items-center gap-1">🎁 {t("payment_welcomeOffer") || "Offre de bienvenue"} (-{welcomeDiscountPercentage}%)</span>
                            <span>{t("payment_applied") || "Appliqué"}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Promo discount line */}
                    {promoResult?.valid && (
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-white/10">
                        <div className="flex items-center gap-1.5">
                          <TagIcon className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            {promoResult.code}
                          </span>
                          <button
                            onClick={handleRemovePromo}
                            className="text-xs text-red-400 hover:text-red-500 underline ms-1"
                          >
                            ✕
                          </button>
                        </div>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          -{promoResult.discount_amount.toLocaleString()} {t("currency")}
                        </span>
                      </div>
                    )}

                    {/* Wallet (referral balance) line */}
                    {walletBalance > 0 && coursePrice > 0 && (
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-white/10">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={useWallet}
                            onChange={(e) => setUseWallet(e.target.checked)}
                            className="w-4 h-4 accent-gold rounded"
                          />
                          <span className="text-xs text-oxford dark:text-white">
                            {t("use_wallet") || "Utiliser mon solde parrainage"}
                          </span>
                          <span className="text-xs font-semibold text-gold">
                            ({walletBalance.toLocaleString()} {t("currency")})
                          </span>
                        </label>
                        {useWallet && walletApplied > 0 && (
                          <span className="text-xs font-semibold text-gold">
                            -{walletApplied.toLocaleString()} {t("currency")}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Promo code input */}
                  {coursePrice > 0 && !promoResult?.valid && (
                    <div className="mb-4">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <TagIcon className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver dark:text-gray-500" />
                          <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                            onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                            placeholder={t("promo_placeholder") || "Code promo"}
                            className="w-full ps-9 pe-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs text-oxford dark:text-white placeholder-silver dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                          />
                        </div>
                        <button
                          onClick={handleApplyPromo}
                          disabled={promoLoading || !promoCode.trim()}
                          className="px-3 py-2 bg-oxford dark:bg-white/10 hover:bg-oxford/90 dark:hover:bg-white/15 text-white text-xs font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {promoLoading ? "..." : (t("promo_apply") || "Appliquer")}
                        </button>
                      </div>
                      {promoError && (
                        <p className="text-xs text-red-500 mt-1">{promoError}</p>
                      )}
                    </div>
                  )}

                  {/* Payment methods (paid only) */}
                  {!isFree && (
                    <div className="mb-5">
                      <p className="text-xs font-medium text-silver dark:text-gray-400 uppercase tracking-wider mb-2">
                        {t("payment_method") || "Moyen de paiement"}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {/* EDAHABIA */}
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("edahabia")}
                          className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
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
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <span className="text-xs font-semibold text-oxford dark:text-white">
                            EDAHABIA
                          </span>
                        </button>

                        {/* CIB */}
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("cib")}
                          className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
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
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <span className="text-xs font-semibold text-oxford dark:text-white">
                            CIB
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Inline Error Alert */}
                  {errorMsg && (
                    <div className="p-3 mb-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                      <XMarkIcon className="w-4 h-4 shrink-0 text-red-500" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Powered by Chargily */}
                  {!isFree && (
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <LockClosedIcon className="w-3.5 h-3.5 text-silver dark:text-gray-500" />
                      <span className="text-[11px] text-silver dark:text-gray-500">
                        {t("payment_secured") || "Paiement sécurisé par"}
                      </span>
                      <Image
                        src="/chargili.jpg"
                        alt="Chargily"
                        width={18}
                        height={18}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                      <span className="text-[11px] font-medium text-silver dark:text-gray-500">
                        Chargily Pay
                      </span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleClose}
                      className="flex-1 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-oxford dark:text-white font-medium rounded-xl transition-colors text-sm"
                    >
                      {t("cancel") || "Annuler"}
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={!email.trim()}
                      className="flex-1 py-3 bg-gold hover:bg-gold/90 text-oxford font-semibold rounded-xl transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <GiftIcon className="w-4 h-4" />
                      {isFree
                        ? "Offrir gratuitement"
                        : `Payer et offrir (${effectivePrice.toLocaleString()} ${t("currency")})`}
                    </button>
                  </div>
                </>
              )}

              {/* ── Sending / Redirecting ── */}
              {step === "sending" && (
                <div className="py-8 text-center">
                  <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm text-oxford dark:text-white font-medium mb-1">
                    {isFree ? "Envoi du cadeau en cours..." : "Préparation du paiement sécurisé..."}
                  </p>
                  <p className="text-xs text-silver dark:text-gray-400">
                    {isFree ? "Veuillez patienter un instant." : "Vous allez être redirigé vers Chargily..."}
                  </p>
                </div>
              )}

              {/* ── Success (instant / free) ── */}
              {step === "success" && (
                <div className="py-6 text-center">
                  <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircleIcon className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-bold text-oxford dark:text-white mb-2">
                    Cadeau envoyé ! 🎉
                  </h3>
                  <p className="text-sm text-silver dark:text-gray-400 mb-4">
                    Un email a été envoyé à <strong className="text-oxford dark:text-white">{email}</strong> avec le lien pour réclamer le cours.
                  </p>
                  {giftCode && (
                    <div
                      onClick={handleCopyCode}
                      className="cursor-pointer bg-gray-50 dark:bg-white/5 border-2 border-dashed border-gold/40 rounded-xl p-4 mb-4 group hover:border-gold transition-colors"
                      title="Cliquez pour copier"
                    >
                      <p className="text-xl font-mono font-bold text-gold tracking-wider">
                        {giftCode}
                      </p>
                      <p className="text-[10px] text-silver dark:text-gray-500 mt-1 group-hover:text-gold transition-colors">
                        Cliquez pour copier le code cadeau
                      </p>
                    </div>
                  )}
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
