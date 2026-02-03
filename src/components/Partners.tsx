"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "@/lib/i18n";

const partners = [
  {
    name: "Udemy",
    logo: "https://cdn.worldvectorlogo.com/logos/udemy-1.svg",
  },
  {
    name: "Coursera",
    logo: "https://cdn.worldvectorlogo.com/logos/coursera-2.svg",
  },
  {
    name: "edX",
    logo: "https://cdn.worldvectorlogo.com/logos/edx.svg",
  },
  {
    name: "Khan Academy",
    logo: "https://cdn.worldvectorlogo.com/logos/khan-academy-1.svg",
  },
  {
    name: "LinkedIn",
    logo: "https://cdn.worldvectorlogo.com/logos/linkedin-icon-2.svg",
  },
  {
    name: "Skillshare",
    logo: "https://cdn.worldvectorlogo.com/logos/skillshare.svg",
  },
  {
    name: "Pluralsight",
    logo: "https://cdn.worldvectorlogo.com/logos/pluralsight.svg",
  },
  {
    name: "Udacity",
    logo: "https://cdn.worldvectorlogo.com/logos/udacity-1.svg",
  },
];

export default function Partners() {
  const t = useTranslations("partners");

  // Duplicate partners for seamless infinite scroll
  const duplicatedPartners = [...partners, ...partners];

  return (
    <section className="py-16 relative overflow-hidden bg-gray-50 dark:bg-oxford-light/30">
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

      {/* Scrolling Partners */}
      <div className="relative">
        {/* Left Shadow */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 via-gray-50/80 dark:from-oxford-light/30 dark:via-oxford-light/20 to-transparent z-10 pointer-events-none" />

        {/* Right Shadow */}
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 via-gray-50/80 dark:from-oxford-light/30 dark:via-oxford-light/20 to-transparent z-10 pointer-events-none" />

        {/* Scrolling Container */}
        <div className="flex overflow-hidden">
          <motion.div
            className="flex items-center gap-16 py-6"
            animate={{
              x: [0, -200 * partners.length],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 40,
                ease: "linear",
              },
            }}
          >
            {duplicatedPartners.map((partner, index) => (
              <div
                key={`${partner.name}-${index}`}
                className="flex-shrink-0 group cursor-pointer"
              >
                <div className="flex items-center justify-center px-8 py-4 bg-white dark:bg-oxford-light rounded-xl border border-gray-100 dark:border-white/10 hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5 transition-all duration-300 h-20 min-w-[180px]">
                  <div className="relative h-8 w-32 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 dark:invert dark:brightness-200">
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
