"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpIcon as ArrowUp } from "@heroicons/react/24/outline";

import { useTranslations } from "@/lib/i18n";

export default function Footer() {
  const t = useTranslations("footer");

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-oxford text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/images/logo/logo_DarkMood2.png"
                alt="OOSkills"
                width={250}
                height={70}
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-sm text-white/70 leading-relaxed max-w-md">
              {t("description")}
            </p>
          </div>

          {/* Site links — every entry leads to a real page or section */}
          <nav aria-label="OOSkills">
            <h4 className="text-sm font-semibold mb-5">OOSkills</h4>
            <ul className="space-y-3">
              {[
                { href: "/courses", key: "catalog" },
                { href: "/#faq", key: "faq" },
                { href: "/#contact", key: "contact" },
              ].map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-gold transition-colors"
                  >
                    {t(`links.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal links */}
          <nav aria-label={t("links.resources")}>
            <h4 className="text-sm font-semibold mb-5">
              {t("links.resources")}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/terms-of-service"
                  className="text-sm text-white/70 hover:text-gold transition-colors"
                >
                  {t("links.terms")}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-sm text-white/70 hover:text-gold transition-colors"
                >
                  {t("links.privacy")}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="container mx-auto px-4 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/70">{t("copyright")}</p>
            <button
              type="button"
              onClick={scrollToTop}
              aria-label={t("links.backToTop")}
              className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center hover:bg-gold hover:text-oxford transition-colors duration-200"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
