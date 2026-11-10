import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catalogue des formations",
  description:
    "Toutes les formations en ligne OOSkills : informatique, bureautique, gestion et développement personnel, en français, en arabe et en anglais.",
  alternates: { canonical: "/courses" },
  openGraph: { url: "/courses" },
};

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
