import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Comment OOSkills collecte, utilise et protège vos données personnelles, et comment exercer vos droits.",
  alternates: { canonical: "/privacy-policy" },
  openGraph: { url: "/privacy-policy" },
};

export default function PrivacyPolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
