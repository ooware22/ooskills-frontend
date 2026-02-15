/**
 * Admin Categories API Service
 *
 * Typed API functions for admin category management endpoints.
 * Connects to Django formation CategoryViewSet at /api/formation/categories/.
 * Backend uses slug as lookup field for retrieve/update/delete.
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

/** Extract array from response - handles both paginated and direct array responses */
function extractResults<T>(data: T[] | PaginatedResponse<T>): { results: T[]; count: number } {
    if (Array.isArray(data)) {
        return { results: data, count: data.length };
    }
    if (data && 'results' in data) {
        return { results: data.results, count: data.count };
    }
    return { results: [], count: 0 };
}

// =============================================================================
// API
// =============================================================================

const ENDPOINT = '/formation/categories/';

const adminCategoriesApi = {
    /**
     * List all categories
     */
    list: async () => {
        const response = await axiosClient.get<AdminCategory[] | PaginatedResponse<AdminCategory>>(ENDPOINT);
        return extractResults(response.data);
    },

    /**
     * Get a single category by slug
     */
    retrieve: async (slug: string) => {
        const response = await axiosClient.get<AdminCategory>(`${ENDPOINT}${slug}/`);
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
     * Update an existing category (by slug)
     */
    update: async (slug: string, data: AdminCategoryUpdatePayload) => {
        const response = await axiosClient.patch<AdminCategory>(`${ENDPOINT}${slug}/`, data);
        return response.data;
    },

    /**
     * Delete a category (by slug)
     */
    delete: async (slug: string) => {
        await axiosClient.delete(`${ENDPOINT}${slug}/`);
    },
};

export default adminCategoriesApi;
