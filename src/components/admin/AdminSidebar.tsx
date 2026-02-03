"use client";

import { useState, createContext, useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Squares2X2Icon as LayoutDashboard,
  SparklesIcon as Sparkles,
  ClockIcon as Clock,
  TrophyIcon as Award,
  BookOpenIcon as BookOpen,
  QuestionMarkCircleIcon as HelpCircle,
  PhoneIcon as Phone,
  Cog6ToothIcon as Settings,
  ArrowRightStartOnRectangleIcon as LogOut,
  ChevronLeftIcon as ChevronLeft,
  Bars3Icon as Menu,
  XMarkIcon as X,
} from "@heroicons/react/24/outline";
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

// Context for mobile menu and collapse state
const SidebarContext = createContext<{
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}>({
  mobileOpen: false,
  setMobileOpen: () => {},
  collapsed: false,
  setCollapsed: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  return (
    <SidebarContext.Provider
      value={{ mobileOpen, setMobileOpen, collapsed, setCollapsed }}
    >
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
  const { mobileOpen, setMobileOpen, collapsed, setCollapsed } = useSidebar();

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
          "fixed top-0 start-0 h-screen bg-oxford border-e border-white/10 transition-all duration-300 ease-in-out z-50 flex flex-col shadow-xl overflow-x-hidden",
          // Desktop
          "hidden lg:flex",
          collapsed ? "lg:w-16" : "lg:w-64",
          // Mobile
          mobileOpen && "!flex w-64",
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
        <div className="p-6 border-b border-white/10 transition-all duration-300 flex justify-center">
          <Link
            href="/admin"
            className="flex items-center hover:opacity-80 transition-opacity"
            onClick={closeMobile}
          >
            {collapsed && !mobileOpen ? (
              <Image
                src="/images/logo/logo_icon2.png"
                alt="OOSkills"
                width={56}
                height={56}
                className="w-14 h-14 rounded-xl object-contain"
              />
            ) : (
              <Image
                src="/images/logo/logo_DarkMood2.png"
                alt="OOSkills"
                width={220}
                height={60}
                className="h-6 w-auto"
              />
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-2 overflow-hidden">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                title={collapsed && !mobileOpen ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 relative group",
                  isActive
                    ? "bg-gold text-oxford shadow-md"
                    : "text-white/70 hover:text-white hover:bg-white/5",
                  collapsed && !mobileOpen && "justify-center px-2",
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {(!collapsed || mobileOpen) && (
                  <span className="whitespace-nowrap overflow-hidden transition-all duration-300">
                    {item.label}
                  </span>
                )}

                {/* Tooltip for collapsed state */}
                {collapsed && !mobileOpen && (
                  <div className="absolute start-full ms-3 px-3 py-2 bg-oxford/95 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl z-[100] pointer-events-none">
                    {item.label}
                    <div className="absolute top-1/2 -translate-y-1/2 end-full w-2 h-2 bg-oxford border-t border-s border-white/20 rotate-45 -me-[5px]" />
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 space-y-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "hidden lg:flex w-full items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200 group relative",
              collapsed && "justify-center px-2",
            )}
          >
            {collapsed ? (
              <>
                <Menu className="w-5 h-5" />
                {/* Tooltip for expand button */}
                <div className="absolute start-full ms-3 px-3 py-2 bg-oxford/95 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl z-[100] pointer-events-none">
                  Expand
                  <div className="absolute top-1/2 -translate-y-1/2 end-full w-2 h-2 bg-oxford border-t border-s border-white/20 rotate-45 -me-[5px]" />
                </div>
              </>
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
            title={collapsed && !mobileOpen ? "Back to Site" : undefined}
            className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200 group relative",
              collapsed && !mobileOpen && "justify-center px-2",
            )}
          >
            <LogOut className="w-5 h-5" />
            {(!collapsed || mobileOpen) && <span>Back to Site</span>}

            {/* Tooltip for collapsed state */}
            {collapsed && !mobileOpen && (
              <div className="absolute start-full ms-3 px-3 py-2 bg-oxford/95 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl z-[100] pointer-events-none">
                Back to Site
                <div className="absolute top-1/2 -translate-y-1/2 end-full w-2 h-2 bg-oxford border-t border-s border-white/20 rotate-45 -me-[5px]" />
              </div>
            )}
          </Link>
        </div>
      </aside>
    </>
  );
}
