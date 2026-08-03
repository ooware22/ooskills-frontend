"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Boundary caught error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full text-center p-8 bg-slate-800/80 rounded-2xl border border-slate-700/50 shadow-2xl backdrop-blur-md">
        <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-slate-400 text-sm mb-6">
          An unexpected error occurred. You can try refreshing or clicking the button below to recover.
        </p>
        <button
          onClick={() => reset()}
          className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition shadow-lg shadow-emerald-600/20"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
