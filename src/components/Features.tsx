"use client";

import { motion } from "framer-motion";
import {
  TrophyIcon as Award,
  ClockIcon as Clock,
  PhoneIcon as HeadphonesIcon,
  SparklesIcon as Sparkles,
  ArrowTrendingUpIcon as TrendingUp,
  WalletIcon as Wallet,
} from "@heroicons/react/24/outline";
import { useTranslations } from "@/lib/i18n";

const icons = {
  quality: Sparkles,
  flexible: Clock,
  certificate: Award,
  support: HeadphonesIcon,
  affordable: Wallet,
  progress: TrendingUp,
};

const featureKeys = ["quality", "flexible", "certificate", "support", "affordable", "progress"];

export default function Features() {
  const t = useTranslations("features");

  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-oxford dark:text-white tracking-tight mb-4">
            {t("title")}
          </h2>
          <p className="text-silver dark:text-gray-400">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureKeys.map((feature, index) => {
            const Icon = icons[feature as keyof typeof icons];
            return (
              <motion.div
                key={feature}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group p-6 bg-white dark:bg-oxford-light rounded-xl border border-gray-100 dark:border-white/5 hover:border-gold/30 dark:hover:border-gold/30 hover:shadow-xl hover:shadow-gold/5 dark:hover:shadow-gold/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div className="w-10 h-10 bg-gold/10 group-hover:bg-gold/20 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-gold/20">
                  <Icon className="w-5 h-5 text-gold group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-lg font-semibold text-oxford dark:text-white mb-2 group-hover:text-gold transition-colors duration-300">
                  {t(`items.${feature}.title`)}
                </h3>
                <p className="text-sm text-silver dark:text-gray-400 leading-relaxed">
                  {t(`items.${feature}.description`)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
