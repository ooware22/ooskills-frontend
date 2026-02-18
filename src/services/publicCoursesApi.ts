/**
 * Public Courses & Categories API Service
 *
 * Read-only API functions for public course browsing.
 * Connects to Django formation CourseViewSet at /api/formation/courses/
 * and CategoryViewSet at /api/formation/categories/.
 * No authentication required — backend returns only PUBLISHED courses.
 */

import axiosClient from '@/lib/axios';

// =============================================================================
// TYPES
// =============================================================================

export interface PublicCourseModule {
    id: string;
    title: string;
    type: string;
    sequence: number;
    lessons: number;
    duration: string;
}

export interface PublicCourse {
    id: number;
    title: string;
    slug: string;
    category: string;          // category slug
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
    modules: PublicCourseModule[];
    language: string;
    certificate: boolean;
    lastUpdated: string;
}

export interface CategoryName {
    ar: string;
    en: string;
    fr: string;
}

export interface PublicCategory {
    id: string;
    name: CategoryName;
    slug: string;
    icon: string;
}

export interface CourseFilterParams {
    search?: string;
    category?: string;        // category slug
    level?: string;
    language?: string;
    price_min?: number;
    price_max?: number;
    ordering?: string;        // e.g. '-date', 'price', '-rating', '-students'
}

interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

/** Extract array from response — handles both paginated and direct array */
function extractResults<T>(data: T[] | PaginatedResponse<T>): { results: T[]; count: number } {
    if (Array.isArray(data)) {
        return { results: data, count: data.length };
    }
    if (data && 'results' in data) {
        return { results: data.results, count: data.count };
    }
    return { results: [], count: 0 };
}

// =============================================================================
// API
// =============================================================================

const COURSES_ENDPOINT = '/formation/courses/';
const CATEGORIES_ENDPOINT = '/formation/categories/';

const publicCoursesApi = {
    /**
     * List published courses with optional filters
     */
    listCourses: async (params?: CourseFilterParams) => {
        const qp = new URLSearchParams();
        if (params?.search) qp.set('search', params.search);
        if (params?.category) qp.set('category', params.category);
        if (params?.level) qp.set('level', params.level);
        if (params?.language) qp.set('language', params.language);
        if (params?.price_min !== undefined) qp.set('price_min', String(params.price_min));
        if (params?.price_max !== undefined) qp.set('price_max', String(params.price_max));
        if (params?.ordering) qp.set('ordering', params.ordering);

        const qs = qp.toString();
        const url = qs ? `${COURSES_ENDPOINT}?${qs}` : COURSES_ENDPOINT;

        const response = await axiosClient.get<PublicCourse[] | PaginatedResponse<PublicCourse>>(url);
        return extractResults(response.data);
    },

    /**
     * Get a single course by slug
     */
    getCourse: async (slug: string) => {
        const response = await axiosClient.get<PublicCourse>(`${COURSES_ENDPOINT}${slug}/`);
        return response.data;
    },

    /**
     * List all categories
     */
    listCategories: async () => {
        const response = await axiosClient.get<PublicCategory[] | PaginatedResponse<PublicCategory>>(CATEGORIES_ENDPOINT);
        return extractResults(response.data);
    },
};

export interface CourseRatingItem {
    id: string;
    user: string;
    course: string;
    rating: number;
    review_text: string;
    user_name: string;
    created_at: string;
}

const ratingApi = {
    /** Get all ratings for a course */
    getCourseRatings: async (slug: string): Promise<CourseRatingItem[]> => {
        const response = await axiosClient.get<CourseRatingItem[]>(
            `${COURSES_ENDPOINT}${slug}/ratings/`
        );
        return response.data;
    },

    /** Submit or update a rating for a course (must be enrolled) */
    submitCourseRating: async (
        slug: string,
        rating: number,
        review_text: string = ''
    ): Promise<CourseRatingItem> => {
        const response = await axiosClient.post<CourseRatingItem>(
            `${COURSES_ENDPOINT}${slug}/rate/`,
            { rating, review_text }
        );
        return response.data;
    },
};

export { ratingApi };
export default publicCoursesApi;

