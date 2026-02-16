'use client';

import { use, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useEnrollment } from '@/hooks/useEnrollment';
import { getCourseContent, getAudioUrl, getFlatSlides } from '@/data/courseContent';
import { getCourseById } from '@/data/courses';
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
import type { Slide, QuizQuestion, CourseContentModule } from '@/data/courseContent';

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

  const question = quiz.questions[currentQ];
  const isLast = currentQ === quiz.questions.length - 1;

  const handleSelect = (idx: number) => {
    if (showExplanation) return;
    setSelected(idx);
    setShowExplanation(true);
    setScores(prev => [...prev, idx === question.correct_answer]);
  };

  const handleNext = () => {
    if (isLast) {
      const correct = scores.filter(Boolean).length;
      const pct = Math.round((correct / quiz.questions.length) * 100);
      onComplete(pct);
    } else {
      setCurrentQ(prev => prev + 1);
      setSelected(null);
      setShowExplanation(false);
    }
  };

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
  const courseId = Number(id);
  const { isEnrolled, getProgress, updateProgress, loaded } = useEnrollment();

  // Course data
  const course = getCourseById(courseId);
  const content = getCourseContent(courseId);
  const flatSlides = useMemo(() => content ? getFlatSlides(content) : [], [content]);

  // Player state
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const isResizing = useRef(false);
  const [showNarration, setShowNarration] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
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

  // Redirect if not enrolled (wait for localStorage to load first)
  useEffect(() => {
    if (loaded && !isEnrolled(courseId)) {
      router.replace(`/courses/${courseId}`);
    }
  }, [courseId, isEnrolled, loaded, router]);

  // Load saved progress
  useEffect(() => {
    const progress = getProgress(courseId);
    if (progress) {
      setCurrentSlideIdx(progress.currentSlideIndex || 0);
      setCompletedSlides(progress.completedSlides || []);
      setCompletedModules(progress.completedModules || []);
      setQuizScores(progress.quizScores || {});
    }
  }, [courseId, getProgress]);

  // Save progress on changes
  useEffect(() => {
    if (completedSlides.length > 0 || currentSlideIdx > 0) {
      updateProgress(courseId, {
        currentSlideIndex: currentSlideIdx,
        completedSlides,
        completedModules,
        quizScores,
      });
    }
  }, [currentSlideIdx, completedSlides, completedModules, quizScores, courseId, updateProgress]);

  // Audio handling
  const currentFlat = flatSlides[currentSlideIdx];
  const audioUrl = currentFlat ? getAudioUrl(currentFlat.audioIndex) : '';

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
      }
    }
  }, [flatSlides.length, completedSlides, currentSlideIdx]);

  const goNext = () => {
    // Check if current module has a quiz at the end
    if (currentFlat && content) {
      const mod = content.modules[currentFlat.moduleIndex];
      const isLastSlideInModule = currentFlat.slideIndexInModule === mod.slides.length - 1;
      if (isLastSlideInModule && mod.quiz && !quizScores[`mod_${currentFlat.moduleIndex}`]) {
        setShowQuiz(true);
        return;
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

  if (!course || !content || flatSlides.length === 0) {
    return (
      <div className="min-h-screen bg-[#0f1729] flex items-center justify-center">
        <div className="text-white">Loading...</div>
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
        <Link href={`/courses/${courseId}`} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white">
          <Bars3Icon className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-medium text-white truncate flex-1">{course.title}</h1>
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
                                <div className="flex items-center gap-2 px-2 py-2 text-sm">
                                  {quizScores[`mod_${mi}`] !== undefined ? (
                                    <>
                                      <CheckCircleSolid className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                                      <span className="text-emerald-400">Quiz — {quizScores[`mod_${mi}`]}%</span>
                                    </>
                                  ) : (
                                    <>
                                      <AcademicCapIcon className="w-3 h-3 text-gray-600 flex-shrink-0" />
                                      <span className="text-gray-600">Quiz</span>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </nav>
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
              {showQuiz && currentModule.quiz ? (
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
        <button onClick={goNext} disabled={currentSlideIdx === flatSlides.length - 1 && !showQuiz}
          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center disabled:opacity-30 transition-colors">
          <ChevronRightIcon className="w-5 h-5 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
}
