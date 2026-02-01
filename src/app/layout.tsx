import { ThemeProvider } from "@/components/ThemeProvider";
import { I18nProvider } from "@/lib/i18n";
import AnimatedBackground from "@/components/AnimatedBackground";
import "./globals.css";

export const metadata = {
  title: "OOSkills - Plateforme E-Learning",
  description: "Développez vos compétences avec OOSkills, la plateforme e-learning de référence en Algérie.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" dir="ltr" suppressHydrationWarning>
      <body className="min-h-screen transition-colors duration-300" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider>
            <AnimatedBackground />
            {children}
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
