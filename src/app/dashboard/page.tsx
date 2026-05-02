"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  PlayCircleIcon,
  ArrowRightIcon,
  AcademicCapIcon,
  TrophyIcon,
  GiftIcon,
  UserPlusIcon,
  ClipboardDocumentIcon,
  BanknotesIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import { FireIcon } from "@heroicons/react/24/solid";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";
import Image from "next/image";
import StudentHeader from "@/components/student/StudentHeader";
import XPProgressBar from "@/components/student/XPProgressBar";
import AchievementCard from "@/components/student/AchievementCard";
import LevelUpModal from "@/components/student/LevelUpModal";
import XPGainToast from "@/components/student/XPGainToast";
import AchievementToast from "@/components/student/AchievementToast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchMyEnrollments,
  fetchMyQuizAttempts,
  fetchMyCertificates,
} from "@/store/slices/enrollmentSlice";
import {
  selectGamification,
  selectAchievements,
  selectStreak,
  addXP,
  demoLevelUp,
  demoAchievement,
  fetchGamificationProfile,
  fetchAchievements,
} from "@/store/slices/gamificationSlice";
import { fetchGifts, fetchReferralCode } from "@/store/slices/userDataSlice";

/** Ensure image src starts with / or is an absolute URL */
function normalizeImg(src: string | undefined | null): string | null {
  if (!src) return null;
  if (src.startsWith("http") || src.startsWith("/")) return src;
  return `/${src}`;
}

