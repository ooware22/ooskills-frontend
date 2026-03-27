"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TagIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { promoApi, type PromoCode, type PromoCodePayload } from "@/services/promoGiftApi";

type ModalMode = "create" | "edit" | null;

export default function AdminPromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Form fields
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [maxUses, setMaxUses] = useState("0");
  const [maxUsesPerUser, setMaxUsesPerUser] = useState("1");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [minOrderTotal, setMinOrderTotal] = useState("0");
  const [isActive, setIsActive] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await promoApi.list();
      setPromoCodes(data);
    } catch {
      setFeedback({ type: "error", msg: "Erreur de chargement." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const resetForm = () => {
    setCode(""); setDiscountType("percentage"); setDiscountValue("");
    setMaxUses("0"); setMaxUsesPerUser("1"); setValidFrom(""); setValidUntil("");
    setMinOrderTotal("0"); setIsActive(true); setEditingPromo(null);
  };

  const openCreate = () => { resetForm(); setModalMode("create"); };

  const openEdit = (p: PromoCode) => {
    setEditingPromo(p);
    setCode(p.code);
    setDiscountType(p.discount_type);
    setDiscountValue(String(p.discount_value));
    setMaxUses(String(p.max_uses));
    setMaxUsesPerUser(String(p.max_uses_per_user));
    setValidFrom(p.valid_from ? p.valid_from.slice(0, 16) : "");
    setValidUntil(p.valid_until ? p.valid_until.slice(0, 16) : "");
    setMinOrderTotal(String(p.min_order_total));
    setIsActive(p.is_active);
    setModalMode("edit");
  };

  const handleSave = async () => {
    const payload: PromoCodePayload = {
      code: code.toUpperCase(),
      discount_type: discountType,
      discount_value: parseFloat(discountValue) || 0,
      max_uses: parseInt(maxUses) || 0,
      max_uses_per_user: parseInt(maxUsesPerUser) || 1,
      valid_from: validFrom || null,
      valid_until: validUntil || null,
      min_order_total: parseInt(minOrderTotal) || 0,
      is_active: isActive,
    };
    try {
      if (modalMode === "create") {
        await promoApi.create(payload);
        setFeedback({ type: "success", msg: "Code promo créé !" });
      } else if (editingPromo) {
        await promoApi.update(editingPromo.id, payload);
        setFeedback({ type: "success", msg: "Code promo mis à jour !" });
      }
      setModalMode(null);
      resetForm();
      fetchAll();
    } catch (err: any) {
      setFeedback({ type: "error", msg: err?.message || "Erreur." });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await promoApi.delete(deleteId);
      setFeedback({ type: "success", msg: "Code promo supprimé." });
      setDeleteId(null);
      fetchAll();
    } catch {
      setFeedback({ type: "error", msg: "Erreur de suppression." });
    }
  };

  // Auto-dismiss feedback
  useEffect(() => {
    if (feedback) {
      const t = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(t);
    }
  }, [feedback]);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-oxford dark:text-white flex items-center gap-3">
            <TagIcon className="w-7 h-7 text-gold" />
            Codes Promo
          </h1>
          <p className="text-sm text-silver dark:text-gray-400 mt-1">
            Gérez vos codes promotionnels et réductions
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-gold hover:bg-gold/90 text-oxford font-semibold rounded-xl transition-colors text-sm"
        >
          <PlusIcon className="w-4 h-4" />
          Nouveau code
        </button>
      </div>

      {/* Feedback toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-4 p-4 rounded-xl flex items-center gap-3 ${
              feedback.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircleIcon className="w-5 h-5" />
            ) : (
              <ExclamationTriangleIcon className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">{feedback.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="bg-white dark:bg-oxford-light rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" />
          </div>
        ) : promoCodes.length === 0 ? (
          <div className="p-12 text-center">
            <TagIcon className="w-12 h-12 text-silver/30 mx-auto mb-3" />
            <p className="text-sm text-silver dark:text-gray-400">Aucun code promo</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                  <th className="text-start px-5 py-3 font-semibold text-oxford dark:text-white">Code</th>
                  <th className="text-start px-5 py-3 font-semibold text-oxford dark:text-white">Réduction</th>
                  <th className="text-start px-5 py-3 font-semibold text-oxford dark:text-white">Utilisations</th>
                  <th className="text-start px-5 py-3 font-semibold text-oxford dark:text-white">Validité</th>
                  <th className="text-start px-5 py-3 font-semibold text-oxford dark:text-white">Statut</th>
                  <th className="text-end px-5 py-3 font-semibold text-oxford dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {promoCodes.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-oxford dark:text-white">{p.code}</span>
                    </td>
                    <td className="px-5 py-4 text-silver dark:text-gray-400">
                      {p.discount_type === "percentage" ? `${p.discount_value}%` : `${p.discount_value} DZD`}
                    </td>
                    <td className="px-5 py-4 text-silver dark:text-gray-400">
                      {p.uses_count} / {p.max_uses || "∞"}
                    </td>
                    <td className="px-5 py-4 text-silver dark:text-gray-400 text-xs">
                      {p.valid_from ? new Date(p.valid_from).toLocaleDateString() : "—"}{" "}
                      → {p.valid_until ? new Date(p.valid_until).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        p.is_active
                          ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-red-50 dark:bg-red-500/10 text-red-500"
                      }`}>
                        {p.is_active ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-end">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-silver hover:text-oxford dark:hover:text-white transition-colors"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-silver hover:text-red-500 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {modalMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalMode(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-oxford-light rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-oxford dark:text-white">
                    {modalMode === "create" ? "Nouveau code promo" : "Modifier le code"}
                  </h3>
                  <button onClick={() => setModalMode(null)} className="p-1.5 text-silver hover:text-oxford dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/5">
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Code */}
                  <div>
                    <label className="block text-xs font-medium text-silver dark:text-gray-400 mb-1.5">Code</label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="SUMMER50"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-oxford dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                    />
                  </div>

                  {/* Type + Value */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-silver dark:text-gray-400 mb-1.5">Type</label>
                      <select
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value as "percentage" | "fixed")}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50"
                      >
                        <option value="percentage">Pourcentage (%)</option>
                        <option value="fixed">Montant fixe (DZD)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-silver dark:text-gray-400 mb-1.5">Valeur</label>
                      <input
                        type="number"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        placeholder={discountType === "percentage" ? "20" : "500"}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50"
                      />
                    </div>
                  </div>

                  {/* Max uses */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-silver dark:text-gray-400 mb-1.5">Max utilisations (0=illimité)</label>
                      <input type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-silver dark:text-gray-400 mb-1.5">Max par utilisateur</label>
                      <input type="number" value={maxUsesPerUser} onChange={(e) => setMaxUsesPerUser(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50" />
                    </div>
                  </div>

                  {/* Date range */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-silver dark:text-gray-400 mb-1.5">Valide à partir de</label>
                      <input type="datetime-local" value={validFrom} onChange={(e) => setValidFrom(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-silver dark:text-gray-400 mb-1.5">Valide jusqu&apos;à</label>
                      <input type="datetime-local" value={validUntil} onChange={(e) => setValidUntil(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50" />
                    </div>
                  </div>

                  {/* Min order + active */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-silver dark:text-gray-400 mb-1.5">Montant minimum (DZD)</label>
                      <input type="number" value={minOrderTotal} onChange={(e) => setMinOrderTotal(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50" />
                    </div>
                    <div className="flex items-end pb-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={(e) => setIsActive(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-gold focus:ring-gold"
                        />
                        <span className="text-sm text-oxford dark:text-white font-medium">Actif</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setModalMode(null)}
                    className="flex-1 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-oxford dark:text-white font-medium rounded-xl transition-colors text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!code.trim() || !discountValue}
                    className="flex-1 py-3 bg-gold hover:bg-gold/90 text-oxford font-semibold rounded-xl transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {modalMode === "create" ? "Créer" : "Mettre à jour"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-oxford-light rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 w-full max-w-sm p-6"
            >
              <div className="text-center">
                <div className="w-14 h-14 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrashIcon className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-oxford dark:text-white mb-2">Supprimer ce code ?</h3>
                <p className="text-sm text-silver dark:text-gray-400 mb-6">Cette action est irréversible.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteId(null)}
                    className="flex-1 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-oxford dark:text-white font-medium rounded-xl transition-colors text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors text-sm"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
