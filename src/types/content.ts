/**
 * TypeScript Types for Content Management
 * 
 * These types align with the DRF serializers in the backend.
 * Includes both Admin (full translation access) and Public (single language) types.
 */

// =============================================================================
// COMMON TYPES
// =============================================================================

/** Supported locales matching backend SUPPORTED_LANGUAGES */
export type Locale = 'fr' | 'en' | 'ar';

/** Translation JSON structure used in admin endpoints */
export type TranslatedField = Partial<Record<Locale, string>>;

/** Generic API response wrapper */
export interface ApiResponse<T> {
    data: T;
    status: number;
}

/** Paginated response from DRF */
export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

/** Base model fields present on all content models */
export interface BaseContentModel {
    id: number;
    created_at: string;
    updated_at: string;
}

/** Orderable model fields */
export interface OrderedModel {
    order: number;
    is_active: boolean;
}

// =============================================================================
// HERO SECTION
// =============================================================================

/** Admin Hero data (full translations) - matches AdminHeroSerializer */
export interface AdminHeroData extends BaseContentModel {
    title: TranslatedField;
    title_highlight: TranslatedField;
    subtitle: TranslatedField;
    description: TranslatedField;
    primary_cta_text: TranslatedField;
    secondary_cta_text: TranslatedField;
    badge_text: TranslatedField;
    card_title: TranslatedField;
    card_subtitle: TranslatedField;
    background_image: string | null;
    background_image_url: string | null;
    background_image_display: string | null;
    is_active: boolean;
}

/** Public Hero data (single language) - matches PublicHeroSerializer */
export interface PublicHeroData {
    id: number;
    title: string;
    title_highlight: string;
    subtitle: string;
    description: string;
    primary_cta_text: string;
    secondary_cta_text: string;
    badge_text: string;
    card_title: string;
    card_subtitle: string;
    background_image: string | null;
}

/** Hero creation/update payload */
export interface HeroUpdatePayload {
    title?: TranslatedField;
    title_highlight?: TranslatedField;
    subtitle?: TranslatedField;
    description?: TranslatedField;
    primary_cta_text?: TranslatedField;
    secondary_cta_text?: TranslatedField;
    badge_text?: TranslatedField;
    card_title?: TranslatedField;
    card_subtitle?: TranslatedField;
    background_image?: File | null;
    background_image_url?: string | null;
    is_active?: boolean;
}

// =============================================================================
// FEATURES SECTION
// =============================================================================

/** Icon type from backend */
export interface IconValue {
    type: 'lucide' | 'image' | 'url';
    value: string;
}

/** Admin Feature Item - matches AdminFeatureItemSerializer */
export interface AdminFeatureItemData extends BaseContentModel, OrderedModel {
    section: number;
    icon: string;
    icon_image: string | null;
    icon_url: string | null;
    icon_display: IconValue;
    title: TranslatedField;
    description: TranslatedField;
}

/** Admin Features Section - matches AdminFeaturesSectionSerializer */
export interface AdminFeaturesSectionData extends BaseContentModel {
    title: TranslatedField;
    subtitle: TranslatedField;
    is_active: boolean;
    items: AdminFeatureItemData[];
    items_count: number;
}

/** Public Feature Item - matches PublicFeatureItemSerializer */
export interface PublicFeatureItemData {
    id: number;
    icon: IconValue;
    title: string;
    description: string;
    order: number;
}

/** Public Features Section - matches PublicFeaturesSectionSerializer */
export interface PublicFeaturesSectionData {
    id: number;
    title: string;
    subtitle: string;
    items: PublicFeatureItemData[];
}

/** Feature item creation/update payload */
export interface FeatureItemPayload {
    section?: number;
    icon?: string;
    icon_image?: File | null;
    icon_url?: string | null;
    title?: TranslatedField;
    description?: TranslatedField;
    order?: number;
    is_active?: boolean;
}

/** Features section update payload */
export interface FeaturesSectionPayload {
    title?: TranslatedField;
    subtitle?: TranslatedField;
    is_active?: boolean;
}

// =============================================================================
// FAQ SECTION
// =============================================================================

/** Admin FAQ Item - matches AdminFAQItemSerializer */
export interface AdminFAQItemData extends BaseContentModel, OrderedModel {
    section: number | null;
    question: TranslatedField;
    answer: TranslatedField;
}

/** Admin FAQ Section - matches AdminFAQSectionSerializer */
export interface AdminFAQSectionData extends BaseContentModel {
    title: TranslatedField;
    subtitle: TranslatedField;
    is_active: boolean;
    items: AdminFAQItemData[];
    items_count: number;
}

/** Public FAQ Item - matches PublicFAQItemSerializer */
export interface PublicFAQItemData {
    id: number;
    question: string;
    answer: string;
    order: number;
}

/** Public FAQ Section - matches PublicFAQSectionSerializer */
export interface PublicFAQSectionData {
    id: number;
    title: string;
    subtitle: string;
    items: PublicFAQItemData[];
}

/** FAQ item creation/update payload */
export interface FAQItemPayload {
    section?: number | null;
    question?: TranslatedField;
    answer?: TranslatedField;
    order?: number;
    is_active?: boolean;
}

