/**
 * Admin Modules API Service
 *
 * Typed API functions for admin module management endpoints.
 * Connects to Django formation ModuleViewSet at /api/formation/modules/.
 */

import axiosClient from '@/lib/axios';
import type { AdminSectionLesson } from './adminSectionsApi';

// =============================================================================
// TYPES
// =============================================================================

export interface AdminModule {
    id: string;
    section: string;
    title: string;
    sequence: number;
    audioFileIndex?: number;
    lessons: number;
    lessons_list: AdminSectionLesson[];
}

export interface ModuleCreatePayload {
    section: string;
    title: string;
    sequence: number;
    audioFileIndex?: number;
}

export interface ModuleUpdatePayload {
    title?: string;
    sequence?: number;
    audioFileIndex?: number;
}

// =============================================================================
// API
// =============================================================================

const ENDPOINT = '/formation/modules/';

const adminModulesApi = {
    /**
     * Get a single module by ID
     */
    retrieve: async (id: string) => {
        const response = await axiosClient.get<AdminModule>(`${ENDPOINT}${id}/`);
        return response.data;
    },

    /**
     * Create a new module
     */
    create: async (data: ModuleCreatePayload) => {
        const response = await axiosClient.post<AdminModule>(ENDPOINT, data);
        return response.data;
    },

    /**
     * Update a module by ID
     */
    update: async (id: string, data: ModuleUpdatePayload) => {
        const response = await axiosClient.patch<AdminModule>(`${ENDPOINT}${id}/`, data);
        return response.data;
    },

    /**
     * Delete a module by ID
     */
    delete: async (id: string) => {
        await axiosClient.delete(`${ENDPOINT}${id}/`);
    },
};

export default adminModulesApi;
