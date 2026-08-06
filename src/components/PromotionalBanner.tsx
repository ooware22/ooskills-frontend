"use client";

import { useEffect, useState, useRef } from "react";
import publicCoursesApi from "@/services/publicCoursesApi";
import { useI18n } from "@/lib/i18n";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SparklesIcon, XMarkIcon } from "@heroicons/react/24/outline";

export interface MarketingCampaign {
  id: string;
  name: string;
  title: Record<string, string>;
  subtitle: Record<string, string>;
  discount_percentage: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  show_countdown: boolean;
}

export default function PromotionalBanner() {
  const { locale } = useI18n();
  const pathname = usePathname();
  const [campaign, setCampaign] = useState<MarketingCampaign | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only the landing page and a course's own detail page should show the
    // banner — not the catalog list, dashboard, admin, learn player, auth, etc.
    const isAllowedPage =
      pathname === "/" || /^\/courses\/[^/]+$/.test(pathname || "");

    if (!campaign || !isVisible || !isAllowedPage || !bannerRef.current) {
      document.documentElement.style.setProperty("--banner-height", "0px");
      return;
    }

    const updateHeight = () => {
      if (bannerRef.current) {
        const height = bannerRef.current.offsetHeight;
        document.documentElement.style.setProperty("--banner-height", `${height}px`);
      }
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(bannerRef.current);

    return () => {
      resizeObserver.disconnect();
      document.documentElement.style.setProperty("--banner-height", "0px");
    };
  }, [campaign, isVisible, pathname]);

  useEffect(() => {
    publicCoursesApi.getActiveCampaign().then((data) => {
      if (data) {
        setCampaign(data);
      }
    });
  }, []);

  useEffect(() => {
    if (!campaign || !campaign.end_date || !campaign.show_countdown) return;

    const targetTime = new Date(campaign.end_date).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft(null);
        setCampaign(null); // Hide campaign when expired
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [campaign]);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const isAllowedPage =
    pathname === "/" || /^\/courses\/[^/]+$/.test(pathname || "");

  if (!isVisible || !campaign || !isAllowedPage) {
    return null;
  }

  const title = campaign.title[locale] || campaign.title["fr"] || campaign.name;
  const subtitle = campaign.subtitle[locale] || campaign.subtitle["fr"] || "";

  return (
    <AnimatePresence>
      <motion.div
        ref={bannerRef}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="w-full bg-gradient-to-r from-oxford via-oxford-light to-gold/90 text-white relative z-50 shadow-md border-b border-gold/20"
      >
        <div className="container mx-auto px-4 py-2 flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 min-h-[40px] text-center">
          <div className="flex items-center justify-center gap-2 text-xs md:text-sm font-medium">
            <SparklesIcon className="w-4 h-4 text-gold animate-pulse flex-shrink-0" />
            <span className="font-semibold text-gold tracking-wide">{title}</span>
            {subtitle && <span className="text-gray-300 hidden sm:inline">|</span>}
            {subtitle && <span className="text-gray-200 text-xs md:text-sm">{subtitle}</span>}
          </div>

          {timeLeft && (
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold bg-black/35 backdrop-blur-sm border border-white/10 rounded-lg px-2.5 py-0.5 shadow-inner">
              <span className="text-gold/90 font-mono tracking-wider">ENDS IN:</span>
              <div className="flex items-center gap-0.5 font-mono text-[11px] md:text-xs">
                <span className="bg-white/10 px-1 py-0.5 rounded text-white min-w-[20px]">
                  {String(timeLeft.hours).padStart(2, "0")}
                </span>
                <span className="text-gold">:</span>
                <span className="bg-white/10 px-1 py-0.5 rounded text-white min-w-[20px]">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </span>
                <span className="text-gold">:</span>
                <span className="bg-white/10 px-1 py-0.5 rounded text-white min-w-[20px]">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleDismiss}
            aria-label="Dismiss banner"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
