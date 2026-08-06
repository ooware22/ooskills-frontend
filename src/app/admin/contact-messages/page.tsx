"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  EnvelopeIcon,
  EnvelopeOpenIcon,
  XMarkIcon as X,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/outline";
import AdminHeader from "@/components/admin/AdminHeader";
import { useTranslations } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/axios";
import adminContactMessagesApi, {
  type AdminContactMessage,
} from "@/services/adminContactMessagesApi";

const PAGE_SIZE = 20;

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminContactMessagesPage() {
  const t = useTranslations("admin.contactMessages");

  const [messages, setMessages] = useState<AdminContactMessage[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<AdminContactMessage | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const data = await adminContactMessagesApi.list({ page });
      setMessages(data.results);
      setTotalCount(data.count);
    } catch (err) {
      setListError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const unreadCount = messages.filter((m) => !m.is_read).length;

  const openMessage = async (msg: AdminContactMessage) => {
    setSelected(msg);
    if (!msg.is_read) {
      try {
        const updated = await adminContactMessagesApi.setRead(msg.id, true);
        setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        setSelected(updated);
      } catch {
        // Non-critical — the message is still fully readable even if the flag update fails.
      }
    }
  };

  const toggleRead = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      const updated = await adminContactMessagesApi.setRead(selected.id, !selected.is_read);
      setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      setSelected(updated);
      showToast("success", updated.is_read ? t("toastMarkedRead") : t("toastMarkedUnread"));
    } catch (err) {
      showToast("error", getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const deleteMessage = async () => {
    if (!selected) return;
    if (!window.confirm(t("confirmDelete"))) return;
    setActionLoading(true);
    try {
      await adminContactMessagesApi.remove(selected.id);
      setMessages((prev) => prev.filter((m) => m.id !== selected.id));
      setTotalCount((c) => Math.max(0, c - 1));
      setSelected(null);
      showToast("success", t("toastDeleted"));
    } catch (err) {
      showToast("error", getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="min-h-screen">
      <AdminHeader titleKey="admin.contactMessages.title" subtitleKey="admin.contactMessages.subtitle" />

      <div className="p-4 lg:p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-silver dark:text-white/50">{t("statTotal")}</p>
                <p className="text-2xl font-bold text-oxford dark:text-white mt-1">{totalCount}</p>
              </div>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-blue-500/10">
                <EnvelopeIcon className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className={cn(
              "bg-white dark:bg-oxford-light rounded-xl border p-5",
              unreadCount > 0 ? "border-gold/40" : "border-gray-200 dark:border-white/10"
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-silver dark:text-white/50">{t("statUnread")}</p>
                <p className={cn("text-2xl font-bold mt-1", unreadCount > 0 ? "text-gold" : "text-oxford dark:text-white")}>
                  {unreadCount}
                </p>
              </div>
              <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", unreadCount > 0 ? "bg-gold/10" : "bg-gray-500/10")}>
                <EnvelopeOpenIcon className={cn("w-5 h-5", unreadCount > 0 ? "text-gold" : "text-gray-400")} />
              </div>
            </div>
          </motion.div>
        </div>

        {listError && (
          <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
            <p className="text-sm text-red-600 dark:text-red-400">{listError}</p>
          </div>
        )}

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden"
        >
          {loading && (
            <div className="p-12 flex flex-col items-center gap-3">
              <ArrowPathIcon className="w-8 h-8 text-gold animate-spin" />
              <p className="text-sm text-silver dark:text-white/50">{t("loading")}</p>
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="p-12 text-center">
              <EnvelopeIcon className="w-12 h-12 text-gray-300 dark:text-white/20 mx-auto mb-3" />
              <p className="text-sm text-silver dark:text-white/50">{t("noMessagesFound")}</p>
            </div>
          )}

          {!loading && messages.length > 0 && (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-white/10">
                      <th className="text-start px-5 py-4 text-xs font-semibold text-silver dark:text-white/50 uppercase tracking-wider">{t("tableFrom")}</th>
                      <th className="text-start px-5 py-4 text-xs font-semibold text-silver dark:text-white/50 uppercase tracking-wider">{t("tableSubject")}</th>
                      <th className="text-start px-5 py-4 text-xs font-semibold text-silver dark:text-white/50 uppercase tracking-wider">{t("tableStatus")}</th>
                      <th className="text-start px-5 py-4 text-xs font-semibold text-silver dark:text-white/50 uppercase tracking-wider">{t("tableDate")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map((msg) => (
                      <tr
                        key={msg.id}
                        onClick={() => openMessage(msg)}
                        className={cn(
                          "border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors",
                          !msg.is_read && "bg-gold/5 dark:bg-gold/5"
                        )}
                      >
                        <td className="px-5 py-4">
                          <p className={cn("text-sm text-oxford dark:text-white", !msg.is_read && "font-semibold")}>{msg.name}</p>
                          <p className="text-xs text-silver dark:text-white/50">{msg.email}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className={cn("text-sm text-oxford dark:text-white max-w-xs truncate", !msg.is_read && "font-semibold")}>
                            {msg.subject}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-medium",
                            !msg.is_read
                              ? "bg-gold/10 text-gold"
                              : "bg-gray-500/10 text-gray-600 dark:text-gray-400"
                          )}>
                            {!msg.is_read ? t("statusUnread") : t("statusRead")}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-silver dark:text-white/50 whitespace-nowrap">
                          {formatDate(msg.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-gray-100 dark:divide-white/5">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => openMessage(msg)}
                    className={cn(
                      "p-4 space-y-2 active:bg-gray-50 dark:active:bg-white/5 cursor-pointer",
                      !msg.is_read && "bg-gold/5 dark:bg-gold/5"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className={cn("text-sm text-oxford dark:text-white truncate", !msg.is_read && "font-semibold")}>{msg.name}</p>
                        <p className="text-xs text-silver dark:text-white/50 truncate">{msg.email}</p>
                      </div>
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium shrink-0",
                        !msg.is_read
                          ? "bg-gold/10 text-gold"
                          : "bg-gray-500/10 text-gray-600 dark:text-gray-400"
                      )}>
                        {!msg.is_read ? t("statusUnread") : t("statusRead")}
                      </span>
                    </div>
                    <p className={cn("text-sm text-oxford dark:text-white truncate", !msg.is_read && "font-semibold")}>
                      {msg.subject}
                    </p>
                    <p className="text-xs text-silver dark:text-white/50">{formatDate(msg.created_at)}</p>
                  </div>
                ))}
              </div>

              <div className="px-5 py-3 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
                <p className="text-xs text-silver dark:text-white/50">
                  {t("showing")} {messages.length} {t("of")} {totalCount} {t("messagesWord")}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    {t("prev")}
                  </button>
                  <span className="text-xs text-silver dark:text-white/50">{t("page")} {page} / {totalPages}</span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    {t("next")}
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelected(null)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white dark:bg-oxford-light rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10 shrink-0">
                <div>
                  <h3 className="text-sm font-semibold text-oxford dark:text-white">{selected.subject}</h3>
                  <p className="text-xs text-silver dark:text-white/50">{formatDate(selected.created_at)}</p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-silver dark:text-white/50" />
                </button>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto">
                <div>
                  <p className="text-xs font-medium text-silver dark:text-white/50 mb-1">{t("modalFrom")}</p>
                  <p className="text-sm text-oxford dark:text-white">{selected.name}</p>
                  <p className="text-xs text-silver dark:text-white/50">{selected.email}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-silver dark:text-white/50 mb-2">{t("modalMessage")}</p>
                  <p className="text-sm text-oxford dark:text-white whitespace-pre-wrap bg-gray-50 dark:bg-white/5 rounded-lg p-3">
                    {selected.message}
                  </p>
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-white/10 space-y-2 shrink-0">
                <a
                  href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gold text-oxford rounded-xl text-sm font-semibold hover:bg-gold/90 transition-colors"
                >
                  <ArrowUturnLeftIcon className="w-4 h-4" />
                  {t("actionReply")}
                </a>

                <button
                  onClick={toggleRead}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-white/10 text-oxford dark:text-white rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  ) : selected.is_read ? (
                    <EnvelopeIcon className="w-4 h-4" />
                  ) : (
                    <EnvelopeOpenIcon className="w-4 h-4" />
                  )}
                  {selected.is_read ? t("actionMarkUnread") : t("actionMarkRead")}
                </button>

                <button
                  onClick={deleteMessage}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <TrashIcon className="w-4 h-4" />
                  {t("actionDelete")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={cn(
              "fixed bottom-6 inset-x-0 mx-auto w-fit max-w-sm px-4 py-3 rounded-xl shadow-lg z-[60] flex items-center gap-2 text-sm font-medium",
              toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
            )}
          >
            {toast.type === "success" ? (
              <CheckCircleIcon className="w-5 h-5" />
            ) : (
              <ExclamationTriangleIcon className="w-5 h-5" />
            )}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
