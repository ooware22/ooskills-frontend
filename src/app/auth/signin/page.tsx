"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  EnvelopeIcon as Mail,
  LockClosedIcon as Lock,
  ArrowRightIcon as ArrowRight,
  EyeIcon as Eye,
  EyeSlashIcon as EyeOff,
  ExclamationTriangleIcon as AlertIcon,
} from "@heroicons/react/24/outline";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  login,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  clearError,
} from "@/store/slices/authSlice";
import { useTranslations, useI18n } from "@/lib/i18n";

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const t = useTranslations("auth.signin");
  const tCommon = useTranslations("auth");
  const { dir } = useI18n();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const returnUrl = searchParams.get("returnUrl") || "/";
      router.replace(returnUrl);
    }
  }, [isAuthenticated, router, searchParams]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    const result = await dispatch(
      login({
        email: formData.email,
        password: formData.password,
      })
    );

    if (login.fulfilled.match(result)) {
      const returnUrl = searchParams.get("returnUrl") || "/";
      router.push(returnUrl);
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

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className={`backdrop-blur-xl rounded-2xl border p-6 sm:p-8 shadow-2xl ${
            isDark 
              ? "bg-white/5 border-white/10" 
              : "bg-white/80 border-gray-200"
          }`}
        >
          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 sm:mb-5 p-3 sm:p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2 sm:gap-3"
            >
              <AlertIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className={`text-xs sm:text-sm ${isDark ? "text-red-300" : "text-red-600"}`}>{error}</p>
            </motion.div>
          )}

          {/* Email */}
          <div className="mb-4 sm:mb-5">
            <label className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${isDark ? "text-white/70" : "text-oxford/70"}`}>
              {t("email")}
            </label>
            <div className="relative">
              <Mail className={`absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${isDark ? "text-white/30" : "text-oxford/30"}`} />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
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

          {/* Password */}
          <div className="mb-4 sm:mb-6">
            <label className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${isDark ? "text-white/70" : "text-oxford/70"}`}>
              {t("password")}
            </label>
            <div className="relative">
              <Lock className={`absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${isDark ? "text-white/30" : "text-oxford/30"}`} />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder={t("passwordPlaceholder")}
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
                {showPassword ? (
                  <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded text-gold focus:ring-gold/50 ${
                  isDark ? "border-white/20 bg-white/5" : "border-gray-300 bg-white"
                }`}
              />
              <span className={`text-xs sm:text-sm ${isDark ? "text-white/50" : "text-oxford/60"}`}>
                {t("rememberMe")}
              </span>
            </label>
            <a href="#" className="text-xs sm:text-sm text-gold hover:underline">
              {t("forgotPassword")}
            </a>
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

          {/* Divider */}
          <div className="relative my-4 sm:my-6">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${isDark ? "border-white/10" : "border-gray-200"}`} />
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className={`px-4 ${isDark ? "text-white/30" : "text-oxford/40"}`}>
                {t("or")}
              </span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="flex justify-center gap-4 mb-4 sm:mb-6">
            {/* Google */}
            <button
              type="button"
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                isDark 
                  ? "bg-white/10 hover:bg-white/20 border border-white/10" 
                  : "bg-white hover:bg-gray-50 border border-gray-200 shadow-sm"
              }`}
              title="Google"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </button>

            {/* Facebook */}
            <button
              type="button"
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                isDark 
                  ? "bg-white/10 hover:bg-white/20 border border-white/10" 
                  : "bg-white hover:bg-gray-50 border border-gray-200 shadow-sm"
              }`}
              title="Facebook"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>

            {/* Microsoft */}
            <button
              type="button"
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                isDark 
                  ? "bg-white/10 hover:bg-white/20 border border-white/10" 
                  : "bg-white hover:bg-gray-50 border border-gray-200 shadow-sm"
              }`}
              title="Microsoft"
            >
              <svg className="w-5 h-5" viewBox="0 0 23 23">
                <path fill="#f35325" d="M1 1h10v10H1z"/>
                <path fill="#81bc06" d="M12 1h10v10H12z"/>
                <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                <path fill="#ffba08" d="M12 12h10v10H12z"/>
              </svg>
            </button>
          </div>

          {/* Sign Up Link */}
          <p className={`text-center text-xs sm:text-sm ${isDark ? "text-white/50" : "text-oxford/60"}`}>
            {t("noAccount")}{" "}
            <Link
              href="/auth/signup"
              className="text-gold hover:underline font-medium"
            >
              {t("signupLink")}
            </Link>
          </p>
        </form>

        {/* Footer */}
        <p className={`text-center text-[10px] sm:text-xs mt-4 sm:mt-6 ${isDark ? "text-white/30" : "text-oxford/40"}`}>
          {tCommon("copyright")}
        </p>
      </motion.div>
    </div>
  );
}
