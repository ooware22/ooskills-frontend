/**
 * Admin Contact Messages API Service
 *
 * Typed API functions for the admin Contact Messages page.
 * Connects to Django content AdminContactMessageViewSet at /api/admin/cms/contact-messages/.
 */

import axiosClient from '@/lib/axios';

// =============================================================================
// TYPES
// =============================================================================

export interface AdminContactMessage {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface ContactMessageListParams {
    page?: number;
}

// =============================================================================
// API
// =============================================================================

const ENDPOINT = '/admin/cms/contact-messages/';

const adminContactMessagesApi = {
    /** List contact messages (paginated, newest first) */
    list: async (params?: ContactMessageListParams) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.set('page', String(params.page));

        const qs = queryParams.toString();
        const url = qs ? `${ENDPOINT}?${qs}` : ENDPOINT;

        const response = await axiosClient.get<PaginatedResponse<AdminContactMessage> | AdminContactMessage[]>(url);
        const data = response.data;
        return Array.isArray(data)
            ? { count: data.length, next: null, previous: null, results: data }
            : data;
    },

    /** Mark a message as read or unread */
    setRead: async (id: number, isRead: boolean) => {
        const response = await axiosClient.patch<AdminContactMessage>(`${ENDPOINT}${id}/`, { is_read: isRead });
        return response.data;
    },

    /** Delete a message (e.g. spam) */
    remove: async (id: number) => {
        await axiosClient.delete(`${ENDPOINT}${id}/`);
    },
};

export default adminContactMessagesApi;
