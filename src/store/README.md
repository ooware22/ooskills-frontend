# Redux Store - Backend Integration Guide

This document explains how to connect the Redux store to the Django backend.

## Overview

The admin panel uses Redux Toolkit for state management. Each section of the landing page has its own slice with:
- **State**: Current content in all 3 languages (FR, EN, AR)
- **Actions**: Synchronous actions for immediate UI updates
- **Thunks**: Async actions with TODO placeholders for API calls

## Quick Start

### 1. Set the API URL

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 2. Update Async Thunks

Each slice in `src/store/slices/` has async thunks ready to be connected. 

**Example - Hero Slice:**

```typescript
// src/store/slices/heroSlice.ts

export const fetchHeroContent = createAsyncThunk(
  "hero/fetchContent",
  async (_, { rejectWithValue }) => {
    try {
      // Replace this:
      // await new Promise((resolve) => setTimeout(resolve, 500));
      // return defaultContent;
      
      // With this:
      const response = await api.get(ENDPOINTS.hero.getAll());
      return response;
    } catch (error) {
      return rejectWithValue("Failed to fetch hero content");
    }
  }
);

export const saveHeroContent = createAsyncThunk(
  "hero/saveContent",
  async ({ locale, content }, { rejectWithValue }) => {
    try {
      // Replace this:
      // await new Promise((resolve) => setTimeout(resolve, 1000));
      // console.log(`[API] Saving hero content for ${locale}:`, content);
      // return { locale, content };
      
      // With this:
      const response = await api.put(ENDPOINTS.hero.update(locale), content);
      return { locale, content: response };
    } catch (error) {
      return rejectWithValue("Failed to save hero content");
    }
  }
);
```

## File Structure

```
src/
├── store/
│   ├── index.ts           # Store configuration
│   ├── hooks.ts           # Typed hooks (useAppDispatch, useAppSelector)
│   ├── provider.tsx       # Redux Provider for Next.js
│   ├── exports.ts         # Central exports for all modules
│   └── slices/
│       ├── heroSlice.ts       # Hero section state
│       ├── countdownSlice.ts  # Countdown section state
│       ├── featuresSlice.ts   # Features section state
│       ├── coursesSlice.ts    # Courses section state
│       ├── faqSlice.ts        # FAQ section state
│       └── contactSlice.ts    # Contact section state
│
└── services/
    └── api.ts             # API endpoints & helper functions
```

## API Endpoints Expected

The `src/services/api.ts` file defines all expected endpoints:

### Hero
- `GET /api/admin/hero/` - Get all hero content
- `GET /api/admin/hero/:locale/` - Get hero content for locale
- `PUT /api/admin/hero/:locale/` - Update hero content for locale

### Countdown
- `GET /api/admin/countdown/` - Get all countdown content
- `GET /api/admin/countdown/:locale/` - Get countdown for locale
- `PUT /api/admin/countdown/:locale/` - Update countdown for locale
- `PUT /api/admin/countdown/settings/` - Update shared settings

### Features
- `GET /api/admin/features/` - Get all features content
- `GET /api/admin/features/:locale/` - Get features for locale
- `PUT /api/admin/features/:locale/` - Update features for locale
- `POST /api/admin/features/:locale/items/` - Add feature
- `PUT /api/admin/features/:locale/items/:id/` - Update feature
- `DELETE /api/admin/features/:locale/items/:id/` - Delete feature

### Courses
- `GET /api/admin/courses/` - Get all courses content
- `GET /api/admin/courses/:locale/` - Get courses for locale
- `PUT /api/admin/courses/:locale/` - Update courses for locale
- `POST /api/admin/courses/:locale/items/` - Add course
- `PUT /api/admin/courses/:locale/items/:id/` - Update course
- `DELETE /api/admin/courses/:locale/items/:id/` - Delete course

### FAQ
- `GET /api/admin/faq/` - Get all FAQ content
- `GET /api/admin/faq/:locale/` - Get FAQ for locale
- `PUT /api/admin/faq/:locale/` - Update FAQ for locale
- `POST /api/admin/faq/:locale/items/` - Add FAQ item
- `PUT /api/admin/faq/:locale/items/:id/` - Update FAQ item
- `DELETE /api/admin/faq/:locale/items/:id/` - Delete FAQ item

### Contact
- `GET /api/admin/contact/` - Get all contact content
- `GET /api/admin/contact/form-labels/:locale/` - Get form labels for locale
- `PUT /api/admin/contact/form-labels/:locale/` - Update form labels
- `GET /api/admin/contact/info/` - Get contact info
- `PUT /api/admin/contact/info/` - Update contact info
- `GET /api/admin/contact/social/` - Get social links
- `PUT /api/admin/contact/social/` - Update social links

### Auth
- `POST /api/auth/login/` - Login
- `POST /api/auth/logout/` - Logout
- `POST /api/auth/refresh/` - Refresh token
- `GET /api/auth/me/` - Get current user

## Data Structures

### Hero Content (per locale)
```json
{
  "badge": "string",
  "title": "string",
  "titleHighlight": "string",
  "subtitle": "string",
  "ctaPrimary": "string",
  "ctaSecondary": "string",
  "illustrationTitle": "string",
  "illustrationSubtitle": "string"
}
```

### Countdown Content (per locale)
```json
{
  "title": "string",
  "subtitle": "string",
  "ctaText": "string"
}
```

### Countdown Settings (shared)
```json
{
  "launchDate": "YYYY-MM-DD",
  "launchTime": "HH:MM",
  "isActive": true
}
```

### Feature Item
```json
{
  "id": "string",
  "icon": "string",
  "title": "string",
  "description": "string"
}
```

### Course Item
```json
{
  "id": "string",
  "image": "string (URL)",
  "title": "string",
  "category": "string",
  "duration": "string",
  "level": "string"
}
```

### FAQ Item
```json
{
  "id": "string",
  "question": "string",
  "answer": "string",
  "isOpen": true
}
```

### Contact Info (shared)
```json
{
  "email": "string",
  "phone": "string",
  "address": "string"
}
```

### Social Links (shared)
```json
{
  "facebook": "string (URL)",
  "instagram": "string (URL)",
  "linkedin": "string (URL)",
  "twitter": "string (URL)",
  "youtube": "string (URL)"
}
```

## Authentication

The API helper automatically includes the auth token from localStorage:

```typescript
// Token is automatically added to requests
const token = localStorage.getItem("auth_token");
headers["Authorization"] = `Bearer ${token}`;
```

Make sure your Django backend returns a JWT token on login and validates it on protected endpoints.

## Usage in Components

Components can use Redux hooks to access and update state:

```tsx
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchHeroContent, saveHeroContent, updateHeroContent } from "@/store/slices/heroSlice";

function HeroAdmin() {
  const dispatch = useAppDispatch();
  const { content, loading, saving, error } = useAppSelector((state) => state.hero);
  
  // Fetch on mount
  useEffect(() => {
    dispatch(fetchHeroContent());
  }, [dispatch]);
  
  // Update local state
  const handleChange = (field: string, value: string) => {
    dispatch(updateHeroContent({ locale: "fr", updates: { [field]: value } }));
  };
  
  // Save to backend
  const handleSave = () => {
    dispatch(saveHeroContent({ locale: "fr", content: content.fr }));
  };
}
```

## Questions?

Contact the frontend team if you need clarification on any data structures or endpoints.
