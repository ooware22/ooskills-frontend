"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Rocket, Bell } from "lucide-react";
import { useTranslations } from "@/lib/i18n";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function Countdown() {
  const t = useTranslations("countdown");
  const launchDate = new Date("2026-05-01T00:00:00");
  
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = launchDate.getTime() - now.getTime();
      
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeUnits = [
    { key: "days", value: timeLeft.days, labelKey: "days" },
    { key: "hours", value: timeLeft.hours, labelKey: "hours" },
    { key: "minutes", value: timeLeft.minutes, labelKey: "minutes" },
    { key: "seconds", value: timeLeft.seconds, labelKey: "seconds" },
  ];

  if (!mounted) {
    return null;
  }

  return (
    <section className="py-16 bg-oxford dark:bg-oxford-light relative overflow-hidden">
      {/* Subtle background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gold/10 rounded-2xl mb-6">
            <Rocket className="w-7 h-7 text-gold" />
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            {t("title")}
          </h2>
          <p className="text-white/60 mb-10 text-sm md:text-base">
            {t("subtitle")}
          </p>

          {/* Countdown Grid */}
          <div className="flex justify-center gap-3 md:gap-6 mb-10">
            {timeUnits.map((unit, index) => (
              <motion.div
                key={unit.key}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 md:w-24 md:h-24 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl flex items-center justify-center mb-2">
                  <span className="text-2xl md:text-4xl font-bold text-white tabular-nums">
                    {unit.value.toString().padStart(2, '0')}
                  </span>
                </div>
                <span className="text-xs md:text-sm text-white/50 uppercase tracking-wider">
                  {t(unit.labelKey)}
                </span>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gold hover:bg-gold-light text-oxford text-sm font-medium rounded-lg transition-colors duration-200"
            >
              <Bell className="w-4 h-4" />
              {t("cta")}
            </a>
          </motion.div>

          {/* Launch Date */}
          <p className="mt-6 text-xs text-white/40">
            {t("launchDate")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
