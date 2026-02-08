"use client";

import { useState, useMemo } from "react";
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
} from "@heroicons/react/24/outline";
import AdminHeader from "@/components/admin/AdminHeader";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Types
type UserRole = "admin" | "student" | "instructor";
type UserStatus = "active" | "inactive" | "suspended";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  avatar: string;
  joinDate: string;
  lastActive: string;
}

// Static mock data with real images
const initialUsers: User[] = [
  {
    id: "1",
    firstName: "Ahmed",
    lastName: "Benali",
    email: "ahmed.benali@email.com",
    phone: "+213 555 123 001",
    role: "admin",
    status: "active",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    joinDate: "2025-03-15",
    lastActive: "2026-02-07",
  },
  {
    id: "2",
    firstName: "Fatima",
    lastName: "Zohra",
    email: "fatima.zohra@email.com",
    phone: "+213 555 123 002",
    role: "instructor",
    status: "active",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    joinDate: "2025-05-20",
    lastActive: "2026-02-06",
  },
  {
    id: "3",
    firstName: "Karim",
    lastName: "Messaoudi",
    email: "karim.messaoudi@email.com",
    phone: "+213 555 123 003",
    role: "student",
    status: "active",
    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    joinDate: "2025-07-10",
    lastActive: "2026-02-05",
  },
  {
    id: "4",
    firstName: "Amina",
    lastName: "Boudiaf",
    email: "amina.boudiaf@email.com",
    phone: "+213 555 123 004",
    role: "student",
    status: "inactive",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    joinDate: "2025-08-01",
    lastActive: "2026-01-15",
  },
  {
    id: "5",
    firstName: "Youssef",
    lastName: "Khelifi",
    email: "youssef.khelifi@email.com",
    phone: "+213 555 123 005",
    role: "instructor",
    status: "active",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    joinDate: "2025-04-12",
    lastActive: "2026-02-07",
  },
  {
    id: "6",
    firstName: "Nadia",
    lastName: "Hadjadj",
    email: "nadia.hadjadj@email.com",
    phone: "+213 555 123 006",
    role: "student",
    status: "suspended",
    avatar: "https://randomuser.me/api/portraits/women/17.jpg",
    joinDate: "2025-09-22",
    lastActive: "2025-12-10",
  },
  {
    id: "7",
    firstName: "Mohamed",
    lastName: "Rahmani",
    email: "mohamed.rahmani@email.com",
    phone: "+213 555 123 007",
    role: "student",
    status: "active",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    joinDate: "2025-11-05",
    lastActive: "2026-02-04",
  },
  {
    id: "8",
    firstName: "Sara",
    lastName: "Djebbari",
    email: "sara.djebbari@email.com",
    phone: "+213 555 123 008",
    role: "admin",
    status: "active",
    avatar: "https://randomuser.me/api/portraits/women/90.jpg",
    joinDate: "2025-02-28",
    lastActive: "2026-02-07",
  },
];

const emptyUser: Omit<User, "id"> = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "student",
  status: "active",
  avatar: "",
  joinDate: new Date().toISOString().split("T")[0],
  lastActive: new Date().toISOString().split("T")[0],
};

