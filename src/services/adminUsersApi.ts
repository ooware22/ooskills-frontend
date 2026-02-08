/**
 * Admin Users API Service
 *
 * Typed API functions for admin user management endpoints.
 * Follows the same pattern as contentApi.ts.
 */

import axiosClient from '@/lib/axios';

// =============================================================================
// TYPES
// =============================================================================

export interface AdminUser {
    id: string;
    supabase_id: string | null;
    email: string;
    email_verified: boolean;
    first_name: string;
    last_name: string;
    full_name: string;
    phone: string;
    wilaya: string;
    wilaya_name: string;
    avatar: string | null;
    avatar_url: string | null;
    avatar_display_url: string | null;
    role: 'USER' | 'INSTRUCTOR' | 'ADMIN' | 'SUPER_ADMIN';
    status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';
    is_staff: boolean;
    is_active: boolean;
    language: string;
    newsletter_subscribed: boolean;
    date_joined: string;
    last_login: string | null;
    updated_at: string;
}

export interface AdminUserCreatePayload {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    wilaya?: string;
    role?: string;
    status?: string;
    is_staff?: boolean;
    email_verified?: boolean;
    avatar?: File;
    language?: string;
    newsletter_subscribed?: boolean;
}

export interface AdminUserUpdatePayload {
    email?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    wilaya?: string;
    role?: string;
    status?: string;
    is_staff?: boolean;
    is_active?: boolean;
    email_verified?: boolean;
    avatar?: File;
    language?: string;
    newsletter_subscribed?: boolean;
}

export interface UserListParams {
    search?: string;
    role?: string;
    status?: string;
    wilaya?: string;
    page?: number;
}

interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

// =============================================================================
// HELPERS
// =============================================================================

/** Build FormData from a payload object, handling File objects properly */
function buildFormData(data: Record<string, unknown>): FormData {
    const formData = new FormData();
    for (const [key, value] of Object.entries(data)) {
        if (value === undefined || value === null) continue;
        if (value instanceof File) {
            formData.append(key, value);
        } else if (typeof value === 'boolean') {
            formData.append(key, value ? 'true' : 'false');
        } else {
            formData.append(key, String(value));
        }
    }
    return formData;
}

// =============================================================================
// API
// =============================================================================

const ENDPOINT = '/admin/users/';

const adminUsersApi = {
    /**
     * List users with optional filters
     */
    list: async (params?: UserListParams) => {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.set('search', params.search);
        if (params?.role && params.role !== 'all') queryParams.set('role', params.role);
        if (params?.status && params.status !== 'all') queryParams.set('status', params.status);
        if (params?.wilaya) queryParams.set('wilaya', params.wilaya);
        if (params?.page) queryParams.set('page', String(params.page));

        const qs = queryParams.toString();
        const url = qs ? `${ENDPOINT}?${qs}` : ENDPOINT;

        const response = await axiosClient.get<PaginatedResponse<AdminUser>>(url);
        return response.data;
    },

    /**
     * Get a single user by ID
     */
    retrieve: async (id: string) => {
        const response = await axiosClient.get<AdminUser>(`${ENDPOINT}${id}/`);
        return response.data;
    },

    /**
     * Create a new user (supports avatar file upload)
     */
    create: async (data: AdminUserCreatePayload) => {
        const formData = buildFormData(data as unknown as Record<string, unknown>);
        const response = await axiosClient.post<AdminUser>(ENDPOINT, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    /**
     * Update a user (supports avatar file upload)
     */
    update: async (id: string, data: AdminUserUpdatePayload) => {
        const formData = buildFormData(data as unknown as Record<string, unknown>);
        const response = await axiosClient.patch<AdminUser>(`${ENDPOINT}${id}/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    /**
     * Soft delete a user
     */
    delete: async (id: string) => {
        await axiosClient.delete(`${ENDPOINT}${id}/`);
    },

    /**
     * Activate a user account
     */
    activate: async (id: string) => {
        const response = await axiosClient.post<AdminUser>(`${ENDPOINT}${id}/activate/`);
        return response.data;
    },

    /**
     * Suspend a user account
     */
    suspend: async (id: string) => {
        const response = await axiosClient.post<AdminUser>(`${ENDPOINT}${id}/suspend/`);
        return response.data;
    },

    /**
     * Promote user to admin
     */
    promoteAdmin: async (id: string) => {
        const response = await axiosClient.post<AdminUser>(`${ENDPOINT}${id}/promote_admin/`);
        return response.data;
    },

    /**
     * Promote user to instructor
     */
    promoteInstructor: async (id: string) => {
        const response = await axiosClient.post<AdminUser>(`${ENDPOINT}${id}/promote_instructor/`);
        return response.data;
    },
};

export default adminUsersApi;
