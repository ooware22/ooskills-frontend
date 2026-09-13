/**
 * Countdown Section API Service
 *
 * Public read + admin CRUD for the landing page's launch-countdown banner.
 * Connects to Django content app at /api/public/landing/countdown/ and
 * /api/admin/cms/countdown/.
 */

import axiosClient from '@/lib/axios';

// =============================================================================
// TYPES
// =============================================================================

export interface PublicCountdown {
    title: string;
    subtitle: string;
    cta_text: string;
    launch_date: string;
    is_active: boolean;
}

export interface AdminCountdown {
    id: number;
    title: Record<string, string>;
    subtitle: Record<string, string>;
    cta_text: Record<string, string>;
    launch_date: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface AdminCountdownPayload {
    title?: Record<string, string>;
    subtitle?: Record<string, string>;
    cta_text?: Record<string, string>;
    launch_date?: string;
    is_active?: boolean;
}

// =============================================================================
// API
// =============================================================================

const countdownApi = {
    /** Public: get the countdown config for the given language */
    getPublic: async (lang: string) => {
        const response = await axiosClient.get<PublicCountdown>(`/public/landing/countdown/?lang=${lang}`);
        return response.data;
    },

    /** Admin: get the full countdown config (all languages) */
    getAdmin: async () => {
        const response = await axiosClient.get<AdminCountdown>('/admin/cms/countdown/');
        return response.data;
    },

    /** Admin: update the countdown config */
    update: async (payload: AdminCountdownPayload) => {
        const response = await axiosClient.patch<AdminCountdown>('/admin/cms/countdown/update_settings/', payload);
        return response.data;
    },
};

export default countdownApi;
