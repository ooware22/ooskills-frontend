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
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
