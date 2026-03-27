/**
 * Promo Code, Gift & Referral API Service
 *
 * Uses the central axiosClient for auth & error handling.
 */

import axiosClient from '@/lib/axios';

// =============================================================================
// TYPES
// =============================================================================

export interface PromoValidateResponse {
  valid: boolean;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: string;
  discount_amount: number;
  final_price: number;
  message: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: string;
  max_uses: number;
  uses_count: number;
  max_uses_per_user: number;
  valid_from: string | null;
  valid_until: string | null;
  min_order_total: number;
  course_ids: string[];
  is_active: boolean;
  created_at: string;
}

export interface PromoCodePayload {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses?: number;
  max_uses_per_user?: number;
  valid_from?: string | null;
  valid_until?: string | null;
  min_order_total?: number;
  course_ids?: string[];
  is_active?: boolean;
}

export interface CourseGift {
  id: string;
  sender: string;
  sender_name: string;
  recipient_email: string;
  recipient_user: string | null;
  course: string;
  course_title: string;
  gift_code: string;
  message: string;
  status: 'pending' | 'claimed' | 'expired';
  expires_at: string | null;
  claimed_at: string | null;
  created_at: string;
}

export interface GiftSendResponse {
  gift_code: string;
  recipient_email: string;
  course_title: string;
  message: string;
}

export interface GiftClaimResponse {
  detail: string;
  course_id: string;
  course_slug: string;
}

// =============================================================================
// PROMO CODE API
// =============================================================================

export const promoApi = {
  /** Validate a promo code for a specific course */
  validate: async (code: string, courseId: string): Promise<PromoValidateResponse> => {
    const res = await axiosClient.post<PromoValidateResponse>(
      '/formation/promo-codes/validate/',
      { code, course_id: courseId }
    );
    return res.data;
  },

  /** List all promo codes (admin) */
  list: async (): Promise<PromoCode[]> => {
    const res = await axiosClient.get<PromoCode[]>('/formation/promo-codes/');
    return Array.isArray(res.data) ? res.data : (res.data as any).results ?? [];
  },

  /** Create a promo code (admin) */
  create: async (data: PromoCodePayload): Promise<PromoCode> => {
    const res = await axiosClient.post<PromoCode>('/formation/promo-codes/', data);
    return res.data;
  },

  /** Update a promo code (admin) */
  update: async (id: string, data: Partial<PromoCodePayload>): Promise<PromoCode> => {
    const res = await axiosClient.patch<PromoCode>(`/formation/promo-codes/${id}/`, data);
    return res.data;
  },

  /** Delete a promo code (admin) */
  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`/formation/promo-codes/${id}/`);
  },
};

// =============================================================================
// GIFT API
// =============================================================================

export const giftApi = {
  /** Send a course as gift */
  send: async (courseId: string, recipientEmail: string, message = ''): Promise<GiftSendResponse> => {
    const res = await axiosClient.post<GiftSendResponse>('/formation/gifts/send/', {
      course_id: courseId,
      recipient_email: recipientEmail,
      message,
    });
    return res.data;
  },

  /** Claim a gift by code */
  claim: async (giftCode: string): Promise<GiftClaimResponse> => {
    const res = await axiosClient.post<GiftClaimResponse>('/formation/gifts/claim/', {
      gift_code: giftCode,
    });
    return res.data;
  },

  /** List gifts sent by current user */
  mySent: async (): Promise<CourseGift[]> => {
    const res = await axiosClient.get<CourseGift[]>('/formation/gifts/my-sent/');
    return res.data;
  },

  /** List gifts received by current user */
  myReceived: async (): Promise<CourseGift[]> => {
    const res = await axiosClient.get<CourseGift[]>('/formation/gifts/my-received/');
    return res.data;
  },
};
