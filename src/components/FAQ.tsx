"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon as ChevronDown, ChatBubbleLeftRightIcon as MessageCircle } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/i18n";
import type { PublicFAQSectionData } from "@/types/content";

const staticFaqKeys = ["q1", "q2", "q3", "q4", "q5"];

interface FAQProps {
  data?: PublicFAQSectionData | null;
}

export default function FAQ({ data }: FAQProps) {
  const t = useTranslations("faq");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Determine if we have API data
  const hasApiData = data && data.items && data.items.length > 0;
  
  // Use API title/subtitle if available, otherwise fall back to i18n
  const sectionTitle = data?.title || t("title");
  const sectionSubtitle = data?.subtitle || t("subtitle");


  return (
    <section id="faq" className="py-24 relative bg-gray-50 dark:bg-oxford-light/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-5 gap-12 items-start">
          {/* Left Column - Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 lg:sticky lg:top-32"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-oxford dark:text-white tracking-tight mb-4">
              {sectionTitle}
            </h2>
            <p className="text-silver dark:text-gray-400 mb-8">
              {sectionSubtitle}
            </p>

            {/* Contact CTA */}
            <div className="p-6 bg-white dark:bg-oxford-light rounded-xl border border-gray-100 dark:border-white/5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-sm text-silver dark:text-gray-400 mb-2">
                    {t("moreQuestions")}
                  </p>
                  <a
                    href="#contact"
                    className="text-sm font-medium text-gold hover:underline"
                  >
                    {t("contactUs")}
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Accordion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-3 space-y-3"
          >
            {hasApiData ? (
              // Render from API data
              data.items.map((faqItem, index) => (
                <motion.div
                  key={faqItem.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={cn(
                    "rounded-xl border transition-all duration-300",
                    openIndex === index
                      ? "border-gold bg-white dark:bg-oxford-light shadow-lg"
                      : "border-gray-200 dark:border-white/10 bg-white dark:bg-oxford-light hover:border-gold/50"
                  )}
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full flex items-center gap-4 p-5 text-start group"
                  >
                    <div 
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold transition-all duration-300",
                        openIndex === index 
                          ? "bg-gold text-oxford" 
                          : "bg-gray-100 dark:bg-white/10 text-silver group-hover:bg-gold/20 group-hover:text-gold"
                      )}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <span 
                      className={cn(
                        "flex-1 text-sm font-medium transition-colors duration-300",
                        openIndex === index 
                          ? "text-oxford dark:text-white" 
                          : "text-oxford/80 dark:text-white/80"
                      )}
                    >
                      {faqItem.question}
                    </span>
                    <ChevronDown 
                      className={cn(
                        "w-5 h-5 transition-all duration-300 flex-shrink-0",
                        openIndex === index 
                          ? "text-gold rotate-180" 
                          : "text-silver"
                      )}
                    />
                  </button>
                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 ps-[4rem] text-sm text-silver dark:text-gray-400 leading-relaxed">
                          {faqItem.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            ) : (
              // Fallback to i18n static FAQ keys
              staticFaqKeys.map((faq, index) => (
                <motion.div
                  key={faq}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={cn(
                    "rounded-xl border transition-all duration-300",
                    openIndex === index
                      ? "border-gold bg-white dark:bg-oxford-light shadow-lg"
                      : "border-gray-200 dark:border-white/10 bg-white dark:bg-oxford-light hover:border-gold/50"
                  )}
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full flex items-center gap-4 p-5 text-start group"
                  >
                    <div 
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold transition-all duration-300",
                        openIndex === index 
                          ? "bg-gold text-oxford" 
                          : "bg-gray-100 dark:bg-white/10 text-silver group-hover:bg-gold/20 group-hover:text-gold"
                      )}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <span 
                      className={cn(
                        "flex-1 text-sm font-medium transition-colors duration-300",
                        openIndex === index 
                          ? "text-oxford dark:text-white" 
                          : "text-oxford/80 dark:text-white/80"
                      )}
                    >
                      {t(`items.${faq}.question`)}
                    </span>
                    <ChevronDown 
                      className={cn(
                        "w-5 h-5 transition-all duration-300 flex-shrink-0",
                        openIndex === index 
                          ? "text-gold rotate-180" 
                          : "text-silver"
                      )}
                    />
                  </button>
                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 ps-[4rem] text-sm text-silver dark:text-gray-400 leading-relaxed">
                          {t(`items.${faq}.answer`)}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
