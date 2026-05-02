import { ThemeProvider } from "@/components/ThemeProvider";
import { I18nProvider } from "@/lib/i18n";
import { ReduxProvider } from "@/store/provider";
import dynamic from "next/dynamic";
import "./globals.css";

// Lazy load non-critical layout components
const AnimatedBackground = dynamic(() => import("@/components/AnimatedBackground"));
const ServerWakeUp = dynamic(() => import("@/components/ServerWakeUp"));
const GamificationOverlays = dynamic(() => import("@/components/GamificationOverlays"));

export const metadata = {
  title: "Skills - Plateforme E-Learning",
  description:
    "Développez vos compétences avec OOSkills, la plateforme e-learning de référence en Algérie.",
  icons: {
    icon: "/images/logo/favicon.png",
    apple: "/images/logo/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" dir="ltr" suppressHydrationWarning>
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

