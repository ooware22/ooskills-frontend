"use client";

import { useState, useEffect, Suspense } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  LockClosedIcon as Lock,
  ArrowRightIcon as ArrowRight,
  EyeIcon as Eye,
  EyeSlashIcon as EyeOff,
  CheckCircleIcon,
  ExclamationTriangleIcon as AlertIcon,
} from "@heroicons/react/24/outline";
import { useSearchParams } from "next/navigation";
import { useTranslations, useI18n } from "@/lib/i18n";
import axiosClient from "@/lib/axios";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("auth.resetPassword");
  const tCommon = useTranslations("auth");
  const { dir } = useI18n();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    new_password: "",
    new_password_confirm: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.new_password !== formData.new_password_confirm) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);

    try {
      await axiosClient.post("/auth/reset-password/", {
        token,
        new_password: formData.new_password,
        new_password_confirm: formData.new_password_confirm,
      });
      setSuccess(true);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const isDark = resolvedTheme === "dark";
  const hasToken = !!token;

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
            {hasToken ? t("title") : t("invalidToken")}
          </h1>
          <p className={`text-xs sm:text-sm ${isDark ? "text-white/50" : "text-oxford/60"}`}>
            {hasToken ? t("subtitle") : t("invalidTokenMessage")}
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
          {!hasToken ? (
            /* No Token State */
            <div className="text-center py-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <AlertIcon className="w-8 h-8 text-red-500" />
              </div>
              <Link
                href="/auth/forgot-password"
                className="w-full py-2.5 sm:py-3 text-sm sm:text-base bg-gold hover:bg-gold-light text-oxford font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-gold/20 hover:shadow-gold/40"
              >
                {t("requestNew")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : success ? (
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
              <Link
                href="/auth/signin"
                className="w-full py-2.5 sm:py-3 text-sm sm:text-base bg-gold hover:bg-gold-light text-oxford font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-gold/20 hover:shadow-gold/40"
              >
                {t("goToLogin")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ) : (
            /* Reset Form */
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

              {/* New Password */}
              <div className="mb-4 sm:mb-5">
                <label className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${isDark ? "text-white/70" : "text-oxford/70"}`}>
                  {t("newPassword")}
                </label>
                <div className="relative">
                  <Lock className={`absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${isDark ? "text-white/30" : "text-oxford/30"}`} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={formData.new_password}
                    onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                    placeholder={t("newPasswordPlaceholder")}
                    className={`w-full ps-9 sm:ps-10 pe-10 sm:pe-12 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all ${
                      isDark
                        ? "bg-white/5 border border-white/10 text-white placeholder:text-white/30"
                        : "bg-white border border-gray-200 text-oxford placeholder:text-oxford/40"
                    }`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute end-3 top-1/2 -translate-y-1/2 transition-colors ${
                      isDark ? "text-white/30 hover:text-white/60" : "text-oxford/30 hover:text-oxford/60"
                    }`}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="mb-5 sm:mb-6">
                <label className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${isDark ? "text-white/70" : "text-oxford/70"}`}>
                  {t("confirmPassword")}
                </label>
                <div className="relative">
                  <Lock className={`absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${isDark ? "text-white/30" : "text-oxford/30"}`} />
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    minLength={8}
                    value={formData.new_password_confirm}
                    onChange={(e) => setFormData({ ...formData, new_password_confirm: e.target.value })}
                    placeholder={t("confirmPasswordPlaceholder")}
                    className={`w-full ps-9 sm:ps-10 pe-10 sm:pe-12 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all ${
                      isDark
                        ? "bg-white/5 border border-white/10 text-white placeholder:text-white/30"
                        : "bg-white border border-gray-200 text-oxford placeholder:text-oxford/40"
                    }`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className={`absolute end-3 top-1/2 -translate-y-1/2 transition-colors ${
                      isDark ? "text-white/30 hover:text-white/60" : "text-oxford/30 hover:text-oxford/60"
                    }`}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
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

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
