"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  TrophyIcon,
  AcademicCapIcon,
  ClipboardDocumentIcon,
  ShareIcon,
  CalendarDaysIcon,
  StarIcon,
  CheckBadgeIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { TrophyIcon as TrophySolid } from "@heroicons/react/24/solid";
import Link from "next/link";

import { useI18n } from "@/lib/i18n";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyCertificates } from "@/store/slices/enrollmentSlice";
import type { Certificate } from "@/store/slices/enrollmentSlice";
import StudentHeader from "@/components/student/StudentHeader";

/* ── Score ring ─────────────────────────────────────────────── */
function ScoreRing({ score }: { score: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#22C55E" : score >= 60 ? "#CFB53B" : "#EF4444";

  return (
    <div className="relative w-[72px] h-[72px] flex-shrink-0">
      <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          className="text-gray-200 dark:text-white/10"
        />
        <motion.circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
        {score}%
      </span>
    </div>
  );
}

export default function CertificatesPage() {
  const dispatch = useAppDispatch();
  const { t, locale } = useI18n();
  const isRtl = locale === "ar";
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { certificates, certificatesLoading } = useAppSelector(
    (s) => s.enrollment,
  );

  useEffect(() => {
    dispatch(fetchMyCertificates());
  }, [dispatch]);

  // Helper: format date
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(
      locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    );

  // Copy verification link
  const copyVerifyLink = (cert: Certificate) => {
    const url = `${window.location.origin}/verify/${cert.code}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(cert.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Share certificate
  const shareCertificate = (cert: Certificate) => {
    const url = `${window.location.origin}/verify/${cert.code}`;
    if (navigator.share) {
      navigator.share({
        title: `Badge — ${cert.course_title}`,
        text: `I earned a badge for "${cert.course_title}" on OOSkills!`,
        url,
      });
    } else {
      copyVerifyLink(cert);
    }
  };

  return (
    <div className="min-h-screen" dir={isRtl ? "rtl" : "ltr"}>
      <StudentHeader
        titleKey="student.certificates.title"
        subtitleKey="student.certificates.subtitle"
      />

      <div className="p-4 sm:p-6 lg:p-8">
        {/* Loading State */}
        {certificatesLoading && (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden animate-pulse"
              >
                <div className="h-28 bg-gray-200 dark:bg-white/5" />
                <div className="p-5 space-y-4">
                  <div className="h-5 w-3/4 bg-gray-200 dark:bg-white/10 rounded" />
                  <div className="h-4 w-1/2 bg-gray-200 dark:bg-white/10 rounded" />
                  <div className="flex gap-3">
                    <div className="h-16 flex-1 bg-gray-200 dark:bg-white/10 rounded-xl" />
                    <div className="h-16 flex-1 bg-gray-200 dark:bg-white/10 rounded-xl" />
                  </div>
                  <div className="h-10 bg-gray-200 dark:bg-white/10 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!certificatesLoading && certificates.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-gold/20 rounded-full animate-ping" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-gold/20 to-amber-400/10 rounded-full flex items-center justify-center border-2 border-dashed border-gold/30">
                <AcademicCapIcon className="w-11 h-11 text-gold" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-oxford dark:text-white mb-2">
              {t("student.certificates.empty") || "No badges yet"}
            </h3>
            <p className="text-silver dark:text-white/50 max-w-md mx-auto">
              {t("student.certificates.emptyDesc") ||
                "Complete a course and pass its quiz to earn your first badge!"}
            </p>
          </motion.div>
        )}

        {/* Certificates Grid */}
        {!certificatesLoading && certificates.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {certificates.map((cert, idx) => {
              const score = Math.round(Number(cert.score));
              const isCopied = copiedId === cert.id;

              return (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: idx * 0.07,
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                  }}
                  className="group relative rounded-2xl overflow-hidden
                    bg-white dark:bg-white/[0.03]
                    border border-gray-100 dark:border-white/[0.08]
                    hover:border-gold/40 dark:hover:border-gold/30
                    shadow-sm hover:shadow-xl hover:shadow-gold/10
                    transition-all duration-300"
                >
                  {/* ── Banner ────────────────────────────── */}
                  <div className="relative h-28 bg-gradient-to-br from-oxford via-oxford-light to-oxford overflow-hidden">
                    {/* Decorative circles */}
                    <div className="absolute -top-6 -end-6 w-28 h-28 rounded-full bg-gold/10" />
                    <div className="absolute -bottom-4 -start-4 w-20 h-20 rounded-full bg-gold/5" />

                    {/* Gold accent line */}
                    <div className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />

                    {/* Badge icon */}
                    <div className="absolute top-4 start-5 flex items-center gap-3">
                      <div className="p-2.5 bg-gold/15 backdrop-blur-sm rounded-xl border border-gold/20">
                        <TrophySolid className="w-6 h-6 text-gold" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <CheckBadgeIcon className="w-4 h-4 text-gold" />
                          <span className="text-[11px] font-semibold text-gold uppercase tracking-widest">
                            Verified
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Score ring — positioned at end of banner */}
                    <div className="absolute top-3 end-4">
                      <div className="bg-white/10 backdrop-blur-sm rounded-full p-1">
                        <ScoreRing score={score} />
                      </div>
                    </div>
                  </div>

                  {/* ── Body ──────────────────────────────── */}
                  <div className="p-5">
                    {/* Title & Holder */}
                    <div className="mb-4">
                      <h3 className="font-semibold text-oxford dark:text-white text-[17px] leading-snug line-clamp-2 group-hover:text-gold transition-colors duration-300">
                        {cert.course_title}
                      </h3>
                      <p className="text-silver dark:text-white/45 text-sm mt-1 flex items-center gap-1.5">
                        <AcademicCapIcon className="w-3.5 h-3.5" />
                        {cert.user_name}
                      </p>
                    </div>

                    {/* Date & Code — compact row */}
                    <div className="space-y-2.5 mb-5">
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarDaysIcon className="w-4 h-4 text-gold/70" />
                        <span className="text-silver dark:text-white/50">
                          {fmtDate(cert.issuedAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/[0.04] rounded-lg px-3 py-2 border border-gray-100 dark:border-white/[0.06]">
                        <span className="text-[10px] text-silver dark:text-white/35 uppercase tracking-widest font-medium">
                          ID
                        </span>
                        <span className="font-mono text-xs font-semibold text-oxford dark:text-white/80 tracking-wider flex-1 truncate">
                          {cert.code}
                        </span>
                        <button
                          onClick={() => copyVerifyLink(cert)}
                          className="p-1 rounded-md text-silver hover:text-gold hover:bg-gold/10 transition-all duration-200"
                          title="Copy verification link"
                        >
                          {isCopied ? (
                            <motion.svg
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-3.5 h-3.5 text-emerald-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2.5}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </motion.svg>
                          ) : (
                            <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/verify/${cert.code}`}
                        target="_blank"
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold
                          bg-gold/10 text-gold border border-gold/20
                          hover:bg-gold hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-gold/25
                          transition-all duration-300"
                      >
                        <EyeIcon className="w-4 h-4" />
                        {t("student.certificates.view") || "View Badge"}
                      </Link>
                      <button
                        onClick={() => shareCertificate(cert)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold
                          bg-transparent text-silver dark:text-white/50 border border-gray-200 dark:border-white/10
                          hover:bg-oxford hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-oxford/25
                          transition-all duration-300"
                      >
                        <ShareIcon className="w-4 h-4" />
                        {t("student.certificates.share") || "Share"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
