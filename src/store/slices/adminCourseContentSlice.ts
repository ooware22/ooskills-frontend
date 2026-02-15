import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import adminSectionsApi from "@/services/adminSectionsApi";
import adminLessonsApi from "@/services/adminLessonsApi";
import adminQuizzesApi from "@/services/adminQuizzesApi";
import type { AdminSection, SectionCreatePayload, SectionUpdatePayload } from "@/services/adminSectionsApi";
import type { LessonCreatePayload, LessonUpdatePayload } from "@/services/adminLessonsApi";
import type { QuizCreatePayload, QuizUpdatePayload, QuestionCreatePayload } from "@/services/adminQuizzesApi";
import { getErrorMessage } from "@/lib/axios";
import { CACHE_DURATION, shouldFetch } from "@/lib/cache";
import type { RootState } from "@/store";

// =============================================================================
// TYPES
// =============================================================================

interface AdminCourseContentState {
    sections: AdminSection[];
    loading: boolean;
    saving: boolean;
    error: string | null;
    lastFetched: number | null;
    /** The course slug for which sections are currently loaded */
    courseSlug: string | null;
}

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: AdminCourseContentState = {
    sections: [],
    loading: false,
    saving: false,
    error: null,
    lastFetched: null,
    courseSlug: null,
};

// =============================================================================
// ASYNC THUNKS — SECTIONS
// =============================================================================

