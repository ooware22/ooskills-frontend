"use client";

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base background color */}
      <div className="absolute inset-0 bg-white dark:bg-oxford transition-colors duration-300" />
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/80 via-white to-gray-50/50 dark:from-oxford dark:via-oxford dark:to-oxford-light/20" />
      
      {/* Subtle dot pattern */}
      <div 
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Very subtle gold accent glow - top right */}
      <div className="absolute -top-20 -end-20 w-[400px] h-[400px] rounded-full bg-gold/[0.03] dark:bg-gold/[0.02] blur-3xl" />
      
      {/* Very subtle blue accent glow - bottom left */}
      <div className="absolute -bottom-20 -start-20 w-[500px] h-[500px] rounded-full bg-oxford/[0.02] dark:bg-white/[0.01] blur-3xl" />
    </div>
  );
}
