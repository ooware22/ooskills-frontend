"use client";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import { wishlistApi, type WishlistItem, type PublicCourse } from "@/services/publicCoursesApi";
import { getErrorMessage } from "@/lib/axios";
import { logout, clearCredentials } from "./authSlice";

interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
  lastFetched: number | null;
  error: string | null;
}

const initialState: WishlistState = {
  items: [],
  loading: false,
  lastFetched: null,
  error: null,
};

function isCacheValid(lastFetched: number | null): boolean {
  return lastFetched !== null; // fetch once per session (reset on page refresh)
}

// ─── Thunks ─────────────────────────────────────────────────────────────────

export const fetchMyWishlist = createAsyncThunk(
  "wishlist/fetchMyWishlist",
  async (_, { getState }) => {
    const state = (getState() as RootState).wishlist;
    if (isCacheValid(state.lastFetched)) return state.items;
    return await wishlistApi.getMyWishlist();
  },
  {
    condition: (_, { getState }) => {
      const state = (getState() as RootState).wishlist;
      if (state.loading) return false;
      if (isCacheValid(state.lastFetched)) return false;
      return true;
    },
  },
);

export const toggleWishlist = createAsyncThunk(
  "wishlist/toggleWishlist",
  async (
    payload: { slug: string; course?: PublicCourse },
    { rejectWithValue },
  ) => {
    try {
      const { wishlisted } = await wishlistApi.toggleWishlist(payload.slug);
      return { slug: payload.slug, course: payload.course, wishlisted };
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

// ─── Slice ──────────────────────────────────────────────────────────────────

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    invalidateWishlist(state) {
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyWishlist.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
        state.lastFetched = Date.now();
      })
      .addCase(fetchMyWishlist.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(toggleWishlist.pending, (state) => {
        state.error = null;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        const { slug, course, wishlisted } = action.payload;
        if (wishlisted) {
          if (course && !state.items.some((i) => i.course.slug === slug)) {
            state.items.unshift({
              id: `local-${slug}`,
              course,
              created_at: new Date().toISOString(),
            });
          }
        } else {
          state.items = state.items.filter((i) => i.course.slug !== slug);
        }
      })
      .addCase(toggleWishlist.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to update wishlist";
      });

    builder
      .addCase(logout.fulfilled, () => initialState)
      .addCase(logout.rejected, () => initialState)
      .addCase(clearCredentials, () => initialState);
  },
});

export const { invalidateWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