export default function UsersPage() {
  const { t } = useI18n();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");

  // Modal state
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view" | "delete" | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Omit<User, "id">>(emptyUser);
  const [toast, setToast] = useState<string | null>(null);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchSearch =
        search === "" ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === "all" || user.role === roleFilter;
      const matchStatus = statusFilter === "all" || user.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  // Stats
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "active").length;
  const newThisMonth = users.filter((u) => {
    const joinDate = new Date(u.joinDate);
    const now = new Date();
    return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
  }).length;

  // Translation helpers
  const tu = (key: string) => t(`admin.users.${key}`);

  const roleLabel = (role: UserRole) => tu(`role${role.charAt(0).toUpperCase() + role.slice(1)}`);
  const statusLabel = (status: UserStatus) => tu(`status${status.charAt(0).toUpperCase() + status.slice(1)}`);

  const statusColor = (status: UserStatus) => {
    switch (status) {
      case "active": return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
      case "inactive": return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
      case "suspended": return "bg-red-500/10 text-red-600 dark:text-red-400";
    }
  };

  const roleColor = (role: UserRole) => {
    switch (role) {
      case "admin": return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
      case "instructor": return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "student": return "bg-gold/10 text-gold";
    }
  };

  // Show toast with auto-hide
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // CRUD operations
  const openAdd = () => {
    setFormData(emptyUser);
    setModalMode("add");
  };

  const openEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({ ...user });
    setModalMode("edit");
  };

  const openView = (user: User) => {
    setSelectedUser(user);
    setModalMode("view");
  };

  const openDelete = (user: User) => {
    setSelectedUser(user);
    setModalMode("delete");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedUser(null);
    setFormData(emptyUser);
  };

  const handleSave = () => {
    if (modalMode === "add") {
      const newUser: User = {
        ...formData,
        id: String(Date.now()),
      };
      setUsers((prev) => [newUser, ...prev]);
      showToast(tu("userAdded"));
    } else if (modalMode === "edit" && selectedUser) {
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...formData, id: selectedUser.id } : u))
      );
      showToast(tu("userUpdated"));
    }
    closeModal();
  };

  const handleDelete = () => {
    if (selectedUser) {
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
      showToast(tu("userDeleted"));
    }
    closeModal();
  };

  return (
    <div className="min-h-screen">
      <AdminHeader titleKey="admin.users.title" subtitleKey="admin.users.subtitle" />

      <div className="p-4 lg:p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: tu("totalUsers"), value: totalUsers, icon: UsersIcon, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: tu("activeUsers"), value: activeUsers, icon: ChartBarIcon, color: "text-emerald-500", bg: "bg-emerald-500/10" },
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full ps-10 pe-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | "all")}
              className="px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors cursor-pointer"
            >
              <option value="all">{tu("allRoles")}</option>
              <option value="admin">{tu("roleAdmin")}</option>
              <option value="student">{tu("roleStudent")}</option>
              <option value="instructor">{tu("roleInstructor")}</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as UserStatus | "all")}
              className="px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors cursor-pointer"
            >
              <option value="all">{tu("allStatuses")}</option>
              <option value="active">{tu("statusActive")}</option>
              <option value="inactive">{tu("statusInactive")}</option>
              <option value="suspended">{tu("statusSuspended")}</option>
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

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden"
        >
          {/* Desktop Table */}
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
                {filteredUsers.map((user, idx) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Image
                          src={user.avatar}
                          alt={`${user.firstName} ${user.lastName}`}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 dark:ring-white/10"
                        />
                        <div>
                          <p className="font-medium text-oxford dark:text-white text-sm">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-silver dark:text-white/40">{user.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-white/60">
                      {user.email}
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn("inline-flex px-2.5 py-1 rounded-full text-xs font-medium", roleColor(user.role))}>
                        {roleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", statusColor(user.status))}>
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          user.status === "active" ? "bg-emerald-500" : user.status === "inactive" ? "bg-gray-400" : "bg-red-500"
                        )} />
                        {statusLabel(user.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-white/60">
                      {new Date(user.joinDate).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openView(user)}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title={tu("viewUser")}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(user)}
                          className="p-2 text-gray-400 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors"
                          title={tu("editUser")}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDelete(user)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title={tu("deleteUser")}
                        >
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
            {filteredUsers.map((user) => (
              <div key={user.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image
                      src={user.avatar}
                      alt={`${user.firstName} ${user.lastName}`}
                      width={44}
                      height={44}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-100 dark:ring-white/10"
                    />
                    <div>
                      <p className="font-medium text-oxford dark:text-white text-sm">
                        {user.firstName} {user.lastName}
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
                  <span className={cn("inline-flex px-2.5 py-1 rounded-full text-xs font-medium", roleColor(user.role))}>
                    {roleLabel(user.role)}
                  </span>
                  <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", statusColor(user.status))}>
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      user.status === "active" ? "bg-emerald-500" : user.status === "inactive" ? "bg-gray-400" : "bg-red-500"
                    )} />
                    {statusLabel(user.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredUsers.length === 0 && (
            <div className="p-12 text-center">
              <UsersIcon className="w-12 h-12 text-gray-300 dark:text-white/20 mx-auto mb-3" />
              <p className="text-sm text-silver dark:text-white/50">{tu("noUsersFound")}</p>
            </div>
          )}

          {/* Footer */}
          <div className="px-5 py-3 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
            <p className="text-xs text-silver dark:text-white/50">
              {tu("showing")} {filteredUsers.length} {tu("of")} {users.length} {tu("users")}
            </p>
          </div>
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
                    <Image
                      src={selectedUser.avatar}
                      alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-oxford dark:text-white text-sm">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </p>
                      <p className="text-xs text-silver dark:text-white/40">{selectedUser.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={closeModal}
                      className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-white/10 text-oxford dark:text-white rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      {t("admin.common.cancel")}
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors"
                    >
                      {t("admin.common.delete")}
                    </button>
                  </div>
                </div>
              )}

              {/* View User */}
              {modalMode === "view" && selectedUser && (
                <div className="p-6 space-y-5">
                  <div className="flex items-center gap-4">
                    <Image
                      src={selectedUser.avatar}
                      alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-gray-100 dark:ring-white/10"
                    />
                    <div>
                      <p className="text-lg font-semibold text-oxford dark:text-white">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn("inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium", roleColor(selectedUser.role))}>
                          {roleLabel(selectedUser.role)}
                        </span>
                        <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium", statusColor(selectedUser.status))}>
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            selectedUser.status === "active" ? "bg-emerald-500" : selectedUser.status === "inactive" ? "bg-gray-400" : "bg-red-500"
                          )} />
                          {statusLabel(selectedUser.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: tu("email"), value: selectedUser.email },
                      { label: tu("phone"), value: selectedUser.phone },
                      { label: tu("joinDate"), value: new Date(selectedUser.joinDate).toLocaleDateString() },
                      { label: tu("lastActive"), value: new Date(selectedUser.lastActive).toLocaleDateString() },
                    ].map((item) => (
                      <div key={item.label} className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                        <p className="text-xs text-silver dark:text-white/40 mb-1">{item.label}</p>
                        <p className="text-sm font-medium text-oxford dark:text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add / Edit Form */}
              {(modalMode === "add" || modalMode === "edit") && (
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  {/* Avatar URL */}
                  <div className="flex items-center gap-4">
                    {formData.avatar ? (
                      <Image
                        src={formData.avatar}
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
                        type="text"
                        value={formData.avatar}
                        onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Name Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">{tu("firstName")}</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">{tu("lastName")}</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
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
                        <option value="admin">{tu("roleAdmin")}</option>
                        <option value="student">{tu("roleStudent")}</option>
                        <option value="instructor">{tu("roleInstructor")}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-silver dark:text-white/50 mb-1.5">{tu("status")}</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors cursor-pointer"
                      >
                        <option value="active">{tu("statusActive")}</option>
                        <option value="inactive">{tu("statusInactive")}</option>
                        <option value="suspended">{tu("statusSuspended")}</option>
                      </select>
                    </div>
                  </div>

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
                      disabled={!formData.firstName || !formData.lastName || !formData.email}
                      className="flex-1 px-4 py-2.5 bg-gold text-oxford rounded-xl text-sm font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      {modalMode === "add" ? tu("addUser") : t("admin.common.save")}
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
