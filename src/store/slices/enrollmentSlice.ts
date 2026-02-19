"use client";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/axios";
import type { RootState } from "@/store";
import { logout, clearCredentials } from "./authSlice";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Enrollment {
  id: string;
  user: string;
  course: string;          // course UUID
  course_title: string;
  course_slug: string;
  course_image: string | null;
  progress: string;        // decimal string "0.00"–"100.00"
  status: "active" | "completed" | "cancelled" | "expired";
  enrolled_at: string;
  completed_at: string | null;
}

export interface OrderItem {
  id: string;
  course: string;
  course_title: string;
  price: number;
}

export interface Order {
  id: string;
  user: string;
  total: number;
  status: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: string;
  paymentRef: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface LessonProgress {
  id: string;
  enrollment: string;
  lesson: string;
  current_slide: number;
  completed: boolean;
  last_position: number;
  time_spent: number;
  started_at: string;
  completed_at: string | null;
  updated_at: string;
}

export interface QuizAttempt {
  id: string;
  enrollment: string;
  quiz: string;
  score: number;
  answers: Record<string, number>;
  passed: boolean;
  xp_earned: number;
  feedback: unknown[];
  attempt_number: number;
  submitted_at: string;
  remaining_attempts: number;
}

export interface Certificate {
  id: string;
  user: string;
  course: string;
  course_title: string;
  user_name: string;
  score: number;
  code: string;
  issuedAt: string;
  pdf_url: string | null;
}

// ─── State ──────────────────────────────────────────────────────────────────

interface StudentState {
  enrollments: Enrollment[];
  enrollmentsLoading: boolean;
  lastFetchedEnrollments: number | null;

  orders: Order[];
  ordersLoading: boolean;
  lastFetchedOrders: number | null;

  progress: LessonProgress[];
  progressLoading: boolean;

  quizAttempts: QuizAttempt[];
  quizAttemptsLoading: boolean;

  certificates: Certificate[];
  certificatesLoading: boolean;
  lastFetchedCertificates: number | null;

