"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  EnvelopeIcon as Mail,
  LockClosedIcon as Lock,
  ArrowRightIcon as ArrowRight,
  EyeIcon as Eye,
  EyeSlashIcon as EyeOff,
  ExclamationTriangleIcon as AlertIcon,
} from "@heroicons/react/24/outline";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  login,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  clearError,
  clearCredentials,
} from "@/store/slices/authSlice";

export default function AdminLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  const [showPassword, setShowPassword] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const returnUrl = searchParams.get("returnUrl") || "/admin";
      router.replace(returnUrl);
    }
  }, [isAuthenticated, router, searchParams]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    setRoleError(null);

    const result = await dispatch(
      login({
        email: formData.email,
        password: formData.password,
      })
    );

    if (login.fulfilled.match(result)) {
      // Block non-admin users from the admin portal
      const userRole = (result.payload.user as any)?.role;
      const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

      if (!isAdmin) {
        dispatch(clearCredentials());
        setRoleError("Access denied. This login is for administrators only.");
        return;
      }

      const returnUrl = searchParams.get("returnUrl") || "/admin";
      router.push(returnUrl);
    }
  };

  return (
    <div className="min-h-screen bg-oxford flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <Image
              src="/images/logo/logo_DarkMood2.png"
              alt="OOSkills"
              width={180}
              height={60}
              className="h-10 w-auto"
            />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Login</h1>
          <p className="text-white/50 text-sm">
            Sign in to manage your landing page content
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8"
        >
          {/* Error Alert */}
          {(error || roleError) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3"
            >
              <AlertIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{roleError || error}</p>
            </motion.div>
          )}

          {/* Email */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-white/70 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="admin@ooskills.com"
                className="w-full ps-10 pe-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white/70 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="••••••••"
                className="w-full ps-10 pe-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-gold focus:ring-gold/50"
              />
              <span className="text-sm text-white/50">Remember me</span>
            </label>
            <a href="#" className="text-sm text-gold hover:underline">
              Forgot password?
            </a>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gold hover:bg-gold-light text-oxford font-medium rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-oxford/30 border-t-oxford rounded-full animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-white/30 text-xs mt-6">
          © 2026 OOSkills. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
