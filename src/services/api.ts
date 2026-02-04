/**
 * API Service for Backend Integration
 * 
 * This file contains all the API endpoint configurations and helper functions
 * for connecting the Redux store to the Django backend.
 * 
 * TODO: Update BASE_URL with the actual Django API URL
 */

// Base URL for the Django API
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// API Endpoints
export const ENDPOINTS = {
  // Hero Section
  hero: {
    getAll: () => `${API_BASE_URL}/admin/hero/`,
    getByLocale: (locale: string) => `${API_BASE_URL}/admin/hero/${locale}/`,
    update: (locale: string) => `${API_BASE_URL}/admin/hero/${locale}/`,
  },
  
  // Countdown Section
  countdown: {
    getAll: () => `${API_BASE_URL}/admin/countdown/`,
    getByLocale: (locale: string) => `${API_BASE_URL}/admin/countdown/${locale}/`,
    update: (locale: string) => `${API_BASE_URL}/admin/countdown/${locale}/`,
    updateSettings: () => `${API_BASE_URL}/admin/countdown/settings/`,
  },
  
  // Features Section
  features: {
    getAll: () => `${API_BASE_URL}/admin/features/`,
    getByLocale: (locale: string) => `${API_BASE_URL}/admin/features/${locale}/`,
    update: (locale: string) => `${API_BASE_URL}/admin/features/${locale}/`,
    addFeature: (locale: string) => `${API_BASE_URL}/admin/features/${locale}/items/`,
    updateFeature: (locale: string, id: string) => `${API_BASE_URL}/admin/features/${locale}/items/${id}/`,
    deleteFeature: (locale: string, id: string) => `${API_BASE_URL}/admin/features/${locale}/items/${id}/`,
  },
  
  // Courses Section
  courses: {
    getAll: () => `${API_BASE_URL}/admin/courses/`,
    getByLocale: (locale: string) => `${API_BASE_URL}/admin/courses/${locale}/`,
    update: (locale: string) => `${API_BASE_URL}/admin/courses/${locale}/`,
    addCourse: (locale: string) => `${API_BASE_URL}/admin/courses/${locale}/items/`,
    updateCourse: (locale: string, id: string) => `${API_BASE_URL}/admin/courses/${locale}/items/${id}/`,
    deleteCourse: (locale: string, id: string) => `${API_BASE_URL}/admin/courses/${locale}/items/${id}/`,
  },
  
  // FAQ Section
  faq: {
    getAll: () => `${API_BASE_URL}/admin/faq/`,
    getByLocale: (locale: string) => `${API_BASE_URL}/admin/faq/${locale}/`,
    update: (locale: string) => `${API_BASE_URL}/admin/faq/${locale}/`,
    addFaq: (locale: string) => `${API_BASE_URL}/admin/faq/${locale}/items/`,
    updateFaq: (locale: string, id: string) => `${API_BASE_URL}/admin/faq/${locale}/items/${id}/`,
    deleteFaq: (locale: string, id: string) => `${API_BASE_URL}/admin/faq/${locale}/items/${id}/`,
  },
  
  // Contact Section
  contact: {
    getAll: () => `${API_BASE_URL}/admin/contact/`,
    getFormLabels: (locale: string) => `${API_BASE_URL}/admin/contact/form-labels/${locale}/`,
    updateFormLabels: (locale: string) => `${API_BASE_URL}/admin/contact/form-labels/${locale}/`,
    getContactInfo: () => `${API_BASE_URL}/admin/contact/info/`,
    updateContactInfo: () => `${API_BASE_URL}/admin/contact/info/`,
    getSocialLinks: () => `${API_BASE_URL}/admin/contact/social/`,
    updateSocialLinks: () => `${API_BASE_URL}/admin/contact/social/`,
  },
  
  // Auth
  auth: {
    login: () => `${API_BASE_URL}/auth/login/`,
    logout: () => `${API_BASE_URL}/auth/logout/`,
    refresh: () => `${API_BASE_URL}/auth/refresh/`,
    me: () => `${API_BASE_URL}/auth/me/`,
  },
};

// HTTP Request Helper
interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
}

export async function apiRequest<T>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {} } = options;
  
  // Get auth token from localStorage (or your preferred storage)
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

// Convenience methods
export const api = {
  get: <T>(url: string) => apiRequest<T>(url, { method: "GET" }),
  post: <T>(url: string, body: unknown) => apiRequest<T>(url, { method: "POST", body }),
  put: <T>(url: string, body: unknown) => apiRequest<T>(url, { method: "PUT", body }),
  patch: <T>(url: string, body: unknown) => apiRequest<T>(url, { method: "PATCH", body }),
  delete: <T>(url: string) => apiRequest<T>(url, { method: "DELETE" }),
};

/**
 * Example usage in a slice:
 * 
 * export const fetchHeroContent = createAsyncThunk(
 *   "hero/fetchContent",
 *   async (_, { rejectWithValue }) => {
 *     try {
 *       const data = await api.get(ENDPOINTS.hero.getAll());
 *       return data;
 *     } catch (error) {
 *       return rejectWithValue(error.message);
 *     }
 *   }
 * );
 * 
 * export const saveHeroContent = createAsyncThunk(
 *   "hero/saveContent",
 *   async ({ locale, content }, { rejectWithValue }) => {
 *     try {
 *       const data = await api.put(ENDPOINTS.hero.update(locale), content);
 *       return { locale, content: data };
 *     } catch (error) {
 *       return rejectWithValue(error.message);
 *     }
 *   }
 * );
 */
