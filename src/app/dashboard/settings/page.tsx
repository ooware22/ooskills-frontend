"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCircleIcon,
  BellIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import StudentHeader from "@/components/student/StudentHeader";

export default function StudentSettingsPage() {
  const { t } = useI18n();
  const ts = (key: string) => t(`student.settings.${key}`);

  // Local form state
  const [toast, setToast] = useState("");
  const [profile, setProfile] = useState({
    firstName: "Islem",
    lastName: "Charaf Eddine",
    email: "islem@example.com",
    phone: "+213 555 123 456",
    bio: "Passionate learner focused on AI and digital skills.",
  });

  const [notifications, setNotifications] = useState({
    courseUpdates: true,
    newLessons: true,
    quizReminders: true,
    promotions: false,
    emailDigest: true,
  });

  const [language, setLanguage] = useState("en");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleSaveProfile = () => {
    showToast(ts("profileSaved"));
  };

  const handleSaveNotifications = () => {
    showToast(ts("notificationsSaved"));
  };

  const handleSaveLanguage = () => {
    showToast(ts("languageSaved"));
  };

  const InputClass = "w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors";
  const LabelClass = "block text-xs font-medium text-silver dark:text-white/50 mb-1.5";

  return (
    <div className="min-h-screen">
      <StudentHeader
        titleKey="student.settings.title"
        subtitleKey="student.settings.subtitle"
      />

      <div className="p-6 space-y-6">
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
              <h3 className="text-sm font-semibold text-oxford dark:text-white">{ts("profileSection")}</h3>
              <p className="text-xs text-silver dark:text-white/50">{ts("profileDesc")}</p>
            </div>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center text-oxford text-xl font-bold">
                {profile.firstName[0]}{profile.lastName[0]}
              </div>
              <button className="absolute -bottom-1 -end-1 w-6 h-6 bg-gold rounded-full flex items-center justify-center shadow-lg">
                <CameraIcon className="w-3.5 h-3.5 text-oxford" />
              </button>
            </div>
            <div>
              <p className="font-medium text-oxford dark:text-white text-sm">
                {profile.firstName} {profile.lastName}
              </p>
              <p className="text-xs text-silver dark:text-white/50">{profile.email}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={LabelClass}>{ts("firstName")}</label>
              <input
                type="text"
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                className={InputClass}
              />
            </div>
            <div>
              <label className={LabelClass}>{ts("lastName")}</label>
              <input
                type="text"
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                className={InputClass}
              />
            </div>
            <div>
              <label className={LabelClass}>{ts("email")}</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className={InputClass}
              />
            </div>
            <div>
              <label className={LabelClass}>{ts("phone")}</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className={InputClass}
              />
            </div>
          </div>
          <div className="mb-4">
            <label className={LabelClass}>{ts("bio")}</label>
            <textarea
              rows={3}
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className={cn(InputClass, "resize-none")}
            />
          </div>
          <button
            onClick={handleSaveProfile}
            className="px-5 py-2.5 bg-gold hover:bg-gold-light text-oxford rounded-lg text-sm font-medium transition-colors"
          >
            {ts("saveProfile")}
          </button>
        </motion.div>

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
              <h3 className="text-sm font-semibold text-oxford dark:text-white">{ts("notificationsSection")}</h3>
              <p className="text-xs text-silver dark:text-white/50">{ts("notificationsDesc")}</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { key: "courseUpdates", label: ts("courseUpdates"), desc: ts("courseUpdatesDesc") },
              { key: "newLessons", label: ts("newLessons"), desc: ts("newLessonsDesc") },
              { key: "quizReminders", label: ts("quizReminders"), desc: ts("quizRemindersDesc") },
              { key: "promotions", label: ts("promotions"), desc: ts("promotionsDesc") },
              { key: "emailDigest", label: ts("emailDigest"), desc: ts("emailDigestDesc") },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-oxford rounded-lg">
                <div>
                  <p className="text-sm font-medium text-oxford dark:text-white">{item.label}</p>
                  <p className="text-xs text-silver dark:text-white/50">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications[item.key as keyof typeof notifications]}
                    onChange={(e) =>
                      setNotifications({ ...notifications, [item.key]: e.target.checked })
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
              <h3 className="text-sm font-semibold text-oxford dark:text-white">{ts("languageSection")}</h3>
              <p className="text-xs text-silver dark:text-white/50">{ts("languageDesc")}</p>
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
                    : "bg-gray-50 dark:bg-white/5 text-oxford dark:text-white border-gray-200 dark:border-white/10 hover:border-gold/30"
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
      </div>

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