/** FAQ section update payload */
export interface FAQSectionPayload {
    title?: TranslatedField;
    subtitle?: TranslatedField;
    is_active?: boolean;
}


// =============================================================================
// PARTNERS SECTION
// =============================================================================

/** Admin Partner - matches AdminPartnerSerializer */
export interface AdminPartnerData extends BaseContentModel, OrderedModel {
    name: string;
    logo: string | null;
    logo_url: string | null;
    logo_display: string | null;
    website_url: string | null;
}

/** Public Partner - matches PublicPartnerSerializer */
export interface PublicPartnerData {
    id: number;
    name: string;
    logo: string | null;
    website_url: string | null;
    order: number;
}

/** Partner creation/update payload */
export interface PartnerPayload {
    name?: string;
    logo?: File | null;
    logo_url?: string | null;
    website_url?: string | null;
    order?: number;
    is_active?: boolean;
}

// =============================================================================
// TESTIMONIALS SECTION
// =============================================================================

/** Admin Testimonial - matches AdminTestimonialSerializer */
export interface AdminTestimonialData extends BaseContentModel, OrderedModel {
    author_name: string;
    author_title: TranslatedField;
    author_image: string | null;
    author_image_url: string | null;
    author_image_display: string | null;
    content: TranslatedField;
    rating: number;
}

/** Public Testimonial - matches PublicTestimonialSerializer */
export interface PublicTestimonialData {
    id: number;
    author_name: string;
    author_title: string;
    author_image: string | null;
    content: string;
    rating: number;
    order: number;
}

/** Testimonial creation/update payload */
export interface TestimonialPayload {
    author_name?: string;
    author_title?: TranslatedField;
    author_image?: File | null;
    author_image_url?: string | null;
    content?: TranslatedField;
    rating?: number;
    order?: number;
    is_active?: boolean;
}

// =============================================================================
// SITE SETTINGS
// =============================================================================

/** Admin Site Settings - matches AdminSiteSettingsSerializer */
export interface AdminSiteSettingsData extends BaseContentModel {
    // General Settings
    site_name: string;
    site_tagline: string;
    default_language: Locale;
    google_analytics_id: string;

    // SEO Settings
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
    og_image: string | null;
    og_image_url: string | null;
    og_image_display: string | null;

    // Feature Toggles
    dark_mode_enabled: boolean;
    notifications_enabled: boolean;
    maintenance_mode: boolean;
    registration_enabled: boolean;

    // Social Media Links
    facebook_url: string;
    twitter_url: string;
    instagram_url: string;
    linkedin_url: string;
    youtube_url: string;

    // Contact Info
    contact_email: string;
    contact_phone: string;
    contact_address: string;
}

/** Public Site Settings - matches PublicSiteSettingsSerializer */
export interface PublicSiteSettingsData {
    site_name: string;
    site_tagline: string;
    default_language: Locale;
    google_analytics_id: string;
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
    og_image: string | null;
    dark_mode_enabled: boolean;
    notifications_enabled: boolean;
    maintenance_mode: boolean;
    registration_enabled: boolean;
    facebook_url: string;
    twitter_url: string;
    instagram_url: string;
    linkedin_url: string;
    youtube_url: string;
    contact_email: string;
    contact_phone: string;
    contact_address: string;
}

/** Site settings update payload */
export interface SiteSettingsPayload {
    site_name?: string;
    site_tagline?: string;
    default_language?: Locale;
    google_analytics_id?: string;
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
    og_image?: File | null;
    og_image_url?: string | null;
    dark_mode_enabled?: boolean;
    notifications_enabled?: boolean;
    maintenance_mode?: boolean;
    registration_enabled?: boolean;
    facebook_url?: string;
    twitter_url?: string;
    instagram_url?: string;
    linkedin_url?: string;
    youtube_url?: string;
    contact_email?: string;
    contact_phone?: string;
    contact_address?: string;
}

// =============================================================================
// LANDING PAGE (AGGREGATED)
// =============================================================================

/** Landing page meta info */
export interface LandingPageMeta {
    lang: Locale;
    supported_languages: Locale[];
    default_language: Locale;
}

/** Public Landing Page - matches PublicLandingPageView response */
export interface PublicLandingPageData {
    hero: PublicHeroData | null;
    features: PublicFeaturesSectionData | null;
    partners: PublicPartnerData[];
    faq: PublicFAQSectionData | null;
    testimonials: PublicTestimonialData[];
    settings: PublicSiteSettingsData;
    meta: LandingPageMeta;
}

// =============================================================================
// BULK ORDER UPDATE
// =============================================================================

/** Bulk order update item */
export interface OrderUpdateItem {
    id: number;
    order: number;
}

/** Bulk order update payload - matches BulkOrderUpdateSerializer */
export interface BulkOrderUpdatePayload {
    items: OrderUpdateItem[];
}

/** Bulk order update response */
export interface BulkOrderUpdateResponse {
    status: 'reordered';
    count: number;
}

// =============================================================================
// CACHE INVALIDATION
// =============================================================================

/** Cache invalidation response */
export interface CacheInvalidationResponse {
    status: 'success';
    message: string;
}