export const fetchSections = createAsyncThunk(
    "adminCourseContent/fetchSections",
    async (courseSlug: string, { rejectWithValue }) => {
        try {
            const sections = await adminSectionsApi.list(courseSlug);
            return { sections, courseSlug };
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    },
    {
        condition(courseSlug, { getState }) {
            const { adminCourseContent } = getState() as RootState;
            // Refetch if different course or cache expired
            if (adminCourseContent.courseSlug !== courseSlug) return true;
            return shouldFetch(adminCourseContent.lastFetched, adminCourseContent.loading, CACHE_DURATION.MEDIUM);
        },
    }
);

export const createSection = createAsyncThunk(
    "adminCourseContent/createSection",
    async (data: SectionCreatePayload, { rejectWithValue }) => {
        try {
            return await adminSectionsApi.create(data);
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const updateSection = createAsyncThunk(
    "adminCourseContent/updateSection",
    async ({ id, data }: { id: string; data: SectionUpdatePayload }, { rejectWithValue }) => {
        try {
            return await adminSectionsApi.update(id, data);
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const deleteSection = createAsyncThunk(
    "adminCourseContent/deleteSection",
    async (id: string, { rejectWithValue }) => {
        try {
            await adminSectionsApi.delete(id);
            return id;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

// =============================================================================
// ASYNC THUNKS — LESSONS
// =============================================================================

export const createLesson = createAsyncThunk(
    "adminCourseContent/createLesson",
    async (data: LessonCreatePayload, { rejectWithValue }) => {
        try {
            return await adminLessonsApi.create(data);
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const updateLesson = createAsyncThunk(
    "adminCourseContent/updateLesson",
    async ({ id, data }: { id: string; data: LessonUpdatePayload }, { rejectWithValue }) => {
        try {
            return await adminLessonsApi.update(id, data);
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const deleteLesson = createAsyncThunk(
    "adminCourseContent/deleteLesson",
    async ({ id, sectionId }: { id: string; sectionId: string }, { rejectWithValue }) => {
        try {
            await adminLessonsApi.delete(id);
            return { id, sectionId };
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

// =============================================================================
// ASYNC THUNKS — QUIZZES
// =============================================================================

export const createQuiz = createAsyncThunk(
    "adminCourseContent/createQuiz",
    async (
        { quiz, questions }: { quiz: QuizCreatePayload; questions: Omit<QuestionCreatePayload, 'quiz'>[] },
        { rejectWithValue }
    ) => {
        try {
            const created = await adminQuizzesApi.create(quiz);
            // Create questions sequentially
            for (let i = 0; i < questions.length; i++) {
                await adminQuizzesApi.createQuestion({ ...questions[i], quiz: created.id, sequence: i });
            }
            // Re-fetch quiz with nested questions
            return await adminQuizzesApi.retrieve(created.id);
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const updateQuiz = createAsyncThunk(
    "adminCourseContent/updateQuiz",
    async (
        { id, data, questions }: {
            id: string;
            data: QuizUpdatePayload;
            questions: Omit<QuestionCreatePayload, 'quiz'>[];
        },
        { rejectWithValue }
    ) => {
        try {
            await adminQuizzesApi.update(id, data);
            // Get existing questions to diff
            const existing = await adminQuizzesApi.retrieve(id);
            // Delete removed questions
            for (const eq of existing.questions) {
                if (!questions.find(q => (q as any).id === eq.id)) {
                    await adminQuizzesApi.deleteQuestion(eq.id);
                }
            }
            // Create or update questions
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i] as any;
                const existingQ = existing.questions.find(eq => eq.id === q.id);
                if (existingQ) {
                    await adminQuizzesApi.updateQuestion(q.id, { ...q, sequence: i });
                } else {
                    await adminQuizzesApi.createQuestion({ ...q, quiz: id, sequence: i });
                }
            }
            // Re-fetch updated quiz
            return await adminQuizzesApi.retrieve(id);
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const deleteQuiz = createAsyncThunk(
    "adminCourseContent/deleteQuiz",
    async ({ id, sectionId }: { id: string; sectionId: string }, { rejectWithValue }) => {
        try {
            await adminQuizzesApi.delete(id);
            return { id, sectionId };
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

// =============================================================================
// SLICE
// =============================================================================

const adminCourseContentSlice = createSlice({
    name: "adminCourseContent",
    initialState,
    reducers: {
        clearError(state) {
            state.error = null;
        },
        invalidateCache(state) {
            state.lastFetched = null;
        },
        clearSections(state) {
            state.sections = [];
            state.courseSlug = null;
            state.lastFetched = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // ── Fetch Sections ──
            .addCase(fetchSections.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSections.fulfilled, (state, action) => {
                state.loading = false;
                state.sections = action.payload.sections;
                state.courseSlug = action.payload.courseSlug;
                state.lastFetched = Date.now();
            })
            .addCase(fetchSections.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // ── Create Section ──
            .addCase(createSection.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(createSection.fulfilled, (state, action) => {
                state.saving = false;
                state.sections.push(action.payload);
            })
            .addCase(createSection.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload as string;
            })

            // ── Update Section ──
            .addCase(updateSection.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(updateSection.fulfilled, (state, action) => {
                state.saving = false;
                const idx = state.sections.findIndex((s) => s.id === action.payload.id);
                if (idx !== -1) state.sections[idx] = action.payload;
            })
            .addCase(updateSection.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload as string;
            })

            // ── Delete Section ──
            .addCase(deleteSection.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(deleteSection.fulfilled, (state, action) => {
                state.saving = false;
                state.sections = state.sections.filter((s) => s.id !== action.payload);
            })
            .addCase(deleteSection.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload as string;
            })

            // ── Create Lesson ──
            .addCase(createLesson.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(createLesson.fulfilled, (state, action) => {
                state.saving = false;
                const sectionId = action.payload.section;
                const section = state.sections.find((s) => s.id === sectionId);
                if (section) {
                    section.lessons_list.push({
                        id: action.payload.id,
                        title: action.payload.title,
                        type: action.payload.type,
                        sequence: action.payload.sequence,
                        duration_seconds: action.payload.duration_seconds,
                        audioUrl: action.payload.audioUrl,
                        content: action.payload.content,
                        slide_type: action.payload.slide_type,
                    });
                    section.lessons = section.lessons_list.length;
                }
            })
            .addCase(createLesson.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload as string;
            })

            // ── Update Lesson ──
            .addCase(updateLesson.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(updateLesson.fulfilled, (state, action) => {
                state.saving = false;
                const sectionId = action.payload.section;
                const section = state.sections.find((s) => s.id === sectionId);
                if (section) {
                    const idx = section.lessons_list.findIndex((l) => l.id === action.payload.id);
                    if (idx !== -1) {
                        section.lessons_list[idx] = {
                            id: action.payload.id,
                            title: action.payload.title,
                            type: action.payload.type,
                            sequence: action.payload.sequence,
                            duration_seconds: action.payload.duration_seconds,
                            audioUrl: action.payload.audioUrl,
                            content: action.payload.content,
                            slide_type: action.payload.slide_type,
                        };
                    }
                }
            })
            .addCase(updateLesson.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload as string;
            })

            // ── Delete Lesson ──
            .addCase(deleteLesson.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(deleteLesson.fulfilled, (state, action) => {
                state.saving = false;
                const section = state.sections.find((s) => s.id === action.payload.sectionId);
                if (section) {
                    section.lessons_list = section.lessons_list.filter((l) => l.id !== action.payload.id);
                    section.lessons = section.lessons_list.length;
                }
            })
            .addCase(deleteLesson.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload as string;
            })

            // ── Create Quiz ──
            .addCase(createQuiz.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(createQuiz.fulfilled, (state, action) => {
                state.saving = false;
                const sectionId = action.payload.section;
                const section = state.sections.find((s) => s.id === sectionId);
                if (section) {
                    section.quiz = action.payload;
                }
            })
            .addCase(createQuiz.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload as string;
            })

            // ── Update Quiz ──
            .addCase(updateQuiz.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(updateQuiz.fulfilled, (state, action) => {
                state.saving = false;
                const sectionId = action.payload.section;
                const section = state.sections.find((s) => s.id === sectionId);
                if (section) {
                    section.quiz = action.payload;
                }
            })
            .addCase(updateQuiz.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload as string;
            })

            // ── Delete Quiz ──
            .addCase(deleteQuiz.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(deleteQuiz.fulfilled, (state, action) => {
                state.saving = false;
                const section = state.sections.find((s) => s.id === action.payload.sectionId);
                if (section) {
                    section.quiz = null;
                }
            })
            .addCase(deleteQuiz.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError, invalidateCache, clearSections } = adminCourseContentSlice.actions;
export default adminCourseContentSlice.reducer;
