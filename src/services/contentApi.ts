/**
 * Content API Service
 * 
 * Typed API functions for all content management endpoints.
 * Uses the central Axios client for consistent error handling.
 */

import axiosClient from '@/lib/axios';
import type {
    Locale,
    // Admin types
    AdminHeroData,
    AdminFeaturesSectionData,
    AdminFeatureItemData,
    AdminFAQSectionData,
    AdminFAQItemData,
    AdminPartnerData,
    AdminTestimonialData,
    AdminSiteSettingsData,
    // Public types
    PublicLandingPageData,
    PublicHeroData,
    PublicFeaturesSectionData,
    PublicPartnerData,
    PublicFAQSectionData,
    PublicFAQItemData,
    PublicTestimonialData,
    PublicSiteSettingsData,
    // Payloads
    HeroUpdatePayload,
    FeaturesSectionPayload,
    FeatureItemPayload,
    FAQSectionPayload,
    FAQItemPayload,
    PartnerPayload,
    TestimonialPayload,
    SiteSettingsPayload,
    BulkOrderUpdatePayload,
    BulkOrderUpdateResponse,
    CacheInvalidationResponse,
} from '@/types/content';

// =============================================================================
// PAGINATED RESPONSE TYPE (DRF default pagination format)
// =============================================================================

interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

/** Extract array from response - handles both paginated and direct array responses */
function extractResults<T>(data: T[] | PaginatedResponse<T>): T[] {
    if (Array.isArray(data)) {
        return data;
    }
    if (data && 'results' in data) {
        return data.results;
    }
    return [];
}

// =============================================================================
// ENDPOINT PATHS
// =============================================================================

const ENDPOINTS = {
    // Public endpoints (read-only)
    public: {
        landing: '/public/landing/',
        hero: '/public/landing/hero/',
        features: '/public/landing/features/',
        partners: '/public/landing/partners/',
        faq: '/public/landing/faq/',
        testimonials: '/public/landing/testimonials/',
        settings: '/public/settings/',
    },
    // Admin endpoints (CRUD)
    admin: {
        hero: '/admin/cms/hero/',
        features: '/admin/cms/features/',
        featureItems: '/admin/cms/feature-items/',
        partners: '/admin/cms/partners/',
        faq: '/admin/cms/faq/',
        faqItems: '/admin/cms/faq-items/',
        testimonials: '/admin/cms/testimonials/',
        settings: '/admin/cms/settings/',
        invalidateCache: '/admin/cms/invalidate-cache/',
    },
} as const;

// =============================================================================
// PUBLIC API (Read-only endpoints for landing page)
// =============================================================================

export const publicApi = {
    /**
     * Get aggregated landing page data (single request for entire homepage)
     */
    getLandingPage: async (lang: Locale = 'fr') => {
        const response = await axiosClient.get<PublicLandingPageData>(
            `${ENDPOINTS.public.landing}?lang=${lang}`
        );
        return response.data;
    },

    /**
     * Get hero section only
     */
    getHero: async (lang: Locale = 'fr') => {
        const response = await axiosClient.get<PublicHeroData>(
            `${ENDPOINTS.public.hero}?lang=${lang}`
        );
        return response.data;
    },

    /**
     * Get features section with items
     */
    getFeatures: async (lang: Locale = 'fr') => {
        const response = await axiosClient.get<PublicFeaturesSectionData>(
            `${ENDPOINTS.public.features}?lang=${lang}`
        );
        return response.data;
    },

    /**
     * Get all active partners
     */
    getPartners: async () => {
        const response = await axiosClient.get<PublicPartnerData[]>(
            ENDPOINTS.public.partners
        );
        return response.data;
    },

    /**
     * Get all active FAQ items
     */
    getFAQ: async (lang: Locale = 'fr') => {
        const response = await axiosClient.get<PublicFAQItemData[]>(
            `${ENDPOINTS.public.faq}?lang=${lang}`
        );
        return response.data;
    },

    /**
     * Get all active testimonials
     */
    getTestimonials: async (lang: Locale = 'fr') => {
        const response = await axiosClient.get<PublicTestimonialData[]>(
            `${ENDPOINTS.public.testimonials}?lang=${lang}`
        );
        return response.data;
    },

    /**
     * Get site settings
     */
    getSettings: async (lang: Locale = 'fr') => {
        const response = await axiosClient.get<PublicSiteSettingsData>(
            `${ENDPOINTS.public.settings}?lang=${lang}`
        );
        return response.data;
    },
};

