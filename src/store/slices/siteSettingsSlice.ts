import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminSettingsApi } from "@/services/contentApi";
import { getErrorMessage } from "@/lib/axios";
import { CACHE_DURATION, shouldFetch } from "@/lib/cache";
import type { RootState } from "../index";
import type { AdminSiteSettingsData, Locale, SiteSettingsPayload } from "@/types/content";

// =============================================================================
// TYPES
// =============================================================================

export type { Locale } from "@/types/content";

/** Frontend-friendly site settings structure */
export interface SiteSettings {
    // General
    siteName: string;
    siteTagline: string;
    defaultLanguage: Locale;
    googleAnalyticsId: string;

    // SEO
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    ogImage: string | null;

    // Feature Toggles
    darkModeEnabled: boolean;
    notificationsEnabled: boolean;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
}

/** State structure for site settings slice */
export interface SiteSettingsState {
    /** Site settings from backend (raw format) */
    data: AdminSiteSettingsData | null;
    /** Is data currently being fetched */
    loading: boolean;
    /** Is data currently being saved */
    saving: boolean;
    /** Error message if any */
    error: string | null;
    /** Timestamp of last successful fetch */
    lastFetched: number | null;
}

// =============================================================================
// HELPERS
// =============================================================================

/** Transform backend settings to frontend format */
const transformSettings = (data: AdminSiteSettingsData | null): SiteSettings | null => {
    if (!data) return null;

    return {
        siteName: data.site_name,
        siteTagline: data.site_tagline,
        defaultLanguage: data.default_language,
        googleAnalyticsId: data.google_analytics_id,

        metaTitle: data.meta_title,
        metaDescription: data.meta_description,
        metaKeywords: data.meta_keywords,
        ogImage: data.og_image_display || data.og_image_url || data.og_image,

        darkModeEnabled: data.dark_mode_enabled,
        notificationsEnabled: data.notifications_enabled,
        maintenanceMode: data.maintenance_mode,
        registrationEnabled: data.registration_enabled,
    };
};

/** Transform frontend settings to backend payload */
const transformToPayload = (settings: Partial<SiteSettings>): SiteSettingsPayload => {
    const payload: SiteSettingsPayload = {};

    if (settings.siteName !== undefined) payload.site_name = settings.siteName;
    if (settings.siteTagline !== undefined) payload.site_tagline = settings.siteTagline;
    if (settings.defaultLanguage !== undefined) payload.default_language = settings.defaultLanguage;
    if (settings.googleAnalyticsId !== undefined) payload.google_analytics_id = settings.googleAnalyticsId;

    if (settings.metaTitle !== undefined) payload.meta_title = settings.metaTitle;
    if (settings.metaDescription !== undefined) payload.meta_description = settings.metaDescription;
    if (settings.metaKeywords !== undefined) payload.meta_keywords = settings.metaKeywords;
    if (settings.ogImage !== undefined) payload.og_image_url = settings.ogImage;

    if (settings.darkModeEnabled !== undefined) payload.dark_mode_enabled = settings.darkModeEnabled;
    if (settings.notificationsEnabled !== undefined) payload.notifications_enabled = settings.notificationsEnabled;
    if (settings.maintenanceMode !== undefined) payload.maintenance_mode = settings.maintenanceMode;
    if (settings.registrationEnabled !== undefined) payload.registration_enabled = settings.registrationEnabled;

    return payload;
};

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: SiteSettingsState = {
    data: null,
    loading: false,
    saving: false,
    error: null,
    lastFetched: null,
};

// =============================================================================
// ASYNC THUNKS
// =============================================================================

/**
 * Fetch site settings from backend
 */
export const fetchSiteSettings = createAsyncThunk(
    "siteSettings/fetch",
    async (options: { forceRefresh?: boolean } = {}, { rejectWithValue }) => {
        try {
            const data = await adminSettingsApi.get();
            return data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    },
    {
        condition: (options, { getState }) => {
            if (options?.forceRefresh) return true;
            const { siteSettings } = getState() as RootState;
            return shouldFetch(siteSettings.lastFetched, siteSettings.loading, CACHE_DURATION.LONG);
        },
    }
);

/**
 * Update site settings
 */
export const updateSiteSettings = createAsyncThunk(
    "siteSettings/update",
    async (settings: Partial<SiteSettings>, { rejectWithValue }) => {
        try {
            const payload = transformToPayload(settings);
            const updated = await adminSettingsApi.update(payload);
            return updated;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

/**
 * Update a single setting field
 */
export const updateSettingField = createAsyncThunk(
    "siteSettings/updateField",
    async (
        { field, value }: { field: keyof SiteSettings; value: string | boolean },
        { rejectWithValue }
    ) => {
        try {
            const settings = { [field]: value } as Partial<SiteSettings>;
            const payload = transformToPayload(settings);
            const updated = await adminSettingsApi.update(payload);
            return updated;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

// =============================================================================
// SLICE
// =============================================================================

const siteSettingsSlice = createSlice({
    name: "siteSettings",
    initialState,
    reducers: {
        /** Clear error state */
        clearError: (state) => {
            state.error = null;
        },

        /** Force cache invalidation */
        invalidateCache: (state) => {
            state.lastFetched = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Settings
            .addCase(fetchSiteSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSiteSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
                state.lastFetched = Date.now();
            })
            .addCase(fetchSiteSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Update Settings
            .addCase(updateSiteSettings.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(updateSiteSettings.fulfilled, (state, action) => {
                state.saving = false;
                state.data = action.payload;
            })
            .addCase(updateSiteSettings.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload as string;
            })

            // Update Single Field
            .addCase(updateSettingField.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(updateSettingField.fulfilled, (state, action) => {
                state.saving = false;
                state.data = action.payload;
            })
            .addCase(updateSettingField.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload as string;
            });
    },
});

// =============================================================================
// EXPORTS
// =============================================================================

export const { clearError, invalidateCache } = siteSettingsSlice.actions;

export default siteSettingsSlice.reducer;

// =============================================================================
// SELECTORS
// =============================================================================

export const selectSiteSettingsState = (state: RootState) => state.siteSettings;
export const selectSiteSettings = (state: RootState) => transformSettings(state.siteSettings.data);
export const selectSiteSettingsRaw = (state: RootState) => state.siteSettings.data;
export const selectSiteSettingsLoading = (state: RootState) => state.siteSettings.loading;
export const selectSiteSettingsSaving = (state: RootState) => state.siteSettings.saving;
export const selectSiteSettingsError = (state: RootState) => state.siteSettings.error;

// Specific field selectors
export const selectDefaultLanguage = (state: RootState): Locale =>
    state.siteSettings.data?.default_language || 'fr';
export const selectMaintenanceMode = (state: RootState): boolean =>
    state.siteSettings.data?.maintenance_mode || false;
export const selectDarkModeEnabled = (state: RootState): boolean =>
    state.siteSettings.data?.dark_mode_enabled ?? true;
