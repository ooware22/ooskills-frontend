"use client";

import { motion } from "framer-motion";
import {
  ArrowRightIcon as ArrowRight,
  PlayIcon as Play,
  UserGroupIcon as Users,
  BookOpenIcon as BookOpen,
  TrophyIcon as Award,
  StarIcon as Star,
  CheckCircleIcon as CheckCircle2,
  AcademicCapIcon as GraduationCap,
  ComputerDesktopIcon as Monitor,
  RocketLaunchIcon as Rocket,
  BoltIcon as Zap,
  TrophyIcon as Trophy,
  CursorArrowRaysIcon as Target,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { useTranslations } from "@/lib/i18n";

export default function Hero() {
  const t = useTranslations("hero");

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center pt-20 pb-16 md:pb-0 overflow-hidden"
    >
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center lg:text-start"
          >
            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-oxford dark:text-white leading-[1.1] tracking-tight mb-6">
              {t("title")}{" "}
              <span className="relative inline-block text-gold">
                {t("titleHighlight")}
                {/* Creative Animated Underline */}
                <motion.svg
                  className="absolute -bottom-2 start-0 w-full h-3"
                  viewBox="0 0 200 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                >
                  <motion.path
                    d="M2 8C30 4 60 2 100 6C140 10 170 4 198 8"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                  />
                </motion.svg>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base md:text-lg text-silver dark:text-gray-400 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              {t("subtitle")}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-10">
              <a
                href="#courses"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-oxford bg-gold hover:bg-gold-light rounded-lg transition-colors duration-200 shadow-sm"
              >
                {t("cta")}
                <ArrowRight className="w-4 h-4 ms-2 rtl:rotate-180" />
              </a>
              <a
                href="#features"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-oxford dark:text-white border border-oxford/20 dark:border-white/20 hover:bg-oxford/5 dark:hover:bg-white/5 rounded-lg transition-colors duration-200"
              >
                <Play className="w-4 h-4 me-2" />
                {t("ctaSecondary")}
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 justify-center lg:justify-start text-sm text-silver">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold" />
                <span>{t("trustIndicator1") || "شهادات معتمدة"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold" />
                <span>{t("trustIndicator2") || "خبراء محترفون"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gold" />
                <span>{t("trustIndicator3") || "دعم مستمر"}</span>
              </div>
            </div>
          </motion.div>

          {/* Hero Visual - Inclined Floating macOS Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateX: 25, rotateY: -15 }}
            animate={{
              opacity: 1,
              scale: 1,
              rotateX: 8,
              rotateY: -5,
              y: [0, -10, 0],
            }}
            transition={{
              opacity: { duration: 0.6, delay: 0.2 },
              scale: { duration: 0.8, delay: 0.2, ease: "easeOut" },
              rotateX: { duration: 0.8, delay: 0.2, ease: "easeOut" },
              rotateY: { duration: 0.8, delay: 0.2, ease: "easeOut" },
              y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 },
            }}
            style={{ perspective: "1200px", transformStyle: "preserve-3d" }}
            className="relative"
          >
            {/* Dynamic Glow Effect */}
            <motion.div
              className="absolute -inset-12 bg-gradient-to-br from-gold/20 via-purple-500/10 to-blue-500/10 rounded-3xl blur-3xl"
              animate={{
                opacity: [0.3, 0.5, 0.3],
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Main macOS Window - Now with 3D shadow */}
            <motion.div
              className="relative bg-white dark:bg-oxford rounded-2xl border border-gray-200 dark:border-gold/10 overflow-hidden"
              style={{
                boxShadow:
                  "0 50px 100px -20px rgba(0,0,0,0.25), 0 30px 60px -30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              {/* macOS Window Header */}
              <div className="px-4 py-3 bg-gray-50 dark:bg-oxford-light/50 border-b border-gray-100 dark:border-gold/5 flex items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#28ca42]" />
                </div>
              </div>

              {/* Creative Banner - #1 Badge */}
              <motion.div
                className="relative bg-gradient-to-r from-gold via-gold-light to-gold overflow-hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                {/* Animated Shine Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ x: "200%" }}
                  transition={{
                    duration: 2,
                    delay: 1.2,
                    repeat: Infinity,
                    repeatDelay: 4,
                  }}
                />
                <div className="relative px-4 py-2 flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
                    transition={{
                      duration: 1,
                      delay: 1.5,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  >
                    <Trophy className="w-5 h-5 text-oxford" />
                  </motion.div>
                  <span className="text-xs font-bold text-oxford tracking-wide">
                    {t("badge")}
                  </span>
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                    transition={{
                      duration: 1,
                      delay: 1.7,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  >
                    <Target className="w-5 h-5 text-oxford" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Window Content with Sidebar */}
              <div className="flex">
                {/* Minimal Sidebar */}
                <motion.div
                  className="w-14 bg-gray-50 dark:bg-oxford-light/50 border-e border-gray-100 dark:border-gold/5 py-4 flex flex-col items-center gap-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="w-8 h-8 bg-gold/10 dark:bg-gold/20 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-gold" />
                  </div>
                  <div className="w-8 h-8 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg flex items-center justify-center transition-colors">
                    <Award className="w-4 h-4 text-gray-400 dark:text-white/40" />
                  </div>
                  <div className="w-8 h-8 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg flex items-center justify-center transition-colors">
                    <Users className="w-4 h-4 text-gray-400 dark:text-white/40" />
                  </div>
                </motion.div>

                {/* Main Content Area */}
                <div className="flex-1 p-5 bg-white dark:bg-oxford">
                  {/* Course Card */}
                  <motion.div
                    className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 mb-4 border border-gray-100 dark:border-white/5"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-gold to-gold-light rounded-xl flex items-center justify-center shadow-sm">
                        <BookOpen className="w-6 h-6 text-oxford" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-oxford dark:text-white text-sm mb-0.5">
                          {t("illustrationTitle")}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-white/40">
                          {t("illustrationSubtitle")}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                        <span className="text-oxford dark:text-white font-medium">
                          4.9
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Progress Bar */}
                  <motion.div
                    className="mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-gray-500 dark:text-white/40">
                        {t("progressLabel")}
                      </span>
                      <span className="font-semibold text-gold">67%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "67%" }}
                        transition={{
                          duration: 1.2,
                          delay: 0.8,
                          ease: "easeOut",
                        }}
                        className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full"
                      />
                    </div>
                  </motion.div>

                  {/* Course List - Minimalistic */}
                  <div className="space-y-2">
                    {[
                      { label: "Introduction", progress: 100, color: "green" },
                      { label: "Module 1", progress: 80, color: "blue" },
                      { label: "Module 2", progress: 30, color: "purple" },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + i * 0.1 }}
                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            item.color === "green"
                              ? "bg-green-100 dark:bg-green-500/20"
                              : item.color === "blue"
                                ? "bg-blue-100 dark:bg-blue-500/20"
                                : "bg-purple-100 dark:bg-purple-500/20"
                          }`}
                        >
                          <CheckCircle2
                            className={`w-3.5 h-3.5 ${
                              item.color === "green"
                                ? "text-green-500"
                                : item.color === "blue"
                                  ? "text-blue-500"
                                  : "text-purple-500"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="h-2 bg-gray-200 dark:bg-white/10 rounded w-20 mb-1" />
                          <div className="h-1.5 bg-gray-100 dark:bg-white/5 rounded w-12" />
                        </div>
                        <span className="text-[10px] text-gray-400 dark:text-white/30 opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.progress}%
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
            {/* Creative Floating Elements - Orbiting Bubbles */}

            {/* Bubble 1 - Certificate Badge (Top Right) */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: [0, -15, 0],
                x: [0, 5, 0],
              }}
              transition={{
                opacity: { delay: 1.0, duration: 0.4 },
                scale: { delay: 1.0, duration: 0.5, type: "spring" },
                y: {
                  delay: 1.5,
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                x: {
                  delay: 1.5,
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              className="hidden lg:block absolute -top-8 end-8 z-20"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-gold to-amber-400 rounded-2xl shadow-lg flex items-center justify-center rotate-12">
                <GraduationCap className="w-8 h-8 text-oxford" />
              </div>
            </motion.div>

            {/* Bubble 2 - Code Symbol (Middle Right) */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: [0, 10, 0],
                rotate: [0, 5, 0],
              }}
              transition={{
                opacity: { delay: 1.2, duration: 0.4 },
                scale: { delay: 1.2, duration: 0.5, type: "spring" },
                y: {
                  delay: 1.7,
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                rotate: {
                  delay: 1.7,
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              className="hidden lg:block absolute top-1/3 -end-10 z-20"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl shadow-lg flex items-center justify-center -rotate-6">
                <Monitor className="w-7 h-7 text-white" />
              </div>
            </motion.div>

            {/* Bubble 3 - Star Rating (Bottom Right) */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: [0, -8, 0],
              }}
              transition={{
                opacity: { delay: 1.4, duration: 0.4 },
                scale: { delay: 1.4, duration: 0.5, type: "spring" },
                y: {
                  delay: 1.9,
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              className="hidden lg:block absolute -bottom-4 end-12 z-20"
            >
              <div className="bg-white dark:bg-oxford-light rounded-full shadow-lg px-4 py-2 flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-gold fill-gold" />
                  ))}
                </div>
                <span className="text-xs font-bold text-oxford dark:text-white">
                  4.9
                </span>
              </div>
            </motion.div>

            {/* Bubble 4 - Rocket (Bottom Left) */}
            <motion.div
              initial={{ opacity: 0, scale: 0, y: 50 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: [0, -20, 0],
                rotate: [-15, -10, -15],
              }}
              transition={{
                opacity: { delay: 1.1, duration: 0.4 },
                scale: { delay: 1.1, duration: 0.5, type: "spring" },
                y: {
                  delay: 1.6,
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                rotate: {
                  delay: 1.6,
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              className="hidden lg:block absolute -bottom-10 -start-6 z-20"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg flex items-center justify-center">
                <Rocket className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            {/* Bubble 5 - Lightning (Top Left) */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: [0, 12, 0],
                x: [0, -5, 0],
              }}
              transition={{
                opacity: { delay: 1.3, duration: 0.4 },
                scale: { delay: 1.3, duration: 0.5, type: "spring" },
                y: {
                  delay: 1.8,
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                x: {
                  delay: 1.8,
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              className="hidden lg:block absolute -top-4 -start-8 z-20"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg flex items-center justify-center rotate-12">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
