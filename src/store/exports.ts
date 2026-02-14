// =============================================================================
// STORE EXPORTS
// =============================================================================

export { store } from "./index";
export type { RootState, AppDispatch } from "./index";
export { useAppDispatch, useAppSelector } from "./hooks";
export { ReduxProvider } from "./provider";

// =============================================================================
// AUTH SLICE EXPORTS
// =============================================================================

export {
  default as authReducer,
  initializeAuth,
  login,
  register,
  logout,
  refreshProfile,
  setCredentials,
  clearCredentials,
  clearError as clearAuthError,
  updateUser,
  // Selectors
  selectAuthState,
  selectUser,
  selectIsAuthenticated,
  selectIsInitialized,
  selectAuthLoading,
  selectAuthError,
  selectUserRole,
  selectIsAdmin,
} from "./slices/authSlice";
export type { AuthState } from "@/types/auth";

// =============================================================================
// HERO SLICE EXPORTS
// =============================================================================

export {
  default as heroReducer,
  fetchHeroContent,
  saveHeroContent,
  updateHeroField,
  updateHeroContent,
  resetHeroContent,
  resetAllHeroContent,
  clearError as clearHeroError,
  invalidateCache as invalidateHeroCache,
  // Selectors
  selectHeroState,
  selectHeroContent,
  selectActiveHero,
  selectHeroLoading,
  selectHeroSaving,
  selectHeroError,
} from "./slices/heroSlice";
export type { HeroContent, HeroState } from "./slices/heroSlice";

// =============================================================================
// COUNTDOWN SLICE EXPORTS (No backend integration)
// =============================================================================

export {
  default as countdownReducer,
  fetchCountdownContent,
  saveCountdownContent,
  updateCountdownContent,
  updateCountdownSettings,
  resetCountdownContent,
} from "./slices/countdownSlice";
export type { CountdownContent, CountdownSettings, CountdownState } from "./slices/countdownSlice";

// =============================================================================
// FEATURES SLICE EXPORTS
// =============================================================================

export {
  default as featuresReducer,
  fetchFeaturesContent,
  saveFeaturesSection,
  createFeatureItem,
  updateFeatureItem,
  deleteFeatureItem,
  reorderFeatureItems,
  updateFeaturesSection,
  addFeature,
  updateFeature,
  removeFeature,
  resetFeaturesContent,
  clearError as clearFeaturesError,
  invalidateCache as invalidateFeaturesCache,
  // Selectors
  selectFeaturesState,
  selectFeaturesContent,
  selectActiveSection,
  selectFeaturesLoading,
  selectFeaturesSaving,
  selectFeaturesError,
} from "./slices/featuresSlice";
export type { Feature, FeaturesContent, FeaturesState } from "./slices/featuresSlice";

// =============================================================================
// COURSES SLICE EXPORTS (No backend integration)
// =============================================================================

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

// =============================================================================
// FAQ SLICE EXPORTS
// =============================================================================

export {
  default as faqReducer,
  fetchFAQContent,
  saveFAQContent,
  saveFAQSection,
  createFAQItem,
  updateFAQItem,
  deleteFAQItem,
  reorderFAQItems,
  updateFAQSection,
  addFAQ,
  updateFAQ,
  removeFAQ,
  toggleFAQ,
  resetFAQContent,
  clearError as clearFAQError,
  invalidateCache as invalidateFAQCache,
  // Selectors
  selectFAQState,
  selectFAQContent,
  selectFAQItems,
  selectFAQLoading,
  selectFAQSaving,
  selectFAQError,
} from "./slices/faqSlice";
export type { FAQ, FAQContent, FAQState } from "./slices/faqSlice";

// =============================================================================
// CONTACT SLICE EXPORTS (No backend integration)
// =============================================================================

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

// =============================================================================
// PARTNERS SLICE EXPORTS (NEW)
// =============================================================================

export {
  default as partnersReducer,
  fetchPartners,
  createPartner,
  updatePartner,
  deletePartner,
  reorderPartners,
  clearError as clearPartnersError,
  invalidateCache as invalidatePartnersCache,
  // Selectors
  selectPartnersState,
  selectPartners,
  selectPartnersRaw,
  selectPartnersLoading,
  selectPartnersSaving,
  selectPartnersError,
} from "./slices/partnersSlice";
export type { Partner, PartnersState } from "./slices/partnersSlice";

// =============================================================================
// TESTIMONIALS SLICE EXPORTS (NEW)
// =============================================================================

export {
  default as testimonialsReducer,
  fetchTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  reorderTestimonials,
  clearError as clearTestimonialsError,
  invalidateCache as invalidateTestimonialsCache,
  // Selectors
  selectTestimonialsState,
  selectTestimonials,
  selectTestimonialsRaw,
  selectTestimonialsLoading,
  selectTestimonialsSaving,
  selectTestimonialsError,
} from "./slices/testimonialsSlice";
export type { Testimonial, TestimonialsState } from "./slices/testimonialsSlice";

// =============================================================================
// SITE SETTINGS SLICE EXPORTS (NEW)
// =============================================================================

export {
  default as siteSettingsReducer,
  fetchSiteSettings,
  updateSiteSettings,
  updateSettingField,
  clearError as clearSiteSettingsError,
  invalidateCache as invalidateSiteSettingsCache,
  // Selectors
  selectSiteSettingsState,
  selectSiteSettings,
  selectSiteSettingsRaw,
  selectSiteSettingsLoading,
  selectSiteSettingsSaving,
  selectSiteSettingsError,
  selectDefaultLanguage,
  selectMaintenanceMode,
  selectDarkModeEnabled,
} from "./slices/siteSettingsSlice";
export type { SiteSettings, SiteSettingsState } from "./slices/siteSettingsSlice";

// =============================================================================
// COMMON EXPORTS
// =============================================================================

export type { Locale } from "@/types/content";

// =============================================================================
// ADMIN CATEGORIES SLICE EXPORTS
// =============================================================================

export {
  default as adminCategoriesReducer,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  clearError as clearCategoriesError,
} from "./slices/adminCategoriesSlice";

// =============================================================================
// ADMIN COURSES MANAGEMENT SLICE EXPORTS
// =============================================================================

export {
  default as adminCoursesManagementReducer,
  fetchAdminCourses,
  createAdminCourse,
  updateAdminCourse,
  deleteAdminCourse,
  setFilters as setAdminCoursesFilters,
  clearError as clearAdminCoursesError,
} from "./slices/adminCoursesManagementSlice";
