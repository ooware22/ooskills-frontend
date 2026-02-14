/**
 * Admin Courses Management API Service
 *
 * Typed API functions for admin course management endpoints.
 * Follows the same pattern as adminUsersApi.ts.
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
    image?: string;
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
    image?: string;
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

// =============================================================================
// API
// =============================================================================

const ENDPOINT = '/admin/courses/';

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

        const response = await axiosClient.get<PaginatedResponse<AdminCourse>>(url);
        return response.data;
    },

    /**
     * Get a single course by ID
     */
    retrieve: async (id: string) => {
        const response = await axiosClient.get<AdminCourse>(`${ENDPOINT}${id}/`);
        return response.data;
    },

    /**
     * Create a new course
     */
    create: async (data: AdminCourseCreatePayload) => {
        const response = await axiosClient.post<AdminCourse>(ENDPOINT, data);
        return response.data;
    },

    /**
     * Update a course
     */
    update: async (id: string, data: AdminCourseUpdatePayload) => {
        const response = await axiosClient.patch<AdminCourse>(`${ENDPOINT}${id}/`, data);
        return response.data;
    },

    /**
     * Delete a course
     */
    delete: async (id: string) => {
        await axiosClient.delete(`${ENDPOINT}${id}/`);
    },
};

export default adminCoursesManagementApi;
