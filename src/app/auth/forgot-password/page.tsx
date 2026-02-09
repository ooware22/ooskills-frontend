"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  EnvelopeIcon as Mail,
  ArrowRightIcon as ArrowRight,
  ArrowLeftIcon as ArrowLeft,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useTranslations, useI18n } from "@/lib/i18n";
import axiosClient from "@/lib/axios";

export default function ForgotPassword() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("auth.forgotPassword");
  const tCommon = useTranslations("auth");
  const { dir } = useI18n();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axiosClient.post("/auth/forgot-password/", { email });
      setSent(true);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const isDark = resolvedTheme === "dark";

  return (
    <div
      className={`auth-page h-screen overflow-hidden flex items-center justify-center p-4 transition-colors duration-300 ${
        isDark
          ? "bg-gradient-to-br from-oxford via-oxford to-oxford-light"
          : "bg-gradient-to-br from-cream via-white to-blue-light"
      }`}
      dir={dir}
    >
      {/* Background Pattern */}
      <div
        className={`absolute inset-0 ${isDark ? "opacity-[0.03]" : "opacity-[0.1]"}`}
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${isDark ? "white" : "#002147"} 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Decorative Blobs */}
      <div className={`absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl ${isDark ? "bg-gold/10" : "bg-gold/20"}`} />
      <div className={`absolute bottom-1/4 -right-32 w-96 h-96 rounded-full blur-3xl ${isDark ? "bg-gold/5" : "bg-oxford/5"}`} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md px-4 sm:px-0"
      >
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-block mb-3 sm:mb-4">
            {mounted && (
              <Image
                src={isDark ? "/images/logo/logo_DarkMood2.png" : "/images/logo/logo_LightMood2.png"}
                alt="OOSkills"
                width={180}
                height={60}
                className="h-10 sm:h-12 w-auto"
              />
            )}
          </Link>
          <h1 className={`text-xl sm:text-2xl font-bold mb-1 sm:mb-2 ${isDark ? "text-white" : "text-oxford"}`}>
            {t("title")}
          </h1>
          <p className={`text-xs sm:text-sm ${isDark ? "text-white/50" : "text-oxford/60"}`}>
            {t("subtitle")}
          </p>
        </div>

        {/* Form Card */}
        <div
          className={`backdrop-blur-xl rounded-2xl border p-6 sm:p-8 shadow-2xl ${
            isDark
              ? "bg-white/5 border-white/10"
              : "bg-white/80 border-gray-200"
          }`}
        >
          {sent ? (
            /* Success State */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <CheckCircleIcon className="w-8 h-8 text-green-500" />
              </div>
              <h2 className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-oxford"}`}>
                {t("successTitle")}
              </h2>
              <p className={`text-sm mb-6 ${isDark ? "text-white/60" : "text-oxford/60"}`}>
                {t("successMessage")}
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  href="/auth/signin"
                  className="w-full py-2.5 sm:py-3 text-sm sm:text-base bg-gold hover:bg-gold-light text-oxford font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-gold/20 hover:shadow-gold/40"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t("backToLogin")}
                </Link>
                <button
                  onClick={() => { setSent(false); setEmail(""); }}
                  className={`w-full py-2.5 sm:py-3 text-sm rounded-lg border transition-all duration-200 ${
                    isDark
                      ? "border-white/10 text-white/60 hover:text-white hover:border-white/20"
                      : "border-gray-200 text-oxford/60 hover:text-oxford hover:border-gray-300"
                  }`}
                >
                  {t("tryAgain")}
                </button>
              </div>
            </motion.div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit}>
              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                >
                  <p className={`text-xs sm:text-sm ${isDark ? "text-red-300" : "text-red-600"}`}>{error}</p>
                </motion.div>
              )}

              {/* Email */}
              <div className="mb-5">
                <label className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${isDark ? "text-white/70" : "text-oxford/70"}`}>
                  {t("email")}
                </label>
                <div className="relative">
                  <Mail className={`absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${isDark ? "text-white/30" : "text-oxford/30"}`} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("emailPlaceholder")}
                    className={`w-full ps-9 sm:ps-10 pe-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all ${
                      isDark
                        ? "bg-white/5 border border-white/10 text-white placeholder:text-white/30"
                        : "bg-white border border-gray-200 text-oxford placeholder:text-oxford/40"
                    }`}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 sm:py-3 text-sm sm:text-base bg-gold hover:bg-gold-light text-oxford font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-70 shadow-lg shadow-gold/20 hover:shadow-gold/40"
              >
                {loading ? (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-oxford/30 border-t-oxford rounded-full animate-spin" />
                ) : (
                  <>
                    {t("submit")}
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </>
                )}
              </button>

              {/* Back to login */}
              <p className={`text-center text-xs sm:text-sm mt-5 ${isDark ? "text-white/50" : "text-oxford/60"}`}>
                <Link
                  href="/auth/signin"
                  className="text-gold hover:underline font-medium inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  {t("backToLogin")}
                </Link>
              </p>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className={`text-center text-[10px] sm:text-xs mt-4 sm:mt-6 ${isDark ? "text-white/30" : "text-oxford/40"}`}>
          {tCommon("copyright")}
        </p>
      </motion.div>
    </div>
  );
}