export default function StudentDashboard() {
  const { t } = useI18n();
  const td = (key: string) => t(`student.dashboard.${key}`);
  const dispatch = useAppDispatch();

  const { enrollments, enrollmentsLoading, quizAttempts, certificates } =
    useAppSelector((s) => s.enrollment);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const streak = useAppSelector(selectStreak);
  const user = useAppSelector((s) => s.auth.user);
  const referralBalance = user?.referral_balance
    ? parseFloat(String(user.referral_balance))
    : 0;
  const achievements = useAppSelector(selectAchievements);
  const recentAchievements = achievements.filter((a) => a.unlocked).slice(-4);
  const {
    sentGifts,
    receivedGifts,
    referralCode,
    referralLoading,
    lastFetchedReferral,
  } = useAppSelector((s) => s.userData);
  const referralLoaded = lastFetchedReferral !== null;

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMyEnrollments());
      dispatch(fetchMyQuizAttempts());
      dispatch(fetchMyCertificates());
      dispatch(fetchGamificationProfile());
      dispatch(fetchAchievements());
      dispatch(fetchGifts());
      dispatch(fetchReferralCode());
    }
  }, [dispatch, isAuthenticated]);

  // ── Gift & Referral state ────────────────────────────────────────────
  const [referralCopied, setReferralCopied] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const copyReferralLink = () => {
    const link = `${window.location.origin}/auth/signup?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setReferralCopied(true);
    setTimeout(() => setReferralCopied(false), 2000);
  };

  const shareReferral = (platform: string) => {
    const link = `${window.location.origin}/auth/signup?ref=${referralCode}`;
    const text = `Rejoins-moi sur OOSkills et reçois 100\u00a0DA de bienvenue avec mon code parrainage\u00a0!`;
    if (platform === "native") {
      if (typeof navigator !== "undefined" && navigator.share) {
        navigator.share({ title: "OOSkills", text, url: link }).catch(() => {});
      }
      return;
    }
    const enc = encodeURIComponent(link);
    const encText = encodeURIComponent(text);
    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${link}`)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc}`,
      messenger: `fb-messenger://share/?link=${enc}`,
      telegram: `https://t.me/share/url?url=${enc}&text=${encText}`,
      twitter: `https://twitter.com/intent/tweet?text=${encText}&url=${enc}`,
    };
    if (urls[platform]) {
      window.open(
        urls[platform],
        "_blank",
        "noopener,noreferrer,width=600,height=500",
      );
    }
  };

  // ── Computed stats ──────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = enrollments.length;
    const active = enrollments.filter((e) => e.status === "active").length;
    const completed = enrollments.filter(
      (e) => e.status === "completed",
    ).length;
    const totalXp = quizAttempts.reduce(
      (sum, q) => sum + (q.xp_earned || 0),
      0,
    );
    return [
      {
        labelKey: "enrolledCourses",
        value: String(total),
        icon: BookOpenIcon,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
      },
      {
        labelKey: "completedCourses",
        value: String(completed),
        icon: CheckCircleIcon,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
      },
      {
        labelKey: "inProgress",
        value: String(active),
        icon: ClockIcon,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
      },
      {
        labelKey: "streak",
        value: String(streak),
        icon: FireIcon,
        color: "text-orange-500",
        bg: "bg-orange-500/10",
      },
    ];
  }, [enrollments, streak]);

  // ── Continue learning — active enrollments ─────────────────────────────
  const continueLearning = useMemo(
    () =>
      enrollments
        .filter((e) => e.status === "active")
        .sort(
          (a, b) =>
            new Date(b.enrolled_at).getTime() -
            new Date(a.enrolled_at).getTime(),
        )
        .slice(0, 4),
    [enrollments],
  );

  // ── Recent activity from quiz attempts (sorted newest first) ──────────
  const recentActivity = useMemo(() => {
    const items: {
      type: "quiz" | "certificate";
      text: string;
      course: string;
      time: string;
    }[] = [];

    for (const q of quizAttempts.slice(0, 10)) {
      items.push({
        type: "quiz",
        text: `${q.passed ? "Passed" : "Attempted"} Quiz (${q.score}%)`,
        course: "",
        time: new Date(q.submitted_at).toLocaleDateString(),
      });
    }

    for (const c of certificates.slice(0, 5)) {
      items.push({
        type: "certificate",
        text: `Badge earned: ${c.course_title}`,
        course: c.course_title,
        time: new Date(c.issuedAt).toLocaleDateString(),
      });
    }

    return items
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 8);
  }, [quizAttempts, certificates]);

  // ── Loading skeleton ──────────────────────────────────────────────────
  if (enrollmentsLoading && enrollments.length === 0) {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        <StudentHeader
          titleKey="student.dashboard.welcomeBack"
          subtitleKey="student.dashboard.subtitle"
        />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 p-5 animate-pulse"
              >
                <div className="w-10 h-10 bg-gray-200 dark:bg-white/10 rounded-lg mb-3" />
                <div className="h-6 w-12 bg-gray-200 dark:bg-white/10 rounded mb-1" />
                <div className="h-3 w-20 bg-gray-200 dark:bg-white/10 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <StudentHeader
        titleKey="student.dashboard.welcomeBack"
        subtitleKey="student.dashboard.subtitle"
      />

      <div className="flex-1 overflow-y-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.labelKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}
                >
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-oxford dark:text-white">
                {stat.value}
              </p>
              <p className="text-xs text-silver dark:text-white/50 mt-0.5">
                {td(stat.labelKey)}
              </p>
            </motion.div>
          ))}
        </div>

        {/* XP Progress Bar */}
        <div className="mb-8">
          <XPProgressBar />
        </div>

        {/* ── Gifts & Referral Row ── */}
        <div className="grid lg:grid-cols-2 gap-4 mb-8">
          {/* My Gifts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10"
          >
            <div className="p-5 border-b border-gray-200 dark:border-white/10 flex items-center gap-2">
              <GiftIcon className="w-4 h-4 text-gold" />
              <h3 className="text-sm font-semibold text-oxford dark:text-white">
                Mes Cadeaux
              </h3>
            </div>
            {sentGifts.length === 0 && receivedGifts.length === 0 ? (
              <div className="p-6 text-center">
                <GiftIcon className="w-8 h-8 text-silver/30 mx-auto mb-2" />
                <p className="text-xs text-silver dark:text-white/50">
                  Aucun cadeau pour le moment
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-white/5 max-h-48 overflow-y-auto">
                {[
                  ...sentGifts.map((g) => ({ ...g, _dir: "sent" as const })),
                  ...receivedGifts.map((g) => ({
                    ...g,
                    _dir: "received" as const,
                  })),
                ]
                  .sort(
                    (a, b) =>
                      new Date(b.created_at).getTime() -
                      new Date(a.created_at).getTime(),
                  )
                  .slice(0, 6)
                  .map((g) => (
                    <div
                      key={g.id}
                      className="px-5 py-3 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-oxford dark:text-white truncate">
                          {g._dir === "sent"
                            ? `→ ${g.recipient_email}`
                            : `← ${g.sender_name}`}
                        </p>
                        <p className="text-[10px] text-silver dark:text-white/40 truncate">
                          {g.course_title}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
                          g.status === "claimed"
                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : g.status === "expired"
                              ? "bg-red-50 dark:bg-red-500/10 text-red-500"
                              : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {g.status === "claimed"
                          ? "Réclamé"
                          : g.status === "expired"
                            ? "Expiré"
                            : "En attente"}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </motion.div>

          {/* Referral / Invite Friends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10"
          >
            <div className="p-5 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlusIcon className="w-4 h-4 text-gold" />
                <h3 className="text-sm font-semibold text-oxford dark:text-white">
                  Inviter des amis
                </h3>
              </div>
              {/* Referral Balance Badge */}
              {referralBalance > 0 && (
                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
                  <BanknotesIcon className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {referralBalance.toLocaleString()} DA
                  </span>
                </div>
              )}
            </div>
            <div className="p-5">
              {/* Balance banner */}
              <div
                className={`rounded-xl p-4 mb-4 ${
                  referralBalance > 0
                    ? "bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20"
                    : "bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-silver dark:text-white/40 mb-1">
                      Solde parrainage
                    </p>
                    <p
                      className={`text-xl font-bold ${
                        referralBalance > 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-silver dark:text-white/30"
                      }`}
                    >
                      {referralBalance.toLocaleString()}{" "}
                      <span className="text-sm font-medium">DA</span>
                    </p>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      referralBalance > 0
                        ? "bg-emerald-500/10"
                        : "bg-gray-200/50 dark:bg-white/5"
                    }`}
                  >
                    <BanknotesIcon
                      className={`w-5 h-5 ${referralBalance > 0 ? "text-emerald-500" : "text-silver dark:text-white/20"}`}
                    />
                  </div>
                </div>
                <p className="text-[10px] text-silver dark:text-white/40 mt-2">
                  Gagnez 200 DA par ami invité · Votre ami reçoit 100 DA de
                  bienvenue
                </p>
              </div>

              <p className="text-xs text-silver dark:text-white/50 mb-4">
                Partagez votre lien de parrainage et gagnez des récompenses
                quand vos amis s&apos;inscrivent.
              </p>
              {referralCode ? (
                <div className="space-y-3">
                  {/* Code + Copy + Share */}
                  <div className="flex gap-2">
                    <div className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-oxford dark:text-white truncate">
                      {referralCode}
                    </div>
                    <button
                      onClick={copyReferralLink}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                        referralCopied
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-gold hover:bg-gold/90 text-oxford"
                      }`}
                    >
                      <ClipboardDocumentIcon className="w-4 h-4" />
                      {referralCopied ? "Copié !" : "Copier"}
                    </button>
                    <button
                      onClick={() => setShareModalOpen(true)}
                      className="px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 bg-oxford dark:bg-white/10 hover:bg-oxford/80 dark:hover:bg-white/20 text-white"
                    >
                      <ShareIcon className="w-4 h-4" />
                      Partager
                    </button>
                  </div>
                </div>
              ) : !referralLoaded ? (
                <p className="text-xs text-silver dark:text-white/40 italic">
                  Chargement...
                </p>
              ) : (
                <p className="text-xs text-silver dark:text-white/40 italic">
                  Code indisponible pour le moment.
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* ── Share Modal ── */}
        {shareModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            onClick={() => setShareModalOpen(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 bg-white dark:bg-oxford-light rounded-t-3xl sm:rounded-2xl w-full sm:max-w-sm shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/10">
                <h3 className="text-base font-bold text-oxford dark:text-white">
                  Partager vers...
                </h3>
                <button
                  onClick={() => setShareModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                >
                  <svg
                    className="w-4 h-4 text-oxford dark:text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Options */}
              <div className="divide-y divide-gray-100 dark:divide-white/5">
                {/* WhatsApp */}
                <button
                  onClick={() => {
                    shareReferral("whatsapp");
                    setShareModalOpen(false);
                  }}
                  className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-start"
                >
                  <span className="w-9 h-9 rounded-full bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#25D366">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.558 4.121 1.532 5.847L.057 23.927a.5.5 0 0 0 .604.63l6.337-1.658A11.953 11.953 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.893 0-3.659-.524-5.168-1.432l-.372-.22-3.847 1.007 1.022-3.736-.238-.389A9.937 9.937 0 0 1 2 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
                    </svg>
                  </span>
                  <span className="text-sm font-medium text-oxford dark:text-white">
                    Partager via WhatsApp
                  </span>
                </button>

                {/* Telegram */}
                <button
                  onClick={() => {
                    shareReferral("telegram");
                    setShareModalOpen(false);
                  }}
                  className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-start"
                >
                  <span className="w-9 h-9 rounded-full bg-[#2AABEE]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#2AABEE">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                    </svg>
                  </span>
                  <span className="text-sm font-medium text-oxford dark:text-white">
                    Partager via Telegram
                  </span>
                </button>

                {/* Facebook */}
                <button
                  onClick={() => {
                    shareReferral("facebook");
                    setShareModalOpen(false);
                  }}
                  className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-start"
                >
                  <span className="w-9 h-9 rounded-full bg-[#1877F2]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </span>
                  <span className="text-sm font-medium text-oxford dark:text-white">
                    Partager sur Facebook
                  </span>
                </button>

                {/* Messenger */}
                <button
                  onClick={() => {
                    shareReferral("messenger");
                    setShareModalOpen(false);
                  }}
                  className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-start"
                >
                  <span className="w-9 h-9 rounded-full bg-[#0099FF]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0099FF">
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 3.137 1.202 5.98 3.168 8.1L2 24l4.036-1.061A11.946 11.946 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm1.193 15.208-3.08-3.293-5.856 3.293 6.559-6.963 3.157 3.293 5.78-3.293-6.56 6.963z" />
                    </svg>
                  </span>
                  <span className="text-sm font-medium text-oxford dark:text-white">
                    Envoyer via Messenger
                  </span>
                </button>

                {/* X / Twitter */}
                <button
                  onClick={() => {
                    shareReferral("twitter");
                    setShareModalOpen(false);
                  }}
                  className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-start"
                >
                  <span className="w-9 h-9 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 fill-black dark:fill-white"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835-8.164-10.665h5.524l4.26 5.635 5.127-5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </span>
                  <span className="text-sm font-medium text-oxford dark:text-white">
                    Partager sur X (Twitter)
                  </span>
                </button>

                {/* Email */}
                <button
                  onClick={() => {
                    const link = `${window.location.origin}/auth/signup?ref=${referralCode}`;
                    window.location.href = `mailto:?subject=${encodeURIComponent("Rejoins OOSkills")}&body=${encodeURIComponent(`Rejoins-moi sur OOSkills et reçois 100 DA de bienvenue !\n\n${link}`)}`;
                    setShareModalOpen(false);
                  }}
                  className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-start"
                >
                  <span className="w-9 h-9 rounded-full bg-gray-200/80 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-oxford dark:text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                      />
                    </svg>
                  </span>
                  <span className="text-sm font-medium text-oxford dark:text-white">
                    Partager par e-mail
                  </span>
                </button>

                {/* Copy link */}
                <button
                  onClick={() => {
                    copyReferralLink();
                    setShareModalOpen(false);
                  }}
                  className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-start"
                >
                  <span className="w-9 h-9 rounded-full bg-gray-200/80 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-oxford dark:text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                      />
                    </svg>
                  </span>
                  <span className="text-sm font-medium text-oxford dark:text-white">
                    Copier le lien
                  </span>
                </button>
              </div>

              {/* Safe area padding on mobile */}
              <div className="h-4 sm:h-0" />
            </motion.div>
          </div>
        )}
        {recentAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrophyIcon className="w-4 h-4 text-gold" />
                <h3 className="text-sm font-semibold text-oxford dark:text-white">
                  {t("gamification.recentAchievements") ||
                    "Recent Achievements"}
                </h3>
              </div>
              <Link
                href="/dashboard/achievements"
                className="text-xs text-gold hover:text-gold-light transition-colors flex items-center gap-1"
              >
                {td("viewAll")}
                <ArrowRightIcon className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {recentAchievements.map((ach, i) => (
                <AchievementCard
                  key={ach.id}
                  achievement={ach}
                  compact
                  delay={i * 0.05}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Demo buttons (for testing — remove in production) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-8 flex flex-wrap gap-2"
        >
          <button
            onClick={() =>
              dispatch(addXP({ amount: 50, label: "Quiz passed" }))
            }
            className="px-3 py-1.5 text-xs font-medium bg-gold/10 text-gold rounded-lg hover:bg-gold/20 transition-colors"
          >
            +50 XP (Demo)
          </button>
          <button
            onClick={() => dispatch(demoLevelUp())}
            className="px-3 py-1.5 text-xs font-medium bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors"
          >
            Level Up (Demo)
          </button>
          <button
            onClick={() => dispatch(demoAchievement())}
            className="px-3 py-1.5 text-xs font-medium bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-colors"
          >
            Achievement (Demo)
          </button>
        </motion.div>

        {/* Continue Learning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 mb-8"
        >
          <div className="p-5 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-oxford dark:text-white">
                {td("continueLearning")}
              </h2>
              <p className="text-xs text-silver dark:text-white/50 mt-0.5">
                {td("pickUpWhere")}
              </p>
            </div>
            <Link
              href="/dashboard/my-courses"
              className="text-sm text-gold hover:text-gold-light transition-colors flex items-center gap-1"
            >
              {td("viewAll")}
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          {continueLearning.length === 0 ? (
            <div className="p-8 text-center">
              <BookOpenIcon className="w-10 h-10 text-silver/40 mx-auto mb-3" />
              <p className="text-sm text-silver dark:text-white/50">
                {td("noCoursesYet") || "No courses yet. Start learning!"}
              </p>
              <Link
                href="/courses"
                className="inline-flex items-center gap-1 text-sm text-gold hover:text-gold-light mt-3"
              >
                {td("browseCatalog") || "Browse catalog"}
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {continueLearning.map((enrollment, index) => {
                const progress = parseFloat(enrollment.progress) || 0;
                return (
                  <motion.div
                    key={enrollment.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-white/5 overflow-hidden flex-shrink-0">
                        {normalizeImg(enrollment.course_image) ? (
                          <Image
                            src={normalizeImg(enrollment.course_image)!}
                            alt={enrollment.course_title}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
                            <BookOpenIcon className="w-6 h-6 text-gold/60" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-oxford dark:text-white text-sm truncate">
                          {enrollment.course_title}
                        </h3>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex-1 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gold rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gold">
                            {Math.round(progress)}%
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/courses/${enrollment.course_slug}/learn`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-gold/10 hover:bg-gold/20 rounded-lg"
                      >
                        <PlayCircleIcon className="w-5 h-5 text-gold" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10"
        >
          <div className="p-5 border-b border-gray-200 dark:border-white/10">
            <h2 className="text-lg font-semibold text-oxford dark:text-white">
              {td("recentActivity")}
            </h2>
            <p className="text-xs text-silver dark:text-white/50 mt-0.5">
              {td("recentActivityDesc")}
            </p>
          </div>

          {recentActivity.length === 0 ? (
            <div className="p-8 text-center">
              <ClockIcon className="w-10 h-10 text-silver/40 mx-auto mb-3" />
              <p className="text-sm text-silver dark:text-white/50">
                {td("noActivity") || "No recent activity"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.04 }}
                  className="px-5 py-3.5 flex items-start gap-3"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      activity.type === "quiz"
                        ? "bg-emerald-500/10"
                        : "bg-gold/10"
                    }`}
                  >
                    {activity.type === "quiz" ? (
                      <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <TrophyIcon className="w-4 h-4 text-gold" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-oxford dark:text-white">
                      {activity.text}
                    </p>
                    <p className="text-xs text-silver dark:text-white/40 mt-0.5">
                      {activity.course ? `${activity.course} · ` : ""}
                      {activity.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
