import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminTestimonialsApi } from "@/services/contentApi";
import { getErrorMessage } from "@/lib/axios";
import { CACHE_DURATION, shouldFetch } from "@/lib/cache";
import type { RootState } from "../index";
import type { AdminTestimonialData, TranslatedField, Locale } from "@/types/content";

// =============================================================================
// TYPES
// =============================================================================

export type { Locale } from "@/types/content";

/** Frontend-friendly testimonial structure (for a single locale) */
export interface Testimonial {
    id: number;
    authorName: string;
    authorTitle: string;
    authorImage: string | null;
    content: string;
    rating: number;
    order: number;
}

/** State structure for testimonials slice */
export interface TestimonialsState {
    /** All testimonials from backend */
    items: AdminTestimonialData[];
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

/** Get value from translated field for a specific locale */
const getTranslation = (field: TranslatedField | undefined, locale: Locale): string => {
    if (!field) return "";
    return field[locale] || field["fr"] || field["en"] || field["ar"] || "";
};

/** Transform backend testimonial to frontend testimonial */
const transformTestimonial = (testimonial: AdminTestimonialData, locale: Locale): Testimonial => ({
    id: testimonial.id,
    authorName: testimonial.author_name,
    authorTitle: getTranslation(testimonial.author_title, locale),
    authorImage: testimonial.author_image_display || testimonial.author_image_url || testimonial.author_image,
    content: getTranslation(testimonial.content, locale),
    rating: testimonial.rating,
    order: testimonial.order,
});

/** Transform all testimonials for a locale */
const transformTestimonials = (testimonials: AdminTestimonialData[], locale: Locale): Testimonial[] =>
    testimonials
        .filter(t => t.is_active)
        .sort((a, b) => a.order - b.order)
        .map(t => transformTestimonial(t, locale));

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: TestimonialsState = {
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
 * Fetch all testimonials from backend
 */
export const fetchTestimonials = createAsyncThunk(
    "testimonials/fetch",
    async (options: { forceRefresh?: boolean } = {}, { rejectWithValue }) => {
        try {
            const data = await adminTestimonialsApi.list();
            return data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    },
    {
        condition: (options, { getState }) => {
            if (options?.forceRefresh) return true;
            const { testimonials } = getState() as RootState;
            return shouldFetch(testimonials.lastFetched, testimonials.loading, CACHE_DURATION.MEDIUM);
        },
    }
);

/**
 * Create a new testimonial
 */
export const createTestimonial = createAsyncThunk(
    "testimonials/create",
    async (
        { locale, data }: {
            locale: Locale;
            data: {
                author_name: string;
                author_title: string;
                content: string;
                rating: number;
                author_image_url?: string;
            }
        },
        { getState, rejectWithValue }
    ) => {
        try {
            const state = getState() as RootState;
            const payload = {
                author_name: data.author_name,
                author_title: { [locale]: data.author_title },
                content: { [locale]: data.content },
                rating: data.rating,
                author_image_url: data.author_image_url,
                order: state.testimonials.items.length,
                is_active: true,
            };
            const created = await adminTestimonialsApi.create(payload);
            return created;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

/**
 * Update a testimonial
 */
export const updateTestimonial = createAsyncThunk(
    "testimonials/update",
    async (
        { locale, id, data }: {
            locale: Locale;
            id: number;
            data: Partial<{
                author_name: string;
                author_title: string;
                content: string;
                rating: number;
                author_image_url: string;
                is_active: boolean;
            }>
        },
        { getState, rejectWithValue }
    ) => {
        try {
            const state = getState() as RootState;
            const existing = state.testimonials.items.find(i => i.id === id);

            if (!existing) {
                return rejectWithValue("Testimonial not found");
            }

            const payload: Record<string, unknown> = {};

            if (data.author_name !== undefined) {
                payload.author_name = data.author_name;
            }
            if (data.author_title !== undefined) {
                payload.author_title = { ...existing.author_title, [locale]: data.author_title };
            }
            if (data.content !== undefined) {
                payload.content = { ...existing.content, [locale]: data.content };
            }
            if (data.rating !== undefined) {
                payload.rating = data.rating;
            }
            if (data.author_image_url !== undefined) {
                payload.author_image_url = data.author_image_url;
            }
            if (data.is_active !== undefined) {
                payload.is_active = data.is_active;
            }

            const updated = await adminTestimonialsApi.update(id, payload);
            return updated;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

/**
 * Delete a testimonial
 */
export const deleteTestimonial = createAsyncThunk(
    "testimonials/delete",
    async (id: number, { rejectWithValue }) => {
        try {
            await adminTestimonialsApi.delete(id);
            return id;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

/**
 * Reorder testimonials
 */
export const reorderTestimonials = createAsyncThunk(
    "testimonials/reorder",
    async (items: { id: number; order: number }[], { rejectWithValue }) => {
        try {
            await adminTestimonialsApi.reorder({ items });
            return items;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

// =============================================================================
// SLICE
// =============================================================================

const testimonialsSlice = createSlice({
    name: "testimonials",
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
            // Fetch Testimonials
            .addCase(fetchTestimonials.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTestimonials.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
                state.lastFetched = Date.now();
            })
            .addCase(fetchTestimonials.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Create Testimonial
            .addCase(createTestimonial.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(createTestimonial.fulfilled, (state, action) => {
                state.saving = false;
                state.items.push(action.payload);
            })
            .addCase(createTestimonial.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload as string;
            })

            // Update Testimonial
            .addCase(updateTestimonial.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(updateTestimonial.fulfilled, (state, action) => {
                state.saving = false;
                const index = state.items.findIndex(i => i.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(updateTestimonial.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload as string;
            })

            // Delete Testimonial
            .addCase(deleteTestimonial.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(deleteTestimonial.fulfilled, (state, action) => {
                state.saving = false;
                state.items = state.items.filter(i => i.id !== action.payload);
            })
            .addCase(deleteTestimonial.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload as string;
            })

            // Reorder Testimonials
            .addCase(reorderTestimonials.pending, (state) => {
                state.saving = true;
            })
            .addCase(reorderTestimonials.fulfilled, (state, action) => {
                state.saving = false;
                action.payload.forEach(({ id, order }) => {
                    const item = state.items.find(i => i.id === id);
                    if (item) item.order = order;
                });
                state.items.sort((a, b) => a.order - b.order);
            })
            .addCase(reorderTestimonials.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload as string;
            });
    },
});

// =============================================================================
// EXPORTS
// =============================================================================

export const { clearError, invalidateCache } = testimonialsSlice.actions;

export default testimonialsSlice.reducer;

// =============================================================================
// SELECTORS
// =============================================================================

export const selectTestimonialsState = (state: RootState) => state.testimonials;
export const selectTestimonials = (locale: Locale) => (state: RootState) =>
    transformTestimonials(state.testimonials.items, locale);
export const selectTestimonialsRaw = (state: RootState) => state.testimonials.items;
export const selectTestimonialsLoading = (state: RootState) => state.testimonials.loading;
export const selectTestimonialsSaving = (state: RootState) => state.testimonials.saving;
export const selectTestimonialsError = (state: RootState) => state.testimonials.error;
