"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowRightIcon as ArrowRight,
} from "@heroicons/react/24/outline";
import { useSearchParams } from "next/navigation";
import axiosClient from "@/lib/axios";
import { useTranslations, useI18n } from "@/lib/i18n";

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const { dir, locale } = useI18n();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const hasVerified = useRef(false);

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  const isDark = resolvedTheme === "dark";
  const token = searchParams.get("token");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Guard against duplicate calls (React Strict Mode + dependency changes)
    if (hasVerified.current) return;

    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing.");
      return;
    }

    hasVerified.current = true;

    const verifyEmail = async () => {
      try {
        const response = await axiosClient.post("/auth/verify-email/", { token });
        setStatus("success");
        setMessage(
          response.data?.message ||
          (locale === "ar"
            ? "تم التحقق من بريدك الإلكتروني بنجاح!"
            : locale === "fr"
              ? "Votre email a été vérifié avec succès !"
              : "Your email has been verified successfully!")
        );
      } catch (err: any) {
        setStatus("error");
        const errorMsg =
          err?.response?.data?.error ||
          err?.message ||
          (locale === "ar"
            ? "فشل التحقق من البريد الإلكتروني."
            : locale === "fr"
              ? "La vérification de l'email a échoué."
              : "Email verification failed.");
        setMessage(errorMsg);
      }
    };

    verifyEmail();
  }, [token]); // Only depend on token, not locale

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
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
        </div>

        {/* Card */}
        <div
          className={`backdrop-blur-xl rounded-2xl border p-8 sm:p-10 shadow-2xl text-center ${
            isDark
              ? "bg-white/5 border-white/10"
              : "bg-white/80 border-gray-200"
          }`}
        >
          {/* Loading State */}
          {status === "loading" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="mx-auto mb-5 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gold/10 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-gold/30 border-t-gold rounded-full animate-spin" />
              </div>
              <h2 className={`text-xl sm:text-2xl font-bold mb-3 ${isDark ? "text-white" : "text-oxford"}`}>
                {locale === "ar" ? "جارٍ التحقق..." : locale === "fr" ? "Vérification en cours..." : "Verifying..."}
              </h2>
              <p className={`text-sm ${isDark ? "text-white/50" : "text-oxford/50"}`}>
                {locale === "ar"
                  ? "يرجى الانتظار بينما نتحقق من بريدك الإلكتروني."
                  : locale === "fr"
                    ? "Veuillez patienter pendant que nous vérifions votre email."
                    : "Please wait while we verify your email."}
              </p>
            </motion.div>
          )}

          {/* Success State */}
          {status === "success" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="mx-auto mb-5 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircleIcon className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-500" />
              </div>
              <h2 className={`text-xl sm:text-2xl font-bold mb-3 ${isDark ? "text-white" : "text-oxford"}`}>
                {locale === "ar" ? "تم تفعيل حسابك!" : locale === "fr" ? "Compte activé !" : "Account Activated!"}
              </h2>
              <p className={`text-sm sm:text-base mb-6 ${isDark ? "text-white/60" : "text-oxford/60"}`}>
                {message}
              </p>
              <Link
                href="/auth/signin"
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm bg-gold hover:bg-gold-light text-oxford font-semibold rounded-lg transition-all shadow-md shadow-gold/20"
              >
                {locale === "ar" ? "تسجيل الدخول" : locale === "fr" ? "Se connecter" : "Sign In"}
                <ArrowRight className={`w-3.5 h-3.5 ${dir === "rtl" ? "rotate-180" : ""}`} />
              </Link>
            </motion.div>
          )}

          {/* Error State */}
          {status === "error" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="mx-auto mb-5 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-500/10 flex items-center justify-center">
                <ExclamationCircleIcon className="w-10 h-10 sm:w-12 sm:h-12 text-red-500" />
              </div>
              <h2 className={`text-xl sm:text-2xl font-bold mb-3 ${isDark ? "text-white" : "text-oxford"}`}>
                {locale === "ar" ? "فشل التحقق" : locale === "fr" ? "Échec de la vérification" : "Verification Failed"}
              </h2>
              <p className={`text-sm sm:text-base mb-6 ${isDark ? "text-white/60" : "text-oxford/60"}`}>
                {message}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/auth/signup"
                  className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-all border ${
                    isDark
                      ? "border-white/20 text-white hover:bg-white/10"
                      : "border-gray-300 text-oxford hover:bg-gray-50"
                  }`}
                >
                  {locale === "ar" ? "إنشاء حساب جديد" : locale === "fr" ? "Créer un compte" : "Create Account"}
                </Link>
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm bg-gold hover:bg-gold-light text-oxford font-semibold rounded-lg transition-all shadow-md shadow-gold/20"
                >
                  {locale === "ar" ? "تسجيل الدخول" : locale === "fr" ? "Se connecter" : "Sign In"}
                  <ArrowRight className={`w-3.5 h-3.5 ${dir === "rtl" ? "rotate-180" : ""}`} />
                </Link>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <p className={`text-center text-[10px] sm:text-xs mt-4 sm:mt-6 ${isDark ? "text-white/30" : "text-oxford/40"}`}>
          © {new Date().getFullYear()} OOSkills.{" "}
          {locale === "ar" ? "جميع الحقوق محفوظة." : locale === "fr" ? "Tous droits réservés." : "All rights reserved."}
        </p>
      </motion.div>
    </div>
  );
}
