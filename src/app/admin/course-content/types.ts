// =============================================================================
// TYPES — matches backend JSON models exactly
// =============================================================================

export interface Speaker {
  text: string;
  emotion: string;
  speaker: string;
}

export interface NarrationScript {
  mode: string;
  speakers: Speaker[];
}

export interface Pillar {
  icon: string;
  title: string;
  description: string;
}

export interface VisualContent {
  pillars?: Pillar[];
  [key: string]: unknown;
}

export interface LessonContent {
  visual_content: VisualContent;
  narration_script: NarrationScript;
}

export interface AdminLesson {
  id: string;
  title: string;
  type: "slide" | "video" | "text" | "audio";
  sequence: number;
  duration_seconds: number;
  audioUrl: string | null;
  content: LessonContent;
  slide_type: string;
}

export interface QuizQuestion {
  id: string;
  type: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  difficulty: string;
  category: string;
}

export interface AdminQuiz {
  id: string;
  title: string;
  intro_text: string;
  questions: QuizQuestion[];
  pass_threshold: number;
  max_attempts: number;
  xp_reward: number;
}

export interface AdminSection {
  id: string;
  title: string;
  type: "teaser" | "introduction" | "module" | "conclusion";
  sequence: number;
  audioFileIndex: number;
  lessons: number;
  duration: string;
  lessons_list: AdminLesson[];
  quiz: AdminQuiz | null;
}

export type SectionModalMode = "add" | "edit" | "delete" | null;
export type LessonModalMode = "add" | "edit" | "view" | "delete" | null;
export type QuizModalMode = "add" | "edit" | null;
