import { ThemeProvider } from "@/components/ThemeProvider";
import { I18nProvider } from "@/lib/i18n";
import { ReduxProvider } from "@/store/provider";
import dynamic from "next/dynamic";
import "./globals.css";

// Lazy load non-critical layout components
const AnimatedBackground = dynamic(() => import("@/components/AnimatedBackground"));
const ServerWakeUp = dynamic(() => import("@/components/ServerWakeUp"));
const GamificationOverlays = dynamic(() => import("@/components/GamificationOverlays"));

import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://ooskills.com"),
  title: {
    default: "OOSkills – Plateforme E-Learning N°1 en Algérie | Développez vos Compétences",
    template: "%s | OOSkills",
  },
  description:
    "OOSkills est la plateforme e-learning de référence en Algérie. Développez vos compétences en informatique, business, design et plus. Cours en ligne, certificats reconnus, formation professionnelle accessible à tous les Algériens.",
  keywords: [
    // Primary - Arabic/French Algeria keywords
    "e-learning Algérie",
    "formation en ligne Algérie",
    "plateforme e-learning algérienne",
    "cours en ligne Algérie",
    "compétences Algérie",
    "skills Algeria",
    "تعلم عن بعد الجزائر",
    "تكوين عن بعد",
    // Skills & Training
    "développement compétences",
    "formation professionnelle Algérie",
    "formation à distance",
    "apprentissage en ligne",
    "certificat en ligne",
    "cours certifiants",
    // Domains
    "informatique Algérie",
    "programmation Algérie",
    "développement web Algérie",
    "marketing digital Algérie",
    "design graphique Algérie",
    "business Algérie",
    // English keywords
    "online courses Algeria",
    "e-learning platform Algeria",
    "learn skills online Algeria",
    "professional training Algeria",
    "OOSkills",
    "ooskills.com",
  ],
  authors: [{ name: "OOSkills", url: "https://ooskills.com" }],
  creator: "OOSkills",
  publisher: "OOSkills",
  icons: {
    icon: "/images/logo/favicon.png",
    apple: "/images/logo/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "fr_DZ",
    alternateLocale: ["ar_DZ", "en_US"],
    url: "https://ooskills.com",
    siteName: "OOSkills",
    title: "OOSkills – Plateforme E-Learning N°1 en Algérie",
    description:
      "Développez vos compétences avec OOSkills. Cours en ligne, certificats reconnus, et formation professionnelle accessible à tous en Algérie.",
    images: [
      {
        url: "/images/logo/logo_LightMood2.png",
        width: 1200,
        height: 630,
        alt: "OOSkills - Plateforme E-Learning Algérie",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OOSkills – Plateforme E-Learning N°1 en Algérie",
    description:
      "Développez vos compétences avec OOSkills. Cours en ligne et certificats reconnus en Algérie.",
    images: ["/images/logo/logo_LightMood2.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://ooskills.com",
  },
  verification: {
    // Add your Google Search Console verification code here
    // google: "YOUR_GOOGLE_VERIFICATION_CODE",
    google : '7BStn3aHavKARXTVciGMScdn7u8b_v0AH8_2Zfzv_Ds'
  },
  category: "education",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" dir="ltr" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": ["Organization", "EducationalOrganization"],
                  "@id": "https://ooskills.com/#organization",
                  name: "OOSkills",
                  url: "https://ooskills.com",
                  logo: {
                    "@type": "ImageObject",
                    url: "https://ooskills.com/images/logo/logo_LightMood2.png",
                  },
                  description:
                    "Plateforme e-learning N°1 en Algérie. Cours en ligne, certificats reconnus, formation professionnelle.",
                  areaServed: {
                    "@type": "Country",
                    name: "Algeria",
                  },
                  sameAs: [],
                },
                {
                  "@type": "WebSite",
                  "@id": "https://ooskills.com/#website",
                  url: "https://ooskills.com",
                  name: "OOSkills",
                  publisher: { "@id": "https://ooskills.com/#organization" },
                  inLanguage: ["fr", "ar", "en"],
                  potentialAction: {
                    "@type": "SearchAction",
                    target: {
                      "@type": "EntryPoint",
                      urlTemplate:
                        "https://ooskills.com/courses?search={search_term_string}",
                    },
                    "query-input": "required name=search_term_string",
                  },
                },
                {
                  "@type": "WebPage",
                  "@id": "https://ooskills.com/#webpage",
                  url: "https://ooskills.com",
                  name: "OOSkills – Plateforme E-Learning N°1 en Algérie",
                  isPartOf: { "@id": "https://ooskills.com/#website" },
                  about: { "@id": "https://ooskills.com/#organization" },
                  description:
                    "Développez vos compétences en informatique, business, design et plus avec OOSkills. La plateforme e-learning de référence en Algérie.",
                  inLanguage: "fr",
                },
              ],
            }),
          }}
        />
      </head>
      <body
        className="min-h-screen transition-colors duration-300"
        suppressHydrationWarning
      >
        <ReduxProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <I18nProvider>
              <ServerWakeUp />
              <AnimatedBackground />
              <GamificationOverlays />
              {children}
            </I18nProvider>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}

