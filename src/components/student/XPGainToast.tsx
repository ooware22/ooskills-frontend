"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectXPGainQueue, dismissXPGain } from "@/store/slices/gamificationSlice";
import { useSoundEffects } from "@/hooks/useSoundEffects";

// Individual sparkle particle
function Sparkle({ delay, x, y }: { delay: number; x: number; y: number }) {
  return (
    <motion.div
      className="absolute w-1.5 h-1.5 rounded-full"
      style={{
        background: `radial-gradient(circle, #FFD700 0%, #CFB53B 100%)`,
        left: "50%",
        top: "50%",
        boxShadow: "0 0 4px #FFD700",
      }}
      initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
      animate={{
        x: [0, x * 0.4, x],
        y: [0, y * 0.3 - 10, y - 20],
        opacity: [0, 1, 0],
        scale: [0, 1.5, 0],
      }}
      transition={{
        duration: 0.7,
        delay,
        ease: "easeOut",
      }}
    />
  );
}

// Animated counter that counts up from 0
function CountUpNumber({ target }: { target: number }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.span
        initial={{ filter: "blur(4px)" }}
        animate={{ filter: "blur(0px)" }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        +{target}
      </motion.span>
    </motion.span>
  );
}

function XPFloater({
  id,
  amount,
  label,
  onDismiss,
  index,
}: {
  id: string;
  amount: number;
  label: string;
  onDismiss: (id: string) => void;
  index: number;
}) {
  const { playXPGain } = useSoundEffects();

  useEffect(() => {
    playXPGain();
    const timer = setTimeout(() => onDismiss(id), 3000);
    return () => clearTimeout(timer);
  }, [id, onDismiss, playXPGain]);

  // Generate sparkle positions in a burst pattern
  const sparkles = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    return {
      x: Math.cos(angle) * (20 + Math.random() * 10),
      y: Math.sin(angle) * (15 + Math.random() * 8),
      delay: i * 0.03,
    };
  });

  return (
    <motion.div
      layout
      className="relative flex flex-col items-center pointer-events-none"
      initial={{ opacity: 0, y: 10, scale: 0.3 }}
      animate={{ opacity: 1, y: -(index * 50 + 10), scale: 1 }}
      exit={{ opacity: 0, y: -80, scale: 0.5, filter: "blur(4px)" }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 15,
        scale: { type: "spring", stiffness: 500, damping: 12 },
      }}
    >
      {/* Glow backdrop */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(207,181,59,0.3) 0%, transparent 70%)",
          width: 80,
          height: 40,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.5, 1.2], opacity: [0, 0.8, 0.4] }}
        transition={{ duration: 0.5 }}
      />

      {/* Sparkle burst */}
      {sparkles.map((s, i) => (
        <Sparkle key={i} delay={s.delay} x={s.x} y={s.y} />
      ))}

      {/* Main XP pill */}
      <motion.div
        className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-lg"
        style={{
          background: "linear-gradient(135deg, #1a2744 0%, #243352 100%)",
          border: "1.5px solid rgba(207,181,59,0.4)",
          boxShadow: "0 4px 20px rgba(207,181,59,0.25), 0 0 30px rgba(207,181,59,0.1)",
        }}
        initial={{ rotateX: 90 }}
        animate={{ rotateX: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.05 }}
      >
        {/* Animated star icon */}
        <motion.svg
          viewBox="0 0 20 20"
          className="w-3.5 h-3.5 text-gold"
          fill="currentColor"
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: [0, 1.3, 1] }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </motion.svg>

        {/* XP amount */}
        <span className="text-sm font-extrabold text-gold tracking-wide" style={{ textShadow: "0 0 10px rgba(207,181,59,0.5)" }}>
          <CountUpNumber target={amount} /> XP
        </span>
      </motion.div>

      {/* Label underneath */}
      <motion.span
        className="text-[9px] font-medium text-gold/70 mt-0.5 whitespace-nowrap"
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {label}
      </motion.span>
    </motion.div>
  );
}

export default function XPGainToast() {
  const dispatch = useAppDispatch();
  const queue = useAppSelector(selectXPGainQueue);

  const handleDismiss = useCallback(
    (id: string) => dispatch(dismissXPGain(id)),
    [dispatch],
  );

  return (
    <>
      {/* Header-anchored floating XP — positioned near the profile avatar */}
      <div className="fixed top-14 end-8 z-[95] flex flex-col items-center pointer-events-none">
        <AnimatePresence mode="popLayout">
          {queue.slice(-3).map((item, index) => (
            <XPFloater
              key={item.id}
              id={item.id}
              amount={item.amount}
              label={item.label}
              onDismiss={handleDismiss}
              index={index}
            />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
