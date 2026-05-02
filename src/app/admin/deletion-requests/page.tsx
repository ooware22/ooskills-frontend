"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon as Search,
  TrashIcon,
  XMarkIcon as X,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  XCircleIcon,
  EyeIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import AdminHeader from "@/components/admin/AdminHeader";
import { cn } from "@/lib/utils";
import {
  listDeletionRequests,
  approveDeletionRequest,
  rejectDeletionRequest,
} from "@/services/accountDeletionApi";
import type { AdminDeletionRequest } from "@/services/accountDeletionApi";

type StatusFilter = "all" | "PENDING" | "APPROVED" | "REJECTED";

export default function DeletionRequestsPage() {
  const [requests, setRequests] = useState<AdminDeletionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Modal state
  const [viewRequest, setViewRequest] = useState<AdminDeletionRequest | null>(null);
  const [actionRequest, setActionRequest] = useState<AdminDeletionRequest | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listDeletionRequests({
        status: statusFilter === "all" ? undefined : statusFilter,
        search: search || undefined,
      });
      setRequests(data.results);
    } catch {
      showToast("Erreur lors du chargement des demandes.", "error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAction = async () => {
    if (!actionRequest || !actionType) return;
    setActionLoading(true);
    try {
      if (actionType === "approve") {
        await approveDeletionRequest(actionRequest.id, adminNotes);
        showToast("Demande approuvée avec succès.");
      } else {
        await rejectDeletionRequest(actionRequest.id, adminNotes);
        showToast("Demande rejetée.");
      }
      setActionRequest(null);
      setActionType(null);
      setAdminNotes("");
      fetchRequests();
    } catch {
      showToast("Erreur lors du traitement de la demande.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Stats
  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => r.status === "PENDING").length;
  const approvedCount = requests.filter((r) => r.status === "APPROVED").length;
  const rejectedCount = requests.filter((r) => r.status === "REJECTED").length;

  const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    PENDING: { label: "En attente", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: ClockIcon },
    APPROVED: { label: "Approuvée", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: CheckCircleIcon },
    REJECTED: { label: "Rejetée", color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10 border-red-500/20", icon: XCircleIcon },
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <AdminHeader
        title="Demandes de suppression"
        subtitle="Gérer les demandes de suppression de compte"
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total", count: totalCount, color: "from-blue-500 to-indigo-500", icon: TrashIcon },
            { label: "En attente", count: pendingCount, color: "from-amber-500 to-orange-500", icon: ClockIcon },
            { label: "Approuvées", count: approvedCount, color: "from-emerald-500 to-teal-500", icon: CheckCircleIcon },
            { label: "Rejetées", count: rejectedCount, color: "from-red-500 to-rose-500", icon: XCircleIcon },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-silver dark:text-white/50">{stat.label}</span>
                <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center", stat.color)}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-oxford dark:text-white">{stat.count}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver dark:text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom ou email..."
              className="w-full ps-9 pe-4 py-2.5 bg-white dark:bg-oxford-light border border-gray-200 dark:border-white/10 rounded-xl text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "PENDING", "APPROVED", "REJECTED"] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-xs font-medium border transition-all",
                  statusFilter === s
                    ? "bg-gold text-oxford border-gold"
                    : "bg-white dark:bg-oxford-light text-oxford dark:text-white border-gray-200 dark:border-white/10 hover:border-gold/30"
                )}
              >
                {s === "all" ? "Tous" : statusConfig[s].label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden"
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <TrashIcon className="w-12 h-12 text-silver/30 dark:text-white/10 mb-3" />
              <p className="text-sm font-medium text-oxford dark:text-white">Aucune demande trouvée</p>
              <p className="text-xs text-silver dark:text-white/50 mt-1">Aucune demande de suppression ne correspond à vos critères.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-oxford">
                    <th className="text-start px-4 py-3 text-xs font-medium text-silver dark:text-white/50">Utilisateur</th>
                    <th className="text-start px-4 py-3 text-xs font-medium text-silver dark:text-white/50">Raison</th>
                    <th className="text-start px-4 py-3 text-xs font-medium text-silver dark:text-white/50">Statut</th>
                    <th className="text-start px-4 py-3 text-xs font-medium text-silver dark:text-white/50">Date</th>
                    <th className="text-end px-4 py-3 text-xs font-medium text-silver dark:text-white/50">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => {
                    const cfg = statusConfig[req.status];
                    return (
                      <tr key={req.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center text-oxford text-xs font-bold flex-shrink-0">
                              {req.user_full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "?"}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-oxford dark:text-white truncate">{req.user_full_name}</p>
                              <p className="text-xs text-silver dark:text-white/40 truncate">{req.user_email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-oxford dark:text-white/70 max-w-[200px] truncate">{req.reason}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", cfg.bg, cfg.color)}>
                            <cfg.icon className="w-3 h-3" />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-silver dark:text-white/50">
                            {new Date(req.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setViewRequest(req)}
                              className="p-2 text-silver hover:text-oxford dark:text-white/40 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                              title="Voir les détails"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            {req.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() => { setActionRequest(req); setActionType("approve"); }}
                                  className="p-2 text-emerald-500 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                                  title="Approuver"
                                >
                                  <CheckCircleIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => { setActionRequest(req); setActionType("reject"); }}
                                  className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                  title="Rejeter"
                                >
                                  <XCircleIcon className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* ============ VIEW DETAIL MODAL ============ */}
      <AnimatePresence>
        {viewRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewRequest(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white dark:bg-oxford-light rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10">
                <h3 className="text-lg font-semibold text-oxford dark:text-white">Détails de la demande</h3>
                <button onClick={() => setViewRequest(null)} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* User info */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center text-oxford font-bold">
                    {viewRequest.user_full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "?"}
                  </div>
                  <div>
                    <p className="font-medium text-oxford dark:text-white">{viewRequest.user_full_name}</p>
                    <p className="text-xs text-silver dark:text-white/50">{viewRequest.user_email}</p>
                    <p className="text-xs text-silver dark:text-white/40">
                      Rôle: {viewRequest.user_role} · Inscrit le {new Date(viewRequest.user_date_joined).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>

                {/* Status */}
                {(() => {
                  const cfg = statusConfig[viewRequest.status];
                  return (
                    <div className={cn("p-3 rounded-xl border flex items-center gap-2", cfg.bg, cfg.color)}>
                      <cfg.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{cfg.label}</span>
                      {viewRequest.reviewed_at && (
                        <span className="text-xs opacity-70 ms-2">
                          le {new Date(viewRequest.reviewed_at).toLocaleDateString("fr-FR")}
                        </span>
                      )}
                    </div>
                  );
                })()}

                {/* Reason */}
                <div>
                  <p className="text-xs font-medium text-silver dark:text-white/50 mb-1.5">Raison de la demande</p>
                  <div className="p-3 bg-gray-50 dark:bg-oxford rounded-xl text-sm text-oxford dark:text-white/80 whitespace-pre-wrap">
                    {viewRequest.reason}
                  </div>
                </div>

                {/* Admin notes */}
                {viewRequest.admin_notes && (
                  <div>
                    <p className="text-xs font-medium text-silver dark:text-white/50 mb-1.5">Notes administrateur</p>
                    <div className="p-3 bg-gray-50 dark:bg-oxford rounded-xl text-sm text-oxford dark:text-white/80">
                      {viewRequest.admin_notes}
                    </div>
                    {viewRequest.reviewed_by_email && (
                      <p className="text-xs text-silver dark:text-white/40 mt-1">
                        Par: {viewRequest.reviewed_by_email}
                      </p>
                    )}
                  </div>
                )}

                {/* Dates */}
                <div className="flex gap-4 text-xs text-silver dark:text-white/40">
                  <span>Soumise: {new Date(viewRequest.created_at).toLocaleString("fr-FR")}</span>
                </div>

                {/* Actions for pending */}
                {viewRequest.status === "PENDING" && (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => { setActionRequest(viewRequest); setActionType("approve"); setViewRequest(null); }}
                      className="flex-1 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircleIcon className="w-4 h-4" /> Approuver
                    </button>
                    <button
                      onClick={() => { setActionRequest(viewRequest); setActionType("reject"); setViewRequest(null); }}
                      className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircleIcon className="w-4 h-4" /> Rejeter
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ APPROVE / REJECT MODAL ============ */}
      <AnimatePresence>
        {actionRequest && actionType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setActionRequest(null); setActionType(null); setAdminNotes(""); }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={cn(
                "relative w-full max-w-md bg-white dark:bg-oxford-light rounded-2xl shadow-2xl border overflow-hidden",
                actionType === "approve"
                  ? "border-emerald-200 dark:border-emerald-500/20"
                  : "border-red-200 dark:border-red-500/20"
              )}
            >
              <div className={cn(
                "flex items-center justify-between px-6 py-4 border-b",
                actionType === "approve"
                  ? "border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10"
                  : "border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10"
              )}>
                <div className="flex items-center gap-2">
                  {actionType === "approve" ? (
                    <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                  )}
                  <h3 className={cn("text-lg font-semibold", actionType === "approve" ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300")}>
                    {actionType === "approve" ? "Approuver la demande" : "Rejeter la demande"}
                  </h3>
                </div>
                <button
                  onClick={() => { setActionRequest(null); setActionType(null); setAdminNotes(""); }}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <UserCircleIcon className="w-8 h-8 text-silver dark:text-white/30" />
                  <div>
                    <p className="text-sm font-medium text-oxford dark:text-white">{actionRequest.user_full_name}</p>
                    <p className="text-xs text-silver dark:text-white/50">{actionRequest.user_email}</p>
                  </div>
                </div>

                {actionType === "approve" && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      ⚠️ L&apos;utilisateur pourra supprimer définitivement son compte après votre approbation.
                      Toutes ses données seront perdues.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">
                    Note administrateur (optionnel)
                  </label>
                  <textarea
                    rows={3}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder={actionType === "approve" ? "Note pour l'utilisateur..." : "Raison du rejet..."}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => { setActionRequest(null); setActionType(null); setAdminNotes(""); }}
                    className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-white/10 text-oxford dark:text-white rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAction}
                    disabled={actionLoading}
                    className={cn(
                      "flex-1 px-4 py-2.5 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50",
                      actionType === "approve"
                        ? "bg-emerald-500 hover:bg-emerald-600"
                        : "bg-red-500 hover:bg-red-600"
                    )}
                  >
                    {actionLoading
                      ? "Traitement..."
                      : actionType === "approve"
                        ? "Confirmer l'approbation"
                        : "Confirmer le rejet"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className={cn(
              "fixed bottom-6 left-1/2 z-[70] flex items-center gap-2 px-5 py-3 rounded-xl shadow-2xl border",
              toastType === "success"
                ? "bg-oxford dark:bg-white text-white dark:text-oxford border-white/10 dark:border-gray-200"
                : "bg-red-600 text-white border-red-500/20"
            )}
          >
            {toastType === "success" ? (
              <CheckCircleIcon className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
            ) : (
              <ExclamationTriangleIcon className="w-5 h-5 text-red-200" />
            )}
            <span className="text-sm font-medium">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
