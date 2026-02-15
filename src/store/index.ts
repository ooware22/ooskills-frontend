import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import heroReducer from "./slices/heroSlice";
import countdownReducer from "./slices/countdownSlice";
import featuresReducer from "./slices/featuresSlice";
import coursesReducer from "./slices/coursesSlice";
import faqReducer from "./slices/faqSlice";
import contactReducer from "./slices/contactSlice";
import partnersReducer from "./slices/partnersSlice";
import testimonialsReducer from "./slices/testimonialsSlice";
import siteSettingsReducer from "./slices/siteSettingsSlice";
import dashboardReducer from "./slices/dashboardSlice";
import usersReducer from "./slices/usersSlice";
import adminCategoriesReducer from "./slices/adminCategoriesSlice";
import adminCoursesManagementReducer from "./slices/adminCoursesManagementSlice";
import adminCourseContentReducer from "./slices/adminCourseContentSlice";
import enrollmentReducer from "./slices/enrollmentSlice";
import publicCoursesReducer from "./slices/publicCoursesSlice";

export const store = configureStore({
  reducer: {
    // Authentication
    auth: authReducer,
    // Dashboard
    dashboard: dashboardReducer,
    // Content sections with backend integration
    hero: heroReducer,
    features: featuresReducer,
    faq: faqReducer,
    partners: partnersReducer,
    testimonials: testimonialsReducer,
    siteSettings: siteSettingsReducer,

    // Frontend-only sections (no backend match)
    countdown: countdownReducer,
    courses: coursesReducer,
    contact: contactReducer,

    // Admin user management
    adminUsers: usersReducer,

    // Admin course & category management
    adminCategories: adminCategoriesReducer,
    adminCoursesManagement: adminCoursesManagementReducer,
    adminCourseContent: adminCourseContentReducer,

    // Student enrollment
    enrollment: enrollmentReducer,

    // Public course browsing
    publicCourses: publicCoursesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
