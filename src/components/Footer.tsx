"use client";

import Link from "next/link";
import { GraduationCap, ArrowUp, Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
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
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-oxford" />
              </div>
              <span className="text-lg font-semibold">OOSkills</span>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed mb-6">
              {t("description")}
            </p>
            {/* Social Links */}
            <div className="flex gap-2">
              {[
                { icon: Facebook, href: "#", label: "Facebook" },
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Linkedin, href: "#", label: "LinkedIn" },
                { icon: Twitter, href: "#", label: "Twitter" },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center hover:bg-gold hover:text-oxford transition-colors duration-200"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-semibold mb-5">{t("links.company")}</h4>
            <ul className="space-y-3">
              {["about", "careers", "blog"].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-white/50 hover:text-gold transition-colors"
                  >
                    {t(`links.${link}`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-sm font-semibold mb-5">{t("links.resources")}</h4>
            <ul className="space-y-3">
              {["help", "terms", "privacy"].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-white/50 hover:text-gold transition-colors"
                  >
                    {t(`links.${link}`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-semibold mb-5">{t("newsletter.title")}</h4>
            <p className="text-sm text-white/50 mb-4">{t("newsletter.description")}</p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder={t("newsletter.placeholder")}
                className="flex-1 px-3 py-2 text-sm bg-white/5 rounded-lg border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-gold/50 focus:border-gold"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gold text-oxford text-sm font-medium rounded-lg hover:bg-gold-light transition-colors"
              >
                OK
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="container mx-auto px-4 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/40">{t("copyright")}</p>
            <button
              onClick={scrollToTop}
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
