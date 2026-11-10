import { ThemeProvider } from "@/components/ThemeProvider";
import { I18nProvider } from "@/lib/i18n";
import { LOCALE_STORAGE_KEY, dirOf, resolveLocale } from "@/lib/locale";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { ReduxProvider } from "@/store/provider";
import PromotionalBanner from "@/components/PromotionalBanner";
import dynamic from "next/dynamic";
import "./globals.css";

// Lazy load non-critical layout components
const AnimatedBackground = dynamic(() => import("@/components/AnimatedBackground"));
const ServerWakeUp = dynamic(() => import("@/components/ServerWakeUp"));
const GamificationOverlays = dynamic(() => import("@/components/GamificationOverlays"));

import { cookies, headers } from "next/headers";
import type { Metadata } from "next";

const DEFAULT_TITLE = "OOSkills – Formations en ligne en Algérie";
const DEFAULT_DESCRIPTION =
  "OOSkills est une plateforme algérienne de formation en ligne, en français, en arabe et en anglais : cours, quiz et certificats de réussite vérifiables, accessibles depuis votre téléphone ou votre ordinateur.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/images/logo/favicon.png", type: "image/png" },
    ],
    apple: "/images/logo/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "fr_DZ",
    alternateLocale: ["ar_DZ", "en_US"],
    // "./" = the address of the page being rendered, not always the homepage.
    url: "./",
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    // The image itself comes from app/opengraph-image.tsx (1200x630).
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
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
    // Self-referencing canonical on every page. (It used to be the homepage
    // URL for the whole site, which asked search engines to drop every other
    // page.)
    canonical: "./",
  },
  verification: {
    google: "7BStn3aHavKARXTVciGMScdn7u8b_v0AH8_2Zfzv_Ds",
  },
  category: "education",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const cookieStore = await cookies();

  // The language is decided on the server, so the very first HTML already
  // carries the right text, <html lang> and direction (no client-side flash).
  const locale = resolveLocale(
    cookieStore.get(LOCALE_STORAGE_KEY)?.value,
    headersList.get("accept-language"),
  );
  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <html lang={locale} dir={dirOf(locale)} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": ["Organization", "EducationalOrganization"],
                  "@id": `${SITE_URL}/#organization`,
                  name: SITE_NAME,
                  url: SITE_URL,
                  logo: {
                    "@type": "ImageObject",
                    url: `${SITE_URL}/images/logo/logo_LightMood2.png`,
                  },
                  description: DEFAULT_DESCRIPTION,
                  areaServed: {
                    "@type": "Country",
                    name: "Algeria",
                  },
                },
                {
                  "@type": "WebSite",
                  "@id": `${SITE_URL}/#website`,
                  url: SITE_URL,
                  name: SITE_NAME,
                  publisher: { "@id": `${SITE_URL}/#organization` },
                  inLanguage: ["fr", "ar", "en"],
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
            nonce={headersList.get("x-nonce") || undefined}
          >
            <I18nProvider initialLocale={locale} initialMessages={messages}>
              <PromotionalBanner />
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
