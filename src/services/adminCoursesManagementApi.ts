/**
 * Admin Courses Management API Service
 *
 * Typed API functions for admin course management endpoints.
 * Connects to Django formation CourseViewSet at /api/formation/courses/.
 * Backend uses slug as lookup field for retrieve/update/delete.
 */

import axios from 'axios';
import axiosClient from '@/lib/axios';
import { getAccessToken } from '@/lib/tokenStore';
import { uploadFileDirectToR2 } from './r2Uploader';

// =============================================================================
// TYPES
// =============================================================================

export interface AdminCourseModule {
    id: string;
    title: string;
    type: string;
    sequence: number;
    lessons: number;
    duration: string;
}

export interface AdminCourse {
    id: string;
    title: string;
    slug: string;
    category: string;
    level: string;
    duration: number;
    rating: string;
    reviews: number;
    students: number;
    image: string;
    date: string;
    price: number;
    originalPrice: number;
    discount: number;
    description: string;
    prerequisites: string[];
    whatYouLearn: string[];
    modules: AdminCourseModule[];
    language: string;
    certificate: boolean;
    lastUpdated: string;
    status: string;
    totalSlides?: number;
}

export interface AdminCourseCreatePayload {
    title: string;
    slug: string;
    category: string;
    level: string;
    duration: number;
    price: number;
    originalPrice: number;
    discount: number;
    description: string;
    prerequisites: string[];
    whatYouLearn: string[];
    language: string;
    certificate: boolean;
    image?: File | string;
    status?: string;
}

export interface AdminCourseUpdatePayload {
    title?: string;
    slug?: string;
    category?: string;
    level?: string;
    duration?: number;
    price?: number;
    originalPrice?: number;
    discount?: number;
    description?: string;
    prerequisites?: string[];
    whatYouLearn?: string[];
    language?: string;
    certificate?: boolean;
    image?: File | string;
    status?: string;
}

export interface CourseZipPreviewPlan {
    title: string;
    category: string | null;
    instructor: string | null;
    sections_count: number;
    lessons_count: number;
    sections: {
        title: string;
        lessons: {
            title: string;
            type: string;
            audio_file?: string | null;
            slide_file?: string | null;
        }[];
    }[];
}

export interface CourseListParams {
    search?: string;
    category?: string;
    level?: string;
    page?: number;
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

/** Build FormData from a payload when it contains a File (for image upload) */
function buildFormData(data: Record<string, unknown>): FormData | Record<string, unknown> {
    const hasFile = Object.values(data).some((v) => v instanceof File);
    if (!hasFile) return data;

    const fd = new FormData();
    for (const [key, value] of Object.entries(data)) {
        if (value === undefined || value === null) continue;
        if (value instanceof File) {
            fd.append(key, value);
        } else if (Array.isArray(value)) {
            // JSON-encode arrays so DRF can parse them
            fd.append(key, JSON.stringify(value));
        } else {
            fd.append(key, String(value));
        }
    }
    return fd;
}

// =============================================================================
// UPLOAD via upload.ooskills.com (bypasses Cloudflare proxy — no size limit)
// =============================================================================

/**
 * upload.ooskills.com is a DNS-only (grey-cloud) subdomain pointing directly
 * to the server. It bypasses Cloudflare's 100 MB proxy limit, so ZIP uploads
 * go through as a single request — just like localhost.
 */
const UPLOAD_BASE_URL = process.env.NEXT_PUBLIC_UPLOAD_URL || 'https://upload.ooskills.com/api';

/**
 * Send a FormData POST to upload.ooskills.com with the auth token.
 * Uses plain axios (not axiosClient) so the request goes to the upload subdomain.
 * Does NOT set Content-Type — the browser auto-adds multipart/form-data with boundary.
 */
function uploadRequest<T>(path: string, fd: FormData, timeoutMs: number) {
    const token = getAccessToken();
    return axios.post<T>(`${UPLOAD_BASE_URL}${path}`, fd, {
        timeout: timeoutMs,
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
}

// =============================================================================
// API
// =============================================================================

const ENDPOINT = '/formation/courses/';

const adminCoursesManagementApi = {
    /**
     * List courses with optional filters
     */
    list: async (params?: CourseListParams) => {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.set('search', params.search);
        if (params?.category && params.category !== 'all') queryParams.set('category', params.category);
        if (params?.level && params.level !== 'all') queryParams.set('level', params.level);
        if (params?.page) queryParams.set('page', String(params.page));

        const qs = queryParams.toString();
        const url = qs ? `${ENDPOINT}?${qs}` : ENDPOINT;

        const response = await axiosClient.get<AdminCourse[] | PaginatedResponse<AdminCourse>>(url);
        return extractResults(response.data);
    },

    /**
     * Get a single course by slug
     */
    retrieve: async (slug: string) => {
        const response = await axiosClient.get<AdminCourse>(`${ENDPOINT}${slug}/`);
        return response.data;
    },

    /**
     * Create a new course
     */
    create: async (data: AdminCourseCreatePayload) => {
        const body = buildFormData(data as unknown as Record<string, unknown>);
        const response = await axiosClient.post<AdminCourse>(ENDPOINT, body);
        return response.data;
    },

    /**
     * Update a course (by slug)
     */
    update: async (slug: string, data: AdminCourseUpdatePayload) => {
        const body = buildFormData(data as unknown as Record<string, unknown>);
        const response = await axiosClient.patch<AdminCourse>(`${ENDPOINT}${slug}/`, body);
        return response.data;
    },

    /**
     * Delete a course (by slug)
     * Uses a longer timeout because cascade deletes on large courses
     * (clearing FileFields + DB cascade) can take 60s+ on free-tier DB.
     */
    delete: async (slug: string) => {
        await axiosClient.delete(`${ENDPOINT}${slug}/`, {
            timeout: 120_000, // 2 min — cascade deletes are slow
        });
    },

    /**
     * Preview a ZIP course import.
     * Uploads the ZIP directly to Cloudflare R2, then passes the R2 key to Django.
     * Returns the plan preview along with temp_key so import doesn't re-upload.
     */
    previewCourseZip: async (file: File) => {
        const { objectKey } = await uploadFileDirectToR2(file, 'materials', 'temp-zip');
        const response = await axiosClient.post<CourseZipPreviewPlan>(
            `${ENDPOINT}import-zip-preview/`,
            { temp_key: objectKey },
            { timeout: 300_000 }, // 5 min timeout for backend R2 download & parsing
        );
        return { ...response.data, temp_key: objectKey };
    },

    /**
     * Confirm a ZIP course import.
     * Reuses the existing tempKey if provided (from preview) or uploads if file provided.
     */
    importCourseZip: async (
        fileOrKey: File | { tempKey: string },
        categoryId?: string,
        instructorId?: string,
    ) => {
        let objectKey: string;
        if (typeof fileOrKey === 'object' && 'tempKey' in fileOrKey && fileOrKey.tempKey) {
            objectKey = fileOrKey.tempKey;
        } else {
            const res = await uploadFileDirectToR2(fileOrKey as File, 'materials', 'temp-zip');
            objectKey = res.objectKey;
        }

        const response = await axiosClient.post<AdminCourse>(
            `${ENDPOINT}import-zip/`,
            {
                temp_key: objectKey,
                category_id: categoryId || undefined,
                instructor_id: instructorId || undefined,
            },
            { timeout: 300_000 }, // 5 min timeout for backend download & background trigger
        );
        return response.data;
    },
};

export default adminCoursesManagementApi;
