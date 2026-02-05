import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminHeroApi, adminFeaturesApi, adminFAQApi, adminSettingsApi } from "@/services/contentApi";
import { getErrorMessage } from "@/lib/axios";
import { shouldFetch } from "@/lib/cache";
import type { RootState } from "../index";

// =============================================================================
// TYPES
// =============================================================================

export interface SectionInfo {
    nameKey: string;
    status: string;
    loading: boolean;
}

export interface DashboardState {
    sections: Record<string, SectionInfo>;
    loading: boolean;
    error: string | null;
    lastFetched: number | null;
}

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: DashboardState = {
    sections: {
        hero: { nameKey: "hero", status: "Loading...", loading: true },
        countdown: { nameKey: "countdown", status: "Active", loading: false },
        features: { nameKey: "features", status: "Loading...", loading: true },
        courses: { nameKey: "courses", status: "Coming soon", loading: false },
        faq: { nameKey: "faq", status: "Loading...", loading: true },
        contact: { nameKey: "contact", status: "Loading...", loading: true },
        settings: { nameKey: "settings", status: "Loading...", loading: true },
    },
    loading: false,
    error: null,
    lastFetched: null,
};

// =============================================================================
// ASYNC THUNKS
// =============================================================================

export const fetchDashboardData = createAsyncThunk<
    Record<string, string>,
    { forceRefresh?: boolean } | undefined,
    { state: RootState; rejectValue: string }
>(
    "dashboard/fetchData",
    async (options, { getState, rejectWithValue }) => {
        const { dashboard } = getState();

        // Use cached data unless force refresh
        if (!options?.forceRefresh && !shouldFetch(dashboard.lastFetched)) {
            return {}; // Return empty to skip update
        }

        const results: Record<string, string> = {};

        // Fetch Hero status
        try {
            const heroSection = await adminHeroApi.getActive();
            results.hero = heroSection?.is_active ? "Published" : "Draft";
        } catch {
            results.hero = "Not configured";
        }

        // Fetch Features count
        try {
            const featuresSection = await adminFeaturesApi.section.getActive();
            const itemCount = featuresSection?.items?.length || 0;
            results.features = `${itemCount} items`;
        } catch {
            results.features = "0 items";
        }

        // Fetch FAQ count
        try {
            const faqSection = await adminFAQApi.section.getActive();
            const faqCount = faqSection?.items?.length || 0;
            results.faq = `${faqCount} items`;
        } catch {
            results.faq = "0 items";
        }

        // Fetch Contact/Settings status
        try {
            const settings = await adminSettingsApi.get();
            const hasContact = settings?.contact_email || settings?.contact_phone;
            results.contact = hasContact ? "Configured" : "Not configured";
            results.settings = settings?.site_name ? "Configured" : "Not configured";
        } catch {
            results.contact = "Not configured";
            results.settings = "Not configured";
        }

        return results;
    }
);

// =============================================================================
// SLICE
// =============================================================================

const dashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardData.pending, (state) => {
                state.loading = true;
                state.error = null;
                // Set all dynamic sections to loading
                ["hero", "features", "faq", "contact", "settings"].forEach(key => {
                    if (state.sections[key]) {
                        state.sections[key].loading = true;
                    }
                });
            })
            .addCase(fetchDashboardData.fulfilled, (state, action) => {
                state.loading = false;
                state.lastFetched = Date.now();

                // Update section statuses from results
                Object.entries(action.payload).forEach(([key, status]) => {
                    if (state.sections[key]) {
                        state.sections[key].status = status;
                        state.sections[key].loading = false;
                    }
                });

                // Mark all as not loading
                Object.keys(state.sections).forEach(key => {
                    state.sections[key].loading = false;
                });
            })
            .addCase(fetchDashboardData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch dashboard data";
                // Mark all as not loading
                Object.keys(state.sections).forEach(key => {
                    state.sections[key].loading = false;
                });
            });
    },
});

export default dashboardSlice.reducer;

// =============================================================================
// SELECTORS
// =============================================================================

export const selectDashboardSections = (state: RootState) => state.dashboard.sections;
export const selectDashboardLoading = (state: RootState) => state.dashboard.loading;
export const selectDashboardError = (state: RootState) => state.dashboard.error;
