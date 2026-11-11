"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCircleIcon,
  BellIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  CameraIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import StudentHeader from "@/components/student/StudentHeader";
import ChangePasswordCard from "@/components/student/ChangePasswordCard";
import {
  submitDeletionRequest,
  cancelDeletionRequest,
  confirmAccountDeletion,
} from "@/services/accountDeletionApi";
import type { DeletionRequest } from "@/services/accountDeletionApi";
import {
  clearTokens,
  updateProfile as updateProfileApi,
} from "@/services/authApi";
import { useRouter } from "next/navigation";
import { WILAYAS } from "@/constants/wilayas";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { updateUser } from "@/store/slices/authSlice";
import {
  fetchDeletionRequest,
  setDeletionRequest,
} from "@/store/slices/userDataSlice";

export default function StudentSettingsPage() {
  const { t, locale } = useI18n();
  const ts = (key: string) => t(`student.settings.${key}`);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);

  // Local form state — seeded from Redux auth user
  const [toast, setToast] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    wilaya: "",
    newsletterSubscribed: false,
  });

  const [notifications, setNotifications] = useState({
    courseUpdates: true,
    newLessons: true,
    quizReminders: true,
    promotions: false,
    emailDigest: true,
  });

  const [language, setLanguage] = useState("en");

  // Seed form from auth user
  useEffect(() => {
    if (authUser) {
      setProfile({
        firstName: authUser.first_name || "",
        lastName: authUser.last_name || "",
        email: authUser.email || "",
        phone: authUser.phone || "",
        wilaya: authUser.wilaya || "",
        newsletterSubscribed: authUser.newsletter_subscribed || false,
      });
      setLanguage(authUser.language || "fr");
      setAvatarPreview(authUser.avatar_display_url || null);
    }
  }, [authUser]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast(ts("avatarTooBig"));
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Deletion request state — from Redux store
  const deletionRequest = useAppSelector((s) => s.userData.deletionRequest);
  const [deletionReason, setDeletionReason] = useState("");
  const [deletionLoading, setDeletionLoading] = useState(false);
  const [deletionError, setDeletionError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  // Fetch deletion request status on mount (once per session)
  useEffect(() => {
    dispatch(fetchDeletionRequest());
  }, [dispatch]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    try {
      const payload: Record<string, unknown> = {
        first_name: profile.firstName,
        last_name: profile.lastName,
        phone: profile.phone || undefined,
        wilaya: profile.wilaya || undefined,
        newsletter_subscribed: profile.newsletterSubscribed,
      };
      if (avatarFile) {
        payload.avatar = avatarFile;
      }
      const updatedUser = await updateProfileApi(
        payload as Parameters<typeof updateProfileApi>[0],
      );
      dispatch(updateUser(updatedUser));
      setAvatarFile(null);
      showToast(ts("profileSaved"));
    } catch {
      showToast(ts("profileError"));
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSaveNotifications = () => {
    showToast(ts("notificationsSaved"));
  };

  const handleSaveLanguage = async () => {
    setProfileSaving(true);
    try {
      const updatedUser = await updateProfileApi({ language });
      dispatch(updateUser(updatedUser));
      showToast(ts("languageSaved"));
    } catch {
      showToast(ts("languageError"));
    } finally {
      setProfileSaving(false);
    }
  };

  // Deletion handlers
  const handleSubmitDeletion = async () => {
    if (!deletionReason.trim()) {
      setDeletionError(ts("deletion.reasonRequired"));
      return;
    }
    setDeletionLoading(true);
    setDeletionError("");
    try {
      const req = await submitDeletionRequest(deletionReason.trim());
      dispatch(setDeletionRequest(req));
      setDeletionReason("");
      showToast(ts("deletion.submitted"));
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || ts("deletion.submitError");
      setDeletionError(errorMsg);
    } finally {
      setDeletionLoading(false);
    }
  };

  const handleCancelDeletion = async () => {
    setDeletionLoading(true);
    try {
      await cancelDeletionRequest();
      dispatch(setDeletionRequest(null));
      showToast(ts("deletion.cancelled"));
    } catch {
      setDeletionError(ts("deletion.cancelError"));
    } finally {
      setDeletionLoading(false);
    }
  };

  const handleConfirmDeletion = async () => {
    if (!confirmPassword) {
      setConfirmError(ts("deletion.passwordRequired"));
      return;
    }
    setConfirmLoading(true);
    setConfirmError("");
    try {
      await confirmAccountDeletion(confirmPassword);
      clearTokens();
      router.push("/auth/signin");
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || ts("deletion.deleteError");
      setConfirmError(errorMsg);
    } finally {
      setConfirmLoading(false);
    }
  };

  const InputClass =
    "w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors";
  const LabelClass =
    "block text-xs font-medium text-silver dark:text-white/50 mb-1.5";

  const statusColors: Record<string, string> = {
    PENDING:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    APPROVED:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    REJECTED: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  };

  const statusLabels: Record<string, string> = {
    PENDING: ts("deletion.statusPending"),
    APPROVED: ts("deletion.statusApproved"),
    REJECTED: ts("deletion.statusRejected"),
  };
  const dateLocale = locale === "ar" ? "ar-DZ" : locale === "en" ? "en-GB" : "fr-FR";

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <StudentHeader
        titleKey="student.settings.title"
        subtitleKey="student.settings.subtitle"
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center">
              <UserCircleIcon className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-oxford dark:text-white">
                {ts("profileSection")}
              </h3>
              <p className="text-xs text-silver dark:text-white/50">
                {ts("profileDesc")}
              </p>
            </div>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full object-cover border-2 border-gold/30"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center text-oxford text-xl font-bold">
                  {profile.firstName?.[0] || ""}
                  {profile.lastName?.[0] || ""}
                </div>
              )}
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                aria-label={ts("changePhoto")}
                className="absolute -bottom-1 -end-1 w-7 h-7 bg-goldrounded-full flex items-center justify-center shadow-lg hover:bg-gold-light transition-colors"
              >
                <CameraIcon className="w-3.5 h-3.5 text-oxford" />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div>
              <p className="font-medium text-oxford dark:text-white text-sm">
                {profile.firstName} {profile.lastName}
              </p>
              <p className="text-xs text-silver dark:text-white/50">
                {profile.email}
              </p>
              {avatarFile && (
                <p className="text-xs text-gold mt-0.5">
                  {ts("newPhoto")}
                </p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="st-first-name" className={LabelClass}>{ts("firstName")}</label>
              <input
                id="st-first-name"
                type="text"
                value={profile.firstName}
                onChange={(e) =>
                  setProfile({ ...profile, firstName: e.target.value })
                }
                className={InputClass}
              />
            </div>
            <div>
              <label htmlFor="st-last-name" className={LabelClass}>{ts("lastName")}</label>
              <input
                id="st-last-name"
                type="text"
                value={profile.lastName}
                onChange={(e) =>
                  setProfile({ ...profile, lastName: e.target.value })
                }
                className={InputClass}
              />
            </div>
            <div>
              <label htmlFor="st-email" className={LabelClass}>{ts("email")}</label>
              <input
                id="st-email"
                type="email"
                value={profile.email}
                readOnly
                disabled
                className={cn(InputClass, "opacity-60 cursor-not-allowed")}
              />
            </div>
            <div>
              <label htmlFor="st-phone" className={LabelClass}>{ts("phone")}</label>
              <input
                id="st-phone"
                type="tel"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                placeholder="+213 5XX XX XX XX"
                className={InputClass}
              />
            </div>
            <div>
              <label htmlFor="st-wilaya" className={LabelClass}>{ts("wilaya")}</label>
              {/* A list of names instead of a free "16" code (audit FN-30). */}
              <select
                id="st-wilaya"
                value={profile.wilaya}
                onChange={(e) =>
                  setProfile({ ...profile, wilaya: e.target.value })
                }
                className={InputClass}
              >
                <option value="">{ts("wilayaPlaceholder")}</option>
                {WILAYAS.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.code} - {locale === "ar" ? w.nameAr : w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Newsletter toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-oxford rounded-lg mb-4">
            <div>
              <p id="st-newsletter-label" className="text-sm font-medium text-oxford dark:text-white">
                {ts("newsletter")}
              </p>
              <p className="text-xs text-silver dark:text-white/50">
                {ts("newsletterDesc")}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <span className="sr-only">{ts("newsletter")}</span>
              <input
                type="checkbox"
                checked={profile.newsletterSubscribed}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    newsletterSubscribed: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 dark:bg-white/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gold/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
            </label>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={profileSaving}
            className="px-5 py-2.5 bg-gold hover:bg-gold-light text-oxford rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {profileSaving ? ts("saving") : ts("saveProfile")}
          </button>
        </motion.div>

        {/* Password Section */}
        <ChangePasswordCard hasPassword={authUser?.has_password !== false} />

        {/* Notifications Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center">
              <BellIcon className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-oxford dark:text-white">
                {ts("notificationsSection")}
              </h3>
              <p className="text-xs text-silver dark:text-white/50">
                {ts("notificationsDesc")}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              {
                key: "courseUpdates",
                label: ts("courseUpdates"),
                desc: ts("courseUpdatesDesc"),
              },
              {
                key: "newLessons",
                label: ts("newLessons"),
                desc: ts("newLessonsDesc"),
              },
              {
                key: "quizReminders",
                label: ts("quizReminders"),
                desc: ts("quizRemindersDesc"),
              },
              {
                key: "promotions",
                label: ts("promotions"),
                desc: ts("promotionsDesc"),
              },
              {
                key: "emailDigest",
                label: ts("emailDigest"),
                desc: ts("emailDigestDesc"),
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-oxford rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-oxford dark:text-white">
                    {item.label}
                  </p>
                  <p className="text-xs text-silver dark:text-white/50">
                    {item.desc}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      notifications[item.key as keyof typeof notifications]
                    }
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        [item.key]: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 dark:bg-white/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gold/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                </label>
              </div>
            ))}
          </div>
          <button
            onClick={handleSaveNotifications}
            className="mt-4 px-5 py-2.5 bg-gold hover:bg-gold-light text-oxford rounded-lg text-sm font-medium transition-colors"
          >
            {ts("saveNotifications")}
          </button>
        </motion.div>

        {/* Language Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center">
              <GlobeAltIcon className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-oxford dark:text-white">
                {ts("languageSection")}
              </h3>
              <p className="text-xs text-silver dark:text-white/50">
                {ts("languageDesc")}
              </p>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            {[
              { code: "en", label: "English" },
              { code: "fr", label: "Français" },
              { code: "ar", label: "العربية" },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={cn(
                  "px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border",
                  language === lang.code
                    ? "bg-gold text-oxford border-gold"
                    : "bg-gray-50 dark:bg-white/5 text-oxford dark:text-white border-gray-200 dark:border-white/10 hover:border-gold/30",
                )}
              >
                {lang.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleSaveLanguage}
            className="px-5 py-2.5 bg-gold hover:bg-gold-light text-oxford rounded-lg text-sm font-medium transition-colors"
          >
            {ts("saveLanguage")}
          </button>
        </motion.div>

        {/* ============ DANGER ZONE ============ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-oxford-light rounded-xl border-2 border-red-300 dark:border-red-500/30 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">
                {ts("deletion.title")}
              </h3>
              <p className="text-xs text-silver dark:text-white/50">
                {ts("deletion.desc")}
              </p>
            </div>
          </div>

          {/* No active request — show form */}
          {(!deletionRequest || deletionRequest.status === "REJECTED") && (
            <div className="space-y-4">
              {/* Show rejection info if previous was rejected */}
              {deletionRequest?.status === "REJECTED" && (
                <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
                  <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">
                    {ts("deletion.rejectedTitle")}
                  </p>
                  {deletionRequest.admin_notes && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {ts("deletion.adminNote")}{" "}
                      {deletionRequest.admin_notes}
                    </p>
                  )}
                  <p className="text-xs text-silver dark:text-white/60 mt-2">
                    {ts("deletion.resubmit")}
                  </p>
                </div>
              )}

              <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  ⚠️ {ts("deletion.warning")}
                </p>
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-2 font-medium">
                  {ts("deletion.delay")}
                </p>
              </div>

              <div>
                <label htmlFor="st-deletion-reason" className="block text-xs font-medium text-red-600 dark:text-red-400 mb-1.5">
                  {ts("deletion.reasonLabel")} *
                </label>
                <textarea
                  id="st-deletion-reason"
                  rows={3}
                  value={deletionReason}
                  onChange={(e) => setDeletionReason(e.target.value)}
                  placeholder={ts("deletion.reasonPlaceholder")}
                  className={cn(
                    InputClass,
                    "resize-none border-red-200 dark:border-red-500/20 focus:ring-red-500/50",
                  )}
                />
              </div>

              {deletionError && (
                <p className="text-xs text-red-500">{deletionError}</p>
              )}

              <button
                onClick={handleSubmitDeletion}
                disabled={deletionLoading || !deletionReason.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <TrashIcon className="w-4 h-4" />
                {deletionLoading
                  ? ts("deletion.submitting")
                  : ts("deletion.submit")}
              </button>
            </div>
          )}

          {/* Pending request */}
          {deletionRequest?.status === "PENDING" && (
            <div className="space-y-4">
              <div
                className={cn("p-4 rounded-xl border", statusColors["PENDING"])}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <p className="text-sm font-medium">
                    {statusLabels["PENDING"]}
                  </p>
                </div>
                <p className="text-xs opacity-80">
                  {ts("deletion.submittedOn")}{" "}
                  {new Date(deletionRequest.created_at).toLocaleDateString(
                    dateLocale,
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </p>
                <p className="text-xs mt-2 opacity-80">
                  {ts("deletion.reason")} {deletionRequest.reason}
                </p>
                <p className="text-xs mt-2 opacity-80">{ts("deletion.delay")}</p>
              </div>

              <button
                onClick={handleCancelDeletion}
                disabled={deletionLoading}
                className="px-5 py-2.5 border border-gray-200 dark:border-white/10 text-oxford dark:text-white rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                {deletionLoading ? ts("deletion.cancelling") : ts("deletion.cancel")}
              </button>
            </div>
          )}

          {/* Approved request — show confirm button */}
          {deletionRequest?.status === "APPROVED" && (
            <div className="space-y-4">
              <div
                className={cn(
                  "p-4 rounded-xl border",
                  statusColors["APPROVED"],
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircleIcon className="w-4 h-4" />
                  <p className="text-sm font-medium">
                    {statusLabels["APPROVED"]}
                  </p>
                </div>
                {deletionRequest.admin_notes && (
                  <p className="text-xs opacity-80 mt-1">
                    {ts("deletion.adminNote")}{" "}
                    {deletionRequest.admin_notes}
                  </p>
                )}
                <p className="text-xs mt-2 opacity-80">
                  {ts("deletion.approvedOn")}{" "}
                  {deletionRequest.reviewed_at &&
                    new Date(deletionRequest.reviewed_at).toLocaleDateString(
                      dateLocale,
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      },
                    )}
                </p>
              </div>

              <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
                <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                  🚨 {ts("deletion.irreversible")}
                </p>
              </div>

              <button
                onClick={() => setShowConfirmModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
                {ts("deletion.confirm")}
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* ============ CONFIRM DELETION MODAL ============ */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowConfirmModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white dark:bg-oxford-light rounded-2xl shadow-2xl border border-red-200 dark:border-red-500/20 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10">
                <div className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                  <h3 className="text-lg font-semibold text-red-700 dark:text-red-300">
                    {ts("deletion.modalTitle")}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setConfirmError("");
                    setConfirmPassword("");
                  }}
                  aria-label={ts("deletion.close")}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-white rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-700 dark:text-white/70">
                  {ts("deletion.modalText")}
                </p>

                <div>
                  <label htmlFor="st-delete-password" className="block text-xs font-medium text-red-600 dark:text-red-400 mb-1.5">
                    {ts("deletion.password")}
                  </label>
                  <input
                    id="st-delete-password"
                    type="password"
                    autoComplete="current-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={ts("deletion.passwordPlaceholder")}
                    className={cn(
                      InputClass,
                      "border-red-200 dark:border-red-500/20 focus:ring-red-500/50",
                    )}
                  />
                </div>

                {confirmError && (
                  <p className="text-xs text-red-500">{confirmError}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowConfirmModal(false);
                      setConfirmError("");
                      setConfirmPassword("");
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-white/10 text-oxford dark:text-white rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    {ts("deletion.cancelModal")}
                  </button>
                  <button
                    onClick={handleConfirmDeletion}
                    disabled={confirmLoading || !confirmPassword}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {confirmLoading
                      ? ts("deletion.deleting")
                      : ts("deletion.deleteForever")}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className="fixed bottom-6 left-1/2 z-[60] flex items-center gap-2 px-5 py-3 bg-oxford dark:bg-white text-white dark:text-oxford rounded-xl shadow-2xl border border-white/10 dark:border-gray-200"
          >
            <CheckCircleIcon className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
            <span className="text-sm font-medium">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
