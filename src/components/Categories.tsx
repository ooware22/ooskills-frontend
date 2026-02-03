"use client";

import { motion } from "framer-motion";
import {
  ComputerDesktopIcon,
  ChartBarIcon,
  CodeBracketIcon,
  PaintBrushIcon,
  LanguageIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  CameraIcon,
  MusicalNoteIcon,
  HeartIcon,
  CpuChipIcon,
  PresentationChartLineIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "@/lib/i18n";

const categories = [
  { key: "it", icon: ComputerDesktopIcon },
  { key: "business", icon: ChartBarIcon },
  { key: "programming", icon: CodeBracketIcon },
  { key: "design", icon: PaintBrushIcon },
  { key: "languages", icon: LanguageIcon },
  { key: "marketing", icon: BriefcaseIcon },
  { key: "education", icon: AcademicCapIcon },
  { key: "photography", icon: CameraIcon },
  { key: "music", icon: MusicalNoteIcon },
  { key: "health", icon: HeartIcon },
  { key: "ai", icon: CpuChipIcon },
  { key: "finance", icon: PresentationChartLineIcon },
];

export default function Categories() {
  const t = useTranslations("categories");

  // Duplicate categories for seamless infinite scroll
  const duplicatedCategories = [...categories, ...categories];

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Section Header */}
      <div className="container mx-auto px-4 lg:px-8 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-oxford dark:text-white mb-3">
            {t("title")}
          </h2>
          <p className="text-silver dark:text-gray-400 text-sm md:text-base">
            {t("subtitle")}
          </p>
        </motion.div>
      </div>

      {/* Scrolling Categories */}
      <div className="relative">
        {/* Left Shadow */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white via-white/80 dark:from-oxford dark:via-oxford/80 to-transparent z-10 pointer-events-none" />

        {/* Right Shadow */}
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white via-white/80 dark:from-oxford dark:via-oxford/80 to-transparent z-10 pointer-events-none" />

        {/* Scrolling Container */}
        <div className="flex overflow-hidden">
          <motion.div
            className="flex gap-6 py-4"
            animate={{
              x: [0, -50 * categories.length * 1.5],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 30,
                ease: "linear",
              },
            }}
          >
            {duplicatedCategories.map((category, index) => (
              <div
                key={`${category.key}-${index}`}
                className="flex-shrink-0 group cursor-pointer"
              >
                <div className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-oxford-light rounded-xl border border-gray-100 dark:border-white/10 hover:border-gold/50 dark:hover:border-gold/50 hover:shadow-lg hover:shadow-gold/10 transition-all duration-300">
                  <div className="w-10 h-10 bg-gold/10 dark:bg-gold/20 rounded-lg flex items-center justify-center group-hover:bg-gold group-hover:text-oxford transition-colors duration-300">
                    <category.icon className="w-5 h-5 text-gold group-hover:text-oxford" />
                  </div>
                  <span className="text-sm font-medium text-oxford dark:text-white whitespace-nowrap">
                    {t(`items.${category.key}`)}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
