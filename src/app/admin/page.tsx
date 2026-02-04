"use client";

import { motion } from "framer-motion";
import {
  SparklesIcon as Sparkles,
  ClockIcon as Clock,
  TrophyIcon as Award,
  BookOpenIcon as BookOpen,
  QuestionMarkCircleIcon as HelpCircle,
  PhoneIcon as Phone,
  ArrowTrendingUpIcon as TrendingUp,
  UsersIcon as Users,
  EyeIcon as Eye,
  PencilSquareIcon as Edit3,
} from "@heroicons/react/24/outline";
import AdminHeader from "@/components/admin/AdminHeader";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

const stats = [
  { labelKey: "totalCourses", value: "12,458", change: "+12%", icon: Eye },
  { labelKey: "totalStudents", value: "45,892", change: "+8%", icon: TrendingUp },
  { labelKey: "activeUsers", value: "234", change: "+24%", icon: Users },
];

const sections = [
  { nameKey: "hero", icon: Sparkles, href: "/admin/hero", status: "Published" },
  { nameKey: "countdown", icon: Clock, href: "/admin/countdown", status: "Active" },
  { nameKey: "features", icon: Award, href: "/admin/features", status: "6 items" },
  { nameKey: "courses", icon: BookOpen, href: "/admin/courses", status: "4 items" },
  { nameKey: "faq", icon: HelpCircle, href: "/admin/faq", status: "5 items" },
  { nameKey: "contact", icon: Phone, href: "/admin/contact", status: "Published" },
];

export default function AdminDashboard() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen">
      <AdminHeader 
        titleKey="admin.dashboard.title"
        subtitleKey="admin.dashboard.subtitle"
      />
      
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.labelKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-gold" />
                </div>
                <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-oxford dark:text-white mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-silver dark:text-white/50">{t(`admin.dashboard.${stat.labelKey}`)}</p>
            </motion.div>
          ))}
        </div>

        {/* Manage Sections */}
        <div className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10">
          <div className="p-6 border-b border-gray-200 dark:border-white/10">
            <h2 className="text-lg font-semibold text-oxford dark:text-white">
              {t("admin.dashboard.quickActions")}
            </h2>
            <p className="text-sm text-silver dark:text-white/50">
              {t("admin.dashboard.overview")}
            </p>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-white/10">
            {sections.map((section, index) => (
              <motion.div
                key={section.nameKey}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
              >
                <Link
                  href={section.href}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-oxford/5 dark:bg-white/5 rounded-lg flex items-center justify-center">
                      <section.icon className="w-5 h-5 text-oxford dark:text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-oxford dark:text-white">
                        {t(`admin.sidebar.${section.nameKey}`)}
                      </p>
                      <p className="text-xs text-silver dark:text-white/50">
                        {section.status}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-silver dark:text-white/50">{t("admin.common.edit")}</span>
                    <Edit3 className="w-4 h-4 text-silver dark:text-white/50" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
