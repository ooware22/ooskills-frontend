"use client";

import { useState, createContext, useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import {
  Squares2X2Icon as LayoutDashboard,
  BookOpenIcon as BookOpen,
  MagnifyingGlassIcon as Search,
  Cog6ToothIcon as Settings,
  ArrowRightStartOnRectangleIcon as LogOut,
  ChevronLeftIcon as ChevronLeft,
  Bars3Icon as Menu,
  XMarkIcon as X,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useAppDispatch } from "@/store/hooks";
import { clearCredentials } from "@/store/slices/authSlice";

// Navigation items for student dashboard
const navItems = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/dashboard/my-courses", labelKey: "myCourses", icon: BookOpen },
  { href: "/dashboard/catalogue", labelKey: "catalogue", icon: Search },
  { href: "/dashboard/settings", labelKey: "settings", icon: Settings },
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

// Mobile menu button (hamburger) for the student layout
export function MobileMenuButton() {
  const { setMobileOpen } = useSidebar();
  return (
    <button
      onClick={() => setMobileOpen(true)}
      className="lg:hidden fixed top-4 start-4 z-30 p-2 bg-oxford rounded-lg text-white shadow-lg"
    >
      <Menu className="w-5 h-5" />
    </button>
  );
}

// Tooltip for collapsed sidebar
function SidebarTooltip({ label, isRtl }: { label: string; isRtl: boolean }) {
  return (
    <span
      className={cn(
        "absolute top-1/2 -translate-y-1/2 px-2 py-1 bg-oxford text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg",
        isRtl ? "right-full mr-2" : "left-full ml-2"
      )}
    >
      {label}
    </span>
  );
}

export default function StudentSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { mobileOpen, setMobileOpen, collapsed, setCollapsed } = useSidebar();
  const { t, locale } = useI18n();
  const isRtl = locale === "ar";

  const handleLogout = () => {
    closeMobile();
    dispatch(clearCredentials());
    router.push("/");
  };

  const closeMobile = () => setMobileOpen(false);
  const getLabel = (key: string) => t(`student.sidebar.${key}`);

  const isExpanded = !collapsed || mobileOpen;

  const renderLink = (
    href: string,
    labelKey: string,
    Icon: React.ElementType
  ) => {
    const isActive = pathname === href;
    const label = getLabel(labelKey);
    return (
      <Link
        key={href}
        href={href}
        onClick={closeMobile}
        title={!isExpanded ? label : undefined}
        className={cn(
          "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative group",
          isActive
            ? "bg-gold text-oxford shadow-md"
            : "text-white/70 hover:text-white hover:bg-white/5",
          !isExpanded && "justify-center px-2"
        )}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        {isExpanded && (
          <span className="whitespace-nowrap overflow-hidden transition-all duration-300">
            {label}
          </span>
        )}
        {!isExpanded && <SidebarTooltip label={label} isRtl={isRtl} />}
      </Link>
    );
  };

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
          "fixed top-0 h-screen bg-oxford border-white/10 transition-all duration-300 ease-in-out z-50 flex flex-col shadow-xl overflow-x-hidden",
          isRtl ? "right-0 border-l" : "left-0 border-r",
          "hidden lg:flex",
          collapsed ? "lg:w-16" : "lg:w-64",
          mobileOpen && "!flex w-64"
        )}
      >
        {/* Mobile Close Button */}
        <button
          onClick={closeMobile}
          className={cn(
            "lg:hidden absolute top-4 p-1 text-white/60 hover:text-white",
            isRtl ? "left-4" : "right-4"
          )}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="p-6 border-b border-white/10 transition-all duration-300 flex justify-center">
          <Link
            href="/dashboard"
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
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10">
          {navItems.map((item) =>
            renderLink(item.href, item.labelKey, item.icon)
          )}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 space-y-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? getLabel("expand") : getLabel("collapse")}
            className={cn(
              "hidden lg:flex w-full items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200 group relative",
              collapsed && "justify-center px-2"
            )}
          >
            {collapsed ? (
              <>
                <Menu className="w-5 h-5" />
                <SidebarTooltip label={getLabel("expand")} isRtl={isRtl} />
              </>
            ) : (
              <>
                <ChevronLeft className={cn("w-5 h-5", isRtl && "rotate-180")} />
                <span>{getLabel("collapse")}</span>
              </>
            )}
          </button>
          <button
            onClick={handleLogout}
            title={!isExpanded ? getLabel("logout") : undefined}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200 group relative",
              !isExpanded && "justify-center px-2"
            )}
          >
            <LogOut className={cn("w-5 h-5", isRtl && "rotate-180")} />
            {isExpanded && <span>{getLabel("logout")}</span>}
            {!isExpanded && (
              <SidebarTooltip label={getLabel("logout")} isRtl={isRtl} />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
