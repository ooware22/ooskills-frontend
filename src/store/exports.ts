// Store exports
export { store } from "./index";
export type { RootState, AppDispatch } from "./index";
export { useAppDispatch, useAppSelector } from "./hooks";
export { ReduxProvider } from "./provider";

// Hero slice exports
export {
  default as heroReducer,
  fetchHeroContent,
  saveHeroContent,
  updateHeroContent,
  resetHeroContent,
} from "./slices/heroSlice";
export type { HeroContent, HeroState } from "./slices/heroSlice";

// Countdown slice exports
export {
  default as countdownReducer,
  fetchCountdownContent,
  saveCountdownContent,
  updateCountdownContent,
  updateCountdownSettings,
  resetCountdownContent,
} from "./slices/countdownSlice";
export type { CountdownContent, CountdownSettings, CountdownState } from "./slices/countdownSlice";

// Features slice exports
export {
  default as featuresReducer,
  fetchFeaturesContent,
  saveFeaturesContent,
  updateFeaturesSection,
  addFeature,
  updateFeature,
  removeFeature,
  resetFeaturesContent,
} from "./slices/featuresSlice";
export type { Feature, FeaturesContent, FeaturesState } from "./slices/featuresSlice";

// Courses slice exports
export {
  default as coursesReducer,
  fetchCoursesContent,
  saveCoursesContent,
  updateCoursesSection,
  addCourse,
  updateCourse,
  removeCourse,
  resetCoursesContent,
} from "./slices/coursesSlice";
export type { Course, CoursesContent, CoursesState } from "./slices/coursesSlice";

// FAQ slice exports
export {
  default as faqReducer,
  fetchFAQContent,
  saveFAQContent,
  updateFAQSection,
  addFAQ,
  updateFAQ,
  removeFAQ,
  toggleFAQ,
  resetFAQContent,
} from "./slices/faqSlice";
export type { FAQ, FAQContent, FAQState } from "./slices/faqSlice";

// Contact slice exports
export {
  default as contactReducer,
  fetchContactContent,
  saveContactContent,
  updateFormLabels,
  updateContactInfo,
  updateSocialLinks,
  resetContactContent,
  resetContactInfo,
  resetSocialLinks,
} from "./slices/contactSlice";
export type { ContactFormLabels, ContactInfo, SocialLinks, ContactContent, ContactState } from "./slices/contactSlice";
