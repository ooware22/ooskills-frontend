"use client";

import { motion } from "framer-motion";
import { UserPlusIcon as UserPlus, BookOpenIcon as BookOpen, TrophyIcon as Award, ArrowRightIcon as ArrowRight } from "@heroicons/react/24/outline";
import { useTranslations } from "@/lib/i18n";

export default function HowItWorks() {
  const t = useTranslations("howItWorks");

  const steps = [
    { 
      icon: UserPlus, 
      step: "01", 
      titleKey: "step1.title", 
      descKey: "step1.description" 
    },
    { 
      icon: BookOpen, 
      step: "02", 
      titleKey: "step2.title", 
      descKey: "step2.description" 
    },
    { 
      icon: Award, 
      step: "03", 
      titleKey: "step3.title", 
      descKey: "step3.description" 
    },
  ];

  return (
    <section id="how-it-works" className="py-24 relative">
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

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Connector Lines - Desktop only */}
          <div className="hidden md:flex absolute top-10 left-0 right-0 justify-center items-center z-0">
            <div className="w-full max-w-[600px] flex items-center">
              <div className="flex-1" />
              <div className="w-[180px] h-px bg-gray-200 dark:bg-white/10" />
              <div className="flex-1" />
              <div className="w-[180px] h-px bg-gray-200 dark:bg-white/10" />
              <div className="flex-1" />
            </div>
          </div>

          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative z-10"
            >
              <div className="text-center">
                {/* Step Number & Icon */}
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="w-20 h-20 bg-gold/10 rounded-2xl flex items-center justify-center">
                    <item.icon className="w-8 h-8 text-gold" />
                  </div>
                  <span className="absolute -top-2 -end-2 w-8 h-8 bg-oxford dark:bg-white text-white dark:text-oxford text-sm font-bold rounded-lg flex items-center justify-center">
                    {item.step}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-oxford dark:text-white mb-2">
                  {t(item.titleKey)}
                </h3>
                <p className="text-sm text-silver dark:text-gray-400 leading-relaxed">
                  {t(item.descKey)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-12"
        >
          <a
            href="#courses"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-oxford bg-gold hover:bg-gold-light rounded-lg transition-colors duration-200"
          >
            {t("cta")}
            <ArrowRight className="w-4 h-4 ms-2 rtl:rotate-180" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
