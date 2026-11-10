import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui/Toast";

// Sign-in, sign-up and password pages: useful to visitors, useless in search
// results (robots.txt already keeps crawlers out of /auth/).
export const metadata: Metadata = {
  title: "Mon compte",
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ToastProvider>{children}</ToastProvider>;
}
