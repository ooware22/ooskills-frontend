/**
 * Admin Categories API Service
 *
 * Typed API functions for admin category management endpoints.
 * Follows the same pattern as adminUsersApi.ts.
 */

import axiosClient from '@/lib/axios';

// =============================================================================
// TYPES
// =============================================================================

export interface CategoryName {
    ar: string;
    en: string;
    fr: string;
}

export interface AdminCategory {
    id: string;
    name: CategoryName;
    slug: string;
    icon: string;
}

export interface AdminCategoryCreatePayload {
    name: CategoryName;
    slug: string;
    icon: string;
}

export interface AdminCategoryUpdatePayload {
    name?: CategoryName;
    slug?: string;
    icon?: string;
}

interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

// =============================================================================
// API
// =============================================================================

const ENDPOINT = '/admin/categories/';

const adminCategoriesApi = {
    /**
     * List all categories
     */
    list: async () => {
        const response = await axiosClient.get<PaginatedResponse<AdminCategory>>(ENDPOINT);
        return response.data;
    },

    /**
     * Get a single category by ID
     */
    retrieve: async (id: string) => {
        const response = await axiosClient.get<AdminCategory>(`${ENDPOINT}${id}/`);
        return response.data;
    },

    /**
     * Create a new category
     */
    create: async (data: AdminCategoryCreatePayload) => {
        const response = await axiosClient.post<AdminCategory>(ENDPOINT, data);
        return response.data;
    },

    /**
     * Update an existing category
     */
    update: async (id: string, data: AdminCategoryUpdatePayload) => {
        const response = await axiosClient.patch<AdminCategory>(`${ENDPOINT}${id}/`, data);
        return response.data;
    },

    /**
     * Delete a category
     */
    delete: async (id: string) => {
        await axiosClient.delete(`${ENDPOINT}${id}/`);
    },
};

export default adminCategoriesApi;
