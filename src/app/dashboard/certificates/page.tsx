"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrophyIcon,
  AcademicCapIcon,
  ClipboardDocumentIcon,
  ShareIcon,
  CalendarDaysIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { TrophyIcon as TrophySolid } from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyCertificates } from "@/store/slices/enrollmentSlice";
import type { Certificate } from "@/store/slices/enrollmentSlice";
import { MobileMenuButton } from "@/components/student/StudentSidebar";

export default function CertificatesPage() {
  const dispatch = useAppDispatch();
  const { t, locale } = useI18n();
  const isRtl = locale === "ar";

  const { certificates, certificatesLoading } = useAppSelector(
    (s) => s.enrollment
  );

  useEffect(() => {
    dispatch(fetchMyCertificates());
  }, [dispatch]);

  // Helper: format date
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  // Copy verification link
  const copyVerifyLink = (code: string) => {
    const url = `${window.location.origin}/verify/${code}`;
    navigator.clipboard.writeText(url).then(() => {
      alert("Verification link copied!");
    });
  };

  // Share certificate
  const shareCertificate = (cert: Certificate) => {
    const url = `${window.location.origin}/verify/${cert.code}`;
    if (navigator.share) {
      navigator.share({
        title: `Certificate — ${cert.course_title}`,
        text: `I earned a certificate for "${cert.course_title}" on OOSkills!`,
        url,
      });
    } else {
      copyVerifyLink(cert.code);
    }
  };

  return (
    <>
      <MobileMenuButton />
      <div className="min-h-screen p-4 sm:p-6 lg:p-8" dir={isRtl ? "rtl" : "ltr"}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gold/10 rounded-xl">
              <TrophySolid className="w-6 h-6 text-gold" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-oxford dark:text-white">
              {t("student.certificates.title") || "My Certificates"}
            </h1>
          </div>
          <p className="text-silver dark:text-white/50 text-sm ms-12">
            {t("student.certificates.subtitle") ||
              "View and share your earned certificates"}
          </p>
        </div>

        {/* Loading State */}
        {certificatesLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!certificatesLoading && certificates.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AcademicCapIcon className="w-10 h-10 text-gold" />
            </div>
            <h3 className="text-xl font-semibold text-oxford dark:text-white mb-2">
              {t("student.certificates.empty") || "No certificates yet"}
            </h3>
            <p className="text-silver dark:text-white/50 max-w-md mx-auto">
              {t("student.certificates.emptyDesc") ||
                "Complete a course and pass its quiz to earn your first certificate!"}
            </p>
          </motion.div>
        )}

        {/* Certificates Grid */}
        {!certificatesLoading && certificates.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {certificates.map((cert, idx) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="group relative bg-white dark:bg-white/[0.04] rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden hover:shadow-xl hover:shadow-gold/5 transition-all duration-300"
              >
                {/* Decorative top bar */}
                <div className="h-1.5 bg-gradient-to-r from-gold via-amber-400 to-gold" />

                {/* Certificate Content */}
                <div className="p-6">
                  {/* Trophy & Title */}
                  <div className="flex items-start gap-4 mb-5">
                    <div className="p-3 bg-gold/10 rounded-xl flex-shrink-0 group-hover:bg-gold/20 transition-colors duration-300">
                      <TrophyIcon className="w-7 h-7 text-gold" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-oxford dark:text-white text-lg leading-snug line-clamp-2 group-hover:text-gold transition-colors duration-300">
                        {cert.course_title}
                      </h3>
                      <p className="text-silver dark:text-white/50 text-sm mt-1">
                        {cert.user_name}
                      </p>
                    </div>
                  </div>

                  {/* Score & Date */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <StarIcon className="w-3.5 h-3.5 text-gold" />
                        <span className="text-xs text-silver dark:text-white/50 uppercase tracking-wide">
                          Score
                        </span>
                      </div>
                      <span className="text-xl font-bold text-oxford dark:text-white">
                        {Math.round(Number(cert.score))}%
                      </span>
                    </div>
                    <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <CalendarDaysIcon className="w-3.5 h-3.5 text-gold" />
                        <span className="text-xs text-silver dark:text-white/50 uppercase tracking-wide">
                          Issued
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-oxford dark:text-white">
                        {fmtDate(cert.issuedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Verification Code */}
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 rounded-xl px-3 py-2.5 mb-5">
                    <span className="text-xs text-silver dark:text-white/40 uppercase tracking-wider">
                      Code
                    </span>
                    <span className="font-mono text-sm font-semibold text-oxford dark:text-white tracking-widest flex-1">
                      {cert.code}
                    </span>
                    <button
                      onClick={() => copyVerifyLink(cert.code)}
                      className="p-1 text-silver hover:text-gold transition-colors"
                      title="Copy verification link"
                    >
                      <ClipboardDocumentIcon className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => shareCertificate(cert)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-gold/10 text-gold hover:bg-gold/20 transition-all duration-200"
                    >
                      <ShareIcon className="w-4 h-4" />
                      {t("student.certificates.share") || "Share"}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
