"use client";

import { useState, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  Clock,
  Award,
  BookOpen,
  HelpCircle,
  Phone,
  Settings,
  LogOut,
  GraduationCap,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/hero", label: "Hero Section", icon: Sparkles },
  { href: "/admin/countdown", label: "Countdown", icon: Clock },
  { href: "/admin/features", label: "Features", icon: Award },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/faq", label: "FAQ", icon: HelpCircle },
  { href: "/admin/contact", label: "Contact & Social", icon: Phone },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

// Context for mobile menu
const SidebarContext = createContext<{
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}>({ mobileOpen: false, setMobileOpen: () => {} });

export const useSidebar = () => useContext(SidebarContext);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <SidebarContext.Provider value={{ mobileOpen, setMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function MobileMenuButton() {
  const { mobileOpen, setMobileOpen } = useSidebar();
  return (
    <button
      onClick={() => setMobileOpen(!mobileOpen)}
      className="lg:hidden p-2 text-oxford dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
    >
      <Menu className="w-5 h-5" />
    </button>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { mobileOpen, setMobileOpen } = useSidebar();

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 start-0 h-screen bg-oxford border-e border-white/10 transition-all duration-300 z-50 flex flex-col",
          // Desktop
          "hidden lg:flex",
          collapsed ? "lg:w-16" : "lg:w-64",
          // Mobile
          mobileOpen && "!flex w-64"
        )}
      >
        {/* Mobile Close Button */}
        <button
          onClick={closeMobile}
          className="lg:hidden absolute top-4 end-4 p-1 text-white/60 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="p-4 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-3" onClick={closeMobile}>
            <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-oxford" />
            </div>
            {(!collapsed || mobileOpen) && (
              <div>
                <h1 className="text-white font-semibold">OOSkills</h1>
                <p className="text-white/40 text-xs">Admin Panel</p>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gold text-oxford"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {(!collapsed || mobileOpen) && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 space-y-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            {collapsed ? (
              <Menu className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span>Collapse</span>
              </>
            )}
          </button>
          <Link
            href="/"
            onClick={closeMobile}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {(!collapsed || mobileOpen) && <span>Back to Site</span>}
          </Link>
        </div>
      </aside>
    </>
  );
}