// =============================================================================
// ADMIN HERO API
// =============================================================================

export const adminHeroApi = {
    /**
     * List all hero sections
     */
    list: async () => {
        const response = await axiosClient.get<AdminHeroData[] | PaginatedResponse<AdminHeroData>>(ENDPOINTS.admin.hero);
        return extractResults(response.data);
    },

    /**
     * Get the currently active hero section
     */
    getActive: async () => {
        const response = await axiosClient.get<AdminHeroData>(
            `${ENDPOINTS.admin.hero}active/`
        );
        return response.data;
    },

    /**
     * Get a specific hero section by ID
     */
    retrieve: async (id: number) => {
        const response = await axiosClient.get<AdminHeroData>(
            `${ENDPOINTS.admin.hero}${id}/`
        );
        return response.data;
    },

    /**
     * Create a new hero section
     */
    create: async (data: HeroUpdatePayload) => {
        const response = await axiosClient.post<AdminHeroData>(
            ENDPOINTS.admin.hero,
            data
        );
        return response.data;
    },

    /**
     * Update a hero section (partial update)
     */
    update: async (id: number, data: Partial<HeroUpdatePayload>) => {
        const response = await axiosClient.patch<AdminHeroData>(
            `${ENDPOINTS.admin.hero}${id}/`,
            data
        );
        return response.data;
    },

    /**
     * Delete a hero section
     */
    delete: async (id: number) => {
        await axiosClient.delete(`${ENDPOINTS.admin.hero}${id}/`);
    },

    /**
     * Activate a hero section (deactivates others)
     */
    activate: async (id: number) => {
        const response = await axiosClient.post<AdminHeroData>(
            `${ENDPOINTS.admin.hero}${id}/activate/`
        );
        return response.data;
    },
};

// =============================================================================
// ADMIN FEATURES API
// =============================================================================

export const adminFeaturesApi = {
    // Features Section
    section: {
        /**
         * List all feature sections
         */
        list: async () => {
            const response = await axiosClient.get<AdminFeaturesSectionData[] | PaginatedResponse<AdminFeaturesSectionData>>(
                ENDPOINTS.admin.features
            );
            return extractResults(response.data);
        },

        /**
         * Get the currently active features section
         */
        getActive: async () => {
            const response = await axiosClient.get<AdminFeaturesSectionData>(
                `${ENDPOINTS.admin.features}active/`
            );
            return response.data;
        },

        /**
         * Get a specific features section by ID
         */
        retrieve: async (id: number) => {
            const response = await axiosClient.get<AdminFeaturesSectionData>(
                `${ENDPOINTS.admin.features}${id}/`
            );
            return response.data;
        },

        /**
         * Create a new features section
         */
        create: async (data: FeaturesSectionPayload) => {
            const response = await axiosClient.post<AdminFeaturesSectionData>(
                ENDPOINTS.admin.features,
                data
            );
            return response.data;
        },

        /**
         * Update a features section
         */
        update: async (id: number, data: Partial<FeaturesSectionPayload>) => {
            const response = await axiosClient.patch<AdminFeaturesSectionData>(
                `${ENDPOINTS.admin.features}${id}/`,
                data
            );
            return response.data;
        },

        /**
         * Delete a features section
         */
        delete: async (id: number) => {
            await axiosClient.delete(`${ENDPOINTS.admin.features}${id}/`);
        },

        /**
         * Activate a features section
         */
        activate: async (id: number) => {
            const response = await axiosClient.post<AdminFeaturesSectionData>(
                `${ENDPOINTS.admin.features}${id}/activate/`
            );
            return response.data;
        },
    },

    // Feature Items
    items: {
        /**
         * List all feature items (optionally filter by section)
         */
        list: async (sectionId?: number) => {
            const url = sectionId
                ? `${ENDPOINTS.admin.featureItems}?section=${sectionId}`
                : ENDPOINTS.admin.featureItems;
            const response = await axiosClient.get<AdminFeatureItemData[] | PaginatedResponse<AdminFeatureItemData>>(url);
            return extractResults(response.data);
        },

        /**
         * Get a specific feature item
         */
        retrieve: async (id: number) => {
            const response = await axiosClient.get<AdminFeatureItemData>(
                `${ENDPOINTS.admin.featureItems}${id}/`
            );
            return response.data;
        },

        /**
         * Create a new feature item
         */
        create: async (data: FeatureItemPayload) => {
            const response = await axiosClient.post<AdminFeatureItemData>(
                ENDPOINTS.admin.featureItems,
                data
            );
            return response.data;
        },

        /**
         * Update a feature item
         */
        update: async (id: number, data: Partial<FeatureItemPayload>) => {
            const response = await axiosClient.patch<AdminFeatureItemData>(
                `${ENDPOINTS.admin.featureItems}${id}/`,
                data
            );
            return response.data;
        },

        /**
         * Delete a feature item
         */
        delete: async (id: number) => {
            await axiosClient.delete(`${ENDPOINTS.admin.featureItems}${id}/`);
        },

        /**
         * Bulk reorder feature items
         */
        reorder: async (data: BulkOrderUpdatePayload) => {
            const response = await axiosClient.post<BulkOrderUpdateResponse>(
                `${ENDPOINTS.admin.featureItems}reorder/`,
                data
            );
            return response.data;
        },
    },
};

