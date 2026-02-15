/**
 * Admin Quizzes API Service
 *
 * Typed API functions for admin quiz management endpoints.
 * Connects to Django formation QuizViewSet at /api/formation/quizzes/
 * and QuizQuestionViewSet at /api/formation/quiz-questions/.
 */

import axiosClient from '@/lib/axios';

// =============================================================================
// TYPES
// =============================================================================

export interface QuizQuestion {
    id: string;
    quiz?: string;
    type: string;
    question: string;
    options: string[];
    correct_answer: number;
    explanation: string;
    difficulty: string;
    category: string;
    sequence?: number;
}

export interface AdminQuiz {
    id: string;
    section: string;
    title: string;
    intro_text: string;
    questions: QuizQuestion[];
    pass_threshold: number;
    max_attempts: number;
    xp_reward: number;
}

export interface QuizCreatePayload {
    section: string;
    title: string;
    intro_text?: string;
    pass_threshold?: number;
    max_attempts?: number;
    xp_reward?: number;
}

export interface QuizUpdatePayload {
    title?: string;
    intro_text?: string;
    pass_threshold?: number;
    max_attempts?: number;
    xp_reward?: number;
}

export interface QuestionCreatePayload {
    quiz: string;
    type: string;
    question: string;
    options: string[];
    correct_answer: number;
    explanation?: string;
    difficulty?: string;
    category?: string;
    sequence?: number;
}

export interface QuestionUpdatePayload {
    type?: string;
    question?: string;
    options?: string[];
    correct_answer?: number;
    explanation?: string;
    difficulty?: string;
    category?: string;
    sequence?: number;
}

// =============================================================================
// API
// =============================================================================

const QUIZ_ENDPOINT = '/formation/quizzes/';
const QUESTION_ENDPOINT = '/formation/quiz-questions/';

const adminQuizzesApi = {
    // ── Quiz CRUD ──

    /** List quizzes, optionally filtered by section */
    list: async (sectionId?: string) => {
        const params = sectionId ? `?section=${sectionId}` : '';
        const response = await axiosClient.get<AdminQuiz[]>(`${QUIZ_ENDPOINT}${params}`);
        return Array.isArray(response.data) ? response.data : (response.data as any).results ?? [];
    },

    /** Get a single quiz by ID */
    retrieve: async (id: string) => {
        const response = await axiosClient.get<AdminQuiz>(`${QUIZ_ENDPOINT}${id}/`);
        return response.data;
    },

    /** Create a new quiz */
    create: async (data: QuizCreatePayload) => {
        const response = await axiosClient.post<AdminQuiz>(QUIZ_ENDPOINT, data);
        return response.data;
    },

    /** Update a quiz by ID */
    update: async (id: string, data: QuizUpdatePayload) => {
        const response = await axiosClient.patch<AdminQuiz>(`${QUIZ_ENDPOINT}${id}/`, data);
        return response.data;
    },

    /** Delete a quiz by ID */
    delete: async (id: string) => {
        await axiosClient.delete(`${QUIZ_ENDPOINT}${id}/`);
    },

    // ── Question CRUD ──

    /** Create a question for a quiz */
    createQuestion: async (data: QuestionCreatePayload) => {
        const response = await axiosClient.post<QuizQuestion>(QUESTION_ENDPOINT, data);
        return response.data;
    },

    /** Update a question by ID */
    updateQuestion: async (id: string, data: QuestionUpdatePayload) => {
        const response = await axiosClient.patch<QuizQuestion>(`${QUESTION_ENDPOINT}${id}/`, data);
        return response.data;
    },

    /** Delete a question by ID */
    deleteQuestion: async (id: string) => {
        await axiosClient.delete(`${QUESTION_ENDPOINT}${id}/`);
    },
};

export default adminQuizzesApi;
