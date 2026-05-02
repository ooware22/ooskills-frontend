import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/lib/axios";
import type { RootState } from "@/store";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationState {
  items: AppNotification[];
  lastFetched: number | null;
  loading: boolean;
}

const STALE_MS = 60_000; // re-fetch at most every 60 s

// ---------------------------------------------------------------------------
// Thunks
// ---------------------------------------------------------------------------

export const fetchNotifications = createAsyncThunk<
  AppNotification[],
  void,
  { state: RootState }
>(
  "notifications/fetch",
  async (_, { getState }) => {
    const { lastFetched } = getState().notifications;
    if (lastFetched !== null && Date.now() - lastFetched < STALE_MS) {
      return getState().notifications.items;
    }
    const { data } = await api.get<AppNotification[]>("/auth/notifications/");
    return data;
  },
  {
    condition: (_, { getState }) => {
      const { loading, lastFetched } = getState().notifications;
      if (loading) return false;
      if (lastFetched !== null && Date.now() - lastFetched < STALE_MS) return false;
      return true;
    },
  },
);

export const markAllRead = createAsyncThunk("notifications/markAllRead", async () => {
  await api.post("/auth/notifications/mark-all-read/");
});

export const markOneRead = createAsyncThunk(
  "notifications/markOneRead",
  async (id: string) => {
    await api.post(`/auth/notifications/${id}/read/`);
    return id;
  }
);

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const initialState: NotificationState = {
  items: [],
  lastFetched: null,
  loading: false,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    resetNotifications: () => initialState,
  },
  extraReducers: (builder) => {
    // fetch
    builder.addCase(fetchNotifications.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.items = action.payload;
      state.lastFetched = Date.now();
      state.loading = false;
    });
    builder.addCase(fetchNotifications.rejected, (state) => {
      state.loading = false;
    });

    // mark all read
    builder.addCase(markAllRead.fulfilled, (state) => {
      state.items = state.items.map((n) => ({ ...n, is_read: true }));
    });

    // mark one read
    builder.addCase(markOneRead.fulfilled, (state, action) => {
      const n = state.items.find((x) => x.id === action.payload);
      if (n) n.is_read = true;
    });

    // reset on logout (match any action type ending in logout/fulfilled)
    builder.addMatcher(
      (action) => action.type === "auth/logout/fulfilled",
      () => initialState
    );
  },
});

export const { resetNotifications } = notificationSlice.actions;

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

export const selectNotifications = (state: RootState) => state.notifications.items;
export const selectUnreadCount = (state: RootState) =>
  state.notifications.items.filter((n) => !n.is_read).length;
export const selectNotificationsLoading = (state: RootState) =>
  state.notifications.loading;

export default notificationSlice.reducer;