// =============================================================================
// ADMIN FAQ API
// =============================================================================

export const adminFAQApi = {
    // FAQ Section (title/subtitle)
    section: {
        /**
         * List all FAQ sections
         */
        list: async () => {
            const response = await axiosClient.get<AdminFAQSectionData[] | PaginatedResponse<AdminFAQSectionData>>(
                ENDPOINTS.admin.faq
            );
            return extractResults(response.data);
        },

        /**
         * Get the currently active FAQ section
         */
        getActive: async () => {
            const response = await axiosClient.get<AdminFAQSectionData>(
                `${ENDPOINTS.admin.faq}active/`
            );
            return response.data;
        },

        /**
         * Get a specific FAQ section by ID
         */
        retrieve: async (id: number) => {
            const response = await axiosClient.get<AdminFAQSectionData>(
                `${ENDPOINTS.admin.faq}${id}/`
            );
            return response.data;
        },

        /**
         * Create a new FAQ section
         */
        create: async (data: FAQSectionPayload) => {
            const response = await axiosClient.post<AdminFAQSectionData>(
                ENDPOINTS.admin.faq,
                data
            );
            return response.data;
        },

        /**
         * Update a FAQ section
         */
        update: async (id: number, data: Partial<FAQSectionPayload>) => {
            const response = await axiosClient.patch<AdminFAQSectionData>(
                `${ENDPOINTS.admin.faq}${id}/`,
                data
            );
            return response.data;
        },

        /**
         * Delete a FAQ section
         */
        delete: async (id: number) => {
            await axiosClient.delete(`${ENDPOINTS.admin.faq}${id}/`);
        },

        /**
         * Activate a FAQ section
         */
        activate: async (id: number) => {
            const response = await axiosClient.post<AdminFAQSectionData>(
                `${ENDPOINTS.admin.faq}${id}/activate/`
            );
            return response.data;
        },
    },

    // FAQ Items (questions/answers)
    items: {
        /**
         * List all FAQ items (optionally filter by section)
         */
        list: async (sectionId?: number) => {
            const url = sectionId
                ? `${ENDPOINTS.admin.faqItems}?section=${sectionId}`
                : ENDPOINTS.admin.faqItems;
            const response = await axiosClient.get<AdminFAQItemData[] | PaginatedResponse<AdminFAQItemData>>(url);
            return extractResults(response.data);
        },

        /**
         * Get a specific FAQ item
         */
        retrieve: async (id: number) => {
            const response = await axiosClient.get<AdminFAQItemData>(
                `${ENDPOINTS.admin.faqItems}${id}/`
            );
            return response.data;
        },

        /**
         * Create a new FAQ item
         */
        create: async (data: FAQItemPayload) => {
            const response = await axiosClient.post<AdminFAQItemData>(
                ENDPOINTS.admin.faqItems,
                data
            );
            return response.data;
        },

        /**
         * Update a FAQ item
         */
        update: async (id: number, data: Partial<FAQItemPayload>) => {
            const response = await axiosClient.patch<AdminFAQItemData>(
                `${ENDPOINTS.admin.faqItems}${id}/`,
                data
            );
            return response.data;
        },

        /**
         * Delete a FAQ item
         */
        delete: async (id: number) => {
            await axiosClient.delete(`${ENDPOINTS.admin.faqItems}${id}/`);
        },

        /**
         * Bulk reorder FAQ items
         */
        reorder: async (data: BulkOrderUpdatePayload) => {
            const response = await axiosClient.post<BulkOrderUpdateResponse>(
                `${ENDPOINTS.admin.faqItems}reorder/`,
                data
            );
            return response.data;
        },
    },
};

// =============================================================================
// ADMIN PARTNERS API
// =============================================================================

