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
  ChevronDownIcon as ChevronDown,
  Bars3Icon as Menu,
  XMarkIcon as X,
  GlobeAltIcon as Globe,
  UsersIcon as Users,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

// Types for nav items
type NavLink = {
  type: "link";
  href: string;
  labelKey: string;
  icon: React.ElementType;
};

type NavGroup = {
  type: "group";
  labelKey: string;
  icon: React.ElementType;
  children: { href: string; labelKey: string; icon: React.ElementType }[];
};

type NavItem = NavLink | NavGroup;

// Navigation structure with groups
const navItems: NavItem[] = [
  { type: "link", href: "/admin", labelKey: "dashboard", icon: LayoutDashboard },
  {
    type: "group",
    labelKey: "landingPage",
    icon: Globe,
    children: [
      { href: "/admin/hero", labelKey: "hero", icon: Sparkles },
      { href: "/admin/countdown", labelKey: "countdown", icon: Clock },
      { href: "/admin/features", labelKey: "features", icon: Award },
      { href: "/admin/courses", labelKey: "courses", icon: BookOpen },
      { href: "/admin/faq", labelKey: "faq", icon: HelpCircle },
      { href: "/admin/contact", labelKey: "contact", icon: Phone },
      { href: "/admin/settings", labelKey: "settings", icon: Settings },
    ],
  },
  { type: "link", href: "/admin/users", labelKey: "users", icon: Users },
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

// Tooltip component for collapsed sidebar
function SidebarTooltip({ label, isRtl }: { label: string; isRtl: boolean }) {
  return (
    <div className={cn(
      "absolute px-3 py-2 bg-oxford/95 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl z-[100] pointer-events-none",
      isRtl ? "right-full mr-3" : "left-full ml-3"
    )}>
      {label}
      <div className={cn(
        "absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-oxford border-white/20 rotate-45",
        isRtl ? "left-full -ml-[5px] border-t border-r" : "right-full -mr-[5px] border-t border-l"
      )} />
    </div>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const { mobileOpen, setMobileOpen, collapsed, setCollapsed } = useSidebar();
  const { t, locale } = useI18n();
  const isRtl = locale === "ar";

  // Track which groups are open
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    // Auto-open groups that contain the current active route
    const initial: Record<string, boolean> = {};
    navItems.forEach((item) => {
      if (item.type === "group") {
        const hasActiveChild = item.children.some((child) => pathname === child.href);
        if (hasActiveChild) {
          initial[item.labelKey] = true;
        }
      }
    });
    return initial;
  });

  const closeMobile = () => setMobileOpen(false);
  const getLabel = (key: string) => t(`admin.sidebar.${key}`);

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isExpanded = !collapsed || mobileOpen;

  const renderLink = (
    href: string,
    labelKey: string,
    Icon: React.ElementType,
    indented = false
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
          !isExpanded && "justify-center px-2",
          indented && isExpanded && "ms-4 py-2.5"
        )}
      >
        <Icon className={cn("w-5 h-5 flex-shrink-0", indented && "w-4 h-4")} />
        {isExpanded && (
          <span className="whitespace-nowrap overflow-hidden transition-all duration-300">
            {label}
          </span>
        )}
        {!isExpanded && <SidebarTooltip label={label} isRtl={isRtl} />}
      </Link>
    );
  };

  const renderGroup = (item: NavGroup) => {
    const isOpen = openGroups[item.labelKey] ?? false;
    const hasActiveChild = item.children.some((child) => pathname === child.href);
    const label = getLabel(item.labelKey);

    // In collapsed mode, just show icon with tooltip
    if (!isExpanded) {
      return (
        <div key={item.labelKey} className="relative group">
          <button
            onClick={() => {
              // Expand sidebar when clicking a group in collapsed mode
              setCollapsed(false);
              setOpenGroups((prev) => ({ ...prev, [item.labelKey]: true }));
            }}
            title={label}
            className={cn(
              "flex items-center justify-center w-full px-2 py-3 rounded-xl text-sm font-medium transition-all duration-200",
              hasActiveChild
                ? "bg-gold/20 text-gold"
                : "text-white/70 hover:text-white hover:bg-white/5"
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
          </button>
          <SidebarTooltip label={label} isRtl={isRtl} />
        </div>
      );
    }

    return (
      <div key={item.labelKey}>
        <button
          onClick={() => toggleGroup(item.labelKey)}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200",
            hasActiveChild
              ? "bg-gold/15 text-gold"
              : "text-white/70 hover:text-white hover:bg-white/5"
          )}
        >
          <item.icon className="w-5 h-5 flex-shrink-0" />
          <span className="whitespace-nowrap overflow-hidden flex-1 text-start">
            {label}
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 flex-shrink-0 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {/* Children with smooth animation */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            isOpen ? "max-h-[500px] opacity-100 mt-1" : "max-h-0 opacity-0"
          )}
        >
          <div className="space-y-0.5">
            {item.children.map((child) =>
              renderLink(child.href, child.labelKey, child.icon, true)
            )}
          </div>
        </div>
      </div>
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
          mobileOpen && "!flex w-64",
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
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10">
          {navItems.map((item) => {
            if (item.type === "link") {
              return renderLink(item.href, item.labelKey, item.icon);
            }
            return renderGroup(item);
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 space-y-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? getLabel("expand") : getLabel("collapse")}
            className={cn(
              "hidden lg:flex w-full items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200 group relative",
              collapsed && "justify-center px-2",
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
          <Link
            href="/"
            onClick={closeMobile}
            title={!isExpanded ? getLabel("logout") : undefined}
            className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200 group relative",
              !isExpanded && "justify-center px-2",
            )}
          >
            <LogOut className={cn("w-5 h-5", isRtl && "rotate-180")} />
            {isExpanded && <span>{getLabel("logout")}</span>}
            {!isExpanded && <SidebarTooltip label={getLabel("logout")} isRtl={isRtl} />}
          </Link>
        </div>
      </aside>
    </>
  );
}
