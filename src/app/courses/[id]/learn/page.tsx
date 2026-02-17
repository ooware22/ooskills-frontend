'use client';

import { use, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useEnrollment } from '@/hooks/useEnrollment';
import { getCourseContentBySlug, getAudioUrl, getFlatSlides } from '@/data/courseContent';

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchMyEnrollments, saveProgress, fetchMyProgress } from '@/store/slices/enrollmentSlice';
import axiosClient from '@/lib/axios';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  Bars3Icon,
  XMarkIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import type { Slide, QuizQuestion, CourseContentModule, CourseContent, Quiz } from '@/data/courseContent';

/* ────────────────────── helpers ────────────────────── */

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

/* ─────────────── Slide Content Renderer ─────────────── */
function SlideContent({ slide }: { slide: Slide }) {
  const vc = slide.visual_content;

  if (vc.pillars && vc.pillars.length > 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {vc.pillars.map((p, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-xl p-5 text-center backdrop-blur">
            <div className="text-3xl mb-3">{p.icon}</div>
            <h4 className="text-gold font-bold text-lg mb-1">{p.title}</h4>
            <p className="text-gray-300 text-sm">{p.description}</p>
          </motion.div>
        ))}
      </div>
    );
  }

  if (vc.cells && vc.cells.length > 0) {
    return (
      <div>
        {vc.chart_title && <h4 className="text-white font-bold text-center mb-4">{vc.chart_title}</h4>}
        <div className="grid grid-cols-2 gap-3">
          {vc.cells.map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
              className="rounded-xl p-4 border border-white/10" style={{ backgroundColor: c.color + '20' }}>
              <div className="w-3 h-3 rounded-full mb-2" style={{ backgroundColor: c.color }} />
              <h5 className="text-white font-semibold">{c.title}</h5>
              <p className="text-gray-400 text-sm">{c.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (vc.columns && vc.columns.length > 0) {
    return (
      <div>
        {vc.comparison_title && <h4 className="text-white font-bold text-center mb-4">{vc.comparison_title}</h4>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {vc.columns.map((col, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur">
              <h5 className="text-gold font-bold mb-3 text-center">{col.title}</h5>
              <ul className="space-y-2">
                {col.items.map((item, j) => (
                  <li key={j} className="text-gray-300 text-sm flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full flex-shrink-0 mt-1.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (vc.steps && vc.steps.length > 0) {
    return (
      <div className="space-y-3">
        {vc.steps.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
            className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur">
            <div className="w-10 h-10 bg-gold/20 text-gold rounded-full flex items-center justify-center font-bold flex-shrink-0">
              {s.step}
            </div>
            <div>
              <h5 className="text-white font-semibold">{s.title}</h5>
              <p className="text-gray-400 text-sm">{s.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (vc.key_figure) {
    return (
      <div className="text-center">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="text-6xl font-black text-gold mb-2">{vc.key_figure}</motion.div>
        {vc.key_figure_label && <p className="text-gray-300 text-lg mb-4">{vc.key_figure_label}</p>}
        {vc.bullet_points && (
          <div className="flex justify-center gap-6 mt-4">
            {vc.bullet_points.map((bp, i) => (
              <span key={i} className="px-4 py-2 bg-white/10 rounded-full text-white text-sm">{bp}</span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Default: bullet points
  if (vc.bullet_points && vc.bullet_points.length > 0) {
    return (
      <ul className="space-y-3">
        {vc.bullet_points.map((bp, i) => (
          <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
            className="flex items-start gap-3 text-gray-200">
            <span className="w-2 h-2 bg-gold rounded-full flex-shrink-0 mt-2" />
            <span className="text-base">{bp}</span>
          </motion.li>
        ))}
      </ul>
    );
  }

  return <p className="text-gray-400 text-center italic">No visual content for this slide.</p>;
}

/* ─────────────── Quiz Component ─────────────── */
function QuizView({ quiz, onComplete }: { quiz: NonNullable<CourseContentModule['quiz']>; onComplete: (score: number) => void }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [scores, setScores] = useState<boolean[]>([]);
  const [selections, setSelections] = useState<(number | null)[]>([]);
  const [showResults, setShowResults] = useState(false);

  const question = quiz.questions[currentQ];
  const isLast = currentQ === quiz.questions.length - 1;

  const handleSelect = (idx: number) => {
    if (showExplanation) return;
    setSelected(idx);
    setShowExplanation(true);
    setScores(prev => [...prev, idx === question.correct_answer]);
    setSelections(prev => [...prev, idx]);
  };

  const handleNext = () => {
    if (isLast) {
      setShowResults(true);
    } else {
      setCurrentQ(prev => prev + 1);
      setSelected(null);
      setShowExplanation(false);
    }
  };

  const correctCount = scores.filter(Boolean).length;
  const pct = quiz.questions.length > 0 ? Math.round((correctCount / quiz.questions.length) * 100) : 0;
  const passed = pct >= (quiz.pass_threshold || 70);

  /* ─── Results Summary ─── */
  if (showResults) {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Score Header */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className={`text-center p-8 rounded-2xl border mb-8 ${
            passed ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'
          }`}>
          <div className={`text-6xl font-black mb-2 ${passed ? 'text-emerald-400' : 'text-red-400'}`}>
            {pct}%
          </div>
          <p className={`text-lg font-semibold ${passed ? 'text-emerald-300' : 'text-red-300'}`}>
            {passed ? '🎉 أحسنت! لقد نجحت' : '😔 حاول مرة أخرى'}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            {correctCount} / {quiz.questions.length} إجابات صحيحة
          </p>
        </motion.div>

        {/* Question-by-question review */}
        <div className="space-y-4 mb-8">
          {quiz.questions.map((q, qi) => {
            const userAnswer = selections[qi];
            const isCorrect = userAnswer === q.correct_answer;
            return (
              <motion.div key={qi} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: qi * 0.05 }}
                className={`p-5 rounded-xl border ${
                  isCorrect ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'
                }`}>
                <div className="flex items-start gap-3 mb-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                    isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {isCorrect ? '✓' : '✗'}
                  </span>
                  <h4 className="text-white font-semibold text-right flex-1" dir="rtl">{q.question}</h4>
                </div>

                <div className="space-y-2 mr-10" dir="rtl">
                  {q.options.map((opt, oi) => {
                    let optCls = 'text-gray-500';
                    if (oi === q.correct_answer) optCls = 'text-emerald-400 font-semibold';
                    else if (oi === userAnswer && oi !== q.correct_answer) optCls = 'text-red-400 line-through';
                    return (
                      <div key={oi} className={`flex items-center gap-2 text-sm ${optCls}`}>
                        {oi === q.correct_answer && <span>✅</span>}
                        {oi === userAnswer && oi !== q.correct_answer && <span>❌</span>}
                        {oi !== q.correct_answer && oi !== userAnswer && <span className="w-5 inline-block" />}
                        <span>{opt}</span>
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="mt-3 mr-10 p-3 bg-white/5 rounded-lg border border-white/5" dir="rtl">
                    <p className="text-gray-400 text-xs">{q.explanation}</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Continue button */}
        <div className="text-center">
          <button onClick={() => onComplete(pct)}
            className="px-10 py-4 bg-gold hover:bg-gold/90 text-oxford font-bold rounded-xl transition-colors text-lg">
            متابعة ←
          </button>
        </div>
      </div>
    );
  }

  /* ─── Question View ─── */
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gold font-bold text-sm">{quiz.title}</span>
          <span className="text-gray-400 text-sm">{currentQ + 1} / {quiz.questions.length}</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-1.5">
          <div className="bg-gold h-1.5 rounded-full transition-all" style={{ width: `${((currentQ + 1) / quiz.questions.length) * 100}%` }} />
        </div>
      </div>

      <motion.div key={currentQ} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="text-white text-xl font-bold mb-6 text-right" dir="rtl">{question.question}</h3>
        <div className="space-y-3">
          {question.options.map((opt, i) => {
            let cls = 'border-white/10 hover:border-white/20 bg-white/5';
            if (showExplanation) {
              if (i === question.correct_answer) cls = 'border-emerald-500 bg-emerald-500/10';
              else if (i === selected && i !== question.correct_answer) cls = 'border-red-500 bg-red-500/10';
            } else if (i === selected) {
              cls = 'border-gold bg-gold/10';
            }
            return (
              <button key={i} onClick={() => handleSelect(i)} disabled={showExplanation}
                className={`w-full text-right p-4 rounded-xl border transition-all ${cls}`} dir="rtl">
                <span className="text-white">{opt}</span>
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-white/5 border border-white/10 rounded-xl" dir="rtl">
            <p className="text-gray-300 text-sm">{question.explanation}</p>
          </motion.div>
        )}

        {showExplanation && (
          <div className="mt-6 flex justify-center">
            <button onClick={handleNext}
              className="px-8 py-3 bg-gold hover:bg-gold/90 text-oxford font-bold rounded-xl transition-colors">
              {isLast ? 'عرض النتيجة' : 'السؤال التالي →'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ─────────────── Final Quiz Component (API-driven) ─────────────── */
interface FinalQuizConfig {
  id: string;
  title: string;
  num_questions: number;
  pass_threshold: number;
  max_attempts: number;
  remaining_attempts: number | null;
  has_passed: boolean;
}

interface FinalQuizQuestion {
  id: string;
  type: string;
  question: string;
  options: string[];
  difficulty: string;
  category: string;
}

interface FinalQuizFeedback {
  question_id: string;
  selected: number | null;
  correct_answer: number;
  is_correct: boolean;
  explanation: string;
}

interface FinalQuizResult {
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

function FinalQuizView({
  courseSlug,
  courseId,
  onDone,
}: {
  courseSlug: string;
  courseId: string;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'results' | 'certificate'>('intro');
  const [config, setConfig] = useState<FinalQuizConfig | null>(null);
  const [questions, setQuestions] = useState<FinalQuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<FinalQuizResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load config on mount
  useEffect(() => {
    setLoading(true);
    axiosClient.get(`/formation/final-quiz/config/?course=${courseSlug}`)
      .then(res => setConfig(res.data))
      .catch(err => setError(err.response?.data?.detail || 'Failed to load final quiz config'))
      .finally(() => setLoading(false));
  }, [courseSlug]);

  // Generate questions
  const handleStartQuiz = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosClient.post('/formation/final-quiz/generate/', { course_id: courseId });
      setQuestions(res.data.questions);
      setPhase('quiz');
      setCurrentQ(0);
      setAnswers({});
      setSelected(null);
      setShowExplanation(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate questions');
    }
    setLoading(false);
  };

  // Handle answer selection
  const handleSelect = (idx: number) => {
    if (showExplanation) return;
    setSelected(idx);
    setAnswers(prev => ({ ...prev, [questions[currentQ].id]: idx }));
  };

  // Move to next question or submit
  const handleNext = async () => {
    const isLast = currentQ === questions.length - 1;
    if (isLast) {
      // Submit quiz
      setLoading(true);
      try {
        const res = await axiosClient.post('/formation/final-quiz/submit/', {
          course_id: courseId,
          question_ids: questions.map(q => q.id),
          answers: { ...answers, [questions[currentQ].id]: selected },
        });
        setResult(res.data);
        if (res.data.passed && res.data.certificate) {
          setPhase('certificate');
        } else {
          setPhase('results');
        }
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to submit quiz');
      }
      setLoading(false);
    } else {
      setCurrentQ(prev => prev + 1);
      setSelected(null);
      setShowExplanation(false);
    }
  };

  /* ─── Loading / Error ─── */
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">جاري التحميل...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="text-red-400 text-lg mb-4">⚠️ {error}</div>
        <button onClick={onDone} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors">
          العودة ←
        </button>
      </div>
    );
  }

  /* ─── Intro ─── */
  if (phase === 'intro' && config) {
    return (
      <div className="max-w-2xl mx-auto text-center py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-20 h-20 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AcademicCapIcon className="w-10 h-10 text-gold" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">{config.title}</h2>
          <div className="space-y-3 mb-8">
            <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
              <span>📝 {config.num_questions} أسئلة</span>
              <span>🎯 الحد الأدنى: {config.pass_threshold}%</span>
              {config.remaining_attempts !== null && (
                <span>🔄 المحاولات المتبقية: {config.remaining_attempts}</span>
              )}
            </div>
            {config.has_passed && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-sm">
                <CheckCircleSolid className="w-4 h-4" /> لقد نجحت مسبقاً في هذا الامتحان
              </div>
            )}
          </div>
          {config.remaining_attempts === 0 ? (
            <p className="text-red-400 mb-6">لقد استنفدت جميع المحاولات</p>
          ) : (
            <button onClick={handleStartQuiz}
              className="px-10 py-4 bg-gold hover:bg-gold/90 text-oxford font-bold rounded-xl transition-colors text-lg">
              ابدأ الامتحان
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  /* ─── Certificate Celebration ─── */
  if (phase === 'certificate' && result) {
    return (
      <div className="max-w-2xl mx-auto text-center py-10">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}>
          {/* Confetti effect */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: ['#D4AF37', '#FFD700', '#22C55E', '#3B82F6', '#A855F7'][i % 5],
                  }}
                  initial={{
                    x: 0, y: 0, opacity: 1,
                  }}
                  animate={{
                    x: (Math.random() - 0.5) * 400,
                    y: (Math.random() - 0.5) * 400,
                    opacity: 0,
                    scale: Math.random() * 2 + 1,
                  }}
                  transition={{ duration: 2, delay: i * 0.05 }}
                />
              ))}
            </div>
          </div>

          <div className="w-24 h-24 bg-gradient-to-br from-gold to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-gold/30">
            <AcademicCapIcon className="w-14 h-14 text-oxford" />
          </div>
          <h2 className="text-4xl font-black text-gold mb-3">🎉 تهانينا!</h2>
          <p className="text-xl text-white mb-2">لقد حصلت على الشهادة</p>
          <p className="text-gray-400 mb-8">بدرجة {result.score}% — {result.xp_earned} XP</p>

          {result.certificate && (
            <div className="bg-white/5 border border-gold/30 rounded-2xl p-6 mb-8 backdrop-blur">
              <p className="text-gray-400 text-sm mb-2">رمز التحقق</p>
              <p className="text-gold font-mono text-lg font-bold tracking-widest">{result.certificate.code}</p>
              {result.certificate.pdf_url && (
                <a href={result.certificate.pdf_url} target="_blank" rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-gold hover:bg-gold/90 text-oxford font-bold rounded-xl transition-colors">
                  📥 تحميل الشهادة (PDF)
                </a>
              )}
            </div>
          )}

          <button onClick={onDone}
            className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors">
            العودة للدورة ←
          </button>
        </motion.div>
      </div>
    );
  }

  /* ─── Results (Failed) ─── */
  if (phase === 'results' && result) {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 rounded-2xl border bg-red-500/10 border-red-500/30 mb-8">
          <div className="text-6xl font-black text-red-400 mb-2">{result.score}%</div>
          <p className="text-lg font-semibold text-red-300">😔 لم تحقق الحد الأدنى ({config?.pass_threshold}%)</p>
          <p className="text-gray-400 text-sm mt-2">
            {result.remaining_attempts !== null
              ? `المحاولات المتبقية: ${result.remaining_attempts}`
              : 'محاولات غير محدودة'}
          </p>
        </motion.div>

        {/* Feedback per question */}
        <div className="space-y-4 mb-8">
          {result.feedback.map((fb, qi) => (
            <motion.div key={qi} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: qi * 0.05 }}
              className={`p-5 rounded-xl border ${
                fb.is_correct ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'
              }`}>
              <div className="flex items-start gap-3 mb-3">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                  fb.is_correct ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {fb.is_correct ? '✓' : '✗'}
                </span>
                <div className="flex-1 text-right" dir="rtl">
                  {/* Find the question text from our questions array */}
                  <h4 className="text-white font-semibold mb-2">
                    {questions.find(q => q.id === fb.question_id)?.question || `سؤال ${qi + 1}`}
                  </h4>
                  <div className="space-y-1 text-sm">
                    {questions.find(q => q.id === fb.question_id)?.options.map((opt, oi) => {
                      let optCls = 'text-gray-500';
                      if (oi === fb.correct_answer) optCls = 'text-emerald-400 font-semibold';
                      else if (oi === fb.selected && oi !== fb.correct_answer) optCls = 'text-red-400 line-through';
                      return (
                        <div key={oi} className={`flex items-center gap-2 ${optCls}`}>
                          {oi === fb.correct_answer && <span>✅</span>}
                          {oi === fb.selected && oi !== fb.correct_answer && <span>❌</span>}
                          {oi !== fb.correct_answer && oi !== fb.selected && <span className="w-5 inline-block" />}
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                  {fb.explanation && (
                    <div className="mt-2 p-2 bg-white/5 rounded-lg border border-white/5">
                      <p className="text-gray-400 text-xs">{fb.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center flex items-center justify-center gap-4">
          {result.remaining_attempts !== 0 && (
            <button onClick={handleStartQuiz}
              className="px-8 py-3 bg-gold hover:bg-gold/90 text-oxford font-bold rounded-xl transition-colors">
              إعادة المحاولة
            </button>
          )}
          <button onClick={onDone}
            className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors">
            العودة ←
          </button>
        </div>
      </div>
    );
  }

  /* ─── Quiz Question View ─── */
  if (phase === 'quiz' && questions.length > 0) {
    const question = questions[currentQ];
    const isLast = currentQ === questions.length - 1;

    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gold font-bold text-sm">الامتحان النهائي</span>
            <span className="text-gray-400 text-sm">{currentQ + 1} / {questions.length}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5">
            <div className="bg-gold h-1.5 rounded-full transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
          </div>
        </div>

        <motion.div key={currentQ} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className="text-white text-xl font-bold mb-6 text-right" dir="rtl">{question.question}</h3>
          <div className="space-y-3">
            {question.options.map((opt, i) => (
              <button key={i} onClick={() => handleSelect(i)}
                className={`w-full text-right p-4 rounded-xl border transition-all ${
                  selected === i ? 'border-gold bg-gold/10' : 'border-white/10 hover:border-white/20 bg-white/5'
                }`} dir="rtl">
                <span className="text-white">{opt}</span>
              </button>
            ))}
          </div>

          {selected !== null && (
            <div className="mt-6 flex justify-center">
              <button onClick={handleNext}
                className="px-8 py-3 bg-gold hover:bg-gold/90 text-oxford font-bold rounded-xl transition-colors">
                {isLast ? 'إرسال الإجابات' : 'السؤال التالي →'}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return null;
}

/* ─────────────── Narration Panel ─────────────── */
function NarrationPanel({ slide }: { slide: Slide }) {
  const speakers = slide.narration_script.speakers;
  if (!speakers || speakers.length === 0) return null;

  return (
    <div className="space-y-3" dir="rtl">
      {speakers.map((s, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
          className="flex gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
            s.speaker === 'أَسْمَاءْ' ? 'bg-pink-500/20 text-pink-400' : 'bg-blue-500/20 text-blue-400'
          }`}>
            {s.speaker === 'أَسْمَاءْ' ? 'أ' : 'ن'}
          </div>
          <div className="flex-1 bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-gold">{s.speaker}</span>
              <span className="text-[10px] text-gray-500 italic">({s.emotion})</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">{s.text}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─────────────── Main Player Page ─────────────── */
export default function CoursePlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const slug = id;
  const dispatch = useAppDispatch();
  const { getProgress, updateProgress } = useEnrollment();

  // Redux enrollment state
  const enrollments = useAppSelector((s) => s.enrollment.enrollments);
  const enrollmentsLoading = useAppSelector((s) => s.enrollment.enrollmentsLoading);
  const lastFetchedEnrollments = useAppSelector((s) => s.enrollment.lastFetchedEnrollments);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const currentEnrollment = enrollments.find((e) => e.course_slug === slug);
  const apiEnrolled = !!currentEnrollment;
  const enrollmentId = currentEnrollment?.id;
  // Only consider enrollment data loaded once the fetch has actually completed at least once
  const enrollmentLoaded = lastFetchedEnrollments !== null && !enrollmentsLoading;

  // Course data — try static content first, then API
  const staticContent = getCourseContentBySlug(slug);
  const [apiContent, setApiContent] = useState<CourseContent | null>(null);
  const [contentLoading, setContentLoading] = useState(false);

  // Fetch content from API if no static content available
  useEffect(() => {
    if (staticContent) return; // static content available, skip API
    let cancelled = false;
    setContentLoading(true);
    axiosClient
      .get(`/formation/sections/?course=${slug}`)
      .then((res) => {
        if (cancelled) return;
        const sections = Array.isArray(res.data) ? res.data : res.data.results || [];
        // Transform API sections → CourseContent
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
              };
            });
            // Transform quiz if present
            let quiz: Quiz | undefined;
            if (section.quiz) {
              const sq = section.quiz;
              quiz = {
                title: typeof sq.title === 'object'
                  ? sq.title.fr || sq.title.en || sq.title.ar || 'Quiz'
                  : sq.title || 'Quiz',
                intro_text: sq.intro_text || '',
                pass_threshold: sq.pass_threshold ?? 70,
                questions: (sq.questions || []).map((q: any, qi: number): QuizQuestion => ({
                  id: qi + 1,
                  type: q.type || 'multiple_choice',
                  question: typeof q.text === 'object'
                    ? q.text.fr || q.text.en || q.text.ar || ''
                    : q.text || q.question || '',
                  options: (q.options || []).map((o: any) =>
                    typeof o === 'object' ? o.text || o.fr || '' : String(o),
                  ),
                  correct_answer: q.correct_answer ?? 0,
                  explanation: typeof q.explanation === 'object'
                    ? q.explanation.fr || q.explanation.en || ''
                    : q.explanation || '',
                  difficulty: q.difficulty || 'medium',
                  category: q.category || '',
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
              sequence: section.sequence || 0,
              audioFileIndex: section.audioFileIndex || 0,
            };
          });

        const totalSlides = modules.reduce((s, m) => s + m.slides.length, 0);
        const totalQuiz = modules.reduce((s, m) => s + (m.quiz?.questions.length || 0), 0);

        setApiContent({
          courseId: 0,
          title: modules[0]?.title || slug,
          totalModules: modules.length,
          totalSlides,
          totalQuizQuestions: totalQuiz,
          audioBasePath: '',
          modules,
        });
      })
      .catch((err) => {
        console.error('Failed to fetch course content:', err);
      })
      .finally(() => {
        if (!cancelled) setContentLoading(false);
      });
    return () => { cancelled = true; };
  }, [slug, staticContent]);

  const content = staticContent || apiContent;
  const courseTitle = content?.title || slug;
  const flatSlides = useMemo(() => content ? getFlatSlides(content) : [], [content]);

  // Player state
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const isResizing = useRef(false);
  const [showNarration, setShowNarration] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showFinalQuiz, setShowFinalQuiz] = useState(false);
  const [completedSlides, setCompletedSlides] = useState<number[]>([]);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [quizScores, setQuizScores] = useState<Record<string, number>>({});
  const [expandedModules, setExpandedModules] = useState<number[]>([0]);

  // Audio state
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioTime, setAudioTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioMuted, setAudioMuted] = useState(false);

  // Fetch enrollments from API
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMyEnrollments());
    }
  }, [dispatch, isAuthenticated]);

  // Redirect if not enrolled (wait for API enrollment data to load)
  useEffect(() => {
    if (enrollmentLoaded && !apiEnrolled) {
      router.replace(`/courses/${slug}`);
    }
  }, [slug, apiEnrolled, enrollmentLoaded, router]);

  // Load saved progress
  useEffect(() => {
    const progress = getProgress(slug as any);
    if (progress) {
      setCurrentSlideIdx(progress.currentSlideIndex || 0);
      setCompletedSlides(progress.completedSlides || []);
      setCompletedModules(progress.completedModules || []);
      setQuizScores(progress.quizScores || {});
    }
  }, [slug, getProgress]);

  // Save progress on changes (localStorage backup)
  useEffect(() => {
    if (completedSlides.length > 0 || currentSlideIdx > 0) {
      updateProgress(slug as any, {
        currentSlideIndex: currentSlideIdx,
        completedSlides,
        completedModules,
        quizScores,
      });
    }
  }, [currentSlideIdx, completedSlides, completedModules, quizScores, slug, updateProgress]);

  // ------- API-based progress saving -------
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedSlideRef = useRef<number>(-1);
  const audioTimeRef = useRef(0);
  // Keep audioTimeRef in sync
  useEffect(() => { audioTimeRef.current = audioTime; }, [audioTime]);

  // Save lesson progress to backend API via Redux thunk (debounced)
  const saveProgressToApi = useCallback(
    (slideIdx: number, completed: boolean = false) => {
      const flat = flatSlides[slideIdx];
      if (!flat?.slide.apiLessonId || !isAuthenticated) {
        console.log('[Progress] SKIPPED — no apiLessonId or not authenticated', {
          slideIdx, apiLessonId: flat?.slide.apiLessonId, isAuthenticated,
        });
        return;
      }
      // Skip if same slide was already saved (non-completed)
      if (slideIdx === lastSavedSlideRef.current && !completed) return;
      lastSavedSlideRef.current = slideIdx;

      // Clear pending save
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

      const payload = {
        lesson_id: flat.slide.apiLessonId,
        current_slide: flat.slideIndexInModule,
        last_position: Math.floor(audioTimeRef.current),
        time_spent_delta: Math.floor(flat.slide.duration_seconds * 0.3),
        completed,
      };

      const doSave = () => {
        console.log('[Progress] Saving via Redux thunk:', payload);
        dispatch(saveProgress(payload))
          .unwrap()
          .then((res) => {
            console.log('[Progress] Saved OK:', res);
            // Refresh enrollments to update progress percentage
            if (completed) dispatch(fetchMyEnrollments());
          })
          .catch((err) => console.error('[Progress] Save FAILED:', err));
      };

      if (completed) {
        doSave(); // save immediately when completing
      } else {
        saveTimerRef.current = setTimeout(doSave, 1500); // debounce navigation
      }
    },
    [flatSlides, isAuthenticated, dispatch],
  );

  // Load progress from API on mount
  useEffect(() => {
    if (!enrollmentId || !isAuthenticated) return;
    let cancelled = false;
    axiosClient
      .get(`/formation/progress/?enrollment=${enrollmentId}`)
      .then((res) => {
        if (cancelled) return;
        const records = Array.isArray(res.data) ? res.data : res.data.results || [];
        if (records.length === 0) return;

        // Build a set of completed lesson IDs
        const completedLessonIds = new Set(
          records.filter((r: any) => r.completed).map((r: any) => r.lesson),
        );

        // Map completed lessons to slide indices
        const completedIdxs: number[] = [];
        let lastSlideIdx = 0;
        flatSlides.forEach((flat, idx) => {
          if (flat.slide.apiLessonId && completedLessonIds.has(flat.slide.apiLessonId)) {
            completedIdxs.push(idx);
          }
          // Find the most recent non-completed lesson to restore position
          if (flat.slide.apiLessonId) {
            const record = records.find((r: any) => r.lesson === flat.slide.apiLessonId);
            if (record && !record.completed) {
              lastSlideIdx = idx;
            }
          }
        });

        if (completedIdxs.length > 0) {
          setCompletedSlides(completedIdxs);
          // If all are completed, start at last; otherwise start at the next uncompleted
          const nextUncompleted = flatSlides.findIndex(
            (_, idx) => !completedIdxs.includes(idx),
          );
          setCurrentSlideIdx(nextUncompleted >= 0 ? nextUncompleted : lastSlideIdx);
        }
      })
      .catch((err) => console.error('Failed to load progress:', err));
    return () => { cancelled = true; };
  }, [enrollmentId, isAuthenticated, flatSlides]);

  // Audio handling — prefer API audio URL (Supabase), fall back to static audio
  const currentFlat = flatSlides[currentSlideIdx];
  const audioUrl = currentFlat
    ? (currentFlat.slide.apiAudioUrl || getAudioUrl(currentFlat.audioIndex))
    : '';

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = audioUrl;
    audio.load();
    setIsPlaying(false);
    setAudioTime(0);
    setAudioDuration(0);
  }, [audioUrl]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) setAudioTime(audioRef.current.currentTime);
  };

  const handleAudioLoaded = () => {
    if (audioRef.current) setAudioDuration(audioRef.current.duration);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    // Mark slide as completed
    if (!completedSlides.includes(currentSlideIdx)) {
      setCompletedSlides(prev => [...prev, currentSlideIdx]);
    }
    // Save completed lesson to API
    saveProgressToApi(currentSlideIdx, true);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setAudioTime(time);
    }
  };

  // Navigation
  const goToSlide = useCallback((idx: number) => {
    if (idx >= 0 && idx < flatSlides.length) {
      setCurrentSlideIdx(idx);
      setShowQuiz(false);
      if (!completedSlides.includes(currentSlideIdx)) {
        setCompletedSlides(prev => [...prev, currentSlideIdx]);
        // Save the completed slide to API
        saveProgressToApi(currentSlideIdx, true);
      }
      // Save navigation to API (non-completed, debounced)
      saveProgressToApi(idx, false);
    }
  }, [flatSlides.length, completedSlides, currentSlideIdx, saveProgressToApi]);

  const goNext = () => {
    // Mark current slide as completed when navigating forward
    if (!completedSlides.includes(currentSlideIdx)) {
      setCompletedSlides(prev => [...prev, currentSlideIdx]);
      saveProgressToApi(currentSlideIdx, true);
    }
    // Check if current module has a quiz at the end
    if (currentFlat && content) {
      const mod = content.modules[currentFlat.moduleIndex];
      const isLastSlideInModule = currentFlat.slideIndexInModule === mod.slides.length - 1;
      if (isLastSlideInModule && mod.quiz && !quizScores[`mod_${currentFlat.moduleIndex}`]) {
        setShowQuiz(true);
        return;
      }
      // Auto-complete modules without quizzes when last slide is done
      if (isLastSlideInModule && !mod.quiz && !completedModules.includes(currentFlat.moduleIndex)) {
        setCompletedModules(prev => [...prev, currentFlat.moduleIndex]);
      }
    }
    goToSlide(currentSlideIdx + 1);
  };

  const goPrev = () => goToSlide(currentSlideIdx - 1);

  const handleQuizComplete = (score: number) => {
    if (currentFlat) {
      const key = `mod_${currentFlat.moduleIndex}`;
      setQuizScores(prev => ({ ...prev, [key]: score }));
      if (!completedModules.includes(currentFlat.moduleIndex)) {
        setCompletedModules(prev => [...prev, currentFlat.moduleIndex]);
      }
      setShowQuiz(false);
      goToSlide(currentSlideIdx + 1);
    }
  };

  // Auto-mark quiz-less modules as completed when all their slides are done
  useEffect(() => {
    if (!content) return;
    content.modules.forEach((mod, mi) => {
      if (completedModules.includes(mi)) return; // already completed
      if (mod.quiz) return; // has a quiz — completed via handleQuizComplete
      // Check if all slides in this module are completed
      const moduleSlideIdxs = flatSlides
        .map((f, idx) => f.moduleIndex === mi ? idx : -1)
        .filter(i => i >= 0);
      if (moduleSlideIdxs.length > 0 && moduleSlideIdxs.every(i => completedSlides.includes(i))) {
        setCompletedModules(prev => prev.includes(mi) ? prev : [...prev, mi]);
      }
    });
  }, [completedSlides, content, flatSlides, completedModules]);

  const toggleModule = (idx: number) => {
    setExpandedModules(prev => prev.includes(idx) ? prev.filter(x => x !== idx) : [...prev, idx]);
  };

  // Sidebar resize handlers
  const handleResizeStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    isResizing.current = true;
    const startX = e.clientX;
    const startW = sidebarWidth;

    const onMove = (ev: PointerEvent) => {
      if (!isResizing.current) return;
      const delta = ev.clientX - startX;
      const newW = Math.min(600, Math.max(200, startW + delta));
      setSidebarWidth(newW);
    };

    const onUp = () => {
      isResizing.current = false;
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }, [sidebarWidth]);

  // Progress calculation
  const progressPct = flatSlides.length > 0 ? Math.round((completedSlides.length / flatSlides.length) * 100) : 0;

  if (!content || flatSlides.length === 0) {
    return (
      <div className="min-h-screen bg-[#0f1729] flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-lg mb-2">
            {contentLoading ? 'Loading course content...' : 'No content available yet'}
          </div>
          {!contentLoading && (
            <Link href={`/courses/${slug}`} className="text-gold hover:text-gold/80 text-sm">
              ← Back to course
            </Link>
          )}
        </div>
      </div>
    );
  }

  const currentSlide = currentFlat.slide;
  const currentModule = content.modules[currentFlat.moduleIndex];

  return (
    <div className="h-screen bg-[#0f1729] text-white overflow-hidden">
      {/* Hidden audio element */}
      <audio ref={audioRef} preload="metadata"
        onTimeUpdate={handleAudioTimeUpdate}
        onLoadedMetadata={handleAudioLoaded}
        onEnded={handleAudioEnded}
      />

      {/* ─── Top Bar (fixed) ─── */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-[#0d1321] border-b border-white/5 flex items-center px-4 gap-4 z-30">
        <Link href={`/courses/${slug}`} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white">
          <Bars3Icon className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-medium text-white truncate flex-1">{courseTitle}</h1>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-32 bg-white/10 rounded-full h-1.5">
              <div className="bg-gold h-1.5 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="text-xs text-gray-400">{progressPct}%</span>
          </div>
        </div>
      </header>

      {/* ─── Middle zone: Sidebar + Content (between top & bottom bars) ─── */}
      <div className="fixed top-14 bottom-20 left-0 right-0 flex">
        {/* ─── Sidebar ─── */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -320, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -320, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{ width: sidebarWidth }}
              className="max-sm:!w-[85vw] max-lg:sm:!w-72 bg-[#0d1321] border-r border-white/5 flex-shrink-0 overflow-y-auto z-20 absolute lg:relative inset-y-0 left-0"
            >
              <div className="p-4 border-b border-white/5 flex items-center justify-between lg:hidden">
                <span className="text-sm font-medium">Modules</span>
                <button onClick={() => setSidebarOpen(false)}>
                  <XMarkIcon className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <nav className="p-2">
                {content.modules.map((mod, mi) => {
                  const isExpanded = expandedModules.includes(mi);
                  const isModuleCompleted = completedModules.includes(mi);
                  const firstSlideIdx = flatSlides.findIndex(f => f.moduleIndex === mi);

                  return (
                    <div key={mi} className="mb-1">
                      <button onClick={() => toggleModule(mi)}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-colors text-base ${
                          currentFlat.moduleIndex === mi ? 'bg-gold/10 text-gold' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {isModuleCompleted ? (
                          <CheckCircleSolid className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-current flex-shrink-0 text-[9px] flex items-center justify-center">
                            {mi + 1}
                          </span>
                        )}
                        <span className="flex-1 truncate font-medium">{mod.title}</span>
                        {isExpanded ? <ChevronUpIcon className="w-3.5 h-3.5" /> : <ChevronDownIcon className="w-3.5 h-3.5" />}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-6 pr-2 py-1 space-y-0.5">
                              {mod.slides.map((slide, si) => {
                                const globalIdx = firstSlideIdx + si;
                                const isActive = currentSlideIdx === globalIdx;
                                const isComplete = completedSlides.includes(globalIdx);
                                return (
                                  <button key={si} onClick={() => goToSlide(globalIdx)}
                                    className={`w-full flex items-center gap-2 px-2 py-2 rounded-md text-left transition-colors text-sm ${
                                      isActive ? 'bg-gold/10 text-gold' : isComplete ? 'text-emerald-400' : 'text-gray-500 hover:text-gray-300'
                                    }`}
                                  >
                                    {isComplete ? (
                                      <CheckCircleSolid className="w-3 h-3 flex-shrink-0" />
                                    ) : (
                                      <span className={`w-3 h-3 rounded-full border flex-shrink-0 ${isActive ? 'border-gold' : 'border-gray-600'}`} />
                                    )}
                                    <span className="truncate">{slide.title}</span>
                                  </button>
                                );
                              })}
                              {mod.quiz && (
                                <button
                                  onClick={() => {
                                    // Navigate to last slide of this module and show quiz
                                    const lastSlideInModuleIdx = flatSlides.findIndex(
                                      (f) => f.moduleIndex === mi && f.slideIndexInModule === mod.slides.length - 1,
                                    );
                                    if (lastSlideInModuleIdx >= 0) {
                                      setCurrentSlideIdx(lastSlideInModuleIdx);
                                      // Mark all slides in this module as completed
                                      const moduleSlideIdxs = flatSlides
                                        .map((f, idx) => f.moduleIndex === mi ? idx : -1)
                                        .filter(i => i >= 0);
                                      setCompletedSlides(prev => {
                                        const next = [...prev];
                                        moduleSlideIdxs.forEach(i => { if (!next.includes(i)) next.push(i); });
                                        return next;
                                      });
                                      setShowQuiz(true);
                                    }
                                  }}
                                  className="flex items-center gap-2 px-2 py-2 text-sm w-full rounded hover:bg-white/10 transition-colors"
                                >
                                  {quizScores[`mod_${mi}`] !== undefined ? (
                                    <>
                                      <CheckCircleSolid className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                                      <span className="text-emerald-400">Quiz — {quizScores[`mod_${mi}`]}%</span>
                                    </>
                                  ) : (
                                    <>
                                      <AcademicCapIcon className="w-3 h-3 text-gold flex-shrink-0" />
                                      <span className="text-gold">Quiz</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </nav>

              {/* Final Quiz Trigger */}
              {content && completedModules.length === content.modules.length && currentEnrollment && (
                <div className="px-3 py-4 border-t border-white/5">
                  <button
                    onClick={() => { setShowFinalQuiz(true); setShowQuiz(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                      showFinalQuiz
                        ? 'bg-gold/20 text-gold border border-gold/40'
                        : 'bg-gold/10 text-gold hover:bg-gold/20 border border-gold/20'
                    }`}>
                    <AcademicCapIcon className="w-5 h-5" />
                    الامتحان النهائي
                  </button>
                </div>
              )}
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Resize handle (desktop only) */}
        {sidebarOpen && (
          <div
            onPointerDown={handleResizeStart}
            className="hidden lg:flex w-1.5 cursor-col-resize items-center justify-center flex-shrink-0 group hover:bg-gold/20 transition-colors"
          >
            <div className="w-0.5 h-8 bg-white/10 rounded-full group-hover:bg-gold/60 transition-colors" />
          </div>
        )}

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="lg:hidden absolute inset-0 bg-black/40 z-10"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ─── Main Content (scrollable) ─── */}
        <main className="flex-1 overflow-y-auto z-0">
            <div className="max-w-4xl mx-auto p-6 lg:p-10">
              {showFinalQuiz && currentEnrollment ? (
                <FinalQuizView
                  courseSlug={slug}
                  courseId={currentEnrollment.course}
                  onDone={() => setShowFinalQuiz(false)}
                />
              ) : showQuiz && currentModule.quiz ? (
                <QuizView quiz={currentModule.quiz} onComplete={handleQuizComplete} />
              ) : (
                <>
                  {/* Module badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2.5 py-0.5 bg-gold/10 text-gold text-xs font-bold rounded-full uppercase">
                      {currentModule.type}
                    </span>
                    <span className="text-gray-500 text-xs">
                      Slide {currentFlat.slideIndexInModule + 1} / {currentModule.slides.length}
                    </span>
                  </div>

                  {/* Slide title */}
                  <motion.h2 key={`title-${currentSlideIdx}`}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="text-2xl lg:text-3xl font-bold text-white mb-8" dir="rtl"
                  >
                    {currentSlide.title}
                  </motion.h2>

                  {/* Slide visual content */}
                  <motion.div key={`content-${currentSlideIdx}`}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-8" dir="rtl"
                  >
                    <SlideContent slide={currentSlide} />
                  </motion.div>

                  {/* Narration */}
                  {showNarration && currentSlide.narration_script.speakers.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="mt-8 border-t border-white/5 pt-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gold flex items-center gap-2">
                          <SpeakerWaveIcon className="w-4 h-4" />
                          النَّص الصَّوتي
                        </h3>
                        <button onClick={() => setShowNarration(false)}
                          className="text-xs text-gray-500 hover:text-gray-300">إخفاء</button>
                      </div>
                      <NarrationPanel slide={currentSlide} />
                    </motion.div>
                  )}

                  {!showNarration && (
                    <button onClick={() => setShowNarration(true)}
                      className="mt-4 text-xs text-gray-500 hover:text-gold transition-colors">
                      عرض النَّص الصَّوتي ↓
                    </button>
                  )}
                </>
              )}
            </div>
        </main>
      </div>

      {/* ─── Bottom Transport Bar (fixed) ─── */}
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-[#0d1321] border-t border-white/5 flex items-center px-4 lg:px-6 gap-4 z-30">
        {/* Prev */}
        <button onClick={goPrev} disabled={currentSlideIdx === 0}
          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center disabled:opacity-30 transition-colors">
          <ChevronLeftIcon className="w-5 h-5 rtl:rotate-180" />
        </button>

        {/* Audio controls */}
        <div className="flex-1 flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-gold hover:bg-gold/90 text-oxford flex items-center justify-center flex-shrink-0 transition-colors">
            {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
          </button>
          <div className="flex-1 flex items-center gap-2">
            <span className="text-[10px] text-gray-500 w-8 text-right font-mono">{formatTime(audioTime)}</span>
            <input type="range" min={0} max={audioDuration || 0} value={audioTime} onChange={handleSeek}
              className="flex-1 h-1 accent-gold bg-white/10 rounded-full cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <span className="text-[10px] text-gray-500 w-8 font-mono">{formatTime(audioDuration)}</span>
          </div>
          <button onClick={() => setAudioMuted(!audioMuted)}
            className="text-gray-400 hover:text-white transition-colors">
            {audioMuted ? <SpeakerXMarkIcon className="w-4 h-4" /> : <SpeakerWaveIcon className="w-4 h-4" />}
          </button>
        </div>

        {/* Next */}
        <button onClick={goNext} disabled={
          currentSlideIdx === flatSlides.length - 1 &&
          !(currentFlat && content && content.modules[currentFlat.moduleIndex]?.quiz && !quizScores[`mod_${currentFlat.moduleIndex}`])
        }
          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center disabled:opacity-30 transition-colors">
          <ChevronRightIcon className="w-5 h-5 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
}
