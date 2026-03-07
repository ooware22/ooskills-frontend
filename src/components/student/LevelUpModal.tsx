"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SparklesIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectShowLevelUp,
  selectGamification,
  dismissLevelUp,
  LEVEL_THRESHOLDS,
} from "@/store/slices/gamificationSlice";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useI18n } from "@/lib/i18n";

// ─── Confetti Canvas ─────────────────────────────────────────────────────────

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  life: number;
}

const CONFETTI_COLORS = [
  "#CFB53B", // gold
  "#E8D48A", // gold-light
  "#002147", // oxford
  "#003366", // oxford-light
  "#F59E0B", // amber
  "#22C55E", // green
  "#3B82F6", // blue
];

function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);

  const createParticles = useCallback(() => {
    const particles: Particle[] = [];
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: -20 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 4 + 2,
        size: Math.random() * 8 + 3,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
        life: 1,
      });
    }
    return particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particlesRef.current = createParticles();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.vy += 0.12; // gravity
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.life -= 0.003;
        p.opacity = Math.max(0, p.life);

        if (p.life <= 0 || p.y > canvas.height + 20) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }

      if (particles.length > 0) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [createParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10"
    />
  );
}

// ─── Level Up Modal ──────────────────────────────────────────────────────────

export default function LevelUpModal() {
  const dispatch = useAppDispatch();
  const show = useAppSelector(selectShowLevelUp);
  const { newLevel } = useAppSelector(selectGamification);
  const { playLevelUp } = useSoundEffects();
  const { t } = useI18n();
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    if (show && !hasPlayedRef.current) {
      playLevelUp();
      hasPlayedRef.current = true;
    }
    if (!show) {
      hasPlayedRef.current = false;
    }
  }, [show, playLevelUp]);

  const levelInfo = LEVEL_THRESHOLDS.find((l) => l.level === newLevel);
  const levelTitle = levelInfo
    ? t(levelInfo.titleKey) || levelInfo.titleFallback
    : "";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => dispatch(dismissLevelUp())}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Confetti */}
          <ConfettiCanvas />

          {/* Modal content */}
          <motion.div
            className="relative z-20 bg-white dark:bg-oxford-light rounded-2xl shadow-2xl border border-gold/20 dark:border-gold/15 p-8 max-w-sm w-full mx-4 text-center overflow-hidden"
            initial={{ scale: 0.5, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            {/* Close button */}
            <button
              onClick={() => dispatch(dismissLevelUp())}
              className="absolute top-3 right-3 p-1.5 text-silver hover:text-oxford dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent pointer-events-none" />

            {/* Icon */}
            <motion.div
              className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-lg shadow-gold/30"
              initial={{ rotate: -10 }}
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <SparklesIcon className="w-10 h-10 text-oxford" />
            </motion.div>

            {/* Title */}
            <motion.h2
              className="text-2xl font-bold text-oxford dark:text-white mb-1"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              {t("gamification.levelUp.title") || "Level Up!"}
            </motion.h2>

            {/* Level number */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 dark:bg-gold/15 mb-3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.25, stiffness: 400 }}
            >
              <span className="text-3xl font-black text-gold">{newLevel}</span>
              <span className="text-sm font-semibold text-gold/80">{levelTitle}</span>
            </motion.div>

            {/* Description */}
            <motion.p
              className="text-sm text-silver dark:text-white/50 mb-6"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              {t("gamification.levelUp.desc") ||
                "Congratulations! Keep learning to unlock more rewards."}
            </motion.p>

            {/* Continue button */}
            <motion.button
              onClick={() => dispatch(dismissLevelUp())}
              className="w-full py-3 bg-gold hover:bg-gold-light text-oxford font-semibold rounded-xl transition-colors shadow-md shadow-gold/20"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45 }}
              whileTap={{ scale: 0.97 }}
            >
              {t("gamification.levelUp.continue") || "Continue"}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
