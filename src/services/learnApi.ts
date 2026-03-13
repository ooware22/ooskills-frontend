/**
 * Learn API Service
 * 
 * Typed API functions for the course learn/player page.
 * Handles course content fetching, quiz attempts, and final quiz operations.
 */

import axiosClient from '@/lib/axios';
import type {
  Slide,
  QuizQuestion,
  Quiz,
  CourseContentModule,
  CourseContent,
  CourseMaterial,
} from '@/data/courseContent';

// =============================================================================
// RESPONSE TYPES
// =============================================================================

/** Extract array from response - handles both paginated and direct array responses */
function extractResults<T>(data: T[] | { results: T[]; count?: number }): T[] {
  if (Array.isArray(data)) return data;
  if (data && 'results' in data) return data.results;
  return [];
}

// Final Quiz types
export interface FinalQuizConfig {
  id: string;
  title: string;
  num_questions: number;
  pass_threshold: number;
  max_attempts: number;
  remaining_attempts: number | null;
  has_passed: boolean;
}

export interface FinalQuizQuestion {
  id: string;
  type: string;
  question: string;
  options: string[];
  difficulty: string;
  category: string;
}

export interface FinalQuizFeedback {
  question_id: string;
  selected: number | null;
  correct_answer: number;
  is_correct: boolean;
  explanation: string;
}

export interface FinalQuizResult {
  score: number;
  passed: boolean;
  xp_earned: number;
  feedback: FinalQuizFeedback[];
  attempt_number: number;
  remaining_attempts: number | null;
  certificate?: {
    id: string;
    code: string;
    score: number;
    pdf_url: string | null;
  };
}

// =============================================================================
// ENDPOINT PATHS
// =============================================================================

const ENDPOINTS = {
  sections: '/formation/sections/',
  courseDetail: '/formation/courses/',
  quizAttempts: '/formation/quiz-attempts/',
  finalQuizConfig: '/formation/final-quiz/config/',
  finalQuizGenerate: '/formation/final-quiz/generate/',
  finalQuizSubmit: '/formation/final-quiz/submit/',
} as const;

// =============================================================================
// CONTENT TRANSFORMATION
// =============================================================================

/**
 * Transform raw API section data into CourseContent format
 */
function transformSectionsToContent(
  sections: any[],
  slug: string,
  materials: any[] = [],
): CourseContent {
  const modules: CourseContentModule[] = sections
    .sort((a: any, b: any) => a.sequence - b.sequence)
    .map((section: any) => {
      const lessons = (section.lessons_list || []).sort(
        (a: any, b: any) => a.sequence - b.sequence,
      );
      const slides: Slide[] = lessons.map((lesson: any, idx: number) => {
        const c = lesson.content || {};
        return {
          id: idx + 1,
          title: typeof lesson.title === 'object'
            ? lesson.title.fr || lesson.title.en || lesson.title.ar || ''
            : lesson.title || '',
          slide_type: lesson.slide_type || c.slide_type || 'bullet_points',
          duration_seconds: lesson.duration_seconds || 30,
          visual_content: c.visual_content || c || {},
          narration_script: c.narration_script || { mode: 'dialogue', speakers: [] },
          apiAudioUrl: lesson.audioUrl || undefined,
          apiLessonId: lesson.id || undefined,
          displayMode: lesson.display_mode || 'both',
          diapositiveUrl: lesson.diapositiveUrl || undefined,
        };
      });

      // Transform quiz if present
      let quiz: Quiz | undefined;
      if (section.quiz) {
        const q = section.quiz;
        quiz = {
          title: typeof q.title === 'object'
            ? q.title.fr || q.title.en || ''
            : q.title || 'Quiz',
          intro_text: typeof q.intro_text === 'object'
            ? q.intro_text.fr || q.intro_text.en || ''
            : q.intro_text || '',
          pass_threshold: q.pass_threshold || 70,
          apiQuizId: q.id,
          questions: (q.questions || []).map((qn: any, qi: number): QuizQuestion => ({
            id: qi + 1,
            apiQuestionId: qn.id,
            type: qn.type || 'multiple_choice',
            question: typeof qn.question === 'object'
              ? qn.question.fr || qn.question.en || ''
              : qn.question || '',
            options: Array.isArray(qn.options)
              ? qn.options.map((opt: any) =>
                  typeof opt === 'object' ? opt.fr || opt.en || '' : opt
                )
              : [],
            correct_answer: qn.correct_answer ?? 0,
            explanation: typeof qn.explanation === 'object'
              ? qn.explanation.fr || qn.explanation.en || ''
              : qn.explanation || '',
            difficulty: qn.difficulty || 'easy',
            category: qn.category || 'general',
          })),
        };
      }

      return {
        type: section.type || 'module',
        title: typeof section.title === 'object'
          ? section.title.fr || section.title.en || section.title.ar || ''
          : section.title || '',
        slides,
        quiz,
        sequence: section.sequence ?? 0,
        audioFileIndex: section.audioFileIndex || 0,
      };
    });

  const totalSlides = modules.reduce((s, m) => s + m.slides.length, 0);
  const totalQuiz = modules.reduce((s, m) => s + (m.quiz?.questions.length || 0), 0);

  return {
    courseId: 0,
    title: modules[0]?.title || slug,
    totalModules: modules.length,
    totalSlides,
    totalQuizQuestions: totalQuiz,
    audioBasePath: '',
    modules,
    materials: materials.map((m: any): CourseMaterial => ({
      id: m.id,
      name: m.name,
      type: m.type || 'other',
      size: m.size || '',
      url: m.download_url || m.url || m.file || '#',
    })),
  };
}

