import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { adminPartnersApi } from "@/services/contentApi";
import { getErrorMessage } from "@/lib/axios";
import { CACHE_DURATION, shouldFetch } from "@/lib/cache";
import type { RootState } from "../index";
import type { AdminPartnerData } from "@/types/content";

// =============================================================================
// TYPES
// =============================================================================

/** Frontend-friendly partner structure */
export interface Partner {
    id: number;
    name: string;
    logo: string | null;
    websiteUrl: string | null;
    order: number;
    isActive: boolean;
}

/** State structure for partners slice */
export interface PartnersState {
    /** All partners from backend */
    items: AdminPartnerData[];
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

/** Transform backend partner to frontend partner */
const transformPartner = (partner: AdminPartnerData): Partner => ({
    id: partner.id,
    name: partner.name,
    logo: partner.logo_display || partner.logo_url || partner.logo,
    websiteUrl: partner.website_url,
    order: partner.order,
    isActive: partner.is_active,
});

/** Transform all partners */
const transformPartners = (partners: AdminPartnerData[]): Partner[] =>
    partners
        .filter(p => p.is_active)
        .sort((a, b) => a.order - b.order)
        .map(transformPartner);

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: PartnersState = {
    items: [],
    loading: false,
    saving: false,
    error: null,
    lastFetched: null,
};

// =============================================================================
// ASYNC THUNKS
// =============================================================================

/**
 * Fetch all partners from backend
 */
export const fetchPartners = createAsyncThunk(
    "partners/fetch",
    async (options: { forceRefresh?: boolean } = {}, { rejectWithValue }) => {
        try {
            const data = await adminPartnersApi.list();
            return data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    },
    {
        condition: (options, { getState }) => {
            if (options?.forceRefresh) return true;
            const { partners } = getState() as RootState;
            return shouldFetch(partners.lastFetched, partners.loading, CACHE_DURATION.MEDIUM);
        },
    }
);

/**
 * Create a new partner
 */
export const createPartner = createAsyncThunk(
    "partners/create",
    async (
        data: { name: string; logo_url?: string; website_url?: string },
        { getState, rejectWithValue }
    ) => {
        try {
            const state = getState() as RootState;
            const payload = {
                ...data,
                order: state.partners.items.length,
                is_active: true,
            };
            const created = await adminPartnersApi.create(payload);
            return created;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

/**
 * Update a partner
 */
export const updatePartner = createAsyncThunk(
    "partners/update",
    async (
        { id, data }: { id: number; data: Partial<{ name: string; logo_url: string; website_url: string; is_active: boolean }> },
        { rejectWithValue }
    ) => {
        try {
            const updated = await adminPartnersApi.update(id, data);
            return updated;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

/**
 * Delete a partner
 */
export const deletePartner = createAsyncThunk(
    "partners/delete",
    async (id: number, { rejectWithValue }) => {
        try {
            await adminPartnersApi.delete(id);
            return id;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

/**
 * Reorder partners
 */
export const reorderPartners = createAsyncThunk(
    "partners/reorder",
    async (items: { id: number; order: number }[], { rejectWithValue }) => {
        try {
            await adminPartnersApi.reorder({ items });
            return items;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

// =============================================================================
// SLICE
// =============================================================================

const partnersSlice = createSlice({
    name: "partners",
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
            // Fetch Partners
            .addCase(fetchPartners.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPartners.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
                state.lastFetched = Date.now();
            })
            .addCase(fetchPartners.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Create Partner
            .addCase(createPartner.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(createPartner.fulfilled, (state, action) => {
                state.saving = false;
                state.items.push(action.payload);
            })
            .addCase(createPartner.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload as string;
            })

            // Update Partner
            .addCase(updatePartner.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(updatePartner.fulfilled, (state, action) => {
                state.saving = false;
                const index = state.items.findIndex(i => i.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(updatePartner.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload as string;
            })

            // Delete Partner
            .addCase(deletePartner.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(deletePartner.fulfilled, (state, action) => {
                state.saving = false;
                state.items = state.items.filter(i => i.id !== action.payload);
            })
            .addCase(deletePartner.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload as string;
            })

            // Reorder Partners
            .addCase(reorderPartners.pending, (state) => {
                state.saving = true;
            })
            .addCase(reorderPartners.fulfilled, (state, action) => {
                state.saving = false;
                action.payload.forEach(({ id, order }) => {
                    const item = state.items.find(i => i.id === id);
                    if (item) item.order = order;
                });
                state.items.sort((a, b) => a.order - b.order);
            })
            .addCase(reorderPartners.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload as string;
            });
    },
});

// =============================================================================
// EXPORTS
// =============================================================================

export const { clearError, invalidateCache } = partnersSlice.actions;

export default partnersSlice.reducer;

// =============================================================================
// SELECTORS
// =============================================================================

export const selectPartnersState = (state: RootState) => state.partners;
export const selectPartners = (state: RootState) => transformPartners(state.partners.items);
export const selectPartnersRaw = (state: RootState) => state.partners.items;
export const selectPartnersLoading = (state: RootState) => state.partners.loading;
export const selectPartnersSaving = (state: RootState) => state.partners.saving;
export const selectPartnersError = (state: RootState) => state.partners.error;
