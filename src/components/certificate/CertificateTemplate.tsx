"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import s from "./Certificate.module.css";

//  Translations -
const translations = {
  en: {
    title: "Certificate",
    subtitle: "of Completion",
    preamble: "This is to certify that",
    hasCompleted: "has successfully completed the course",
    duration: "Duration",
    modules: "Modules",
    level: "Level",
    issuedOn: "Issued on",
    scanVerify: "Scan to verify",
    certIdLabel: "Certificate ID",
    signatureTitle: "Training Platform",
    downloadPdf: "Download PDF",
    copyLink: "Copy Link",
    toastCopy: "\uD83D\uDD17 Verification link copied!",
    themeLight: "Light mode",
    themeDark: "Dark mode",
  },
  fr: {
    title: "Certificat",
    subtitle: "de R\u00E9ussite",
    preamble: "Ceci certifie que",
    hasCompleted: "a compl\u00E9t\u00E9 avec succ\u00E8s la formation",
    duration: "Dur\u00E9e",
    modules: "Modules",
    level: "Niveau",
    issuedOn: "D\u00E9livr\u00E9 le",
    scanVerify: "Scanner pour v\u00E9rifier",
    certIdLabel: "ID du Certificat",
    signatureTitle: "Plateforme de Formation",
    downloadPdf: "T\u00E9l\u00E9charger PDF",
    copyLink: "Copier le lien",
    toastCopy: "\uD83D\uDD17 Lien de v\u00E9rification copi\u00E9 !",
    themeLight: "Mode clair",
    themeDark: "Mode sombre",
  },
  ar: {
    title: "\u0634\u0647\u0627\u062F\u0629",
    subtitle: "\u0625\u062A\u0645\u0627\u0645 \u0628\u0646\u062C\u0627\u062D",
    preamble: "\u0646\u0634\u0647\u062F \u0628\u0623\u0646",
    hasCompleted: "\u0642\u062F \u0623\u062A\u0645\u0651 \u0628\u0646\u062C\u0627\u062D \u0627\u0644\u062F\u0648\u0631\u0629 \u0627\u0644\u062A\u062F\u0631\u064A\u0628\u064A\u0629",
    duration: "\u0627\u0644\u0645\u062F\u0629",
    modules: "\u0627\u0644\u0648\u062D\u062F\u0627\u062A",
    level: "\u0627\u0644\u0645\u0633\u062A\u0648\u0649",
    issuedOn: "\u0635\u062F\u0631\u062A \u0628\u062A\u0627\u0631\u064A\u062E",
    scanVerify: "\u0627\u0645\u0633\u062D \u0644\u0644\u062A\u062D\u0642\u0642",
    certIdLabel: "\u0631\u0642\u0645 \u0627\u0644\u0634\u0647\u0627\u062F\u0629",
    signatureTitle: "\u0645\u0646\u0635\u0629 \u0627\u0644\u062A\u062F\u0631\u064A\u0628",
    downloadPdf: "\u062A\u062D\u0645\u064A\u0644 PDF",
    copyLink: "\u0646\u0633\u062E \u0627\u0644\u0631\u0627\u0628\u0637",
    toastCopy: "\uD83D\uDD17 \u062A\u0645 \u0646\u0633\u062E \u0631\u0627\u0628\u0637 \u0627\u0644\u062A\u062D\u0642\u0642!",
    themeLight: "\u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u0641\u0627\u062A\u062D",
    themeDark: "\u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u062F\u0627\u0643\u0646",
  },
} as const;

type Lang = keyof typeof translations;

//  Types 
export interface CertificateData {
  code: string;
  studentName: string;
  courseName: string;
  duration?: string;
  modules?: string;
  level?: string;
  issuedAt: string;
  score?: number;
}

//  Icons (inline SVGs) -
const ClockIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const BookIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const CapIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15v-3.572a48.353 48.353 0 0110.5 0V15" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const LinkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

//  Helpers 
const dateLocales: Record<Lang, string> = {
  en: "en-US",
  fr: "fr-FR",
  ar: "ar-SA",
};

