/**
 * Account Deletion API Service
 *
 * Typed API functions for account deletion request endpoints.
 * User-facing + Admin-facing endpoints.
 */

import axiosClient from '@/lib/axios';

// =============================================================================
// TYPES
// =============================================================================

export interface DeletionRequest {
    id: string;
    user: string;
    user_email: string;
    user_full_name: string;
    reason: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    status_display: string;
    admin_notes: string;
    reviewed_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface AdminDeletionRequest extends DeletionRequest {
    user_avatar: string | null;
    user_role: string;
    user_date_joined: string;
    reviewed_by: string | null;
    reviewed_by_email: string | null;
}

interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

// =============================================================================
// USER-FACING API
// =============================================================================

const USER_ENDPOINT = '/auth/request-account-deletion/';
const CONFIRM_ENDPOINT = '/auth/confirm-account-deletion/';

/**
 * Get the current user's latest deletion request
 */
export const getDeletionRequest = async (): Promise<DeletionRequest | null> => {
    const response = await axiosClient.get<{ request: DeletionRequest | null }>(USER_ENDPOINT);
    return response.data.request;
};

/**
 * Submit a new deletion request
 */
export const submitDeletionRequest = async (reason: string): Promise<DeletionRequest> => {
    const response = await axiosClient.post<{ message: string; request: DeletionRequest }>(
        USER_ENDPOINT,
        { reason }
    );
    return response.data.request;
};

/**
 * Cancel a pending deletion request
 */
export const cancelDeletionRequest = async (): Promise<void> => {
    await axiosClient.delete(USER_ENDPOINT);
};

/**
 * Confirm account deletion (requires password, only works with approved request)
 */
export const confirmAccountDeletion = async (password: string): Promise<void> => {
    await axiosClient.post(CONFIRM_ENDPOINT, { password });
};

// =============================================================================
// ADMIN-FACING API
// =============================================================================

const ADMIN_ENDPOINT = '/admin/deletion-requests/';

export interface DeletionRequestListParams {
    status?: string;
    search?: string;
}

/**
 * List all deletion requests (admin)
 */
export const listDeletionRequests = async (
    params?: DeletionRequestListParams
): Promise<PaginatedResponse<AdminDeletionRequest>> => {
    const queryParams = new URLSearchParams();
    if (params?.status && params.status !== 'all') queryParams.set('status', params.status);
    if (params?.search) queryParams.set('search', params.search);

    const qs = queryParams.toString();
    const url = qs ? `${ADMIN_ENDPOINT}?${qs}` : ADMIN_ENDPOINT;

    const response = await axiosClient.get<PaginatedResponse<AdminDeletionRequest>>(url);
    return response.data;
};

/**
 * Get a single deletion request (admin)
 */
export const getDeletionRequestDetail = async (id: string): Promise<AdminDeletionRequest> => {
    const response = await axiosClient.get<AdminDeletionRequest>(`${ADMIN_ENDPOINT}${id}/`);
    return response.data;
};

/**
 * Approve a deletion request (admin)
 */
export const approveDeletionRequest = async (
    id: string,
    adminNotes: string = ''
): Promise<AdminDeletionRequest> => {
    const response = await axiosClient.post<AdminDeletionRequest>(
        `${ADMIN_ENDPOINT}${id}/approve/`,
        { admin_notes: adminNotes }
    );
    return response.data;
};

/**
 * Reject a deletion request (admin)
 */
export const rejectDeletionRequest = async (
    id: string,
    adminNotes: string = ''
): Promise<AdminDeletionRequest> => {
    const response = await axiosClient.post<AdminDeletionRequest>(
        `${ADMIN_ENDPOINT}${id}/reject/`,
        { admin_notes: adminNotes }
    );
    return response.data;
};

const accountDeletionApi = {
    // User
    getDeletionRequest,
    submitDeletionRequest,
    cancelDeletionRequest,
    confirmAccountDeletion,
    // Admin
    listDeletionRequests,
    getDeletionRequestDetail,
    approveDeletionRequest,
    rejectDeletionRequest,
};

export default accountDeletionApi;
