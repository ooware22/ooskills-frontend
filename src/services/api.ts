/**
 * API Endpoints Configuration
 * 
 * This file contains all API endpoint paths for reference.
 * The actual API calls are now handled by contentApi.ts using Axios.
 * 
 * @deprecated Use contentApi from @/services/contentApi instead
 */

// Base URL for the Django API
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// =============================================================================
// ENDPOINT PATHS (Reference)
// =============================================================================

export const ENDPOINTS = {
  // Public endpoints (read-only, for landing page)
  public: {
    landing: () => `${API_BASE_URL}/public/landing/`,
    hero: () => `${API_BASE_URL}/public/landing/hero/`,
    features: () => `${API_BASE_URL}/public/landing/features/`,
    partners: () => `${API_BASE_URL}/public/landing/partners/`,
    faq: () => `${API_BASE_URL}/public/landing/faq/`,
    testimonials: () => `${API_BASE_URL}/public/landing/testimonials/`,
    settings: () => `${API_BASE_URL}/public/settings/`,
  },

  // Admin endpoints (CRUD operations)
  admin: {
    // Hero Section
    hero: {
      list: () => `${API_BASE_URL}/admin/cms/hero/`,
      active: () => `${API_BASE_URL}/admin/cms/hero/active/`,
      retrieve: (id: number) => `${API_BASE_URL}/admin/cms/hero/${id}/`,
      update: (id: number) => `${API_BASE_URL}/admin/cms/hero/${id}/`,
      activate: (id: number) => `${API_BASE_URL}/admin/cms/hero/${id}/activate/`,
    },

    // Features Section
    features: {
      list: () => `${API_BASE_URL}/admin/cms/features/`,
      active: () => `${API_BASE_URL}/admin/cms/features/active/`,
      retrieve: (id: number) => `${API_BASE_URL}/admin/cms/features/${id}/`,
      update: (id: number) => `${API_BASE_URL}/admin/cms/features/${id}/`,
      activate: (id: number) => `${API_BASE_URL}/admin/cms/features/${id}/activate/`,
    },

    // Feature Items
    featureItems: {
      list: () => `${API_BASE_URL}/admin/cms/feature-items/`,
      listBySection: (sectionId: number) => `${API_BASE_URL}/admin/cms/feature-items/?section=${sectionId}`,
      retrieve: (id: number) => `${API_BASE_URL}/admin/cms/feature-items/${id}/`,
      create: () => `${API_BASE_URL}/admin/cms/feature-items/`,
      update: (id: number) => `${API_BASE_URL}/admin/cms/feature-items/${id}/`,
      delete: (id: number) => `${API_BASE_URL}/admin/cms/feature-items/${id}/`,
      reorder: () => `${API_BASE_URL}/admin/cms/feature-items/reorder/`,
    },

    // FAQ Items
    faq: {
      list: () => `${API_BASE_URL}/admin/cms/faq/`,
      retrieve: (id: number) => `${API_BASE_URL}/admin/cms/faq/${id}/`,
      create: () => `${API_BASE_URL}/admin/cms/faq/`,
      update: (id: number) => `${API_BASE_URL}/admin/cms/faq/${id}/`,
      delete: (id: number) => `${API_BASE_URL}/admin/cms/faq/${id}/`,
      reorder: () => `${API_BASE_URL}/admin/cms/faq/reorder/`,
    },

    // Partners
    partners: {
      list: () => `${API_BASE_URL}/admin/cms/partners/`,
      retrieve: (id: number) => `${API_BASE_URL}/admin/cms/partners/${id}/`,
      create: () => `${API_BASE_URL}/admin/cms/partners/`,
      update: (id: number) => `${API_BASE_URL}/admin/cms/partners/${id}/`,
      delete: (id: number) => `${API_BASE_URL}/admin/cms/partners/${id}/`,
      reorder: () => `${API_BASE_URL}/admin/cms/partners/reorder/`,
    },

    // Testimonials
    testimonials: {
      list: () => `${API_BASE_URL}/admin/cms/testimonials/`,
      retrieve: (id: number) => `${API_BASE_URL}/admin/cms/testimonials/${id}/`,
      create: () => `${API_BASE_URL}/admin/cms/testimonials/`,
      update: (id: number) => `${API_BASE_URL}/admin/cms/testimonials/${id}/`,
      delete: (id: number) => `${API_BASE_URL}/admin/cms/testimonials/${id}/`,
      reorder: () => `${API_BASE_URL}/admin/cms/testimonials/reorder/`,
    },

    // Site Settings
    settings: {
      get: () => `${API_BASE_URL}/admin/cms/settings/`,
      update: () => `${API_BASE_URL}/admin/cms/settings/update_settings/`,
    },

    // Cache Management
    cache: {
      invalidate: () => `${API_BASE_URL}/admin/cms/invalidate-cache/`,
    },
  },

  // Auth endpoints (not managed by content layer)
  auth: {
    login: () => `${API_BASE_URL}/auth/login/`,
    logout: () => `${API_BASE_URL}/auth/logout/`,
    refresh: () => `${API_BASE_URL}/auth/refresh/`,
    me: () => `${API_BASE_URL}/auth/me/`,
  },
} as const;

// =============================================================================
// DEPRECATED - Use contentApi instead
// =============================================================================

/**
 * @deprecated Use axiosClient from @/lib/axios instead
 */
export async function apiRequest<T>(
  url: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  console.warn(
    "apiRequest is deprecated. Use contentApi from @/services/contentApi instead."
  );

  const { method = "GET", body, headers = {} } = options;

  const token = typeof window !== "undefined"
    ? localStorage.getItem("auth_token")
    : null;

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers: { ...defaultHeaders, ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * @deprecated Use contentApi from @/services/contentApi instead
 */
export const api = {
  get: <T>(url: string) => apiRequest<T>(url, { method: "GET" }),
  post: <T>(url: string, body: unknown) => apiRequest<T>(url, { method: "POST", body }),
  put: <T>(url: string, body: unknown) => apiRequest<T>(url, { method: "PUT", body }),
  patch: <T>(url: string, body: unknown) => apiRequest<T>(url, { method: "PATCH", body }),
  delete: <T>(url: string) => apiRequest<T>(url, { method: "DELETE" }),
};
