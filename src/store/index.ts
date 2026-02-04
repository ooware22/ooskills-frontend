import { configureStore } from "@reduxjs/toolkit";
import heroReducer from "./slices/heroSlice";
import countdownReducer from "./slices/countdownSlice";
import featuresReducer from "./slices/featuresSlice";
import coursesReducer from "./slices/coursesSlice";
import faqReducer from "./slices/faqSlice";
import contactReducer from "./slices/contactSlice";

export const store = configureStore({
  reducer: {
    hero: heroReducer,
    countdown: countdownReducer,
    features: featuresReducer,
    courses: coursesReducer,
    faq: faqReducer,
    contact: contactReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
