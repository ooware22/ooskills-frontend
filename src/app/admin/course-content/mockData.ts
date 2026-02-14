import type { AdminSection } from "./types";

export const MOCK_SECTIONS: AdminSection[] = [
  {
    id: "be66c5c7-f8ea-4e25-a46d-629ff4ed3779",
    title: "Teaser — الإِسْبَانِيَّةُ الطِّبِّيَّةُ",
    type: "teaser",
    sequence: 1,
    audioFileIndex: 1,
    lessons: 1,
    duration: "1min",
    lessons_list: [
      {
        id: "294e5fef-9a98-4305-a0bb-b59c9fd1c76f",
        title: "Teaser — الإِسْبَانِيَّةُ الطِّبِّيَّةُ: إِتْقَانُ الْمُصْطَلَحَاتِ",
        type: "slide",
        sequence: 0,
        duration_seconds: 38,
        audioUrl: null,
        content: {
          visual_content: {},
          narration_script: {
            mode: "multi_speaker",
            speakers: [
              { text: "مَرْحَبًا بِكُمْ فِي بَرْنَامَجِكُمُ التَّدْرِيبِيِّ 'Vocabulario Médico'.", emotion: "enthousiaste", speaker: "أَسْمَاءْ" },
              { text: "التَّوَاصُلُ الْفَعَّالُ يُقَلِّلُ الْأَخْطَاءَ الطِّبِّيَّةَ بِنِسْبَةٍ تَصِلُ إِلَى خَمْسِينَ بِالْمِائَةِ.", emotion: "pédagogue", speaker: "نَبِيلْ" },
            ],
          },
        },
        slide_type: "bullet_points",
      },
    ],
    quiz: null,
  },
  {
    id: "4669025c-7cc1-439f-aa9f-ba0c3a8c870c",
    title: "Anatomía & Cuerpo Humano (التَّشْرِيحُ وَجِسْمُ الْإِنْسَانِ)",
    type: "module",
    sequence: 2,
    audioFileIndex: 2,
    lessons: 1,
    duration: "1min",
    lessons_list: [
      {
        id: "982a6f35-f04d-4f60-88b3-293c8c475962",
        title: "الْهَيْكَلُ الْعَامُّ: El Cuerpo",
        type: "audio",
        sequence: 0,
        duration_seconds: 32,
        audioUrl: null,
        content: {
          visual_content: {
            pillars: [
              { icon: "🧠", title: "La Cabeza", description: "الرَّأْسُ" },
              { icon: "🫁", title: "El Tronco", description: "الْجِذْعُ" },
              { icon: "💪", title: "Las Extremidades", description: "الْأَطْرَافُ" },
            ],
          },
          narration_script: {
            mode: "multi_speaker",
            speakers: [
              { text: "دَعِينَا نَتَخَيَّلُ الْجِسْمَ، أَوْ 'El Cuerpo'، كَمَبْنَى مُتَكَامِلٍ.", emotion: "pédagogue", speaker: "نَبِيلْ" },
              { text: "حَسَنًا، 'La Cabeza'. الرَّأْسُ.", emotion: "curieux", speaker: "أَسْمَاءْ" },
            ],
          },
        },
        slide_type: "pillars",
      },
    ],
    quiz: {
      id: "6552fc22-19c6-4f2e-8871-fcc66e428215",
      title: "Quiz — Anatomía & Cuerpo Humano",
      intro_text: "",
      questions: [
        {
          id: "0004fa56-c857-4002-80d4-13a359e77aa1",
          type: "multiple_choice",
          question: "مَا هُوَ الْمُصْطَلَحُ الطِّبِّيُّ لِلْقَلْبِ؟",
          options: ["El Hígado", "El Corazón", "El Pulmón", "El Cerebro"],
          correct_answer: 2,
          explanation: "El Corazón هُوَ الْقَلْبُ.",
          difficulty: "easy",
          category: "general",
        },
      ],
      pass_threshold: 70,
      max_attempts: 3,
      xp_reward: 10,
    },
  },
];
