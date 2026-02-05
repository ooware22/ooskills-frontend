"use client";

import { useEffect } from "react";
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
  Cog6ToothIcon as Settings,
} from "@heroicons/react/24/outline";
import AdminHeader from "@/components/admin/AdminHeader";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchDashboardData, selectDashboardSections } from "@/store/slices/dashboardSlice";

type SectionConfig = {
  nameKey: string;
  icon: React.ElementType;
  href: string;
};

const sectionConfigs: SectionConfig[] = [
  { nameKey: "hero", icon: Sparkles, href: "/admin/hero" },
  { nameKey: "countdown", icon: Clock, href: "/admin/countdown" },
  { nameKey: "features", icon: Award, href: "/admin/features" },
  { nameKey: "courses", icon: BookOpen, href: "/admin/courses" },
  { nameKey: "faq", icon: HelpCircle, href: "/admin/faq" },
  { nameKey: "contact", icon: Phone, href: "/admin/contact" },
  { nameKey: "settings", icon: Settings, href: "/admin/settings" },
];

const stats = [
  { labelKey: "totalCourses", value: "12,458", change: "+12%", icon: Eye },
  { labelKey: "totalStudents", value: "45,892", change: "+8%", icon: TrendingUp },
  { labelKey: "activeUsers", value: "234", change: "+24%", icon: Users },
];

export default function AdminDashboard() {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const sections = useAppSelector(selectDashboardSections);

  // Fetch data on mount (uses cache if available)
  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

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
            {sectionConfigs.map((config, index) => {
              const section = sections[config.nameKey];
              return (
                <motion.div
                  key={config.nameKey}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                >
                  <Link
                    href={config.href}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-oxford/5 dark:bg-white/5 rounded-lg flex items-center justify-center">
                        <config.icon className="w-5 h-5 text-oxford dark:text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-oxford dark:text-white">
                          {t(`admin.sidebar.${config.nameKey}`)}
                        </p>
                        <p className="text-xs text-silver dark:text-white/50 flex items-center gap-2">
                          {section?.loading ? (
                            <span className="flex items-center gap-1">
                              <span className="w-3 h-3 border border-gold/30 border-t-gold rounded-full animate-spin" />
                              Loading...
                            </span>
                          ) : (
                            section?.status || "..."
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-silver dark:text-white/50">{t("admin.common.edit")}</span>
                      <Edit3 className="w-4 h-4 text-silver dark:text-white/50" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
