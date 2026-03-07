"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SparklesIcon } from "@heroicons/react/24/solid";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectXPGainQueue, dismissXPGain } from "@/store/slices/gamificationSlice";
import { useSoundEffects } from "@/hooks/useSoundEffects";

function XPToastItem({
  id,
  amount,
  label,
  onDismiss,
}: {
  id: string;
  amount: number;
  label: string;
  onDismiss: (id: string) => void;
}) {
  const { playXPGain } = useSoundEffects();

  useEffect(() => {
    playXPGain();
    const timer = setTimeout(() => onDismiss(id), 2500);
    return () => clearTimeout(timer);
  }, [id, onDismiss, playXPGain]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      className="flex items-center gap-2 px-4 py-2.5 bg-oxford dark:bg-oxford-light rounded-xl shadow-lg border border-gold/20 dark:border-gold/15"
    >
      <SparklesIcon className="w-4 h-4 text-gold" />
      <span className="text-sm font-bold text-gold">+{amount} XP</span>
      <span className="text-xs text-white/60">{label}</span>
    </motion.div>
  );
}

export default function XPGainToast() {
  const dispatch = useAppDispatch();
  const queue = useAppSelector(selectXPGainQueue);

  return (
    <div className="fixed bottom-6 right-6 z-[90] flex flex-col-reverse gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {queue.slice(-3).map((item) => (
          <XPToastItem
            key={item.id}
            id={item.id}
            amount={item.amount}
            label={item.label}
            onDismiss={(id) => dispatch(dismissXPGain(id))}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
