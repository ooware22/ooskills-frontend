/**
 * Admin Sections API Service
 *
 * Typed API functions for admin section management endpoints.
 * Connects to Django formation SectionViewSet at /api/formation/sections/.
 * Sections are filtered by course slug via ?course=<slug> query param.
 */

import axiosClient from '@/lib/axios';

// =============================================================================
// TYPES
// =============================================================================

export interface AdminSectionLesson {
    id: string;
    title: string;
    type: 'slide' | 'video' | 'text' | 'audio';
    sequence: number;
    duration_seconds: number;
    audioUrl: string | null;
    content: {
        visual_content: Record<string, unknown>;
        narration_script: {
            mode: string;
            speakers: { text: string; emotion: string; speaker: string }[];
        };
    };
    slide_type: string;
}

export interface AdminSectionQuiz {
    id: string;
    title: string;
    intro_text: string;
    questions: {
        id: string;
        type: string;
        question: string;
        options: string[];
        correct_answer: number;
        explanation: string;
        difficulty: string;
        category: string;
    }[];
    pass_threshold: number;
    max_attempts: number;
    xp_reward: number;
}

export interface AdminSection {
    id: string;
    course: string;
    title: string;
    type: 'teaser' | 'introduction' | 'module' | 'conclusion';
    sequence: number;
    audioFileIndex: number;
    lessons: number;
    duration: string;
    lessons_list: AdminSectionLesson[];
    quiz: AdminSectionQuiz | null;
}

export interface SectionCreatePayload {
    course: string;
    title: string;
    type: 'teaser' | 'introduction' | 'module' | 'conclusion';
    sequence: number;
    audioFileIndex?: number;
}

export interface SectionUpdatePayload {
    title?: string;
    type?: 'teaser' | 'introduction' | 'module' | 'conclusion';
    sequence?: number;
    audioFileIndex?: number;
}

interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

/** Extract array from response */
function extractResults<T>(data: T[] | PaginatedResponse<T>): T[] {
    if (Array.isArray(data)) return data;
    if (data && 'results' in data) return data.results;
    return [];
}

// =============================================================================
// API
// =============================================================================

const ENDPOINT = '/formation/sections/';

const adminSectionsApi = {
    /**
     * List sections for a course (filter by course slug)
     */
    list: async (courseSlug: string) => {
        const response = await axiosClient.get<AdminSection[] | PaginatedResponse<AdminSection>>(
            `${ENDPOINT}?course=${encodeURIComponent(courseSlug)}`
        );
        return extractResults(response.data);
    },

    /**
     * Get a single section by ID
     */
    retrieve: async (id: string) => {
        const response = await axiosClient.get<AdminSection>(`${ENDPOINT}${id}/`);
        return response.data;
    },

    /**
     * Create a new section
     */
    create: async (data: SectionCreatePayload) => {
        const response = await axiosClient.post<AdminSection>(ENDPOINT, data);
        return response.data;
    },

    /**
     * Update a section by ID
     */
    update: async (id: string, data: SectionUpdatePayload) => {
        const response = await axiosClient.patch<AdminSection>(`${ENDPOINT}${id}/`, data);
        return response.data;
    },

    /**
     * Delete a section by ID
     */
    delete: async (id: string) => {
        await axiosClient.delete(`${ENDPOINT}${id}/`);
    },
};

export default adminSectionsApi;
