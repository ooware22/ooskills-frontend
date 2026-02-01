# OOSkills Landing Page

A professional, minimalistic landing page for the OOSkills e-learning platform built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- 🌓 **Dark/Light Mode** - Theme toggle with system preference detection
- 🌍 **Multilingual** - French (default), English, and Arabic (RTL support)
- 📱 **Responsive Design** - Mobile-first approach
- ⚡ **Performance** - Server-side rendering with Next.js
- 🎨 **Modern Design** - Using OOSkills design system colors

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **i18n**: next-intl
- **Theming**: next-themes
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Navigate to the project directory
cd ooskills-landing

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

## Project Structure

```
ooskills-landing/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── layout.tsx    # Locale-specific layout (RTL support)
│   │   │   └── page.tsx      # Main landing page
│   │   ├── globals.css       # Global styles
│   │   └── layout.tsx        # Root layout
│   ├── components/
│   │   ├── Header.tsx        # Navigation with language/theme switchers
│   │   ├── Hero.tsx          # Hero section with stats
│   │   ├── Features.tsx      # Platform features
│   │   ├── Courses.tsx       # Featured courses
│   │   ├── Testimonials.tsx  # Student testimonials
│   │   ├── FAQ.tsx           # Frequently asked questions
│   │   ├── Contact.tsx       # Contact form (EmailJS ready)
│   │   ├── Footer.tsx        # Footer with links
│   │   └── ThemeProvider.tsx # Theme context provider
│   ├── lib/
│   │   └── utils.ts          # Utility functions
│   ├── i18n.ts               # i18n configuration
│   └── middleware.ts         # Locale routing middleware
├── messages/
│   ├── fr.json               # French translations
│   ├── en.json               # English translations
│   └── ar.json               # Arabic translations
├── tailwind.config.ts        # Tailwind with OOSkills colors
└── next.config.js            # Next.js configuration
```

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Oxford Blue | `#002147` | Primary, headers |
| Oxford Light | `#003366` | Gradients, hovers |
| Gold | `#CFB53B` | CTAs, accents |
| Gold Light | `#E8D48A` | Gold hovers |
| Cream | `#FAF9F6` | Page background |

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Customization

### Adding EmailJS

1. Create an account at [EmailJS](https://www.emailjs.com/)
2. Create a service and template
3. Update the Contact component with your credentials:

```typescript
import emailjs from '@emailjs/browser';

// In handleSubmit:
await emailjs.send(
  'YOUR_SERVICE_ID',
  'YOUR_TEMPLATE_ID', 
  formData,
  'YOUR_PUBLIC_KEY'
);
```

## License

© 2025 OOSkills. All rights reserved.
