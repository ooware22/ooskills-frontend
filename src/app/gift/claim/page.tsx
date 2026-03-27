"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  GiftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { giftApi } from "@/services/promoGiftApi";

function ClaimContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code") || "";

  const [giftCode, setGiftCode] = useState(code);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [courseSlug, setCourseSlug] = useState("");
  const [error, setError] = useState("");

  // Auto-claim if code is in URL
  useEffect(() => {
    if (code) {
      handleClaim(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClaim = async (claimCode?: string) => {
    const finalCode = claimCode || giftCode.trim();
    if (!finalCode) return;
    setLoading(true);
    setError("");
    try {
      const res = await giftApi.claim(finalCode);
      setSuccess(true);
      setCourseSlug(res.course_slug);
    } catch (err: any) {
      setError(err?.message || err?.data?.detail || "Code invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-oxford flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-oxford-light rounded-2xl shadow-xl border border-gray-200 dark:border-white/10 w-full max-w-md p-8"
      >
        {/* ── Initial / Form ── */}
        {!loading && !success && !error && (
          <>
            <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <GiftIcon className="w-8 h-8 text-gold" />
            </div>
            <h1 className="text-2xl font-bold text-oxford dark:text-white text-center mb-2">
              Réclamer un cadeau
            </h1>
            <p className="text-sm text-silver dark:text-gray-400 text-center mb-6">
              Entrez votre code cadeau pour accéder à votre cours offert.
            </p>
            <div className="space-y-4">
              <input
                type="text"
                value={giftCode}
                onChange={(e) => setGiftCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleClaim()}
                placeholder="GIFT-XXXXXXXX"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-center text-lg font-mono font-bold text-oxford dark:text-white placeholder-silver dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all tracking-wider"
              />
              <button
                onClick={() => handleClaim()}
                disabled={!giftCode.trim()}
                className="w-full py-3 bg-gold hover:bg-gold/90 text-oxford font-semibold rounded-xl transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <GiftIcon className="w-4 h-4" />
                Réclamer mon cadeau
              </button>
            </div>
          </>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="py-8 text-center">
            <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-silver dark:text-gray-400">
              Vérification du code...
            </p>
          </div>
        )}

        {/* ── Success ── */}
        {success && (
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-oxford dark:text-white mb-2">
              Cadeau réclamé ! 🎉
            </h2>
            <p className="text-sm text-silver dark:text-gray-400 mb-6">
              Vous êtes maintenant inscrit au cours. Bon apprentissage !
            </p>
            <button
              onClick={() => router.push(`/courses/${courseSlug}`)}
              className="w-full py-3 bg-gold hover:bg-gold/90 text-oxford font-semibold rounded-xl transition-colors text-sm"
            >
              Accéder au cours
            </button>
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-oxford dark:text-white mb-2">
              Code invalide
            </h2>
            <p className="text-sm text-silver dark:text-gray-400 mb-6">
              {error}
            </p>
            <button
              onClick={() => {
                setError("");
                setGiftCode("");
              }}
              className="w-full py-3 bg-gold hover:bg-gold/90 text-oxford font-semibold rounded-xl transition-colors text-sm"
            >
              Réessayer
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function GiftClaimPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-oxford flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      }
    >
      <ClaimContent />
    </Suspense>
  );
}
