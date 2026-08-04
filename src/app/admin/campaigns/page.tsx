"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SparklesIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import AdminHeader from "@/components/admin/AdminHeader";
import { campaignsApi, type CampaignPayload } from "@/services/promoGiftApi";

type ModalMode = "create" | "edit" | null;

interface MarketingCampaign {
  id: string;
  name: string;
  title: Record<string, string>;
  subtitle: Record<string, string>;
  discount_percentage: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  show_countdown: boolean;
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingCampaign, setEditingCampaign] = useState<MarketingCampaign | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("20");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [showCountdown, setShowCountdown] = useState(true);

  // Localized Texts (EN, FR, AR)
  const [titleFr, setTitleFr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  
  const [subtitleFr, setSubtitleFr] = useState("");
  const [subtitleEn, setSubtitleEn] = useState("");
  const [subtitleAr, setSubtitleAr] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await campaignsApi.list();
      setCampaigns(data);
    } catch {
      setFeedback({ type: "error", msg: "Erreur lors du chargement des campagnes." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const resetForm = () => {
    setName("");
    setDiscountPercentage("20");
    setStartDate("");
    setEndDate("");
    setIsActive(true);
    setShowCountdown(true);
    
    setTitleFr("");
    setTitleEn("");
    setTitleAr("");
    
    setSubtitleFr("");
    setSubtitleEn("");
    setSubtitleAr("");
    
    setEditingCampaign(null);
  };

  const openCreate = () => {
    resetForm();
    setModalMode("create");
  };

  const openEdit = (c: MarketingCampaign) => {
    setEditingCampaign(c);
    setName(c.name);
    setDiscountPercentage(String(c.discount_percentage));
    setStartDate(c.start_date ? c.start_date.slice(0, 16) : "");
    setEndDate(c.end_date ? c.end_date.slice(0, 16) : "");
    setIsActive(c.is_active);
    setShowCountdown(c.show_countdown);

    setTitleFr(c.title?.fr || "");
    setTitleEn(c.title?.en || "");
    setTitleAr(c.title?.ar || "");

    setSubtitleFr(c.subtitle?.fr || "");
    setSubtitleEn(c.subtitle?.en || "");
    setSubtitleAr(c.subtitle?.ar || "");

    setModalMode("edit");
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setFeedback({ type: "error", msg: "Veuillez saisir un nom de campagne." });
      return;
    }

    const payload: CampaignPayload = {
      name,
      title: {
        fr: titleFr.trim() || titleEn.trim() || name,
        en: titleEn.trim() || titleFr.trim() || name,
        ar: titleAr.trim() || titleFr.trim() || name,
      },
      subtitle: {
        fr: subtitleFr.trim(),
        en: subtitleEn.trim(),
        ar: subtitleAr.trim(),
      },
      discount_percentage: parseFloat(discountPercentage) || 0,
      start_date: startDate ? new Date(startDate).toISOString() : null,
      end_date: endDate ? new Date(endDate).toISOString() : null,
      is_active: isActive,
      show_countdown: showCountdown,
    };

    try {
      if (modalMode === "create") {
        await campaignsApi.create(payload);
        setFeedback({ type: "success", msg: "Campagne créée avec succès !" });
      } else if (editingCampaign) {
        await campaignsApi.update(editingCampaign.id, payload);
        setFeedback({ type: "success", msg: "Campagne mise à jour avec succès !" });
      }
      setModalMode(null);
      resetForm();
      fetchAll();
    } catch (err: any) {
      setFeedback({ type: "error", msg: err?.response?.data?.detail || err?.message || "Une erreur est survenue." });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await campaignsApi.delete(deleteId);
      setFeedback({ type: "success", msg: "Campagne supprimée." });
      setDeleteId(null);
      fetchAll();
    } catch {
      setFeedback({ type: "error", msg: "Impossible de supprimer la campagne." });
    }
  };

  // Auto-dismiss feedback toast
  useEffect(() => {
    if (feedback) {
      const t = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(t);
    }
  }, [feedback]);

  return (
    <div className="min-h-screen">
      <AdminHeader
        titleKey="admin.campaigns.title"
        subtitleKey="admin.campaigns.subtitle"
      />

      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-oxford dark:text-white flex items-center gap-3">
              <SparklesIcon className="w-7 h-7 text-gold animate-pulse" />
              Campagnes Marketing
            </h1>
            <p className="text-sm text-silver dark:text-gray-400 mt-1">
              Configurez des réductions globales et des bannières de vente flash
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-gold hover:bg-gold/90 text-oxford font-semibold rounded-xl transition-colors text-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Nouvelle campagne
          </button>
        </div>

        {/* Feedback Notifications */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                feedback.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
              ) : (
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
              )}
              <span className="text-sm font-medium">{feedback.msg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Campaigns Table */}
        <div className="bg-white dark:bg-oxford-light rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-10 h-10 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="p-12 text-center">
              <SparklesIcon className="w-12 h-12 text-silver/30 mx-auto mb-3" />
              <p className="text-sm text-silver dark:text-gray-400">Aucune campagne configurée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-silver dark:text-gray-300">
                    <th className="text-start px-5 py-3 font-semibold">Nom</th>
                    <th className="text-start px-5 py-3 font-semibold">Réduction</th>
                    <th className="text-start px-5 py-3 font-semibold">Planification</th>
                    <th className="text-start px-5 py-3 font-semibold">Bannière</th>
                    <th className="text-start px-5 py-3 font-semibold">Statut</th>
                    <th className="text-end px-5 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {campaigns.map((c) => {
                    const isEnded = c.end_date && new Date(c.end_date).getTime() < Date.now();
                    const isUpcoming = c.start_date && new Date(c.start_date).getTime() > Date.now();
                    
                    return (
                      <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-oxford dark:text-white">
                        <td className="px-5 py-4 font-medium">
                          {c.name}
                          <div className="text-[11px] text-silver dark:text-gray-500 font-normal mt-0.5 max-w-[200px] truncate">
                            {c.title?.fr || c.name}
                          </div>
                        </td>
                        <td className="px-5 py-4 font-semibold text-emerald-600 dark:text-emerald-400">
                          -{c.discount_percentage}%
                        </td>
                        <td className="px-5 py-4 text-xs font-mono text-silver dark:text-gray-400">
                          <div>Déb: {c.start_date ? new Date(c.start_date).toLocaleDateString() : "Immédiat"}</div>
                          <div>Fin: {c.end_date ? new Date(c.end_date).toLocaleDateString() : "Sans limite"}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                            c.show_countdown
                              ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "bg-gray-50 dark:bg-white/5 text-silver dark:text-gray-400"
                          }`}>
                            {c.show_countdown ? "Compteur actif" : "Masqué"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                            !c.is_active || isEnded
                              ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                              : isUpcoming
                              ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                              : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          }`}>
                            {!c.is_active ? "Désactivé" : isEnded ? "Terminé" : isUpcoming ? "Planifié" : "En cours"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-end">
                          <div className="flex items-center justify-end gap-2.5">
                            <button
                              onClick={() => openEdit(c)}
                              title="Modifier la campagne"
                              className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 text-silver hover:text-gold rounded-lg transition-colors"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteId(c.id)}
                              title="Supprimer la campagne"
                              className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 text-silver hover:text-red-500 rounded-lg transition-colors"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* CRUD Creation/Edition Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalMode(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative bg-white dark:bg-oxford-light rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10"
          >
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-oxford dark:text-white flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-gold" />
                {modalMode === "create" ? "Nouvelle Campagne Marketing" : "Modifier la Campagne"}
              </h3>
              <button
                onClick={() => setModalMode(null)}
                className="p-1 text-silver hover:text-oxford dark:hover:text-white rounded-lg"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Row 1: Internal Name & Discount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-silver dark:text-gray-400 uppercase tracking-wider mb-2">
                    Nom Interne
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex: Soldes de fin d'année"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold dark:text-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-silver dark:text-gray-400 uppercase tracking-wider mb-2">
                    Pourcentage de Réduction (%)
                  </label>
                  <input
                    type="number"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                    placeholder="ex: 20"
                    min="1"
                    max="100"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold dark:text-white transition-all"
                  />
                </div>
              </div>

              {/* Translation Group: Titles */}
              <div className="bg-gray-50 dark:bg-white/[0.02] p-4 rounded-xl border border-gray-100 dark:border-white/5 space-y-4">
                <span className="block text-xs font-bold text-oxford dark:text-gold uppercase tracking-wider">
                  Bannière - Titre Traduit (Multilingue)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-silver dark:text-gray-400 mb-1.5">Français (FR)</label>
                    <input
                      type="text"
                      value={titleFr}
                      onChange={(e) => setTitleFr(e.target.value)}
                      placeholder="Offre spéciale !"
                      className="w-full px-3 py-2 bg-white dark:bg-oxford border border-gray-200 dark:border-white/10 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold dark:text-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-silver dark:text-gray-400 mb-1.5">Anglais (EN)</label>
                    <input
                      type="text"
                      value={titleEn}
                      onChange={(e) => setTitleEn(e.target.value)}
                      placeholder="Special Offer!"
                      className="w-full px-3 py-2 bg-white dark:bg-oxford border border-gray-200 dark:border-white/10 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold dark:text-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-silver dark:text-gray-400 mb-1.5 text-right">العربية (AR)</label>
                    <input
                      type="text"
                      value={titleAr}
                      onChange={(e) => setTitleAr(e.target.value)}
                      placeholder="عرض خاص!"
                      dir="rtl"
                      className="w-full px-3 py-2 bg-white dark:bg-oxford border border-gray-200 dark:border-white/10 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold dark:text-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Translation Group: Subtitles */}
              <div className="bg-gray-50 dark:bg-white/[0.02] p-4 rounded-xl border border-gray-100 dark:border-white/5 space-y-4">
                <span className="block text-xs font-bold text-oxford dark:text-gold uppercase tracking-wider">
                  Bannière - Sous-titre Traduit (Multilingue)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-silver dark:text-gray-400 mb-1.5">Français (FR)</label>
                    <input
                      type="text"
                      value={subtitleFr}
                      onChange={(e) => setSubtitleFr(e.target.value)}
                      placeholder="Bénéficiez de 20% sur tout..."
                      className="w-full px-3 py-2 bg-white dark:bg-oxford border border-gray-200 dark:border-white/10 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold dark:text-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-silver dark:text-gray-400 mb-1.5">Anglais (EN)</label>
                    <input
                      type="text"
                      value={subtitleEn}
                      onChange={(e) => setSubtitleEn(e.target.value)}
                      placeholder="Get 20% off site-wide..."
                      className="w-full px-3 py-2 bg-white dark:bg-oxford border border-gray-200 dark:border-white/10 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold dark:text-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-silver dark:text-gray-400 mb-1.5 text-right">العربية (AR)</label>
                    <input
                      type="text"
                      value={subtitleAr}
                      onChange={(e) => setSubtitleAr(e.target.value)}
                      placeholder="خصم 20% على جميع الدورات..."
                      dir="rtl"
                      className="w-full px-3 py-2 bg-white dark:bg-oxford border border-gray-200 dark:border-white/10 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold dark:text-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Dates planning */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-silver dark:text-gray-400 uppercase tracking-wider mb-2">
                    Date de début
                  </label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold dark:text-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-silver dark:text-gray-400 uppercase tracking-wider mb-2">
                    Date de fin
                  </label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold dark:text-white transition-all"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4.5 h-4.5 rounded accent-gold text-oxford"
                  />
                  <span className="text-sm font-medium text-oxford dark:text-white">Campagne active</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showCountdown}
                    onChange={(e) => setShowCountdown(e.target.checked)}
                    className="w-4.5 h-4.5 rounded accent-gold text-oxford"
                  />
                  <span className="text-sm font-medium text-oxford dark:text-white">Afficher le compte à rebours</span>
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-white/5 flex gap-3 justify-end bg-gray-50 dark:bg-white/[0.01]">
              <button
                onClick={() => setModalMode(null)}
                className="px-4 py-2 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors dark:text-white"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2.5 bg-gold hover:bg-gold/90 text-oxford font-bold rounded-xl transition-colors text-sm"
              >
                {modalMode === "create" ? "Créer" : "Enregistrer"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white dark:bg-oxford-light rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 w-full max-w-md p-6 z-10"
          >
            <h3 className="text-lg font-bold text-oxford dark:text-white mb-2">
              Supprimer la campagne ?
            </h3>
            <p className="text-sm text-silver dark:text-gray-400 mb-6">
              Cette action est irréversible. Toutes les réductions actives associées à cette campagne prendront immédiatement fin.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2.5 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors dark:text-white"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors text-sm"
              >
                Supprimer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
