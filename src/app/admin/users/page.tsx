"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon as Search,
  PlusIcon as Plus,
  PencilSquareIcon as Edit,
  TrashIcon as Trash,
  EyeIcon as Eye,
  XMarkIcon as X,
  UsersIcon,
  UserPlusIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  NoSymbolIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import AdminHeader from "@/components/admin/AdminHeader";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  activateUser,
  suspendUser,
  promoteUserAdmin,
  promoteUserInstructor,
  setFilters,
} from "@/store/slices/usersSlice";
import type { AdminUser, AdminUserCreatePayload, AdminUserUpdatePayload } from "@/services/adminUsersApi";

// Types for the form
type UserRole = "USER" | "INSTRUCTOR" | "ADMIN" | "SUPER_ADMIN";
type UserStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "DELETED";

export default function UsersPage() {
  const { t } = useI18n();
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const { users, totalCount, loading, saving, error, filters } = useSelector(
    (state: RootState) => state.adminUsers
  );

  // Local UI state
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view" | "delete" | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState(filters.search);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    wilaya: "",
    role: "USER" as UserRole,
    status: "ACTIVE" as UserStatus,
    is_staff: false,
    is_active: true,
    email_verified: false,
    language: "fr",
    newsletter_subscribed: false,
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch users on mount and when filters change
  const doFetch = useCallback(() => {
    dispatch(fetchUsers({
      search: filters.search || undefined,
      role: filters.role !== "all" ? filters.role : undefined,
      status: filters.status !== "all" ? filters.status : undefined,
    }));
  }, [dispatch, filters]);

  useEffect(() => {
    doFetch();
  }, [doFetch]);

  // Debounced search
  const handleSearchChange = (val: string) => {
    setLocalSearch(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      dispatch(setFilters({ search: val }));
    }, 400);
  };

  // Stats (computed from loaded users — approximate since paginated)
  const activeUsersCount = users.filter((u) => u.status === "ACTIVE").length;
  const newThisMonth = users.filter((u) => {
    const d = new Date(u.date_joined);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // Translation helpers
  const tu = (key: string) => t(`admin.users.${key}`);

  const ROLE_LABELS: Record<string, string> = { USER: "roleStudent", INSTRUCTOR: "roleInstructor", ADMIN: "roleAdmin", SUPER_ADMIN: "roleSuperadmin" };
  const STATUS_LABELS: Record<string, string> = { PENDING: "statusPending", ACTIVE: "statusActive", SUSPENDED: "statusSuspended", DELETED: "statusDeleted" };
  const roleLabel = (role: UserRole) => tu(ROLE_LABELS[role] || role);
  const statusLabel = (status: UserStatus) => tu(STATUS_LABELS[status] || status);

  const statusColor = (status: UserStatus) => {
    switch (status) {
      case "ACTIVE": return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
      case "PENDING": return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
      case "SUSPENDED": return "bg-red-500/10 text-red-600 dark:text-red-400";
      case "DELETED": return "bg-red-700/10 text-red-700 dark:text-red-500";
      default: return "bg-gray-500/10 text-gray-600";
    }
  };

  const statusDot = (status: UserStatus) => {
    switch (status) {
      case "ACTIVE": return "bg-emerald-500";
      case "PENDING": return "bg-amber-400";
      case "SUSPENDED": return "bg-red-500";
      case "DELETED": return "bg-red-700";
      default: return "bg-gray-400";
    }
  };

  const roleColor = (role: UserRole) => {
    switch (role) {
      case "ADMIN": return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
      case "SUPER_ADMIN": return "bg-red-500/10 text-red-600 dark:text-red-400";
      case "INSTRUCTOR": return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "USER": return "bg-gold/10 text-gold";
      default: return "bg-gray-500/10 text-gray-600";
    }
  };

  // Toast
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Avatar helpers
  const getUserAvatar = (user: AdminUser) => user.avatar_display_url || user.avatar_url || null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Modal CRUD
  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      phone: "",
      wilaya: "",
      role: "USER",
      status: "ACTIVE",
      is_staff: false,
      is_active: true,
      email_verified: false,
      language: "fr",
      newsletter_subscribed: false,
    });
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const openAdd = () => {
    resetForm();
    setModalMode("add");
  };

  const openEdit = (user: AdminUser) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: "",
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone || "",
      wilaya: user.wilaya || "",
      role: user.role as UserRole,
      status: user.status as UserStatus,
      is_staff: user.is_staff,
      is_active: user.is_active,
      email_verified: user.email_verified,
      language: user.language || "fr",
      newsletter_subscribed: user.newsletter_subscribed,
    });
    setAvatarFile(null);
    setAvatarPreview(getUserAvatar(user));
    setModalMode("edit");
  };

  const openView = (user: AdminUser) => {
    setSelectedUser(user);
    setModalMode("view");
  };

  const openDelete = (user: AdminUser) => {
    setSelectedUser(user);
    setModalMode("delete");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedUser(null);
    resetForm();
  };

  const handleSave = async () => {
    if (modalMode === "add") {
      if (!formData.password) return;
      const payload: AdminUserCreatePayload = {
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone || undefined,
        wilaya: formData.wilaya || undefined,
        role: formData.role,
        status: formData.status,
        is_staff: formData.is_staff,
        email_verified: formData.email_verified,
        language: formData.language,
        newsletter_subscribed: formData.newsletter_subscribed,
      };
      if (avatarFile) payload.avatar = avatarFile;

      const result = await dispatch(createUser(payload));
      if (createUser.fulfilled.match(result)) {
        showToast(tu("userAdded"));
        closeModal();
      }
    } else if (modalMode === "edit" && selectedUser) {
      const payload: AdminUserUpdatePayload = {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        wilaya: formData.wilaya,
        role: formData.role,
        status: formData.status,
        is_staff: formData.is_staff,
        is_active: formData.is_active,
        email_verified: formData.email_verified,
        language: formData.language,
        newsletter_subscribed: formData.newsletter_subscribed,
      };
      if (avatarFile) payload.avatar = avatarFile;

      const result = await dispatch(updateUser({ id: selectedUser.id, data: payload }));
      if (updateUser.fulfilled.match(result)) {
        showToast(tu("userUpdated"));
        closeModal();
      }
    }
  };

  const handleDelete = async () => {
    if (selectedUser) {
      const result = await dispatch(deleteUser(selectedUser.id));
      if (deleteUser.fulfilled.match(result)) {
        showToast(tu("userDeleted"));
        closeModal();
      }
    }
  };

  // Action handlers
  const handleActivate = async (user: AdminUser) => {
    const result = await dispatch(activateUser(user.id));
    if (activateUser.fulfilled.match(result)) showToast("User activated");
  };

  const handleSuspend = async (user: AdminUser) => {
    const result = await dispatch(suspendUser(user.id));
    if (suspendUser.fulfilled.match(result)) showToast("User suspended");
  };

  const handlePromoteAdmin = async (user: AdminUser) => {
    const result = await dispatch(promoteUserAdmin(user.id));
    if (promoteUserAdmin.fulfilled.match(result)) showToast("User promoted to admin");
  };

  const handlePromoteInstructor = async (user: AdminUser) => {
    const result = await dispatch(promoteUserInstructor(user.id));
    if (promoteUserInstructor.fulfilled.match(result)) showToast("User promoted to instructor");
  };

  return (
    <div className="min-h-screen">
      <AdminHeader titleKey="admin.users.title" subtitleKey="admin.users.subtitle" />

      <div className="p-4 lg:p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: tu("totalUsers"), value: totalCount, icon: UsersIcon, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: tu("activeUsers"), value: activeUsersCount, icon: ChartBarIcon, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { label: tu("newThisMonth"), value: newThisMonth, icon: UserPlusIcon, color: "text-gold", bg: "bg-gold/10" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-silver dark:text-white/50">{stat.label}</p>
                  <p className="text-2xl font-bold text-oxford dark:text-white mt-1">{stat.value}</p>
                </div>
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", stat.bg)}>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 p-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={tu("searchPlaceholder")}
                value={localSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full ps-10 pe-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors"
              />
            </div>

            {/* Role Filter */}
            <select
              value={filters.role}
              onChange={(e) => dispatch(setFilters({ role: e.target.value }))}
              className="px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors cursor-pointer"
            >
              <option value="all">{tu("allRoles")}</option>
              <option value="USER">{tu("roleStudent")}</option>
              <option value="INSTRUCTOR">{tu("roleInstructor")}</option>
              <option value="ADMIN">{tu("roleAdmin")}</option>
              <option value="SUPER_ADMIN">{tu("roleSuperadmin")}</option>
            </select>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => dispatch(setFilters({ status: e.target.value }))}
              className="px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors cursor-pointer"
            >
              <option value="all">{tu("allStatuses")}</option>
              <option value="ACTIVE">{tu("statusActive")}</option>
              <option value="PENDING">{tu("statusPending")}</option>
              <option value="SUSPENDED">{tu("statusSuspended")}</option>
            </select>

            {/* Add User Button */}
            <button
              onClick={openAdd}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gold text-oxford rounded-lg text-sm font-semibold hover:bg-gold/90 transition-colors shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>{tu("addUser")}</span>
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden"
        >
          {/* Loading State */}
          {loading && (
            <div className="p-12 flex flex-col items-center gap-3">
              <ArrowPathIcon className="w-8 h-8 text-gold animate-spin" />
              <p className="text-sm text-silver dark:text-white/50">Loading users...</p>
            </div>
          )}

          {/* Desktop Table */}
          {!loading && (
            <>
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-white/10">
                      <th className="text-start px-5 py-4 text-xs font-semibold text-silver dark:text-white/50 uppercase tracking-wider">
                        {tu("firstName")} / {tu("lastName")}
                      </th>
                      <th className="text-start px-5 py-4 text-xs font-semibold text-silver dark:text-white/50 uppercase tracking-wider">
                        {tu("email")}
                      </th>
                      <th className="text-start px-5 py-4 text-xs font-semibold text-silver dark:text-white/50 uppercase tracking-wider">
                        {tu("role")}
                      </th>
                      <th className="text-start px-5 py-4 text-xs font-semibold text-silver dark:text-white/50 uppercase tracking-wider">
                        {tu("status")}
                      </th>
                      <th className="text-start px-5 py-4 text-xs font-semibold text-silver dark:text-white/50 uppercase tracking-wider">
                        {tu("joinDate")}
                      </th>
                      <th className="text-end px-5 py-4 text-xs font-semibold text-silver dark:text-white/50 uppercase tracking-wider">
                        {tu("actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {users.map((user, idx) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {getUserAvatar(user) ? (
                              <Image
                                src={getUserAvatar(user)!}
                                alt={user.full_name}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 dark:ring-white/10"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center ring-2 ring-gray-100 dark:ring-white/10">
                                <span className="text-sm font-semibold text-gold">
                                  {user.first_name?.[0]}{user.last_name?.[0]}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-oxford dark:text-white text-sm">
                                {user.first_name} {user.last_name}
                              </p>
                              <p className="text-xs text-silver dark:text-white/40">{user.phone || "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600 dark:text-white/60">
                          <div className="flex items-center gap-1.5">
                            {user.email}
                            {user.email_verified && (
                              <CheckCircleIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={cn("inline-flex px-2.5 py-1 rounded-full text-xs font-medium", roleColor(user.role as UserRole))}>
                            {roleLabel(user.role as UserRole)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", statusColor(user.status as UserStatus))}>
                            <span className={cn("w-1.5 h-1.5 rounded-full", statusDot(user.status as UserStatus))} />
                            {statusLabel(user.status as UserStatus)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600 dark:text-white/60">
                          {new Date(user.date_joined).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openView(user)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors" title={tu("viewUser")}>
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => openEdit(user)} className="p-2 text-gray-400 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors" title={tu("editUser")}>
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => openDelete(user)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title={tu("deleteUser")}>
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-gray-100 dark:divide-white/5">
                {users.map((user) => (
                  <div key={user.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getUserAvatar(user) ? (
                          <Image
                            src={getUserAvatar(user)!}
                            alt={user.full_name}
                            width={44}
                            height={44}
                            className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-100 dark:ring-white/10"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-gold/20 flex items-center justify-center ring-2 ring-gray-100 dark:ring-white/10">
                            <span className="text-sm font-semibold text-gold">
                              {user.first_name?.[0]}{user.last_name?.[0]}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-oxford dark:text-white text-sm">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-xs text-silver dark:text-white/40">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openView(user)} className="p-2 text-gray-400 hover:text-blue-500 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEdit(user)} className="p-2 text-gray-400 hover:text-gold rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => openDelete(user)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors">
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("inline-flex px-2.5 py-1 rounded-full text-xs font-medium", roleColor(user.role as UserRole))}>
                        {roleLabel(user.role as UserRole)}
                      </span>
                      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", statusColor(user.status as UserStatus))}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", statusDot(user.status as UserStatus))} />
                        {statusLabel(user.status as UserStatus)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {users.length === 0 && !loading && (
                <div className="p-12 text-center">
                  <UsersIcon className="w-12 h-12 text-gray-300 dark:text-white/20 mx-auto mb-3" />
                  <p className="text-sm text-silver dark:text-white/50">{tu("noUsersFound")}</p>
                </div>
              )}

              {/* Footer */}
              <div className="px-5 py-3 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
                <p className="text-xs text-silver dark:text-white/50">
                  {tu("showing")} {users.length} {tu("of")} {totalCount} {tu("users")}
                </p>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* =================== MODALS =================== */}
      <AnimatePresence>
        {modalMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={cn(
                "relative w-full bg-white dark:bg-oxford-light rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden",
                modalMode === "delete" ? "max-w-md" : "max-w-lg"
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10">
                <h3 className="text-lg font-semibold text-oxford dark:text-white">
                  {modalMode === "add" && tu("addUser")}
                  {modalMode === "edit" && tu("editUser")}
                  {modalMode === "view" && tu("viewUser")}
                  {modalMode === "delete" && tu("deleteUser")}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Delete Confirmation */}
              {modalMode === "delete" && selectedUser && (
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 rounded-xl">
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800 dark:text-red-300">{tu("confirmDelete")}</p>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">{tu("confirmDeleteDesc")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                    {getUserAvatar(selectedUser) ? (
                      <Image src={getUserAvatar(selectedUser)!} alt={selectedUser.full_name} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                        <span className="text-sm font-semibold text-gold">{selectedUser.first_name?.[0]}{selectedUser.last_name?.[0]}</span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-oxford dark:text-white text-sm">{selectedUser.first_name} {selectedUser.last_name}</p>
                      <p className="text-xs text-silver dark:text-white/40">{selectedUser.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={closeModal} className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-white/10 text-oxford dark:text-white rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      {t("admin.common.cancel")}
                    </button>
                    <button onClick={handleDelete} disabled={saving} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50">
                      {saving ? "..." : t("admin.common.delete")}
                    </button>
                  </div>
                </div>
              )}

              {/* View User */}
              {modalMode === "view" && selectedUser && (
                <div className="p-6 space-y-5">
                  <div className="flex items-center gap-4">
                    {getUserAvatar(selectedUser) ? (
                      <Image src={getUserAvatar(selectedUser)!} alt={selectedUser.full_name} width={64} height={64} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-gray-100 dark:ring-white/10" />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gold/20 flex items-center justify-center ring-2 ring-gray-100 dark:ring-white/10">
                        <span className="text-xl font-bold text-gold">{selectedUser.first_name?.[0]}{selectedUser.last_name?.[0]}</span>
                      </div>
                    )}
                    <div>
                      <p className="text-lg font-semibold text-oxford dark:text-white">
                        {selectedUser.first_name} {selectedUser.last_name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn("inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium", roleColor(selectedUser.role as UserRole))}>
                          {roleLabel(selectedUser.role as UserRole)}
                        </span>
                        <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium", statusColor(selectedUser.status as UserStatus))}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", statusDot(selectedUser.status as UserStatus))} />
                          {statusLabel(selectedUser.status as UserStatus)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: tu("email"), value: selectedUser.email },
                      { label: tu("phone"), value: selectedUser.phone || "—" },
                      { label: tu("joinDate"), value: new Date(selectedUser.date_joined).toLocaleDateString() },
                      { label: tu("lastActive"), value: selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleDateString() : "—" },
                      { label: "Wilaya", value: selectedUser.wilaya_name || "—" },
                      { label: "Email vérifié", value: selectedUser.email_verified ? "✓ Oui" : "✗ Non" },
                      { label: "Langue", value: selectedUser.language === "fr" ? "Français" : selectedUser.language === "ar" ? "العربية" : "English" },
                      { label: "Newsletter", value: selectedUser.newsletter_subscribed ? "✓ Abonné" : "✗ Non abonné" },
                      { label: "Compte actif", value: selectedUser.is_active ? "✓ Oui" : "✗ Non" },
                      { label: "Accès admin", value: selectedUser.is_staff ? "✓ Oui" : "✗ Non" },
                      { label: "Dernière modification", value: selectedUser.updated_at ? new Date(selectedUser.updated_at).toLocaleDateString() : "—" },
                      { label: "Supabase ID", value: selectedUser.supabase_id ? selectedUser.supabase_id.substring(0, 8) + "..." : "—" },
                    ].map((item) => (
                      <div key={item.label} className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                        <p className="text-xs text-silver dark:text-white/40 mb-1">{item.label}</p>
                        <p className="text-sm font-medium text-oxford dark:text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedUser.status !== "ACTIVE" && (
                      <button onClick={() => { handleActivate(selectedUser); closeModal(); }} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-500/20 transition-colors">
                        <CheckCircleIcon className="w-4 h-4" /> Activer
                      </button>
                    )}
                    {selectedUser.status === "ACTIVE" && (
                      <button onClick={() => { handleSuspend(selectedUser); closeModal(); }} className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-colors">
                        <NoSymbolIcon className="w-4 h-4" /> Suspendre
                      </button>
                    )}
                    {selectedUser.role !== "ADMIN" && selectedUser.role !== "SUPER_ADMIN" && (
                      <button onClick={() => { handlePromoteAdmin(selectedUser); closeModal(); }} className="flex items-center gap-1.5 px-3 py-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-medium hover:bg-purple-500/20 transition-colors">
                        <ShieldCheckIcon className="w-4 h-4" /> Promouvoir Admin
                      </button>
                    )}
                    {selectedUser.role !== "INSTRUCTOR" && (
                      <button onClick={() => { handlePromoteInstructor(selectedUser); closeModal(); }} className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-500/20 transition-colors">
                        <AcademicCapIcon className="w-4 h-4" /> Promouvoir Instructeur
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Add / Edit Form */}
              {(modalMode === "add" || modalMode === "edit") && (
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  {/* Avatar Upload */}
                  <div className="flex items-center gap-4">
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt="Avatar preview"
                        width={56}
                        height={56}
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-gray-100 dark:ring-white/10"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                        <UsersIcon className="w-6 h-6 text-gray-300 dark:text-white/20" />
                      </div>
                    )}
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1">{tu("avatar")}</label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gold/10 file:text-gold hover:file:bg-gold/20 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Name Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">{tu("firstName")}</label>
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">{tu("lastName")}</label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">{tu("email")}</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors"
                    />
                  </div>

                  {/* Password (required for add) */}
                  {modalMode === "add" && (
                    <div>
                      <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">Mot de passe <span className="text-red-500">*</span></label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        placeholder="Entrez un mot de passe"
                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors"
                      />
                    </div>
                  )}

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">{tu("phone")}</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors"
                    />
                  </div>

                  {/* Role & Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">{tu("role")}</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors cursor-pointer"
                      >
                        <option value="USER">{tu("roleStudent")}</option>
                        <option value="INSTRUCTOR">{tu("roleInstructor")}</option>
                        <option value="ADMIN">{tu("roleAdmin")}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">{tu("status")}</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors cursor-pointer"
                      >
                        <option value="ACTIVE">{tu("statusActive")}</option>
                        <option value="PENDING">{tu("statusPending")}</option>
                        <option value="SUSPENDED">{tu("statusSuspended")}</option>
                      </select>
                    </div>
                  </div>

                  {/* Wilaya */}
                  <div>
                    <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">Wilaya</label>
                    <input
                      type="text"
                      value={formData.wilaya}
                      onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
                      placeholder="Ex: 16 (Alger)"
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors"
                    />
                  </div>

                  {/* Language */}
                  <div>
                    <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">Langue préférée</label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors cursor-pointer"
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                      <option value="ar">العربية</option>
                    </select>
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-3 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.email_verified}
                        onChange={(e) => setFormData({ ...formData, email_verified: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-gold focus:ring-gold"
                      />
                      <span className="text-sm text-oxford dark:text-white">Email vérifié</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_staff}
                        onChange={(e) => setFormData({ ...formData, is_staff: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-gold focus:ring-gold"
                      />
                      <span className="text-sm text-oxford dark:text-white">Accès admin Django</span>
                    </label>
                    {modalMode === "edit" && (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-gold focus:ring-gold"
                        />
                        <span className="text-sm text-oxford dark:text-white">Compte actif</span>
                      </label>
                    )}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.newsletter_subscribed}
                        onChange={(e) => setFormData({ ...formData, newsletter_subscribed: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-gold focus:ring-gold"
                      />
                      <span className="text-sm text-oxford dark:text-white">Abonné à la newsletter</span>
                    </label>
                  </div>

                  {/* Error display */}
                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-lg">
                      <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-3">
                    <button
                      onClick={closeModal}
                      className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-white/10 text-oxford dark:text-white rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      {t("admin.common.cancel")}
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving || !formData.first_name || !formData.last_name || !formData.email}
                      className="flex-1 px-4 py-2.5 bg-gold text-oxford rounded-xl text-sm font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      {saving ? "..." : modalMode === "add" ? tu("addUser") : t("admin.common.save")}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className="fixed bottom-6 left-1/2 z-[60] flex items-center gap-2 px-5 py-3 bg-oxford dark:bg-white text-white dark:text-oxford rounded-xl shadow-2xl border border-white/10 dark:border-gray-200"
          >
            <CheckCircleIcon className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
            <span className="text-sm font-medium">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
