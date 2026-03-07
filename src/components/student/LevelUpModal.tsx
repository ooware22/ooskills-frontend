"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
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
  shape: "rect" | "circle" | "star";
}

const CONFETTI_COLORS = [
  "#CFB53B",
  "#E8D48A",
  "#F59E0B",
  "#FBBF24",
  "#22C55E",
  "#3B82F6",
  "#A855F7",
  "#EC4899",
  "#FFFFFF",
];

function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);

  const createParticles = useCallback(() => {
    const particles: Particle[] = [];
    for (let i = 0; i < 150; i++) {
      const shapes: Particle["shape"][] = ["rect", "circle", "star"];
      particles.push({
        x: Math.random() * window.innerWidth,
        y: -20 - Math.random() * 200,
        vx: (Math.random() - 0.5) * 10,
        vy: Math.random() * 5 + 2,
        size: Math.random() * 8 + 3,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        life: 1,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
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

    const drawStar = (
      ctx: CanvasRenderingContext2D,
      size: number,
    ) => {
      const spikes = 5;
      const outerR = size;
      const innerR = size * 0.4;
      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (i * Math.PI) / spikes - Math.PI / 2;
        if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
        else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
      }
      ctx.closePath();
      ctx.fill();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.vx *= 0.99;
        p.vy += 0.12;
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

        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === "star") {
          drawStar(ctx, p.size / 2);
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        }
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

// ─── Orbiting Ring Particles ─────────────────────────────────────────────────

function OrbitParticle({ delay, size, orbit, duration }: { delay: number; size: number; orbit: number; duration: number }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        background: "radial-gradient(circle, #CFB53B, #E8D48A)",
        boxShadow: `0 0 ${size * 2}px #CFB53B`,
        left: "50%",
        top: "50%",
      }}
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        x: [0, orbit, 0, -orbit, 0],
        y: [-orbit, 0, orbit, 0, -orbit],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
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

  // Dynamic tier styling
  const isMaxTier = newLevel >= 10;
  const isHighTier = newLevel >= 7;
  const isMidTier = newLevel >= 4;

  const tierGradient = isMaxTier
    ? "from-amber-400 via-yellow-300 to-orange-500"
    : isHighTier
      ? "from-gold via-amber-400 to-gold-light"
      : isMidTier
        ? "from-blue-400 via-cyan-400 to-blue-500"
        : "from-emerald-400 via-teal-400 to-emerald-500";

  const tierGlow = isMaxTier
    ? "shadow-amber-500/40"
    : isHighTier
      ? "shadow-gold/40"
      : isMidTier
        ? "shadow-blue-500/30"
        : "shadow-emerald-500/30";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop with radial glow */}
          <motion.div
            className="absolute inset-0"
            onClick={() => dispatch(dismissLevelUp())}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background:
                "radial-gradient(circle at 50% 40%, rgba(207,181,59,0.15) 0%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.85) 100%)",
              backdropFilter: "blur(8px)",
            }}
          />

          {/* Confetti */}
          <ConfettiCanvas />

          {/* Modal content */}
          <motion.div
            className="relative z-20 max-w-sm w-full mx-4 text-center"
            initial={{ scale: 0.3, opacity: 0, y: 60 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 40 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
          >
            {/* Close button */}
            <button
              onClick={() => dispatch(dismissLevelUp())}
              className="absolute -top-2 -end-2 z-30 p-2 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            {/* ── Floating Level Badge ─────────────────────── */}
            <div className="relative mx-auto mb-6" style={{ width: 140, height: 140 }}>
              {/* Orbiting particles */}
              <OrbitParticle delay={0} size={4} orbit={75} duration={3} />
              <OrbitParticle delay={0.5} size={3} orbit={70} duration={2.5} />
              <OrbitParticle delay={1} size={5} orbit={80} duration={3.5} />
              <OrbitParticle delay={1.5} size={3} orbit={65} duration={2.8} />

              {/* Outer glow ring */}
              <motion.div
                className={`absolute inset-0 rounded-full bg-gradient-to-br ${tierGradient} opacity-20`}
                animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{ filter: "blur(20px)" }}
              />

              {/* Rotating arc ring */}
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              >
                <svg viewBox="0 0 140 140" className="w-full h-full">
                  <defs>
                    <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#CFB53B" stopOpacity="1" />
                      <stop offset="50%" stopColor="#E8D48A" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#CFB53B" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="70"
                    cy="70"
                    r="65"
                    fill="none"
                    stroke="url(#arcGrad)"
                    strokeWidth="2"
                    strokeDasharray="120 280"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.div>

              {/* Inner circle badge */}
              <motion.div
                className={`absolute inset-4 rounded-full bg-gradient-to-br ${tierGradient} flex items-center justify-center shadow-2xl ${tierGlow}`}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.2, stiffness: 200, damping: 12 }}
              >
                {/* Inner dark circle with level number */}
                <div className="w-[85%] h-[85%] rounded-full bg-[#0a1628] flex flex-col items-center justify-center border-2 border-white/10">
                  <motion.span
                    className="text-4xl font-black bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent leading-none"
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                  >
                    {newLevel}
                  </motion.span>
                  <motion.span
                    className="text-[10px] font-bold text-gold/80 uppercase tracking-[0.2em] mt-0.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    Level
                  </motion.span>
                </div>
              </motion.div>
            </div>

            {/* ── Card body ────────────────────────────────── */}
            <motion.div
              className="relative bg-[#0d1b30]/90 backdrop-blur-xl rounded-2xl border border-white/10 px-8 py-7 overflow-hidden"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent pointer-events-none rounded-2xl" />
              <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

              {/* Title */}
              <motion.h2
                className="text-2xl font-bold text-white mb-1 relative"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {t("gamification.levelUp.title") || "Level Up!"}
              </motion.h2>

              {/* Level title pill */}
              <motion.div
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r ${tierGradient} mb-4`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", delay: 0.5, stiffness: 300 }}
              >
                <span className="text-sm font-bold text-[#0a1628]">{levelTitle}</span>
              </motion.div>

              {/* Description */}
              <motion.p
                className="text-sm text-white/50 mb-6 relative leading-relaxed"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.55 }}
              >
                {t("gamification.levelUp.desc") ||
                  "Congratulations! Keep learning to unlock more rewards."}
              </motion.p>

              {/* Continue button */}
              <motion.button
                onClick={() => dispatch(dismissLevelUp())}
                className={`relative w-full py-3.5 rounded-xl font-bold text-[#0a1628] text-sm bg-gradient-to-r ${tierGradient} transition-all duration-300 overflow-hidden group`}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.65 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ x: "200%" }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                />
                <span className="relative">
                  {t("gamification.levelUp.continue") || "Continue"}
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
