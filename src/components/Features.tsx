"use client";

import { motion } from "framer-motion";
import {
  TrophyIcon as Award,
  ClockIcon as Clock,
  PhoneIcon as HeadphonesIcon,
  SparklesIcon as Sparkles,
  ArrowTrendingUpIcon as TrendingUp,
  WalletIcon as Wallet,
  ComputerDesktopIcon as Monitor,
  UsersIcon as Users,
  BoltIcon as Zap,
  ShieldCheckIcon as Shield,
  RocketLaunchIcon as Rocket,
  BookOpenIcon as BookOpen,
  StarIcon as Star,
  HeartIcon as Heart,
  CheckCircleIcon as CheckCircle,
  MapPinIcon as Target,
} from "@heroicons/react/24/outline";
import { useTranslations } from "@/lib/i18n";
import type { PublicFeaturesSectionData, IconValue } from "@/types/content";

// Icon mapping for lucide icon names from backend
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  // Core feature icons (matching admin panel options)
  monitor: Monitor,
  users: Users,
  award: Award,
  zap: Zap,
  clock: Clock,
  shield: Shield,
  target: Target,
  rocket: Rocket,
  "book-open": BookOpen,
  bookopen: BookOpen,
  star: Star,
  heart: Heart,
  "check-circle": CheckCircle,
  checkcircle: CheckCircle,
  // Additional mappings for backward compatibility
  quality: Sparkles,
  sparkles: Sparkles,
  flexible: Clock,
  certificate: Award,
  trophy: Award,
  support: HeadphonesIcon,
  phone: HeadphonesIcon,
  headphones: HeadphonesIcon,
  affordable: Wallet,
  wallet: Wallet,
  progress: TrendingUp,
  "trending-up": TrendingUp,
};

// Helper to get icon component from API icon value or fallback
function getIconComponent(icon?: IconValue | string): React.ComponentType<{ className?: string }> {
  if (!icon) return Sparkles;
  
  // Handle IconValue from API
  if (typeof icon === 'object' && icon.type === 'lucide') {
    const iconName = icon.value.toLowerCase().replace(/icon$/i, '');
    return iconMap[iconName] || Sparkles;
  }
  
  // Handle string key (for backward compat with static data)
  if (typeof icon === 'string') {
    return iconMap[icon.toLowerCase()] || Sparkles;
  }
  
  return Sparkles;
}

const defaultFeatureKeys = ["quality", "flexible", "certificate", "support", "affordable", "progress"];

interface FeaturesProps {
  data?: PublicFeaturesSectionData | null;
}

export default function Features({ data }: FeaturesProps) {
  const t = useTranslations("features");

  // Use API data if available
  const sectionTitle = data?.title || t("title");
  const sectionSubtitle = data?.subtitle || t("subtitle");
  const hasApiItems = data?.items && data.items.length > 0;


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
            {sectionTitle}
          </h2>
          <p className="text-silver dark:text-gray-400">
            {sectionSubtitle}
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hasApiItems ? (
            // Render from API data
            data!.items.map((item, index) => {
              const Icon = getIconComponent(item.icon);
              return (
                <motion.div
                  key={item.id}
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
                    {item.title}
                  </h3>
                  <p className="text-sm text-silver dark:text-gray-400 leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              );
            })
          ) : (
            // Fallback to i18n static features
            defaultFeatureKeys.map((feature, index) => {
              const Icon = getIconComponent(feature);
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
            })
          )}
        </div>
      </div>
    </section>
  );
}
