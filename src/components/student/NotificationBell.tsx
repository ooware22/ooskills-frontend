"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchNotifications,
  markAllRead,
  markOneRead,
  selectNotifications,
  selectUnreadCount,
  type AppNotification,
} from "@/store/slices/notificationSlice";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { BellIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TYPE_META: Record<string, { icon: string; color: string; bg: string }> = {
  course_purchased: {
    icon: "🛒",
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  course_completed: {
    icon: "✅",
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-900/20",
  },
  certificate_earned: {
    icon: "🏆",
    color: "text-yellow-600",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
  },
  achievement_unlocked: {
    icon: "🏅",
    color: "text-purple-600",
    bg: "bg-purple-50 dark:bg-purple-900/20",
  },
  level_up: {
    icon: "⬆️",
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-900/20",
  },
  gift_received: {
    icon: "🎁",
    color: "text-pink-600",
    bg: "bg-pink-50 dark:bg-pink-900/20",
  },
  referral_bonus: {
    icon: "💰",
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  quiz_passed: {
    icon: "📝",
    color: "text-cyan-600",
    bg: "bg-cyan-50 dark:bg-cyan-900/20",
  },
};

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  return `il y a ${Math.floor(diff / 86400)} j`;
}

function normalizeNotificationLink(link: string): string {
  if (!link) return link;

  if (link.startsWith("/dashboard/learn/")) {
    const slug = link.replace("/dashboard/learn/", "").split("/")[0];
    return slug ? `/courses/${slug}/learn` : "/courses";
  }

  return link;
}

// ---------------------------------------------------------------------------
// Notification row
// ---------------------------------------------------------------------------

function NotifRow({
  notif,
  onClose,
}: {
  notif: AppNotification;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const meta = TYPE_META[notif.type] ?? {
    icon: "🔔",
    color: "text-gray-500",
    bg: "bg-gray-50 dark:bg-white/5",
  };

  const handleClick = () => {
    if (!notif.is_read) dispatch(markOneRead(notif.id));
    if (notif.link) {
      router.push(normalizeNotificationLink(notif.link));
      onClose();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full text-start flex items-start gap-3 px-4 py-3 transition-colors",
        "hover:bg-gray-50 dark:hover:bg-white/5",
        !notif.is_read && "border-s-2 border-gold",
      )}
    >
      {/* Icon */}
      <span
        className={cn(
          "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-base",
          meta.bg,
        )}
      >
        {meta.icon}
      </span>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium text-gray-900 dark:text-white leading-tight truncate",
            !notif.is_read && "font-semibold",
          )}
        >
          {notif.title}
        </p>
        {notif.body && (
          <p className="text-xs text-gray-500 dark:text-white/50 mt-0.5 truncate">
            {notif.body}
          </p>
        )}
        <p className="text-xs text-gray-400 dark:text-white/30 mt-1">
          {timeAgo(notif.created_at)}
        </p>
      </div>

      {/* Unread dot */}
      {!notif.is_read && (
        <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-gold" />
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const POLL_INTERVAL = 60_000; // 60 s

export default function NotificationBell() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);
  const unreadCount = useAppSelector(selectUnreadCount);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Initial fetch
  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  // Poll every 60s when tab is visible
  useEffect(() => {
    const poll = () => {
      if (document.visibilityState === "visible") {
        dispatch(fetchNotifications());
      }
    };
    const interval = setInterval(poll, POLL_INTERVAL);
    document.addEventListener("visibilitychange", poll);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", poll);
    };
  }, [dispatch]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleOpen = useCallback(() => {
    setOpen((v) => !v);
  }, []);

  const handleMarkAllRead = useCallback(() => {
    dispatch(markAllRead());
  }, [dispatch]);

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="relative p-2 text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <BellIcon className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          ref={panelRef}
          className={cn(
            "absolute z-50 mt-2 w-80 max-h-[480px] flex flex-col",
            "rounded-xl border border-gray-200 dark:border-white/10",
            "bg-white dark:bg-gray-900 shadow-xl",
            "overflow-hidden",
            // RTL-safe: align to the right of the bell by default
            "end-0",
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/10">
            <span className="font-semibold text-gray-900 dark:text-white text-sm">
              Notifications
              {unreadCount > 0 && (
                <span className="ms-2 px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold">
                  {unreadCount}
                </span>
              )}
            </span>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline px-2 py-1 rounded"
                  title="Tout marquer comme lu"
                >
                  <CheckIcon className="w-3.5 h-3.5" />
                  Tout lire
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-white/40"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1 divide-y divide-gray-100 dark:divide-white/5">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <BellIcon className="w-10 h-10 text-gray-300 dark:text-white/20 mb-3" />
                <p className="text-sm text-gray-500 dark:text-white/40">
                  Aucune notification pour l&apos;instant
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotifRow key={n.id} notif={n} onClose={() => setOpen(false)} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
