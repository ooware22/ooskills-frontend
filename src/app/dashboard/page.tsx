"use client";

import { motion } from "framer-motion";
import {
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  PlayCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";
import StudentHeader from "@/components/student/StudentHeader";

// Mock stats
const stats = [
  { labelKey: "enrolledCourses", value: "6", icon: BookOpenIcon, color: "text-blue-500", bg: "bg-blue-500/10" },
  { labelKey: "completedCourses", value: "2", icon: CheckCircleIcon, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { labelKey: "inProgress", value: "3", icon: ClockIcon, color: "text-amber-500", bg: "bg-amber-500/10" },
  { labelKey: "totalXp", value: "1,250", icon: SparklesIcon, color: "text-gold", bg: "bg-gold/10" },
];

// Mock in-progress courses
const continueLearning = [
  {
    id: "1",
    title: "Introduction to AI & Machine Learning",
    progress: 65,
    lastLesson: "Neural Networks Basics",
    totalLessons: 24,
    completedLessons: 16,
  },
  {
    id: "2",
    title: "Advanced Digital Marketing",
    progress: 30,
    lastLesson: "Social Media Strategy",
    totalLessons: 18,
    completedLessons: 5,
  },
  {
    id: "3",
    title: "Project Management Fundamentals",
    progress: 85,
    lastLesson: "Risk Assessment",
    totalLessons: 20,
    completedLessons: 17,
  },
];

// Mock recent activity
const recentActivity = [
  { type: "lesson", text: "Completed: Neural Networks Basics", course: "Intro to AI", time: "2 hours ago" },
  { type: "quiz", text: "Passed Quiz: Marketing Fundamentals (85%)", course: "Digital Marketing", time: "5 hours ago" },
  { type: "lesson", text: "Completed: Risk Identification", course: "Project Management", time: "1 day ago" },
  { type: "xp", text: "Earned 50 XP for completing a section", course: "Intro to AI", time: "1 day ago" },
  { type: "lesson", text: "Completed: Data Preprocessing", course: "Intro to AI", time: "2 days ago" },
];

export default function StudentDashboard() {
  const { t } = useI18n();
  const td = (key: string) => t(`student.dashboard.${key}`);

  return (
    <div className="min-h-screen">
      <StudentHeader
        titleKey="student.dashboard.welcomeBack"
        subtitleKey="student.dashboard.subtitle"
      />

      <div className="p-6">
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
                <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
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
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {continueLearning.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-white/5 overflow-hidden flex-shrink-0">
                    <div className="w-full h-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
                      <BookOpenIcon className="w-6 h-6 text-gold/60" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-oxford dark:text-white text-sm truncate">
                      {course.title}
                    </h3>
                    <p className="text-xs text-silver dark:text-white/50 mt-0.5">
                      {td("lastLesson")}: {course.lastLesson}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gold rounded-full transition-all duration-500"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gold">
                        {course.progress}%
                      </span>
                    </div>
                    <p className="text-[11px] text-silver dark:text-white/40 mt-1">
                      {course.completedLessons}/{course.totalLessons} {td("lessons")}
                    </p>
                  </div>
                  <Link
                    href={`/courses/${course.id}/learn`}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-gold/10 hover:bg-gold/20 rounded-lg"
                  >
                    <PlayCircleIcon className="w-5 h-5 text-gold" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
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
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.04 }}
                className="px-5 py-3.5 flex items-start gap-3"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  activity.type === "lesson" ? "bg-blue-500/10" :
                  activity.type === "quiz" ? "bg-emerald-500/10" :
                  "bg-gold/10"
                }`}>
                  {activity.type === "lesson" ? (
                    <BookOpenIcon className="w-4 h-4 text-blue-500" />
                  ) : activity.type === "quiz" ? (
                    <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <SparklesIcon className="w-4 h-4 text-gold" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-oxford dark:text-white">
                    {activity.text}
                  </p>
                  <p className="text-xs text-silver dark:text-white/40 mt-0.5">
                    {activity.course} · {activity.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
