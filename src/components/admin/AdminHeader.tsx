"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  BellIcon as Bell,
  MagnifyingGlassIcon as Search,
  UserIcon as User,
  Bars3Icon as Menu,
  SunIcon as Sun,
  MoonIcon as Moon,
} from "@heroicons/react/24/outline";
import { useSidebar } from "./AdminSidebar";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export default function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  const { setMobileOpen } = useSidebar();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="bg-white dark:bg-oxford-light border-b border-gray-200 dark:border-white/10 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Mobile Menu Button + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 -ms-2 text-oxford dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg lg:text-xl font-semibold text-oxford dark:text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-silver dark:text-white/50 hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-white/5 rounded-lg">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm text-oxford dark:text-white placeholder:text-gray-400 focus:outline-none w-40"
            />
          </div>

          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
              title={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          )}

          {/* Notifications */}
          <button className="relative p-2 text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 end-1.5 w-2 h-2 bg-gold rounded-full" />
          </button>

          {/* Profile */}
          <div className="flex items-center gap-3 ps-2 lg:ps-3 border-s border-gray-200 dark:border-white/10">
            <div className="hidden md:block text-end">
              <p className="text-sm font-medium text-oxford dark:text-white">
                Admin
              </p>
              <p className="text-xs text-silver dark:text-white/50">
                Administrator
              </p>
            </div>
            <div className="w-9 h-9 bg-gold rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-oxford" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