// =============================================================================
// LEARN API
// =============================================================================

export const learnApi = {
  /**
   * Fetch course content (sections + lessons) and materials by slug.
   * Transforms raw API data into CourseContent format.
   */
  fetchCourseContent: async (slug: string): Promise<CourseContent> => {
    const res = await axiosClient.get(`${ENDPOINTS.sections}?course=${slug}`);
    const sections = extractResults(res.data);

    // Also fetch course detail to get materials
    let materials: any[] = [];
    try {
      const courseRes = await axiosClient.get(`${ENDPOINTS.courseDetail}${slug}/`);
      materials = courseRes.data?.materials || [];
    } catch { /* materials are optional */ }

    return transformSectionsToContent(sections, slug, materials);
  },

  /**
   * Fetch all quiz attempts for the current user
   */
  fetchQuizAttempts: async () => {
    const res = await axiosClient.get(ENDPOINTS.quizAttempts);
    return extractResults(res.data);
  },

  /**
   * Submit a section quiz attempt
   */
  submitQuizAttempt: async (quizId: string, answers: Record<string, number>) => {
    const res = await axiosClient.post(ENDPOINTS.quizAttempts, {
      quiz_id: quizId,
      answers,
    });
    return res.data;
  },

  /**
   * Fetch final quiz configuration for a course
   */
  fetchFinalQuizConfig: async (courseSlug: string): Promise<FinalQuizConfig> => {
    const res = await axiosClient.get(
      `${ENDPOINTS.finalQuizConfig}?course=${courseSlug}`,
    );
    return res.data;
  },

  /**
   * Generate final quiz questions
   */
  generateFinalQuizQuestions: async (courseId: string): Promise<FinalQuizQuestion[]> => {
    const res = await axiosClient.post(ENDPOINTS.finalQuizGenerate, {
      course_id: courseId,
    });
    return res.data.questions;
  },

  /**
   * Submit final quiz answers
   */
  submitFinalQuiz: async (
    courseId: string,
    questionIds: string[],
    answers: Record<string, number>,
  ): Promise<FinalQuizResult> => {
    const res = await axiosClient.post(ENDPOINTS.finalQuizSubmit, {
      course_id: courseId,
      question_ids: questionIds,
      answers,
    });
    return res.data;
  },
};

export default learnApi;
