import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
  description:
    "Conditions générales d'utilisation de la plateforme OOSkills : compte, formations, paiement, remboursement et certificats.",
  alternates: { canonical: "/terms-of-service" },
  openGraph: { url: "/terms-of-service" },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