  enrollError: string | null;
  orderError: string | null;
}

const initialState: StudentState = {
  enrollments: [],
  enrollmentsLoading: false,
  lastFetchedEnrollments: null,

  orders: [],
  ordersLoading: false,
  lastFetchedOrders: null,

  progress: [],
  progressLoading: false,

  quizAttempts: [],
  quizAttemptsLoading: false,

  certificates: [],
  certificatesLoading: false,
  lastFetchedCertificates: null,

  enrollError: null,
  orderError: null,
};

// ─── Cache helper ───────────────────────────────────────────────────────────

const CACHE_TTL = 60_000; // 60 seconds

function isCacheValid(lastFetched: number | null): boolean {
  if (!lastFetched) return false;
  return Date.now() - lastFetched < CACHE_TTL;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function extractResults<T>(data: T[] | { results: T[]; count: number }): T[] {
  if (Array.isArray(data)) return data;
  if (data && "results" in data) return data.results;
  return [];
}

// ─── Async Thunks ───────────────────────────────────────────────────────────

export const fetchMyEnrollments = createAsyncThunk(
  "student/fetchMyEnrollments",
  async (_, { getState }) => {
    const state = (getState() as RootState).enrollment;
    if (isCacheValid(state.lastFetchedEnrollments)) return state.enrollments;
    const { data } = await api.get("/formation/enrollments/");
    return extractResults<Enrollment>(data);
  },
);

export const enrollInCourse = createAsyncThunk(
  "student/enrollInCourse",
  async (courseId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/formation/enrollments/", { courseId });
      return data as Enrollment;
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail || "Enrollment failed";
      return rejectWithValue(msg);
    }
  },
);

export const createOrder = createAsyncThunk(
  "student/createOrder",
  async (
    payload: { courseIds: string[]; paymentMethod: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.post("/formation/orders/", {
        course_ids: payload.courseIds,
        paymentMethod: payload.paymentMethod,
      });
      return data as Order;
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Order creation failed";
      return rejectWithValue(msg);
    }
  },
);

export const fetchMyOrders = createAsyncThunk(
  "student/fetchMyOrders",
  async (_, { getState }) => {
    const state = (getState() as RootState).enrollment;
    if (isCacheValid(state.lastFetchedOrders)) return state.orders;
    const { data } = await api.get("/formation/orders/");
    return extractResults<Order>(data);
  },
);

export const fetchMyProgress = createAsyncThunk(
  "student/fetchMyProgress",
  async (enrollmentId: string) => {
    const { data } = await api.get(
      `/formation/progress/?enrollment=${enrollmentId}`,
    );
    return extractResults<LessonProgress>(data);
  },
);

export const saveProgress = createAsyncThunk(
  "student/saveProgress",
  async (payload: {
    lesson_id: string;
    current_slide?: number;
    last_position?: number;
    time_spent_delta?: number;
    completed?: boolean;
  }) => {
    const { data } = await api.post("/formation/progress/", payload);
    return data as LessonProgress;
  },
);

export const fetchMyQuizAttempts = createAsyncThunk(
  "student/fetchMyQuizAttempts",
  async () => {
    // Fetch both section quiz attempts and final quiz attempts in parallel
    const [sectionRes, finalRes] = await Promise.all([
      api.get("/formation/quiz-attempts/"),
      api.get("/formation/final-quiz/my-attempts/").catch(() => ({ data: [] })),
    ]);
    const sectionAttempts = extractResults<QuizAttempt>(sectionRes.data);
    // Map final quiz attempts to the same shape for XP summing
    const finalAttempts: QuizAttempt[] = (
      Array.isArray(finalRes.data) ? finalRes.data : finalRes.data.results || []
    ).map((a: any) => ({
      id: a.id,
      enrollment: a.enrollment,
      quiz: a.final_quiz || '',
      score: a.score,
      answers: a.answers || {},
      passed: a.passed,
      xp_earned: a.xp_earned || 0,
      feedback: a.feedback || [],
      attempt_number: a.attempt_number,
      submitted_at: a.submitted_at,
      remaining_attempts: a.remaining_attempts ?? 0,
    }));
    return [...sectionAttempts, ...finalAttempts];
  },
);

export const fetchMyCertificates = createAsyncThunk(
  "student/fetchMyCertificates",
  async (_, { getState }) => {
    const state = (getState() as RootState).enrollment;
    if (isCacheValid(state.lastFetchedCertificates)) return state.certificates;
    const { data } = await api.get("/formation/certificates/");
    return extractResults<Certificate>(data);
  },
);

// ─── Slice ──────────────────────────────────────────────────────────────────

const enrollmentSlice = createSlice({
  name: "enrollment",
  initialState,
  reducers: {
    /** Invalidate cache so next fetch re-queries the server */
    invalidateEnrollments(state) {
      state.lastFetchedEnrollments = null;
    },
    invalidateOrders(state) {
      state.lastFetchedOrders = null;
    },
    clearEnrollError(state) {
      state.enrollError = null;
    },
    clearOrderError(state) {
      state.orderError = null;
    },
  },
  extraReducers: (builder) => {
    // ── Enrollments ─────────────────────────────────────────────
    builder
      .addCase(fetchMyEnrollments.pending, (state) => {
        state.enrollmentsLoading = true;
      })
      .addCase(fetchMyEnrollments.fulfilled, (state, action) => {
        state.enrollments = action.payload;
        state.enrollmentsLoading = false;
        state.lastFetchedEnrollments = Date.now();
      })
      .addCase(fetchMyEnrollments.rejected, (state) => {
        state.enrollmentsLoading = false;
      });

    // ── Enroll ──────────────────────────────────────────────────
    builder
      .addCase(enrollInCourse.pending, (state) => {
        state.enrollError = null;
      })
      .addCase(enrollInCourse.fulfilled, (state, action) => {
        state.enrollments.push(action.payload);
        state.enrollError = null;
      })
      .addCase(enrollInCourse.rejected, (state, action) => {
        state.enrollError = (action.payload as string) || "Enrollment failed";
      });

    // ── Orders ──────────────────────────────────────────────────
    builder
      .addCase(fetchMyOrders.pending, (state) => {
        state.ordersLoading = true;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
        state.ordersLoading = false;
        state.lastFetchedOrders = Date.now();
      })
      .addCase(fetchMyOrders.rejected, (state) => {
        state.ordersLoading = false;
      });

    builder
      .addCase(createOrder.pending, (state) => {
        state.orderError = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orders.unshift(action.payload);
        state.orderError = null;
        // Invalidate enrollments so we refetch with the new enrollment
        state.lastFetchedEnrollments = null;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.orderError = (action.payload as string) || "Order failed";
      });

    // ── Progress ────────────────────────────────────────────────
    builder
      .addCase(fetchMyProgress.pending, (state) => {
        state.progressLoading = true;
      })
      .addCase(fetchMyProgress.fulfilled, (state, action) => {
        // Merge: replace existing progress for same enrollment, keep others
        const newIds = new Set(action.payload.map((p) => p.id));
        state.progress = [
          ...state.progress.filter((p) => !newIds.has(p.id)),
          ...action.payload,
        ];
        state.progressLoading = false;
      })
      .addCase(fetchMyProgress.rejected, (state) => {
        state.progressLoading = false;
      });

    builder.addCase(saveProgress.fulfilled, (state, action) => {
      const idx = state.progress.findIndex((p) => p.id === action.payload.id);
      if (idx >= 0) state.progress[idx] = action.payload;
      else state.progress.push(action.payload);
    });

    // ── Quiz Attempts ───────────────────────────────────────────
    builder
      .addCase(fetchMyQuizAttempts.pending, (state) => {
        state.quizAttemptsLoading = true;
      })
      .addCase(fetchMyQuizAttempts.fulfilled, (state, action) => {
        state.quizAttempts = action.payload;
        state.quizAttemptsLoading = false;
      })
      .addCase(fetchMyQuizAttempts.rejected, (state) => {
        state.quizAttemptsLoading = false;
      });

    // ── Certificates ────────────────────────────────────────────
    builder
      .addCase(fetchMyCertificates.pending, (state) => {
        state.certificatesLoading = true;
      })
      .addCase(fetchMyCertificates.fulfilled, (state, action) => {
        state.certificates = action.payload;
        state.certificatesLoading = false;
        state.lastFetchedCertificates = Date.now();
      })
      .addCase(fetchMyCertificates.rejected, (state) => {
        state.certificatesLoading = false;
      });

    // ── Reset on logout ─────────────────────────────────────────
    builder
      .addCase(logout.fulfilled, () => initialState)
      .addCase(logout.rejected, () => initialState)
      .addCase(clearCredentials, () => initialState);
  },
});

export const {
  invalidateEnrollments,
  invalidateOrders,
  clearEnrollError,
  clearOrderError,
} = enrollmentSlice.actions;

export default enrollmentSlice.reducer;
