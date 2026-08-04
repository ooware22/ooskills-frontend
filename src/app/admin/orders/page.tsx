"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon as Search,
  XMarkIcon as X,
  ShoppingBagIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  UserPlusIcon,
  ReceiptRefundIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import AdminHeader from "@/components/admin/AdminHeader";
import { useTranslations } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/axios";
import adminOrdersApi, {
  type AdminOrder,
  type OrderStatus,
} from "@/services/adminOrdersApi";

const PAGE_SIZE = 20;
const ALL_STATUSES: OrderStatus[] = ["pending", "paid", "failed", "refunded"];

function statusColor(status: OrderStatus) {
  switch (status) {
    case "paid": return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    case "pending": return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
    case "failed": return "bg-red-500/10 text-red-600 dark:text-red-400";
    case "refunded": return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
    default: return "bg-gray-500/10 text-gray-600";
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function shortId(id: string) {
  return id.split("-")[0];
}

type ActionKey = "confirm" | "enroll" | "refund";

export default function AdminOrdersPage() {
  const t = useTranslations("admin.orders");

  const statusLabel = (status: OrderStatus) => t(`status${status.charAt(0).toUpperCase()}${status.slice(1)}`);
  const statusLegend = (status: OrderStatus) => t(`legend${status.charAt(0).toUpperCase()}${status.slice(1)}`);

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [mismatchCount, setMismatchCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [localSearch, setLocalSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [mismatchedOnly, setMismatchedOnly] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [actionLoading, setActionLoading] = useState<ActionKey | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const data = await adminOrdersApi.list({
        search: search || undefined,
        status: statusFilter,
        mismatched: mismatchedOnly || undefined,
        page,
      });
      setOrders(data.results);
      setTotalCount(data.count);
    } catch (err) {
      setListError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, mismatchedOnly, page]);

  const fetchMismatchStats = useCallback(async () => {
    try {
      const count = await adminOrdersApi.mismatchStats();
      setMismatchCount(count);
    } catch {
      // Non-critical for the stat card — the table itself still works without it.
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { fetchMismatchStats(); }, [fetchMismatchStats]);

  const handleSearchChange = (val: string) => {
    setLocalSearch(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      setSearch(val);
    }, 400);
  };

  const applyUpdatedOrder = (updated: AdminOrder) => {
    setSelectedOrder(updated);
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  };

  const runAction = async (key: ActionKey, order: AdminOrder) => {
    setActionLoading(key);
    try {
      let updated: AdminOrder;
      if (key === "confirm") {
        updated = await adminOrdersApi.confirmPayment(order.id);
        showToast("success", t("toastResyncSuccess"));
      } else if (key === "enroll") {
        updated = await adminOrdersApi.forceEnroll(order.id);
        showToast("success", t("toastEnrollSuccess"));
      } else {
        updated = await adminOrdersApi.markRefunded(order.id);
        showToast("success", t("toastRefundSuccess"));
      }
      applyUpdatedOrder(updated);
      fetchMismatchStats();
    } catch (err) {
      showToast("error", getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="min-h-screen">
      <AdminHeader titleKey="admin.orders.title" subtitleKey="admin.orders.subtitle" />

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
                <p className="text-sm text-silver dark:text-white/50">{t("statTotalOrders")}</p>
                <p className="text-2xl font-bold text-oxford dark:text-white mt-1">{totalCount}</p>
              </div>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-blue-500/10">
                <ShoppingBagIcon className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            onClick={() => { setMismatchedOnly(true); setStatusFilter("all"); setPage(1); }}
            className={cn(
              "text-start bg-white dark:bg-oxford-light rounded-xl border p-5 transition-colors",
              (mismatchCount ?? 0) > 0
                ? "border-red-300 dark:border-red-500/30 hover:border-red-400"
                : "border-gray-200 dark:border-white/10"
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-silver dark:text-white/50">{t("statNeedsAttention")}</p>
                <p className={cn(
                  "text-2xl font-bold mt-1",
                  (mismatchCount ?? 0) > 0 ? "text-red-500" : "text-oxford dark:text-white"
                )}>
                  {mismatchCount === null ? "—" : mismatchCount}
                </p>
              </div>
              <div className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center",
                (mismatchCount ?? 0) > 0 ? "bg-red-500/10" : "bg-gray-500/10"
              )}>
                <ExclamationTriangleIcon className={cn(
                  "w-5 h-5",
                  (mismatchCount ?? 0) > 0 ? "text-red-500" : "text-gray-400"
                )} />
              </div>
            </div>
          </motion.button>
        </div>

        {/* Status legend — explains all 4 statuses, incl. why "Pending" isn't always unpaid */}
        <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <InformationCircleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">{t("legendTitle")}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ALL_STATUSES.map((s) => (
              <div key={s} className="flex items-start gap-2">
                <span className={cn("shrink-0 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium", statusColor(s))}>
                  {statusLabel(s)}
                </span>
                <p className="text-xs text-amber-800/90 dark:text-amber-300/90">{statusLegend(s)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={localSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full ps-10 pe-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as OrderStatus | "all"); setPage(1); }}
              className="px-4 py-2.5 pr-10 appearance-none bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors cursor-pointer bg-no-repeat bg-[length:16px_16px]"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%239ca3af'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center' }}
            >
              <option value="all">{t("filterAllStatuses")}</option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>{statusLabel(s)}</option>
              ))}
            </select>

            <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white cursor-pointer whitespace-nowrap select-none">
              <input
                type="checkbox"
                checked={mismatchedOnly}
                onChange={(e) => { setMismatchedOnly(e.target.checked); setPage(1); }}
                className="rounded border-gray-300 text-gold focus:ring-gold/50"
              />
              {t("needsAttentionOnly")}
            </label>
          </div>
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

          {!loading && orders.length === 0 && (
            <div className="p-12 text-center">
              <ShoppingBagIcon className="w-12 h-12 text-gray-300 dark:text-white/20 mx-auto mb-3" />
              <p className="text-sm text-silver dark:text-white/50">{t("noOrdersFound")}</p>
            </div>
          )}

          {!loading && orders.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-white/10">
                      <th className="text-start px-5 py-4 text-xs font-semibold text-silver dark:text-white/50 uppercase tracking-wider">{t("tableBuyer")}</th>
                      <th className="text-start px-5 py-4 text-xs font-semibold text-silver dark:text-white/50 uppercase tracking-wider">{t("tableCourses")}</th>
                      <th className="text-start px-5 py-4 text-xs font-semibold text-silver dark:text-white/50 uppercase tracking-wider">{t("tableTotal")}</th>
                      <th className="text-start px-5 py-4 text-xs font-semibold text-silver dark:text-white/50 uppercase tracking-wider">{t("tablePayment")}</th>
                      <th className="text-start px-5 py-4 text-xs font-semibold text-silver dark:text-white/50 uppercase tracking-wider">{t("tableStatus")}</th>
                      <th className="text-start px-5 py-4 text-xs font-semibold text-silver dark:text-white/50 uppercase tracking-wider">{t("tableDate")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-oxford dark:text-white">{order.user_name}</p>
                          <p className="text-xs text-silver dark:text-white/50">{order.user_email}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-oxford dark:text-white max-w-xs truncate">
                            {order.items.map((i) => i.course_title).join(", ")}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-sm text-oxford dark:text-white whitespace-nowrap">
                          {order.total.toLocaleString()} DA
                        </td>
                        <td className="px-5 py-4 text-sm text-silver dark:text-white/50 uppercase">
                          {order.paymentMethod}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", statusColor(order.status))}>
                              {statusLabel(order.status)}
                            </span>
                            {order.is_mismatched && (
                              <span title={t("statNeedsAttention")}>
                                <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-silver dark:text-white/50 whitespace-nowrap">
                          {formatDate(order.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-5 py-3 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
                <p className="text-xs text-silver dark:text-white/50">
                  {t("showing")} {orders.length} {t("of")} {totalCount} {t("ordersWord")}
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
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white dark:bg-oxford-light rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10 shrink-0">
                <div>
                  <h3 className="text-sm font-semibold text-oxford dark:text-white">
                    {t("modalOrderPrefix")}{shortId(selectedOrder.id)}
                  </h3>
                  <p className="text-xs text-silver dark:text-white/50">{formatDate(selectedOrder.created_at)}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-silver dark:text-white/50" />
                </button>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto">
                {selectedOrder.is_mismatched && (
                  <div className="flex items-start gap-2.5 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700 dark:text-red-400">
                      {t("modalMismatchWarning")}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-medium text-silver dark:text-white/50 mb-1">{t("modalBuyer")}</p>
                  <p className="text-sm text-oxford dark:text-white">{selectedOrder.user_name}</p>
                  <p className="text-xs text-silver dark:text-white/50">{selectedOrder.user_email}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-silver dark:text-white/50 mb-1">{t("tableStatus")}</p>
                    <span className={cn("inline-block px-2.5 py-1 rounded-full text-xs font-medium", statusColor(selectedOrder.status))}>
                      {statusLabel(selectedOrder.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-silver dark:text-white/50 mb-1">{t("tablePayment")}</p>
                    <p className="text-sm text-oxford dark:text-white uppercase">{selectedOrder.paymentMethod}</p>
                  </div>
                </div>

                {selectedOrder.chargily_checkout_id && (
                  <div>
                    <p className="text-xs font-medium text-silver dark:text-white/50 mb-1">{t("modalChargilyCheckout")}</p>
                    <p className="text-xs font-mono text-oxford dark:text-white break-all">{selectedOrder.chargily_checkout_id}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-medium text-silver dark:text-white/50 mb-2">{t("modalCourses")}</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg"
                      >
                        <div>
                          <p className="text-sm text-oxford dark:text-white">{item.course_title}</p>
                          <p className="text-xs text-silver dark:text-white/50">{item.price.toLocaleString()} DA</p>
                        </div>
                        {item.is_enrolled ? (
                          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            <CheckCircleIcon className="w-4 h-4" /> {t("modalEnrolled")}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-medium text-red-500">
                            <ExclamationTriangleIcon className="w-4 h-4" /> {t("modalNotEnrolled")}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-white/10">
                  <p className="text-sm font-medium text-oxford dark:text-white">{t("tableTotal")}</p>
                  <p className="text-lg font-bold text-oxford dark:text-white">{selectedOrder.total.toLocaleString()} DA</p>
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-white/10 space-y-2 shrink-0">
                <button
                  onClick={() => runAction("confirm", selectedOrder)}
                  disabled={actionLoading !== null}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-white/10 text-oxford dark:text-white rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === "confirm" ? (
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowPathIcon className="w-4 h-4" />
                  )}
                  {t("actionResync")}
                </button>

                <button
                  onClick={() => runAction("enroll", selectedOrder)}
                  disabled={actionLoading !== null}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gold text-oxford rounded-xl text-sm font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === "enroll" ? (
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserPlusIcon className="w-4 h-4" />
                  )}
                  {t("actionForceEnroll")}
                </button>

                {selectedOrder.status === "paid" && (
                  <button
                    onClick={() => runAction("refund", selectedOrder)}
                    disabled={actionLoading !== null}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === "refund" ? (
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    ) : (
                      <ReceiptRefundIcon className="w-4 h-4" />
                    )}
                    {t("actionMarkRefunded")}
                  </button>
                )}
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
              toast.type === "success"
                ? "bg-emerald-500 text-white"
                : "bg-red-500 text-white"
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
