/**
 * Admin Orders Management API Service
 *
 * Typed API functions for the admin Orders page.
 * Connects to Django formation OrderViewSet at /api/formation/orders/.
 * List/retrieve are admin-scoped by the backend (admins see every order).
 */

import axiosClient from '@/lib/axios';

// =============================================================================
// TYPES
// =============================================================================

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'ccp' | 'baridimob' | 'card' | 'edahabia' | 'cib' | 'free';

export interface AdminOrderItem {
    id: string;
    course: string;
    course_slug: string;
    course_title: string;
    price: number;
    is_enrolled: boolean;
}

export interface AdminOrder {
    id: string;
    user: string;
    user_email: string;
    user_name: string;
    total: number;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    paymentRef: string;
    checkout_url: string;
    chargily_checkout_id: string;
    items: AdminOrderItem[];
    is_mismatched: boolean;
    created_at: string;
    updated_at: string;
}

interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface OrderListParams {
    search?: string;
    status?: OrderStatus | 'all';
    paymentMethod?: PaymentMethod | 'all';
    mismatched?: boolean;
    page?: number;
}

// =============================================================================
// API
// =============================================================================

const ENDPOINT = '/formation/orders/';

const adminOrdersApi = {
    /** List orders with optional filters (admin sees all orders, paginated) */
    list: async (params?: OrderListParams) => {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.set('search', params.search);
        if (params?.status && params.status !== 'all') queryParams.set('status', params.status);
        if (params?.paymentMethod && params.paymentMethod !== 'all') queryParams.set('paymentMethod', params.paymentMethod);
        if (params?.mismatched) queryParams.set('mismatched', 'true');
        if (params?.page) queryParams.set('page', String(params.page));

        const qs = queryParams.toString();
        const url = qs ? `${ENDPOINT}?${qs}` : ENDPOINT;

        const response = await axiosClient.get<PaginatedResponse<AdminOrder>>(url);
        return response.data;
    },

    /** Get a single order by id */
    retrieve: async (id: string) => {
        const response = await axiosClient.get<AdminOrder>(`${ENDPOINT}${id}/`);
        return response.data;
    },

    /** Count of paid orders missing an enrollment for a purchased course */
    mismatchStats: async () => {
        const response = await axiosClient.get<{ count: number }>(`${ENDPOINT}mismatch-stats/`);
        return response.data.count;
    },

    /** Re-check payment status with Chargily and auto-enroll if paid (same logic as the success page) */
    confirmPayment: async (id: string) => {
        const response = await axiosClient.post<AdminOrder>(`${ENDPOINT}${id}/confirm-payment/`);
        return response.data;
    },

    /** Directly grant course access for every item in the order, bypassing Chargily */
    forceEnroll: async (id: string) => {
        const response = await axiosClient.post<AdminOrder>(`${ENDPOINT}${id}/force-enroll/`);
        return response.data;
    },

    /** Mark an order as refunded (does not revoke course access) */
    markRefunded: async (id: string) => {
        const response = await axiosClient.post<AdminOrder>(`${ENDPOINT}${id}/mark-refunded/`);
        return response.data;
    },
};

export default adminOrdersApi;
