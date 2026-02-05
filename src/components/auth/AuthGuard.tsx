"use client";

/**
 * AuthGuard Component
 * 
 * Protects routes that require authentication.
 * Shows loading state while checking auth, redirects to login if not authenticated.
 */

import { useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  initializeAuth,
  selectIsAuthenticated,
  selectIsInitialized,
  selectAuthLoading,
  selectIsAdmin,
} from "@/store/slices/authSlice";

interface AuthGuardProps {
  children: ReactNode;
  /** Require admin/superadmin role */
  requireAdmin?: boolean;
  /** URL to redirect to if not authenticated */
  loginUrl?: string;
  /** URL to redirect to if authenticated but not admin */
  unauthorizedUrl?: string;
}

/**
 * Loading spinner component
 */
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-gray-600 text-sm">Vérification de l'authentification...</p>
    </div>
  </div>
);

export default function AuthGuard({
  children,
  requireAdmin = false,
  loginUrl = "/admin/login",
  unauthorizedUrl = "/admin/unauthorized",
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isInitialized = useAppSelector(selectIsInitialized);
  const isLoading = useAppSelector(selectAuthLoading);
  const isAdmin = useAppSelector(selectIsAdmin);

  // Initialize auth state on mount
  useEffect(() => {
    if (!isInitialized) {
      dispatch(initializeAuth());
    }
  }, [dispatch, isInitialized]);

  // Handle redirects after initialization
  useEffect(() => {
    if (!isInitialized || isLoading) return;

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      // Store the intended destination for redirect after login
      const returnUrl = encodeURIComponent(pathname);
      router.replace(`${loginUrl}?returnUrl=${returnUrl}`);
      return;
    }

    // Authenticated but not admin (when admin is required)
    if (requireAdmin && !isAdmin) {
      router.replace(unauthorizedUrl);
      return;
    }
  }, [isInitialized, isLoading, isAuthenticated, isAdmin, requireAdmin, router, pathname, loginUrl, unauthorizedUrl]);

  // Show loading while initializing
  if (!isInitialized || isLoading) {
    return <LoadingSpinner />;
  }

  // Not authenticated - show nothing (redirect is happening)
  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  // Authenticated but not admin (when required) - show nothing (redirect is happening)
  if (requireAdmin && !isAdmin) {
    return <LoadingSpinner />;
  }

  // Authenticated (and admin if required) - render children
  return <>{children}</>;
}