function formatDate(iso: string, locale: string) {
  try {
    return new Date(iso).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

// 
//  CertificateTemplate Component
// 
export default function CertificateTemplate({
  data,
}: {
  data: CertificateData;
}) {
  const { theme, setTheme } = useTheme();
  const [lang, setLang] = useState<Lang>("en");
  const [toast, setToast] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const t = translations[lang];
  const isRtl = lang === "ar";
  const isDark = mounted && theme === "dark";

  const verifyUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/verify/${data.code}`
      : `https://ooskills.com/verify/${data.code}`;

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(verifyUrl)}&margin=0`;

  const logoSrc = isDark
    ? "/images/logo/logo_DarkMood2.png"
    : "/images/logo/logo_LightMood2.png";

  //  Toast helper 
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }, []);

  //  Copy link 
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(verifyUrl);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = verifyUrl;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    showToast(t.toastCopy);
    setTimeout(() => setCopied(false), 2000);
  };

  //  Download PDF 
  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf()
        .set({
          margin: 0,
          filename: `OOSkills_Certificate_${data.studentName.replace(/\s+/g, "_")}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
            logging: false,
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
        })
        .from(cardRef.current)
        .save();
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={s.certificateRoot} dir={isRtl ? "rtl" : "ltr"}>
      <div className={s.pageWrapper}>
        {/*  Certificate Card  */}
        <div className={s.certificateCard} ref={cardRef}>
          <div className={s.certificateBorder}>
            <div className={s.certificateInner}>
              <div className={s.certificateContent}>
                {/* Corner ornaments */}
                <div className={s.cornerBl} />
                <div className={s.cornerBr} />

                {/* Watermark */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/logo/logo_icon2.png"
                  alt=""
                  className={s.watermark}
                  aria-hidden="true"
                />

                {/* Header */}
                <div className={s.certHeader}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoSrc} alt="OOSkills Logo" className={s.certLogo} />
                  <h1 className={s.certTitle}>{t.title}</h1>
                  <p className={s.certSubtitle}>{t.subtitle}</p>
                </div>

                <div className={s.goldDivider} />

                {/* Body */}
                <div className={s.certBody}>
                  <p className={s.certPreamble}>{t.preamble}</p>
                  <h2 className={s.certStudentName}>{data.studentName}</h2>
                  <p className={s.certHasCompleted}>{t.hasCompleted}</p>
                  <h3 className={s.certCourseName}>{data.courseName}</h3>

                  <div className={s.certDetails}>
                    {data.duration && (
                      <div className={s.detailItem}>
                        <span className={s.detailIcon}><ClockIcon /></span>
                        <span className={s.detailValue}>{data.duration}</span>
                        <span className={s.detailLabel}>{t.duration}</span>
                      </div>
                    )}
                    {data.modules && (
                      <div className={s.detailItem}>
                        <span className={s.detailIcon}><BookIcon /></span>
                        <span className={s.detailValue}>{data.modules}</span>
                        <span className={s.detailLabel}>{t.modules}</span>
                      </div>
                    )}
                    {data.level && (
                      <div className={s.detailItem}>
                        <span className={s.detailIcon}><CapIcon /></span>
                        <span className={s.detailValue}>{data.level}</span>
                        <span className={s.detailLabel}>{t.level}</span>
                      </div>
                    )}
                  </div>

                  <p className={s.certDate}>
                    {t.issuedOn}{" "}
                    <strong>{formatDate(data.issuedAt, dateLocales[lang])}</strong>
                  </p>
                </div>

                <div className={s.goldDivider} />

                {/* Footer */}
                <div className={s.certFooter}>
                  <div className={s.certSignature}>
                    <span className={s.signatureName}>OOSkills</span>
                    <span className={s.signatureTitle}>{t.signatureTitle}</span>
                  </div>

                  <div className={s.certQrSection}>
                    <div className={s.qrWrapper}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qrSrc} alt="Verification QR Code" width={90} height={90} />
                    </div>
                    <span className={s.qrLabel}>{t.scanVerify}</span>
                  </div>

                  <div className={s.certIdSection}>
                    <div className={s.certIdLabel}>{t.certIdLabel}</div>
                    <div className={s.certIdValue}>{data.code}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/*  Floating Toolbar  */}
        <div className={s.toolbar}>
          {/* Language switcher */}
          <div className={s.langGroup}>
            {(["en", "fr", "ar"] as Lang[]).map((l) => (
              <button
                key={l}
                className={`${s.langBtn} ${lang === l ? s.langBtnActive : ""}`}
                onClick={() => setLang(l)}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          <div className={s.toolbarDivider} />

          {/* Theme toggle */}
          {mounted && (
            <button
              className={`${s.toolBtn} ${isDark ? s.toolBtnActive : ""}`}
              onClick={() => setTheme(isDark ? "light" : "dark")}
              data-tooltip={isDark ? t.themeLight : t.themeDark}
              aria-label="Toggle theme"
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
          )}

          <div className={s.toolbarDivider} />

          {/* Download PDF */}
          <button
            className={s.toolBtn}
            onClick={handleDownload}
            disabled={downloading}
            data-tooltip={t.downloadPdf}
            aria-label="Download PDF"
          >
            <span className={downloading ? s.spinning : ""}>
              <DownloadIcon />
            </span>
          </button>

          {/* Copy link */}
          <button
            className={`${s.toolBtn} ${copied ? s.copiedBtn : ""}`}
            onClick={handleCopy}
            data-tooltip={t.copyLink}
            aria-label="Copy link"
          >
            {copied ? <CheckIcon /> : <LinkIcon />}
          </button>
        </div>
      </div>

      {/*  Toast  */}
      <div className={`${s.toast} ${toast ? s.toastShow : ""}`}>{toast}</div>
    </div>
  );
}
