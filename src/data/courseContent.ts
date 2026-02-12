// Course content data extracted from the HTML player
// This file contains the structured course content for "Medical Spanish Vocabulary"

export interface Speaker {
  speaker: string;
  emotion: string;
  text: string;
}

export interface NarrationScript {
  mode: string;
  speakers: Speaker[];
}

export interface SlideVisualContent {
  bullet_points?: string[];
  pillars?: Array<{ title: string; description: string; icon: string }>;
  chart_title?: string;
  cells?: Array<{ title: string; description: string; color: string }>;
  columns?: Array<{ title: string; items: string[] }>;
  comparison_title?: string;
  steps?: Array<{ step: number; title: string; description: string }>;
  axes?: Array<{ label: string; max: number }>;
  datasets?: Array<{ label: string; values: number[]; color: string }>;
  bars?: Array<{ label: string; value: number; color: string }>;
  segments?: Array<{ label: string; value: number; color: string }>;
  events?: Array<{ date: string; title: string; description: string }>;
  key_figure?: string;
  key_figure_label?: string;
  quote?: string;
  author?: string;
  term?: string;
  definition?: string;
  examples?: string[];
  formula?: string;
  explanation?: string;
  context?: string;
  problem?: string;
  solution?: string;
  result?: string;
  center_value?: string;
  center_label?: string;
  source?: string;
  unit?: string;
  axis_y?: string;
  axis_x?: string;
  y_top?: string;
  y_bottom?: string;
  x_left?: string;
  x_right?: string;
}

export interface Slide {
  id: number;
  title: string;
  slide_type: string;
  duration_seconds: number;
  visual_content: SlideVisualContent;
  narration_script: NarrationScript;
}

export interface QuizQuestion {
  id: number;
  type: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  difficulty: string;
  category: string;
}

export interface Quiz {
  title: string;
  intro_text: string;
  questions: QuizQuestion[];
  pass_threshold: number;
}

export interface CourseContentModule {
  type: string;
  title: string;
  slides: Slide[];
  quiz?: Quiz;
  sequence: number;
  audioFileIndex: number; // Starting index in the audio files array
}

export interface CourseContent {
  courseId: number;
  title: string;
  totalModules: number;
  totalSlides: number;
  totalQuizQuestions: number;
  audioBasePath: string;
  modules: CourseContentModule[];
}

// Audio file mapping: index -> filename in public/audio/courses/medical-spanish/
const audioFiles: string[] = Array.from({ length: 35 }, (_, i) => `${String(i + 1).padStart(2, '0')}.wav`);

export function getAudioUrl(index: number): string {
  if (index < 0 || index >= audioFiles.length) return '';
  return `/audio/courses/medical-spanish/${audioFiles[index]}`;
}

