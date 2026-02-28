"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrophyIcon,
  AcademicCapIcon,
  ClipboardDocumentIcon,
  ShareIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronDownIcon,
  Square2StackIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { TrophyIcon as TrophySolid } from "@heroicons/react/24/solid";
import Link from "next/link";

import { useI18n } from "@/lib/i18n";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyCertificates } from "@/store/slices/enrollmentSlice";
import type { Certificate } from "@/store/slices/enrollmentSlice";
import StudentHeader from "@/components/student/StudentHeader";
import MergedCertificateTemplate from "@/components/certificate/MergedCertificateTemplate";
import type { MergedCertificateData } from "@/components/certificate/MergedCertificateTemplate";

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

type SortOption = "newest" | "oldest" | "highScore" | "lowScore";

export default function CertificatesPage() {
  const dispatch = useAppDispatch();
  const { t, locale } = useI18n();
  const isRtl = locale === "ar";
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Search & filters
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [sortOpen, setSortOpen] = useState(false);

  // Merge mode
  const [mergeMode, setMergeMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [mergedData, setMergedData] = useState<MergedCertificateData | null>(
    null,
  );

  // Saved merged badges (persisted in localStorage)
  const [savedMerged, setSavedMerged] = useState<MergedCertificateData[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("ooskills_merged_badges");
      if (raw) setSavedMerged(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const persistMerged = (list: MergedCertificateData[]) => {
    setSavedMerged(list);
    localStorage.setItem("ooskills_merged_badges", JSON.stringify(list));
  };

  const deleteMerged = (code: string) => {
    persistMerged(savedMerged.filter((m) => m.code !== code));
  };

  const { certificates, certificatesLoading } = useAppSelector(
    (s) => s.enrollment,
  );

  useEffect(() => {
    dispatch(fetchMyCertificates());
  }, [dispatch]);

  // Close sort dropdown on outside click
  useEffect(() => {
    if (!sortOpen) return;
    const close = () => setSortOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [sortOpen]);

  // Filtered & sorted certificates
  const filteredCerts = useMemo(() => {
    let list = [...certificates];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.course_title.toLowerCase().includes(q) ||
          c.user_name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q),
      );
    }

    // Sort
    switch (sortBy) {
      case "newest":
        list.sort(
          (a, b) =>
            new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime(),
        );
        break;
      case "oldest":
        list.sort(
          (a, b) =>
            new Date(a.issuedAt).getTime() - new Date(b.issuedAt).getTime(),
        );
        break;
      case "highScore":
        list.sort((a, b) => Number(b.score) - Number(a.score));
        break;
      case "lowScore":
        list.sort((a, b) => Number(a.score) - Number(b.score));
        break;
    }

    return list;
  }, [certificates, search, sortBy]);

  // Helpers
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(
      locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US",
      { year: "numeric", month: "long", day: "numeric" },
    );

  const copyVerifyLink = (cert: Certificate) => {
    const url = `${window.location.origin}/verify/${cert.code}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(cert.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

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

  // Merge selection toggle
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exitMergeMode = () => {
    setMergeMode(false);
    setSelectedIds(new Set());
  };

  const handleMerge = () => {
    const selected = certificates.filter((c) => selectedIds.has(c.id));
    if (selected.length < 1) return;

    // Build merged certificate data from selected badges
    const merged: MergedCertificateData = {
      code: selected.map((c) => c.code.slice(-4)).join("-"),
      studentName: selected[0].user_name,
      courses: selected.map((c) => ({
        courseName: c.course_title,
        score: Math.round(Number(c.score)),
      })),
      issuedAt: new Date().toISOString(),
    };

    setMergedData(merged);
    persistMerged([merged, ...savedMerged]);
    exitMergeMode();
  };

  const sortLabels: Record<SortOption, string> = {
    newest: t("student.certificates.sortNewest") || "Newest",
    oldest: t("student.certificates.sortOldest") || "Oldest",
    highScore: t("student.certificates.sortHighScore") || "Highest Score",
    lowScore: t("student.certificates.sortLowScore") || "Lowest Score",
  };

  const hasResults = filteredCerts.length > 0;

  return (
    <div className="min-h-screen" dir={isRtl ? "rtl" : "ltr"}>
      <StudentHeader
        titleKey="student.certificates.title"
        subtitleKey="student.certificates.subtitle"
      />

      <div className="p-6">
        {/* ── Search bar ──────────────────────────────────────── */}
        {!certificatesLoading && certificates.length > 0 && (
          <div className="mb-6">
            <div className="relative max-w-xl">
              <MagnifyingGlassIcon className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-silver dark:text-white/40 z-10" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  t("student.certificates.searchPlaceholder") ||
                  "Search badges..."
                }
                className="w-full ps-12 pe-10 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-oxford dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all text-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute end-4 top-1/2 -translate-y-1/2 text-silver hover:text-oxford dark:text-white/40 dark:hover:text-white"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Toolbar: count left · sort + merge right ────────── */}
        {!certificatesLoading && certificates.length > 0 && (
          <div className="mb-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Left — results count */}
              <p className="text-sm text-silver dark:text-gray-400">
                <span className="font-semibold text-oxford dark:text-white">
                  {filteredCerts.length}
                </span>{" "}
                {filteredCerts.length === 1 ? "badge" : "badges"}
                {search && <> — &quot;{search}&quot;</>}
              </p>

              {/* Right — sort + merge */}
              <div className="flex items-center gap-3">
                {/* Sort dropdown */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSortOpen(!sortOpen);
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-oxford-light border border-gray-200 dark:border-white/10 rounded-xl text-sm text-oxford dark:text-gray-300 hover:border-gold/40 focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all whitespace-nowrap"
                  >
                    <span>{sortLabels[sortBy]}</span>
                    <ChevronDownIcon
                      className={`w-4 h-4 text-silver transition-transform ${sortOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {sortOpen && (
                    <div className="absolute top-full mt-1 end-0 bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 shadow-lg overflow-hidden min-w-[180px] py-1 z-50">
                      {(
                        Object.entries(sortLabels) as [SortOption, string][]
                      ).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => {
                            setSortBy(key);
                            setSortOpen(false);
                          }}
                          className={`w-full text-start px-4 py-2.5 text-sm transition-colors ${
                            sortBy === key
                              ? "bg-gold/10 text-gold font-medium"
                              : "text-oxford dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Merge button */}
                {!mergeMode ? (
                  <button
                    onClick={() => setMergeMode(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gold/10 text-gold border border-gold/20 rounded-xl text-sm font-semibold hover:bg-gold hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-gold/25 transition-all duration-300 whitespace-nowrap"
                  >
                    <Square2StackIcon className="w-5 h-5" />
                    {t("student.certificates.merge") || "Merge Badges"}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={exitMergeMode}
                      className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-oxford dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all whitespace-nowrap"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      {t("student.certificates.cancel") || "Cancel"}
                    </button>
                    <button
                      onClick={handleMerge}
                      disabled={selectedIds.size < 1}
                      className="flex items-center gap-2 px-4 py-2 bg-gold/10 text-gold border border-gold/20 rounded-xl text-sm font-semibold hover:bg-gold hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-gold/25 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      <Square2StackIcon className="w-5 h-5" />
                      {t("student.certificates.mergeBadges") || "Merge"}
                      {selectedIds.size > 0 && (
                        <span className="px-1.5 py-0.5 bg-oxford/20 rounded-full text-xs">
                          {selectedIds.size}
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Merge mode hint */}
            <AnimatePresence>
              {mergeMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-3 px-4 py-3 bg-gold/10 dark:bg-gold/5 border border-gold/20 rounded-xl text-sm">
                    <Square2StackIcon className="w-5 h-5 text-gold flex-shrink-0" />
                    <span className="text-oxford dark:text-white/80">
                      {selectedIds.size < 1
                        ? t("student.certificates.selectBadges") ||
                          "Select at least 1 badge"
                        : `${selectedIds.size} ${t("student.certificates.selected") || "selected"}`}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

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

        {/* Empty State — no badges at all */}
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

        {/* No search results */}
        {!certificatesLoading &&
          certificates.length > 0 &&
          filteredCerts.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <MagnifyingGlassIcon className="w-12 h-12 text-silver/40 dark:text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-oxford dark:text-white mb-1">
                No badges found
              </h3>
              <p className="text-silver dark:text-white/50 text-sm">
                Try a different search term
              </p>
            </motion.div>
          )}

        {/* Certificates Grid */}
        {!certificatesLoading && hasResults && (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredCerts.map((cert, idx) => {
              const score = Math.round(Number(cert.score));
              const isCopied = copiedId === cert.id;
              const isSelected = selectedIds.has(cert.id);

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
                  onClick={mergeMode ? () => toggleSelect(cert.id) : undefined}
                  className={`group relative rounded-2xl overflow-hidden
                    bg-white dark:bg-white/[0.03]
                    border border-gray-100 dark:border-white/[0.08]
                    shadow-sm hover:shadow-xl hover:shadow-gold/10
                    transition-all duration-300
                    ${
                      mergeMode
                        ? isSelected
                          ? "ring-2 ring-gold border-gold/40 dark:border-gold/40 cursor-pointer"
                          : "hover:border-gold/30 cursor-pointer"
                        : "hover:border-gold/40 dark:hover:border-gold/30"
                    }`}
                >
                  {/* Selection indicator */}
                  {mergeMode && (
                    <div className="absolute top-3 end-3 z-10">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-gold border-gold text-oxford"
                            : "border-white/60 bg-white/20 backdrop-blur-sm"
                        }`}
                      >
                        {isSelected && (
                          <motion.svg
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </motion.svg>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── Banner ────────────────────────────── */}
                  <div className="relative h-28 bg-gradient-to-br from-oxford via-oxford-light to-oxford overflow-hidden">
                    <div className="absolute -top-6 -end-6 w-28 h-28 rounded-full bg-gold/10" />
                    <div className="absolute -bottom-4 -start-4 w-20 h-20 rounded-full bg-gold/5" />
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

                    {/* Score ring */}
                    {!mergeMode && (
                      <div className="absolute top-3 end-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-full p-1">
                          <ScoreRing score={score} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── Body ──────────────────────────────── */}
                  <div className="p-5">
                    <div className="mb-4">
                      <h3 className="font-semibold text-oxford dark:text-white text-[17px] leading-snug line-clamp-2 group-hover:text-gold transition-colors duration-300">
                        {cert.course_title}
                      </h3>
                      <p className="text-silver dark:text-white/45 text-sm mt-1 flex items-center gap-1.5">
                        <AcademicCapIcon className="w-3.5 h-3.5" />
                        {cert.user_name}
                      </p>
                    </div>

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
                          onClick={(e) => {
                            e.stopPropagation();
                            copyVerifyLink(cert);
                          }}
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
                    {!mergeMode && (
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
                          onClick={(e) => {
                            e.stopPropagation();
                            shareCertificate(cert);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold
                            bg-transparent text-silver dark:text-white/50 border border-gray-200 dark:border-white/10
                            hover:bg-oxford hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-oxford/25
                            transition-all duration-300"
                        >
                          <ShareIcon className="w-4 h-4" />
                          {t("student.certificates.share") || "Share"}
                        </button>
                      </div>
                    )}

                    {/* Merge mode: show score inline instead of ring */}
                    {mergeMode && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-silver dark:text-white/50">
                          Score
                        </span>
                        <span
                          className={`font-bold ${score >= 80 ? "text-emerald-500" : score >= 60 ? "text-gold" : "text-red-500"}`}
                        >
                          {score}%
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ── Merged Badges Section ──────────────────────────── */}
        {!certificatesLoading && savedMerged.length > 0 && (
          <div className="mt-10">
            {/* Section header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-gold/10 rounded-xl">
                <Square2StackIcon className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-oxford dark:text-white">
                  {t("student.certificates.mergedBadges") || "Merged Badges"}
                </h2>
                <p className="text-sm text-silver dark:text-white/50">
                  {t("student.certificates.mergedBadgesDesc") ||
                    "Your combined achievement badges"}
                </p>
              </div>
            </div>

            {/* Merged badges grid */}
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {savedMerged.map((merged, idx) => {
                const avgScore = Math.round(
                  merged.courses.reduce((s, c) => s + c.score, 0) /
                    merged.courses.length,
                );
                const avgColor =
                  avgScore >= 80
                    ? "text-emerald-500"
                    : avgScore >= 60
                      ? "text-gold"
                      : "text-red-500";

                return (
                  <motion.div
                    key={merged.code}
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
                    {/* Banner */}
                    <div className="relative h-28 bg-gradient-to-br from-oxford via-oxford-light to-oxford overflow-hidden">
                      <div className="absolute -top-6 -end-6 w-28 h-28 rounded-full bg-gold/10" />
                      <div className="absolute -bottom-4 -start-4 w-20 h-20 rounded-full bg-gold/5" />
                      <div className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />

                      {/* Badge icon */}
                      <div className="absolute top-4 start-5 flex items-center gap-3">
                        <div className="p-2.5 bg-gold/15 backdrop-blur-sm rounded-xl border border-gold/20">
                          <Square2StackIcon className="w-6 h-6 text-gold" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <CheckBadgeIcon className="w-4 h-4 text-gold" />
                            <span className="text-[11px] font-semibold text-gold uppercase tracking-widest">
                              Merged
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Average score */}
                      <div className="absolute top-3 end-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-full p-1">
                          <ScoreRing score={avgScore} />
                        </div>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-5">
                      <div className="mb-4">
                        <h3 className="font-semibold text-oxford dark:text-white text-[17px] leading-snug group-hover:text-gold transition-colors duration-300">
                          {merged.courses.length}{" "}
                          {t("student.certificates.courses") || "courses"}
                        </h3>
                        <p className="text-silver dark:text-white/45 text-sm mt-1 flex items-center gap-1.5">
                          <AcademicCapIcon className="w-3.5 h-3.5" />
                          {merged.studentName}
                        </p>
                      </div>

                      {/* Course list */}
                      <div className="space-y-1.5 mb-4">
                        {merged.courses.map((c, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between gap-2 text-sm px-3 py-1.5 bg-gray-50 dark:bg-white/[0.04] rounded-lg border border-gray-100 dark:border-white/[0.06]"
                          >
                            <span className="text-oxford dark:text-white/80 truncate flex-1 font-medium text-xs">
                              {c.courseName}
                            </span>
                            <span
                              className={`font-bold text-xs flex-shrink-0 ${c.score >= 80 ? "text-emerald-500" : c.score >= 60 ? "text-gold" : "text-red-500"}`}
                            >
                              {c.score}%
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Date + avg */}
                      <div className="flex items-center justify-between text-sm mb-5">
                        <div className="flex items-center gap-2">
                          <CalendarDaysIcon className="w-4 h-4 text-gold/70" />
                          <span className="text-silver dark:text-white/50">
                            {fmtDate(merged.issuedAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-silver dark:text-white/50 text-xs">
                            {t("student.certificates.avgScore") || "Avg"}:
                          </span>
                          <span className={`font-bold ${avgColor}`}>
                            {avgScore}%
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setMergedData(merged)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold
                            bg-gold/10 text-gold border border-gold/20
                            hover:bg-gold hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-gold/25
                            transition-all duration-300"
                        >
                          <EyeIcon className="w-4 h-4" />
                          {t("student.certificates.viewMerged") || "View"}
                        </button>
                        <button
                          onClick={() => deleteMerged(merged.code)}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                            bg-transparent text-silver dark:text-white/50 border border-gray-200 dark:border-white/10
                            hover:bg-red-500 hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-red-500/25
                            transition-all duration-300"
                        >
                          <TrashIcon className="w-4 h-4" />
                          {t("student.certificates.deleteMerged") || "Delete"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Merged badge full-screen overlay ─────────────── */}
      <AnimatePresence>
        {mergedData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100]"
          >
            <MergedCertificateTemplate
              data={mergedData}
              onClose={() => setMergedData(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
