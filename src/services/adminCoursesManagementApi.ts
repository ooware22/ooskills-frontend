/**
 * Admin Courses Management API Service
 *
 * Typed API functions for admin course management endpoints.
 * Connects to Django formation CourseViewSet at /api/formation/courses/.
 * Backend uses slug as lookup field for retrieve/update/delete.
 */

import axiosClient from '@/lib/axios';

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
    description: string;
    prerequisites: string[];
    whatYouLearn: string[];
    modules: AdminCourseModule[];
    language: string;
    certificate: boolean;
    lastUpdated: string;
}

export interface AdminCourseCreatePayload {
    title: string;
    slug: string;
    category: string;
    level: string;
    duration: number;
    price: number;
    originalPrice: number;
    description: string;
    prerequisites: string[];
    whatYouLearn: string[];
    language: string;
    certificate: boolean;
    image?: File | string;
}

export interface AdminCourseUpdatePayload {
    title?: string;
    slug?: string;
    category?: string;
    level?: string;
    duration?: number;
    price?: number;
    originalPrice?: number;
    description?: string;
    prerequisites?: string[];
    whatYouLearn?: string[];
    language?: string;
    certificate?: boolean;
    image?: File | string;
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
        const headers = body instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined;
        const response = await axiosClient.post<AdminCourse>(ENDPOINT, body, { headers });
        return response.data;
    },

    /**
     * Update a course (by slug)
     */
    update: async (slug: string, data: AdminCourseUpdatePayload) => {
        const body = buildFormData(data as unknown as Record<string, unknown>);
        const headers = body instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined;
        const response = await axiosClient.patch<AdminCourse>(`${ENDPOINT}${slug}/`, body, { headers });
        return response.data;
    },

    /**
     * Delete a course (by slug)
     */
    delete: async (slug: string) => {
        await axiosClient.delete(`${ENDPOINT}${slug}/`);
    },
};

export default adminCoursesManagementApi;
