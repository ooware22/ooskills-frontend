"use client";

import { useEffect } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Disable scrolling on mount, restore on unmount
  useEffect(() => {
    // Save original styles
    const originalOverflow = document.body.style.overflow;
    const originalHeight = document.body.style.height;
    const htmlOverflow = document.documentElement.style.overflow;
    
    // Disable scrolling
    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";
    document.documentElement.style.overflow = "hidden";
    
    return () => {
      // Restore original styles
      document.body.style.overflow = originalOverflow;
      document.body.style.height = originalHeight;
      document.documentElement.style.overflow = htmlOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden">
      {children}
    </div>
  );
}
