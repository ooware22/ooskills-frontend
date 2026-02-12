"use client";

import { motion } from "framer-motion";
import { ArrowRightIcon as ArrowRight, ClockIcon as Clock, ChartBarIcon as BarChart2, UserGroupIcon as Users } from "@heroicons/react/24/outline";
import { StarIcon as Star } from "@heroicons/react/24/solid";
import { useTranslations } from "@/lib/i18n";
import Image from "next/image";
import Link from "next/link";

const courseKeys = ["excel", "web", "python", "communication"];

const courseImages: Record<string, string> = {
  excel: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&h=400&fit=crop",
  web: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&h=400&fit=crop",
  python: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&h=400&fit=crop",
  communication: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
};

export default function Courses() {
  const t = useTranslations("courses");

  return (
    <section id="courses" className="py-24 relative bg-gray-50 dark:bg-oxford-light/30">
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

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courseKeys.map((course, index) => (
            <motion.div
              key={course}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group bg-white dark:bg-oxford-light rounded-xl border border-gray-100 dark:border-white/5 overflow-hidden hover:border-gold/30 dark:hover:border-gold/30 hover:shadow-xl hover:shadow-gold/10 dark:hover:shadow-gold/15 hover:-translate-y-2 transition-all duration-300 cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-gray-100 dark:bg-oxford relative overflow-hidden">
                <Image
                  src={courseImages[course]}
                  alt={t(`items.${course}.title`)}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                />
                {/* Overlay gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-oxford/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Content */}
              <div className="p-5">
                {/* Category Badge */}
                <div className="inline-block px-2.5 py-1 bg-gold/10 dark:bg-gold/15 text-gold text-xs font-medium rounded-full mb-3 group-hover:bg-gold group-hover:text-oxford transition-colors duration-300">
                  {t(`items.${course}.category`)}
                </div>
                <h3 className="font-semibold text-oxford dark:text-white mb-3 line-clamp-2 group-hover:text-gold transition-colors duration-300">
                  {t(`items.${course}.title`)}
                </h3>

                <div className="flex items-center gap-4 text-xs text-silver mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{t(`items.${course}.duration`)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BarChart2 className="w-3.5 h-3.5" />
                    <span>{t(`items.${course}.level`)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5 group-hover:border-gold/20 transition-colors duration-300">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                    <span className="text-xs font-medium text-oxford dark:text-white">4.9</span>
                    <span className="text-xs text-silver">(128)</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-silver">
                    <Users className="w-3.5 h-3.5" />
                    <span>2.4k</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mt-12"
        >
          <Link 
            href="/courses" 
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-oxford hover:bg-oxford-light dark:bg-white dark:text-oxford dark:hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            {t("viewAll")}
            <ArrowRight className="w-4 h-4 ms-2 rtl:rotate-180" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