export const medicalSpanishCourse: CourseContent = {
  courseId: 25,
  title: "الإِسْبَانِيَّةُ الطِّبِّيَّةُ: إِتْقَانُ الْمُصْطَلَحَاتِ",
  totalModules: 4,
  totalSlides: 35,
  totalQuizQuestions: 22,
  audioBasePath: "/audio/courses/medical-spanish",
  modules: [
    {
      type: "teaser",
      title: "Teaser — الإِسْبَانِيَّةُ الطِّبِّيَّةُ",
      sequence: 0,
      audioFileIndex: 0,
      slides: [{
        id: 1,
        title: "Teaser — الإِسْبَانِيَّةُ الطِّبِّيَّةُ: إِتْقَانُ الْمُصْطَلَحَاتِ",
        slide_type: "bullet_points",
        duration_seconds: 32,
        visual_content: {},
        narration_script: {
          mode: "multi_speaker",
          speakers: [
            { speaker: "أَسْمَاءْ", emotion: "enthousiaste", text: "أَهْلًا بِكُمْ! هَلْ تَخَيَّلْتُمْ يَوْمًا أَنْ تَكُونَ اللُّغَةُ هِيَ الْأَدَاةُ الَّتِي تُنْقِذُ حَيَاةَ إِنْسَانٍ؟" },
            { speaker: "نَبِيلْ", emotion: "confidentiel", text: "بِالضَّبْطِ يَا أَسْمَاءْ. فِي عَالَمِ الطِّبِّ، الدِّقَّةُ لَيْسَتْ رَفَاهِيَةً، بَلْ ضَرُورَةٌ قُصْوَى." },
            { speaker: "أَسْمَاءْ", emotion: "curieux", text: "وَهَذَا مَا سَنَتَعَلَّمُهُ الْيَوْمَ. كَيْفَ نُصْبِحُ جِسْرًا لِلتَّوَاصُلِ وَالشِّفَاءِ." },
            { speaker: "نَبِيلْ", emotion: "motivant", text: "نَعَمْ، سَنَأْخُذُكُمْ فِي رِحْلَةٍ مِنَ التَّشْرِيحِ إِلَى الصَّيْدَلَةِ، لِتُصْبِحُوا مُحْتَرِفِينَ فِي الإِسْبَانِيَّةِ الطِّبِّيَّةِ." }
          ]
        }
      }]
    },
    {
      type: "introduction",
      title: "Introduction — مُقَدِّمَة",
      sequence: 1,
      audioFileIndex: 1,
      slides: [{
        id: 1,
        title: "مُقَدِّمَةُ الدَّوْرَةِ",
        slide_type: "bullet_points",
        duration_seconds: 32,
        visual_content: {},
        narration_script: {
          mode: "multi_speaker",
          speakers: [
            { speaker: "أَسْمَاءْ", emotion: "enthousiaste", text: "مَرْحَبًا بِكُمْ فِي بَرْنَامَجِكُمُ التَّدْرِيبِيِّ 'Vocabulario Médico'." },
            { speaker: "نَبِيلْ", emotion: "pédagogue", text: "التَّوَاصُلُ الْفَعَّالُ يُقَلِّلُ الْأَخْطَاءَ الطِّبِّيَّةَ بِنِسْبَةٍ تَصِلُ إِلَى خَمْسِينَ بِالْمِائَةِ." },
            { speaker: "أَسْمَاءْ", emotion: "surpris", text: "خَمْسُونَ بِالْمِائَةِ؟! نَحْنُ لَا نَتَعَلَّمُ مُفْرَدَاتٍ فَقَطْ، نَحْنُ نَتَعَلَّمُ كَيْفَ نَحْمِي الْمَرْضَى." },
            { speaker: "نَبِيلْ", emotion: "sérieux", text: "سَنَبْدَأُ بِأَسَاسِيَّاتِ جِسْمِ الْإِنْسَانِ، ثُمَّ نَنْتَقِلُ لِلْأَعْرَاضِ، التَّشْخِيصِ، وَحَتَّى الطَّوَارِئِ." }
          ]
        }
      }]
    },
    {
      type: "module",
      title: "Anatomía & Cuerpo Humano (التَّشْرِيحُ وَجِسْمُ الْإِنْسَانِ)",
      sequence: 10,
      audioFileIndex: 2,
      slides: [
        {
          id: 1, title: "الْهَيْكَلُ الْعَامُّ: El Cuerpo", slide_type: "pillars", duration_seconds: 32,
          visual_content: { pillars: [{ title: "La Cabeza", description: "الرَّأْسُ", icon: "🧠" }, { title: "El Tronco", description: "الْجِذْعُ", icon: "🫁" }, { title: "Las Extremidades", description: "الْأَطْرَافُ", icon: "💪" }] },
          narration_script: { mode: "multi_speaker", speakers: [{ speaker: "نَبِيلْ", emotion: "pédagogue", text: "دَعِينَا نَتَخَيَّلُ الْجِسْمَ، أَوْ 'El Cuerpo'، كَمَبْنَى مُتَكَامِلٍ." }, { speaker: "أَسْمَاءْ", emotion: "curieux", text: "حَسَنًا، 'La Cabeza'. الرَّأْسُ." }, { speaker: "نَبِيلْ", emotion: "amusé", text: "دَاخِلَ الرَّأْسِ يُوجَدُ 'El Cerebro'، أَيِ الدِّمَاغُ." }] }
        },
        {
          id: 2, title: "الْأَعْضَاءُ الْحَيَوِيَّةُ: Órganos Vitales", slide_type: "matrix_2x2", duration_seconds: 32,
          visual_content: { chart_title: "أَهَمُّ الْأَعْضَاءِ", cells: [{ title: "El Corazón", description: "الْقَلْبُ", color: "#ef4444" }, { title: "Los Pulmones", description: "الرِّئَتَانِ", color: "#3b82f6" }, { title: "El Estómago", description: "الْمَعِدَةُ", color: "#f59e0b" }, { title: "El Hígado", description: "الْكَبِدُ", color: "#8b5cf6" }] },
          narration_script: { mode: "multi_speaker", speakers: [{ speaker: "نَبِيلْ", emotion: "sérieux", text: "أَهَمُّ عُضْوٍ هُوَ 'El Corazón'. الْقَلْبُ." }, { speaker: "أَسْمَاءْ", emotion: "réfléchi", text: "'Corazón'... كَلِمَةٌ نَسْمَعُهَا كَثِيرًا، لَكِنْ طِبِّيًّا هِيَ الْمِضَخَّةُ." }] }
        },
        {
          id: 3, title: "نِظَامُ الْحَرَكَةِ: Huesos y Músculos", slide_type: "comparison", duration_seconds: 30,
          visual_content: { comparison_title: "الْهَيْكَلُ وَالْحَرَكَةُ", columns: [{ title: "Los Huesos (الْعِظَامُ)", items: ["El Cráneo (الْجُمْجُمَةُ)", "La Costilla (الضِّلْعُ)"] }, { title: "Los Músculos (الْعَضَلَاتُ)", items: ["El Bíceps (الْعَضَلَةُ الثُّنَائِيَّةُ)", "El Tendón (الْوَتَرُ)"] }] },
          narration_script: { mode: "multi_speaker", speakers: [{ speaker: "أَسْمَاءْ", emotion: "curieux", text: "كَيْفَ نَقُولُ 'عَظْم'؟" }, { speaker: "نَبِيلْ", emotion: "direct", text: "الْعَظْمُ هُوَ 'El Hueso'. حَرْفُ H لَا يُنْطَقُ فِي الْإِسْبَانِيَّةِ." }] }
        },
        {
          id: 4, title: "الْوَجْهُ وَالْحَوَاسُّ: La Cara", slide_type: "bullet_points", duration_seconds: 30,
          visual_content: { bullet_points: ["Los Ojos (الْعُيُونُ)", "La Nariz (الْأَنْفُ)", "La Boca (الْفَمُ)", "El Oído (الْأُذُنُ)"] },
          narration_script: { mode: "multi_speaker", speakers: [{ speaker: "نَبِيلْ", emotion: "calm", text: "دَعِينَا نَنْظُرْ إِلَى 'La Cara'، الْوَجْهُ." }, { speaker: "أَسْمَاءْ", emotion: "enthousiaste", text: "أَنَا أُحِبُّ اخْتِبَارَاتِ الذَّاكِرَةِ!" }] }
        },
        {
          id: 5, title: "الْيَدُ وَالْقَدَمُ: Mano y Pie", slide_type: "bullet_points", duration_seconds: 30,
          visual_content: { bullet_points: ["El Brazo (الذِّرَاعُ)", "La Mano (الْيَدُ) - مُؤَنَّثٌ رَغْمَ انْتِهَائِهِ بِـ O", "El Dedo (الْإِصْبَعُ)", "La Pierna (السَّاقُ)", "El Pie (الْقَدَمُ)"] },
          narration_script: { mode: "multi_speaker", speakers: [{ speaker: "نَبِيلْ", emotion: "sérieux", text: "'La Mano' (الْيَدُ). تَنْتَهِي بِـ O لَكِنَّهَا مُؤَنَّثَةٌ!" }, { speaker: "أَسْمَاءْ", emotion: "surpris", text: "حَقًّا؟! عَادَةً الْكَلِمَاتُ الَّتِي تَنْتَهِي بِـ O تَكُونُ مُذَكَّرَةً." }] }
        },
        {
          id: 6, title: "الدَّمُ وَالْأَوْعِيَةُ: Sangre y Venas", slide_type: "bullet_points", duration_seconds: 30,
          visual_content: { bullet_points: ["La Sangre (الدَّمُ)", "La Arteria (الشِّرْيَانُ)", "La Vena (الْوَرِيدُ)", "El Corazón (الْقَلْبُ)"] },
          narration_script: { mode: "multi_speaker", speakers: [{ speaker: "نَبِيلْ", emotion: "calm", text: "'La Sangre' هِيَ الدَّمُ." }, { speaker: "أَسْمَاءْ", emotion: "confidentiel", text: "أَتَذَكَّرُ مَرَّةً قُلْتُ لِمَرِيضٍ 'Sangría' بَدَلَ 'Sangre'!" }] }
        },
        {
          id: 7, title: "الْجِهَازُ الْهَضْمِيُّ: Sistema Digestivo", slide_type: "process_steps", duration_seconds: 30,
          visual_content: { steps: [{ step: 1, title: "La Boca", description: "الْمَدْخَلُ" }, { step: 2, title: "El Esófago", description: "الْمَرِيءُ" }, { step: 3, title: "El Estómago", description: "الْمَعِدَةُ" }, { step: 4, title: "Los Intestinos", description: "الْأَمْعَاءُ" }] },
          narration_script: { mode: "multi_speaker", speakers: [{ speaker: "أَسْمَاءْ", emotion: "curieux", text: "كَيْفَ نُفَرِّقُ بَيْنَ الْمَعِدَةِ وَالْأَمْعَاءِ؟" }, { speaker: "نَبِيلْ", emotion: "direct", text: "'El Estómago' هُوَ الْجُزْءُ الْعُلْوِيُّ. أَمَّا 'Los Intestinos' فَهِيَ الْأَمْعَاءُ." }] }
        },
        {
          id: 8, title: "مُرَاجَعَةٌ سَرِيعَةٌ: Resumen", slide_type: "bullet_points", duration_seconds: 30,
          visual_content: { bullet_points: ["El Cuerpo (الْجِسْمُ)", "El Corazón (الْقَلْبُ)", "Los Pulmones (الرِّئَتَانِ)", "El Estómago (الْمَعِدَةُ)", "Los Huesos (الْعِظَامُ)"] },
          narration_script: { mode: "multi_speaker", speakers: [{ speaker: "نَبِيلْ", emotion: "coach", text: "إِذَا أَشَارَ الْمَرِيضُ إِلَى صَدْرِهِ، مَاذَا يُوجَدُ هُنَاكَ؟" }, { speaker: "أَسْمَاءْ", emotion: "motivant", text: "فِي الْوَحْدَةِ الْقَادِمَةِ، سَنَتَعَلَّمُ كَيْفَ يَصِفُ الْمَرِيضُ مَا يَشْعُرُ بِهِ." }] }
        }
      ],
      quiz: {
        title: "Quiz — Anatomía & Cuerpo Humano",
        intro_text: "3 أسئلة للتحقق من إتقانك!",
        pass_threshold: 70,
        questions: [
          { id: 1, type: "multiple_choice", question: "مَا هُوَ الْمُصْطَلَحُ الطِّبِّيُّ لِلْقَلْبِ؟", options: ["El Hígado", "El Corazón", "El Pulmón", "El Cerebro"], correct_answer: 1, explanation: "El Corazón هُوَ الْقَلْبُ.", difficulty: "easy", category: "general" },
          { id: 2, type: "true_false", question: "كَلِمَةُ 'La Mano' هِيَ كَلِمَةٌ مُذَكَّرَةٌ لِأَنَّهَا تَنْتَهِي بِحَرْفِ O.", options: ["صَحِيح", "خَطَأ"], correct_answer: 1, explanation: "خَطَأٌ! La Mano كَلِمَةٌ مُؤَنَّثَةٌ.", difficulty: "easy", category: "memorisation" },
          { id: 3, type: "scenario", question: "مَرِيضٌ يَشْكُو مِنْ أَلَمٍ فِي 'El Hígado'. أَيْنَ تَفْحَصُ؟", options: ["الْجَانِبُ الْأَيْمَنُ مِنَ الْبَطْنِ (الْكَبِدُ)", "الْجَانِبُ الْأَيْسَرُ مِنَ الصَّدْرِ", "أَسْفَلُ الظَّهْرِ", "الرَّأْسُ"], correct_answer: 0, explanation: "El Hígado يَعْنِي الْكَبِدَ، فِي الْجَانِبِ الْأَيْمَنِ.", difficulty: "medium", category: "raisonnement" }
        ]
      }
    },
    {
      type: "module",
      title: "Síntomas & Signos (الْأَعْرَاضُ وَالْعَلَامَاتُ)",
      sequence: 12,
      audioFileIndex: 10,
      slides: [
        {
          id: 1, title: "كَلِمَةُ السِّرِّ: El Dolor", slide_type: "key_figure", duration_seconds: 30,
          visual_content: { key_figure: "80%", key_figure_label: "مِنَ الزِّيَارَاتِ الطِّبِّيَّةِ سَبَبُهَا الْأَلَمُ", bullet_points: ["Agudo (حَادٌّ)", "Crónico (مُزْمِنٌ)"] },
          narration_script: { mode: "multi_speaker", speakers: [{ speaker: "أَسْمَاءْ", emotion: "enthousiaste", text: "إِذَا كَانَ الْمَرِيضُ لَا يَسْتَطِيعُ وَصْفَ أَلَمِهِ، فَنَحْنُ فِي مُشْكِلَةٍ." }, { speaker: "نَبِيلْ", emotion: "sérieux", text: "الْكَلِمَةُ الْمِفْتَاحِيَّةُ هِيَ 'Dolor'. هَلْ هُوَ 'Agudo' أَمْ 'Crónico'؟" }] }
        },
        {
          id: 2, title: "الْحَرَارَةُ وَالْحُمَّى: La Fiebre", slide_type: "bullet_points", duration_seconds: 30,
          visual_content: { bullet_points: ["Normal (37°C)", "Febrícula (37.5°C)", "Fiebre (38.5°C)", "Fiebre Alta (40°C)"] },
          narration_script: { mode: "multi_speaker", speakers: [{ speaker: "نَبِيلْ", emotion: "direct", text: "الْعَرَضُ الثَّانِي الْأَكْثَرُ شُيُوعًا هُوَ 'La Fiebre'." }, { speaker: "أَسْمَاءْ", emotion: "curieux", text: "هَلْ هُنَاكَ فَرْقٌ بَيْنَ الْحَرَارَةِ الْبَسِيطِ وَالْحُمَّى؟" }] }
        },
        {
          id: 3, title: "الدُّوَارُ وَالْإِغْمَاءُ: Mareo y Desmayo", slide_type: "comparison", duration_seconds: 30,
          visual_content: { comparison_title: "فُقْدَانُ التَّوَازُنِ", columns: [{ title: "Mareo (دُوَّارٌ)", items: ["الشُّعُورُ بِدَوَرَانِ الْغُرْفَةِ", "الْوَعْيُ مَوْجُودٌ"] }, { title: "Desmayo (إِغْمَاءٌ)", items: ["فُقْدَانُ الْوَعْيِ", "السُّقُوطُ"] }] },
          narration_script: { mode: "multi_speaker", speakers: [{ speaker: "نَبِيلْ", emotion: "sérieux", text: "يَأْتِي كَثِيرُونَ يَقُولُونَ 'Estoy mareado'." }, { speaker: "أَسْمَاءْ", emotion: "réfléchi", text: "'Mareo' أَصْلُهَا مِنَ 'Mar' (الْبَحْرِ)." }] }
        },
        {
          id: 4, title: "الْجِهَازُ التَّنَفُّسِيُّ: Tos y Disnea", slide_type: "bullet_points", duration_seconds: 30,
          visual_content: { bullet_points: ["Tos (سُعَالٌ)", "Tos seca (سُعَالٌ جَافٌّ)", "Tos con flema (سُعَالٌ بِبَلْغَمٍ)", "Disnea (ضِيقُ تَنَفُّسٍ)"] },
          narration_script: { mode: "multi_speaker", speakers: [{ speaker: "أَسْمَاءْ", emotion: "curieux", text: "كَيْفَ نُصَنِّفُ السُّعَالَ بِالْإِسْبَانِيَّةِ؟" }, { speaker: "نَبِيلْ", emotion: "direct", text: "السُّعَالُ هُوَ 'Tos'. هَلْ هُوَ 'Seca' أَمْ 'Productiva'؟" }] }
        },
        {
          id: 5, title: "الْغَثَيَانُ وَالْقَيْءُ: Náuseas y Vómitos", slide_type: "process_steps", duration_seconds: 30,
          visual_content: { steps: [{ step: 1, title: "Náuseas", description: "غَثَيَانٌ" }, { step: 2, title: "Vómito", description: "قَيْءٌ" }, { step: 3, title: "Diarrea", description: "إِسْهَالٌ" }] },
          narration_script: { mode: "multi_speaker", speakers: [{ speaker: "نَبِيلْ", emotion: "sérieux", text: "'Náuseas' هِيَ الشُّعُورُ بِالرَّغْبَةِ فِي التَّقَيُّؤِ." }, { speaker: "أَسْمَاءْ", emotion: "réfléchi", text: "وَالتَّقَيُّؤُ نَفْسُهُ هُوَ 'Vomitar'." }] }
        },
        {
          id: 6, title: "الْحَسَّاسِيَّةُ: Alergia y Picazón", slide_type: "bullet_points", duration_seconds: 30,
          visual_content: { bullet_points: ["Alergia (حَسَّاسِيَّةٌ)", "Picazón (حَكَّةٌ)", "Erupción (طَفْحٌ جِلْدِيٌّ)"] },
          narration_script: { mode: "multi_speaker", speakers: [{ speaker: "أَسْمَاءْ", emotion: "enthousiaste", text: "'Alergia' سَهْلَةٌ جِدًّا." }, { speaker: "نَبِيلْ", emotion: "pédagogue", text: "نَسْأَلُ: '¿Tiene alguna alergia?'" }] }
        },
        {
          id: 7, title: "الْعَلَامَاتُ الْحَيَوِيَّةُ: Signos Vitales", slide_type: "bullet_points", duration_seconds: 30,
          visual_content: { bullet_points: ["El Pulso (النَّبْضُ)", "La Presión arterial (ضَغْطُ الدَّمِ)", "La Temperatura (الْحَرَارَةُ)", "El Oxígeno (الْأُكْسِجِينُ)"] },
          narration_script: { mode: "multi_speaker", speakers: [{ speaker: "نَبِيلْ", emotion: "sérieux", text: "أَوَّلُ مَا تَفْعَلُهُ هُوَ قِيَاسُ 'Signos Vitales'." }, { speaker: "أَسْمَاءْ", emotion: "pédagogue", text: "'El Pulso' هُوَ النَّبْضُ. 'La Presión arterial' هُوَ ضَغْطُ الدَّمِ." }] }
        },
        {
          id: 8, title: "خُلَاصَةُ الْأَعْرَاضِ", slide_type: "bullet_points", duration_seconds: 30,
          visual_content: { bullet_points: ["Dolor (أَلَمٌ)", "Fiebre (حُمَّى)", "Mareo (دُوَّارٌ)", "Tos (سُعَالٌ)", "Vómito (قَيْءٌ)"] },
          narration_script: { mode: "multi_speaker", speakers: [{ speaker: "نَبِيلْ", emotion: "motivant", text: "لَقَدْ غَطَّيْنَا الْكَثِيرَ. مِنْ أَلَمِ الرَّأْسِ إِلَى ضَغْطِ الدَّمِ." }, { speaker: "أَسْمَاءْ", emotion: "enthousiaste", text: "أَنَا أَشْعُرُ بِثِقَةٍ أَكْبَرَ الْآنَ." }] }
        }
      ],
      quiz: {
        title: "Quiz — الْأَعْرَاضُ وَالْعَلَامَاتُ",
        intro_text: "3 أسئلة للتحقق من إتقانك!",
        pass_threshold: 70,
        questions: [
          { id: 1, type: "multiple_choice", question: "مَرِيضٌ يَقُولُ 'Tengo mareos'، مَاذَا يَعْنِي؟", options: ["لَدَيْهِ حُمَّى", "يَشْعُرُ بِالدُّوَارِ", "لَدَيْهِ سُعَالٌ", "يَشْعُرُ بِالْجُوعِ"], correct_answer: 1, explanation: "'Mareo' تَعْنِي الدُّوَارَ.", difficulty: "easy", category: "general" },
          { id: 2, type: "true_false", question: "'Tos productiva' تَعْنِي سُعَالًا جَافًّا.", options: ["صَحِيح", "خَطَأ"], correct_answer: 1, explanation: "'Tos productiva' سُعَالٌ بِبَلْغَمٍ.", difficulty: "easy", category: "memorisation" },
          { id: 3, type: "scenario", question: "ضَغْطُ مَرِيضٍ 160/100. كَيْفَ تَصِفُهُ؟", options: ["Presión baja", "Presión alta", "Tiene fiebre", "Tiene tos"], correct_answer: 1, explanation: "الضَّغْطُ 160/100 مُرْتَفِعٌ: 'Presión alta'.", difficulty: "medium", category: "raisonnement" }
        ]
      }
    },
    {
      type: "module",
      title: "Exámenes & Análisis (الْفُحُوصَاتُ وَالتَّحَالِيلُ)",
      sequence: 14,
      audioFileIndex: 18,
      slides: [
        {
          id: 1, title: "تَحْلِيلُ الدَّمِ: Análisis de Sangre", slide_type: "process_steps", duration_seconds: 30,
          visual_content: { steps: [{ step: 1, title: "La Muestra", description: "الْعَيِّنَةُ" }, { step: 2, title: "El Tubo", description: "الْأُنْبُوبُ" }, { step: 3, title: "La Aguja", description: "الْإِبْرَةُ" }, { step: 4, title: "El Resultado", description: "النَّتِيجَةُ" }] },
          narration_script: { mode: "multi_speaker", speakers: [{ speaker: "أَسْمَاءْ", emotion: "curieux", text: "كَيْفَ نَقُولُ لِلْمَرِيضِ 'نَحْتَاجُ لِأَخْذِ عَيِّنَةِ دَمٍ'؟" }, { speaker: "نَبِيلْ", emotion: "calm", text: "'Necesitamos hacer un análisis de sangre'." }] }
        },
        {
          id: 2, title: "الْأَشِعَّةُ: Radiografía y Escáner", slide_type: "bullet_points", duration_seconds: 30,
          visual_content: { bullet_points: ["Radiografía (أَشِعَّةٌ سِينِيَّةٌ)", "TAC / Escáner (أَشِعَّةٌ مَقْطَعِيَّةٌ)", "Resonancia (رَنِينٌ مِغْنَاطِيسِيٌّ)", "Ecografía (مَوْجَاتٌ صَوْتِيَّةٌ)"] },
          narration_script: { mode: "multi_speaker", speakers: [{ speaker: "نَبِيلْ", emotion: "sérieux", text: "الْأَشِعَّةُ الْعَادِيَّةُ هِيَ 'Radiografía'." }, { speaker: "أَسْمَاءْ", emotion: "pédagogue", text: "'Placa'... مِثْلَ 'لَوْحَة'؟" }] }
        },
        {
          id: 3, title: "تَحْلِيلُ الْبَوْلِ: Muestra de Orina", slide_type: "bullet_points", duration_seconds: 30,
          visual_content: { bullet_points: ["Orina (الْبَوْلُ)", "Muestra (الْعَيِّنَةُ)", "Orinar (التَّبَوُّلُ)"] },
          narration_script: { mode: "multi_speaker", speakers: [{ speaker: "نَبِيلْ", emotion: "pédagogue", text: "الْبَوْلُ هُوَ 'Orina'. نَطْلُبُ 'Una muestra de orina'." }] }
        },
        {
          id: 4, title: "نَتَائِجُ الْفُحُوصَاتِ: Positivo y Negativo", slide_type: "comparison", duration_seconds: 30,
          visual_content: { comparison_title: "تَفْسِيرُ النَّتَائِجِ", columns: [{ title: "Positivo (إِيجَابِيٌّ)", items: ["وُجُودُ الْمَرَضِ", "غَالِبًا خَبَرٌ سَيِّئٌ"] }, { title: "Negativo (سَلْبِيٌّ)", items: ["عَدَمُ وُجُودِ الْمَرَضِ", "غَالِبًا خَبَرٌ جَيِّدٌ"] }] },
          narration_script: { mode: "multi_speaker", speakers: [{ speaker: "نَبِيلْ", emotion: "sérieux", text: "'Positivo' وَ 'Negativo'. كَلِمَتَانِ مُهِمَّتَانِ." }, { speaker: "أَسْمَاءْ", emotion: "réfléchi", text: "فِي الطِّبِّ، الْإِيجَابِيُّ غَالِبًا خَبَرٌ سَيِّئٌ!" }] }
        },
        {
          id: 5, title: "فَحْصُ كُورُونَا: El Hisopado", slide_type: "bullet_points", duration_seconds: 30,
          visual_content: { bullet_points: ["Hisopo (الْعُودُ الْقُطْنِيُّ)", "Hisopado (الْمَسْحَةُ)", "PCR (بِي سِي إِرِّي)", "Test rápido (فَحْصٌ سَرِيعٌ)"] },
          narration_script: { mode: "multi_speaker", speakers: [{ speaker: "أَسْمَاءْ", emotion: "curieux", text: "كَيْفَ نُسَمِّي الْعُودَ الْقُطْنِيَّ لِلْفَحْصِ؟" }, { speaker: "نَبِيلْ", emotion: "expert", text: "'Hisopo'. وَعَمَلِيَّةُ الْمَسْحِ 'Hisopado'." }] }
        },
        {
          id: 6, title: "الْوَزْنَ وَالطُّولَ: Peso y Altura", slide_type: "bullet_points", duration_seconds: 30,
          visual_content: { bullet_points: ["El Peso (الْوَزْنُ)", "La Altura (الطُّولُ)", "IMC (مُؤَشِّرُ كُتْلَةِ الْجِسْمِ)", "La Báscula (الْمِيزَانُ)"] },
          narration_script: { mode: "multi_speaker", speakers: [{ speaker: "نَبِيلْ", emotion: "calm", text: "'El Peso' هُوَ الْوَزْنُ وَ 'La Altura' هُوَ الطُّولُ." }] }
        },
        {
          id: 7, title: "الصِّيَامُ: Ayunas", slide_type: "bullet_points", duration_seconds: 30,
          visual_content: { bullet_points: ["En ayunas (صَائِمٌ)", "No comer nada (لَا تَأْكُلْ شَيْئًا)", "8 horas (8 سَاعَاتٍ)"] },
          narration_script: { mode: "multi_speaker", speakers: [{ speaker: "أَسْمَاءْ", emotion: "urgent", text: "كَيْفَ نَقُولُ 'يَجِبُ أَنْ تَكُونَ صَائِمًا'؟" }, { speaker: "نَبِيلْ", emotion: "direct", text: "'Tiene que venir en ayunas'." }] }
        },
        {
          id: 8, title: "الْخُلَاصَةُ: Resumen", slide_type: "bullet_points", duration_seconds: 30,
          visual_content: { bullet_points: ["Análisis de sangre (تَحْلِيلُ دَمٍ)", "Radiografía (أَشِعَّةٌ)", "Aguja (إِبْرَةٌ)", "Ayunas (صِيَامٌ)", "Resultado (نَتِيجَةٌ)"] },
          narration_script: { mode: "multi_speaker", speakers: [{ speaker: "نَبِيلْ", emotion: "motivant", text: "لَقَدْ أَصْبَحْتُمْ جَاهِزِينَ لِطَلَبِ الْفُحُوصَاتِ." }] }
        }
      ],
      quiz: {
        title: "Quiz — الْفُحُوصَاتُ وَالتَّحَالِيلُ",
        intro_text: "3 أسئلة للتحقق من إتقانك!",
        pass_threshold: 70,
        questions: [
          { id: 1, type: "multiple_choice", question: "مَا مَعْنَى 'Estar en ayunas'؟", options: ["أَنْ يَكُونَ نَائِمًا", "أَنْ يَكُونَ صَائِمًا", "أَنْ يَكُونَ خَائِفًا", "أَنْ يَكُونَ جَالِسًا"], correct_answer: 1, explanation: "'Ayunas' تَعْنِي الصِّيَامَ.", difficulty: "easy", category: "general" },
          { id: 2, type: "true_false", question: "'Radiografía' تَعْنِي تَحْلِيلَ الدَّمِ.", options: ["صَحِيح", "خَطَأ"], correct_answer: 1, explanation: "'Radiografía' هِيَ الْأَشِعَّةُ.", difficulty: "easy", category: "memorisation" },
          { id: 3, type: "scenario", question: "أَخْبَرْتَ الْمَرِيضَ: 'El resultado es positivo' لِلْإِنْفْلُوَنْزَا. يَعْنِي:", options: ["غَيْرُ مُصَابٍ", "مُصَابٌ بِالْإِنْفْلُوَنْزَا", "يَحْتَاجُ أَشِعَّةً", "يَجِبُ أَنْ يَصُومَ"], correct_answer: 1, explanation: "النَّتِيجَةُ الْإِيجَابِيَّةُ تَعْنِي وُجُودَ الْمَرَضِ.", difficulty: "medium", category: "raisonnement" }
        ]
      }
    },
    {
      type: "module",
      title: "Farmacología (عِلْمُ الْأَدْوِيَةِ)",
      sequence: 16,
      audioFileIndex: 26,
      slides: [
        {
          id: 1, title: "شَكْلُ الدَّوَاءِ: Presentación", slide_type: "pillars", duration_seconds: 30,
          visual_content: { pillars: [{ title: "La Pastilla", description: "الْقُرْصُ", icon: "💊" }, { title: "El Jarabe", description: "الشَّرَابُ", icon: "🍯" }, { title: "La Inyección", description: "الْحُقْنَةُ", icon: "💉" }, { title: "La Crema", description: "الْمَرْهَمُ", icon: "🧴" }] },
          narration_script: { mode: "multi_speaker", speakers: [{ speaker: "نَبِيلْ", emotion: "calm", text: "أَشْهَرُ شَكْلٍ هُوَ 'La Pastilla'." }, { speaker: "أَسْمَاءْ", emotion: "interpellation", text: "'Jarabe'... كَلِمَةٌ عَرَبِيَّةٌ الْأَصْلِ! 'شَرَاب'." }] }
        },
        {
          id: 2, title: "الْجُرْعَةُ: La Dosis", slide_type: "bullet_points", duration_seconds: 30,
          visual_content: { bullet_points: ["Cada 8 horas (كُلَّ 8 سَاعَاتٍ)", "Una vez al día (مَرَّةً يَوْمِيًّا)", "Antes de comer (قَبْلَ الْأَكْلِ)", "Después de comer (بَعْدَ الْأَكْلِ)"] },
          narration_script: { mode: "multi_speaker", speakers: [{ speaker: "أَسْمَاءْ", emotion: "urgent", text: "أَخْطَرُ شَيْءٍ هُوَ الْخَطَأُ فِي الْجُرْعَةِ." }, { speaker: "نَبِيلْ", emotion: "pédagogue", text: "الْجُرْعَةُ هِيَ 'La Dosis'. 'Cada 8 horas' (كُلَّ 8 سَاعَاتٍ)." }] }
        },
        {
          id: 3, title: "مُسَكِّنَاتُ الْأَلَمِ: Analgésicos", slide_type: "comparison", duration_seconds: 30,
          visual_content: { comparison_title: "أَنْوَاعُ الْمُسَكِّنَاتِ", columns: [{ title: "Paracetamol", items: ["لِلْحُمَّى وَالْأَلَمِ الْخَفِيفِ", "آَمِنٌ لِلْمَعِدَةِ"] }, { title: "Ibuprofeno", items: ["مُضَادُّ الْتِهَابٍ", "قَوِيٌّ لِلْأَلَمِ"] }] },
          narration_script: { mode: "multi_speaker", speakers: [{ speaker: "نَبِيلْ", emotion: "calm", text: "أَكْثَرُ الْأَدْوِيَةِ طَلَبًا هِيَ 'Analgésicos'." }] }
        },
        {
          id: 4, title: "الْمُضَادَّاتُ الْحَيَوِيَّةُ: Antibióticos", slide_type: "bullet_points", duration_seconds: 30,
          visual_content: { bullet_points: ["Antibiótico (مُضَادٌّ حَيَوِيٌّ)", "Terminar el tratamiento (إِكْمَالُ الْعِلَاجِ)", "No dejar a la mitad (لَا تَتْرُكْهُ فِي الْمُنْتَصَفِ)"] },
          narration_script: { mode: "multi_speaker", speakers: [{ speaker: "نَبِيلْ", emotion: "sérieux", text: "'Antibióticos'. يَجِبُ أَنْ نَكُونَ صَارِمِينَ." }, { speaker: "أَسْمَاءْ", emotion: "urgent", text: "لِمَاذَا؟" }] }
        },
        {
          id: 5, title: "الْآثَارُ الْجَانِبِيَّةُ: Efectos Secundarios", slide_type: "bullet_points", duration_seconds: 30,
          visual_content: { bullet_points: ["Sueño (نُعَاسٌ)", "Mareo (دُوَّارٌ)", "Alergia (حَسَّاسِيَّةٌ)", "Dolor de estómago (أَلَمُ مَعِدَةٍ)"] },
          narration_script: { mode: "multi_speaker", speakers: [{ speaker: "أَسْمَاءْ", emotion: "curieux", text: "بَعْضُ الْأَدْوِيَةِ تَجْعَلُكَ تَنْعَسُ." }, { speaker: "نَبِيلْ", emotion: "pédagogue", text: "هَذِهِ تُسَمَّى 'Efectos secundarios'." }] }
        },
        {
          id: 6, title: "الْوَصْفَةُ الطِّبِّيَّةُ: La Receta", slide_type: "bullet_points", duration_seconds: 30,
          visual_content: { bullet_points: ["La Receta (الْوَصْفَةُ الطِّبِّيَّةُ)", "¿Tiene receta? (هَلْ لَدَيْكَ وَصْفَةٌ؟)", "Receta médica (وَصْفَةٌ طِبِّيَّةٌ)"] },
          narration_script: { mode: "multi_speaker", speakers: [{ speaker: "نَبِيلْ", emotion: "sérieux", text: "الْوَرَقَةُ تُسَمَّى 'La Receta'." }, { speaker: "أَسْمَاءْ", emotion: "amusé", text: "'Receta'... مِثْلَ وَصْفَةِ الطَّبْخِ؟" }] }
        },
        {
          id: 7, title: "الصَّيْدَلِيَّةُ: La Farmacia", slide_type: "bullet_points", duration_seconds: 30,
          visual_content: { bullet_points: ["Farmacia de guardia (صَيْدَلِيَّةُ مُنَاوَبَةٍ)", "Medicamento genérico (دَوَاءٌ جَنِيسٌ)", "Prospecto (نَشْرَةُ الدَّوَاءِ)"] },
          narration_script: { mode: "multi_speaker", speakers: [{ speaker: "نَبِيلْ", emotion: "calm", text: "نَبْحَثُ عَنْ 'Farmacia de guardia'." }] }
        },
        {
          id: 8, title: "مُلَخَّصُ الْأَدْوِيَةِ", slide_type: "process_steps", duration_seconds: 30,
          visual_content: { steps: [{ step: 1, title: "Receta", description: "الْوَصْفَةُ" }, { step: 2, title: "Farmacia", description: "الصَّيْدَلِيَّةُ" }, { step: 3, title: "Tratamiento", description: "الْعِلَاجُ" }] },
          narration_script: { mode: "multi_speaker", speakers: [{ speaker: "نَبِيلْ", emotion: "motivant", text: "الْآنَ تَعْرِفُونَ كَيْفَ تَصِفُونَ الْعِلَاجَ." }] }
        }
      ],
      quiz: {
        title: "Quiz — عِلْمُ الْأَدْوِيَةِ",
        intro_text: "3 أسئلة للتحقق من إتقانك!",
        pass_threshold: 70,
        questions: [
          { id: 1, type: "multiple_choice", question: "مَاذَا تَعْنِي 'Tomar una pastilla cada 8 horas'؟", options: ["حَبَّة كُلَّ 8 أَيَّامٍ", "حَبَّة كُلَّ 8 سَاعَاتٍ", "8 حَبَّات مَرَّةً وَاحِدَةً", "شِرَاء 8 عُلَب"], correct_answer: 1, explanation: "'Cada 8 horas' كُلَّ 8 سَاعَاتٍ.", difficulty: "easy", category: "general" },
          { id: 2, type: "true_false", question: "'Jarabe' هُوَ حُقْنَة.", options: ["صَحِيح", "خَطَأ"], correct_answer: 1, explanation: "'Jarabe' شَرَابٌ. الْحُقْنَةُ هِيَ 'Inyección'.", difficulty: "easy", category: "memorisation" },
          { id: 3, type: "scenario", question: "مَرِيضٌ يَقُولُ 'Tengo dolor de cabeza'. مَاذَا تُعْطِيهِ؟", options: ["مُضَادٌّ حَيَوِيٌّ", "مُسَكِّنٌ (Analgésico)", "شَرَابُ سُعَالٍ", "إِنْسُولِين"], correct_answer: 1, explanation: "لِأَلَمِ الرَّأْسِ: مُسَكِّنٌ مِثْلَ الْبَارَاسِيتَامُول.", difficulty: "medium", category: "raisonnement" }
        ]
      }
    },
    {
      type: "conclusion",
      title: "Conclusion — الْخَاتِمَة",
      sequence: 900,
      audioFileIndex: 34,
      slides: [{
        id: 1,
        title: "خَاتِمَةُ الدَّوْرَةِ",
        slide_type: "bullet_points",
        duration_seconds: 30,
        visual_content: {},
        narration_script: {
          mode: "multi_speaker",
          speakers: [
            { speaker: "أَسْمَاءْ", emotion: "enthousiaste", text: "يَا لَهَا مِنْ رِحْلَةٍ! غَطَّيْنَا كُلَّ شَيْءٍ مِنَ التَّشْرِيحِ إِلَى الصَّيْدَلَةِ." },
            { speaker: "نَبِيلْ", emotion: "motivant", text: "الْآنَ لَدَيْكُمْ الْمَفَاتِيحُ لِلتَّوَاصُلِ مَعَ مَلَايِينِ الْمَرْضَى." },
            { speaker: "أَسْمَاءْ", emotion: "call_to_action", text: "لَا تَتَوَقَّفُوا هُنَا. الْمُمَارَسَةُ هِيَ السِّرُّ." },
            { speaker: "نَبِيلْ", emotion: "coach", text: "تَذَكَّرُوا، اللُّغَةُ لَيْسَتْ مُجَرَّدَ كَلِمَاتٍ، بَلْ هِيَ رِعَايَةٌ وَإِنْسَانِيَّةٌ." }
          ]
        }
      }]
    }
  ]
};

// Helper to get all courses content by ID
const courseContentMap: Record<number, CourseContent> = {
  25: medicalSpanishCourse,
};

export function getCourseContent(courseId: number): CourseContent | null {
  return courseContentMap[courseId] || null;
}

// Calculate total slide count for any course content
export function getTotalSlideCount(content: CourseContent): number {
  return content.modules.reduce((sum, mod) => sum + mod.slides.length, 0);
}

// Build a flat list of all slides with their module index  
export function getFlatSlides(content: CourseContent): Array<{ slide: Slide; moduleIndex: number; slideIndexInModule: number; audioIndex: number }> {
  const flat: Array<{ slide: Slide; moduleIndex: number; slideIndexInModule: number; audioIndex: number }> = [];
  content.modules.forEach((mod, mi) => {
    mod.slides.forEach((slide, si) => {
      flat.push({
        slide,
        moduleIndex: mi,
        slideIndexInModule: si,
        audioIndex: mod.audioFileIndex + si,
      });
    });
  });
  return flat;
}