export const adminPartnersApi = {
    /**
     * List all partners
     */
    list: async () => {
        const response = await axiosClient.get<AdminPartnerData[] | PaginatedResponse<AdminPartnerData>>(
            ENDPOINTS.admin.partners
        );
        return extractResults(response.data);
    },

    /**
     * Get a specific partner
     */
    retrieve: async (id: number) => {
        const response = await axiosClient.get<AdminPartnerData>(
            `${ENDPOINTS.admin.partners}${id}/`
        );
        return response.data;
    },

    /**
     * Create a new partner
     */
    create: async (data: PartnerPayload) => {
        const response = await axiosClient.post<AdminPartnerData>(
            ENDPOINTS.admin.partners,
            data
        );
        return response.data;
    },

    /**
     * Update a partner
     */
    update: async (id: number, data: Partial<PartnerPayload>) => {
        const response = await axiosClient.patch<AdminPartnerData>(
            `${ENDPOINTS.admin.partners}${id}/`,
            data
        );
        return response.data;
    },

    /**
     * Delete a partner
     */
    delete: async (id: number) => {
        await axiosClient.delete(`${ENDPOINTS.admin.partners}${id}/`);
    },

    /**
     * Bulk reorder partners
     */
    reorder: async (data: BulkOrderUpdatePayload) => {
        const response = await axiosClient.post<BulkOrderUpdateResponse>(
            `${ENDPOINTS.admin.partners}reorder/`,
            data
        );
        return response.data;
    },
};

// =============================================================================
// ADMIN TESTIMONIALS API
// =============================================================================

export const adminTestimonialsApi = {
    /**
     * List all testimonials
     */
    list: async () => {
        const response = await axiosClient.get<AdminTestimonialData[] | PaginatedResponse<AdminTestimonialData>>(
            ENDPOINTS.admin.testimonials
        );
        return extractResults(response.data);
    },

    /**
     * Get a specific testimonial
     */
    retrieve: async (id: number) => {
        const response = await axiosClient.get<AdminTestimonialData>(
            `${ENDPOINTS.admin.testimonials}${id}/`
        );
        return response.data;
    },

    /**
     * Create a new testimonial
     */
    create: async (data: TestimonialPayload) => {
        const response = await axiosClient.post<AdminTestimonialData>(
            ENDPOINTS.admin.testimonials,
            data
        );
        return response.data;
    },

    /**
     * Update a testimonial
     */
    update: async (id: number, data: Partial<TestimonialPayload>) => {
        const response = await axiosClient.patch<AdminTestimonialData>(
            `${ENDPOINTS.admin.testimonials}${id}/`,
            data
        );
        return response.data;
    },

    /**
     * Delete a testimonial
     */
    delete: async (id: number) => {
        await axiosClient.delete(`${ENDPOINTS.admin.testimonials}${id}/`);
    },

    /**
     * Bulk reorder testimonials
     */
    reorder: async (data: BulkOrderUpdatePayload) => {
        const response = await axiosClient.post<BulkOrderUpdateResponse>(
            `${ENDPOINTS.admin.testimonials}reorder/`,
            data
        );
        return response.data;
    },
};

// =============================================================================
// ADMIN SITE SETTINGS API
// =============================================================================

export const adminSettingsApi = {
    /**
     * Get site settings
     */
    get: async () => {
        const response = await axiosClient.get<AdminSiteSettingsData>(
            ENDPOINTS.admin.settings
        );
        return response.data;
    },

    /**
     * Update site settings
     */
    update: async (data: Partial<SiteSettingsPayload>) => {
        const response = await axiosClient.patch<AdminSiteSettingsData>(
            `${ENDPOINTS.admin.settings}update_settings/`,
            data
        );
        return response.data;
    },
};

// =============================================================================
// CACHE MANAGEMENT API
// =============================================================================

export const cacheApi = {
    /**
     * Invalidate server-side cache
     */
    invalidate: async () => {
        const response = await axiosClient.post<CacheInvalidationResponse>(
            ENDPOINTS.admin.invalidateCache
        );
        return response.data;
    },
};

// =============================================================================
// COMBINED CONTENT API EXPORT
// =============================================================================

export const contentApi = {
    public: publicApi,
    admin: {
        hero: adminHeroApi,
        features: adminFeaturesApi,
        faq: adminFAQApi,
        partners: adminPartnersApi,
        testimonials: adminTestimonialsApi,
        settings: adminSettingsApi,
        cache: cacheApi,
    },
};

export default contentApi;
