import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "@/lib/axios";
import { giftApi, type CourseGift } from "@/services/promoGiftApi";
import { getDeletionRequest, type DeletionRequest } from "@/services/accountDeletionApi";
import type { RootState } from "@/store";
import { logout, clearCredentials } from "./authSlice";

// ─── State ────────────────────────────────────────────────────────────────────

interface UserDataState {
  sentGifts: CourseGift[];
  receivedGifts: CourseGift[];
  giftsLoading: boolean;
  lastFetchedGifts: number | null;

  referralCode: string;
  referralLoading: boolean;
  lastFetchedReferral: number | null;

  deletionRequest: DeletionRequest | null;
  deletionRequestLoading: boolean;
  lastFetchedDeletionRequest: number | null;
}

const initialState: UserDataState = {
  sentGifts: [],
  receivedGifts: [],
  giftsLoading: false,
  lastFetchedGifts: null,

  referralCode: "",
  referralLoading: false,
  lastFetchedReferral: null,

  deletionRequest: null,
  deletionRequestLoading: false,
  lastFetchedDeletionRequest: null,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function ensureReferralCode(): Promise<string> {
  try {
    const r = await axiosClient.post<{ code: string }>("/auth/my-referral-code/");
    return r.data?.code || "";
  } catch {
    return "";
  }
}

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchGifts = createAsyncThunk(
  "userData/fetchGifts",
  async (_, { getState }) => {
    const { lastFetchedGifts } = (getState() as RootState).userData;
    if (lastFetchedGifts !== null) return null; // session cache hit
    const [sent, received] = await Promise.all([
      giftApi.mySent(),
      giftApi.myReceived(),
    ]);
    return { sent, received };
  },
  {
    condition: (_, { getState }) => {
      const state = (getState() as RootState).userData;
      if (state.giftsLoading) return false;
      if (state.lastFetchedGifts !== null) return false;
      return true;
    },
  },
);

export const fetchReferralCode = createAsyncThunk(
  "userData/fetchReferralCode",
  async (_, { getState }) => {
    const { lastFetchedReferral } = (getState() as RootState).userData;
    if (lastFetchedReferral !== null) return null; // session cache hit
    try {
      const r = await axiosClient.get<{ code: string }>("/auth/my-referral-code/");
      return r.data?.code || await ensureReferralCode();
    } catch {
      return await ensureReferralCode();
    }
  },
  {
    condition: (_, { getState }) => {
      const state = (getState() as RootState).userData;
      if (state.referralLoading) return false;
      if (state.lastFetchedReferral !== null) return false;
      return true;
    },
  },
);

export const fetchDeletionRequest = createAsyncThunk(
  "userData/fetchDeletionRequest",
  async (_, { getState }) => {
    const { lastFetchedDeletionRequest } = (getState() as RootState).userData;
    if (lastFetchedDeletionRequest !== null) return null; // session cache hit
    try {
      return await getDeletionRequest();
    } catch {
      return null; // no request exists yet
    }
  },
  {
    condition: (_, { getState }) => {
      const state = (getState() as RootState).userData;
      if (state.deletionRequestLoading) return false;
      if (state.lastFetchedDeletionRequest !== null) return false;
      return true;
    },
  },
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const userDataSlice = createSlice({
  name: "userData",
  initialState,
  reducers: {
    /** Invalidate gifts cache (call after sending a gift) */
    invalidateGifts(state) {
      state.lastFetchedGifts = null;
    },
    /** Update deletion request in store (call after submit/cancel) */
    setDeletionRequest(state, action) {
      state.deletionRequest = action.payload;
      state.lastFetchedDeletionRequest = Date.now();
    },
  },
  extraReducers: (builder) => {
    // ── Gifts ─────────────────────────────────────────────────────
    builder
      .addCase(fetchGifts.pending, (state) => {
        state.giftsLoading = true;
      })
      .addCase(fetchGifts.fulfilled, (state, action) => {
        state.giftsLoading = false;
        if (action.payload) {
          state.sentGifts = action.payload.sent;
          state.receivedGifts = action.payload.received;
          state.lastFetchedGifts = Date.now();
        }
      })
      .addCase(fetchGifts.rejected, (state) => {
        state.giftsLoading = false;
      });

    // ── Referral code ─────────────────────────────────────────────
    builder
      .addCase(fetchReferralCode.pending, (state) => {
        state.referralLoading = true;
      })
      .addCase(fetchReferralCode.fulfilled, (state, action) => {
        state.referralLoading = false;
        if (action.payload !== null) {
          state.referralCode = action.payload;
          state.lastFetchedReferral = Date.now();
        }
      })
      .addCase(fetchReferralCode.rejected, (state) => {
        state.referralLoading = false;
      });

    // ── Deletion request ───────────────────────────────────────
    builder
      .addCase(fetchDeletionRequest.pending, (state) => {
        state.deletionRequestLoading = true;
      })
      .addCase(fetchDeletionRequest.fulfilled, (state, action) => {
        state.deletionRequestLoading = false;
        if (action.payload !== null) {
          state.deletionRequest = action.payload;
        }
        state.lastFetchedDeletionRequest = Date.now();
      })
      .addCase(fetchDeletionRequest.rejected, (state) => {
        state.deletionRequestLoading = false;
      });

    // ── Reset on logout ───────────────────────────────────────────
    builder
      .addCase(logout.fulfilled, () => initialState)
      .addCase(logout.rejected, () => initialState)
      .addCase(clearCredentials, () => initialState);
  },
});

export const { invalidateGifts, setDeletionRequest } = userDataSlice.actions;
export default userDataSlice.reducer;
