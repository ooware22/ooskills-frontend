/**
 * Admin Lessons API Service
 *
 * Typed API functions for admin lesson management endpoints.
 * Connects to Django formation LessonViewSet at /api/formation/lessons/.
 * Supports multipart/form-data for audio file uploads.
 */

import axiosClient, { UPLOAD_TIMEOUT } from '@/lib/axios';

// =============================================================================
// TYPES
// =============================================================================

export interface LessonContent {
    visual_content: Record<string, unknown>;
    narration_script: {
        mode: string;
        speakers: { text: string; emotion: string; speaker: string }[];
    };
}

export interface AdminLesson {
    id: string;
    section: string;
    title: string;
    type: 'slide' | 'video' | 'text' | 'audio';
    sequence: number;
    duration_seconds: number;
    audioUrl: string | null;
    content: LessonContent;
    slide_type: string;
}

export interface LessonCreatePayload {
    section: string;
    title: string;
    type: 'slide' | 'video' | 'text' | 'audio';
    sequence: number;
    duration_seconds: number;
    slide_type: string;
    content?: LessonContent;
    audioFile?: File | null;
}

export interface LessonUpdatePayload {
    title?: string;
    type?: 'slide' | 'video' | 'text' | 'audio';
    sequence?: number;
    duration_seconds?: number;
    slide_type?: string;
    content?: LessonContent;
    audioFile?: File | null;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Build FormData if an audio file is present, otherwise return JSON payload.
 * The backend Lesson.audioUrl is a FileField — it must receive a File via
 * multipart/form-data, not a string.
 */
function buildLessonFormData(
    data: LessonCreatePayload | LessonUpdatePayload,
): { body: FormData | Record<string, unknown>; headers: Record<string, string> } {
    const { audioFile, ...rest } = data;

    if (audioFile) {
        const fd = new FormData();

        // Append all scalar fields
        for (const [key, value] of Object.entries(rest)) {
            if (value === undefined || value === null) continue;
            if (key === 'content' && typeof value === 'object') {
                fd.append(key, JSON.stringify(value));
            } else {
                fd.append(key, String(value));
            }
        }

        // Append the file under the backend field name 'audioUrl'
        fd.append('audioUrl', audioFile);

        return { body: fd, headers: { 'Content-Type': 'multipart/form-data' } };
    }

    // No file — send as JSON (exclude audioFile key entirely)
    return { body: rest as Record<string, unknown>, headers: {} };
}

// =============================================================================
// API
// =============================================================================

const ENDPOINT = '/formation/lessons/';

const adminLessonsApi = {
    /**
     * Get a single lesson by ID
     */
    retrieve: async (id: string) => {
        const response = await axiosClient.get<AdminLesson>(`${ENDPOINT}${id}/`);
        return response.data;
    },

    /**
     * Create a new lesson (supports audio file upload via FormData)
     */
    create: async (data: LessonCreatePayload) => {
        const { body, headers } = buildLessonFormData(data);
        const response = await axiosClient.post<AdminLesson>(ENDPOINT, body, {
            headers,
            timeout: data.audioFile ? UPLOAD_TIMEOUT : undefined,
        });
        return response.data;
    },

    /**
     * Update a lesson by ID (supports audio file upload via FormData)
     */
    update: async (id: string, data: LessonUpdatePayload) => {
        const { body, headers } = buildLessonFormData(data);
        const response = await axiosClient.patch<AdminLesson>(`${ENDPOINT}${id}/`, body, {
            headers,
            timeout: data.audioFile ? UPLOAD_TIMEOUT : undefined,
        });
        return response.data;
    },

    /**
     * Delete a lesson by ID
     */
    delete: async (id: string) => {
        await axiosClient.delete(`${ENDPOINT}${id}/`);
    },
};

export default adminLessonsApi;
