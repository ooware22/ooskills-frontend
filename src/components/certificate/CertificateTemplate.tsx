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
    score: "Score",
    downloadPdf: "Download PDF",
    copyLink: "Copy Link",
    toastCopy: "\uD83D\uDD17 Verification link copied!",
    themeLight: "Light mode",
    themeDark: "Dark mode",
    close: "Close",
    disclaimerTitle: "DISCLAIMER",
    disclaimerText:
      "This badge reflects the candidate's self-assessment. OOSkills Academy does not certify the skills listed herein and disclaims all liability regarding the accuracy of declared results.",
  },
  fr: {
    title: "Certificat",
    subtitle: "de Réussite",
    preamble: "Ceci certifie que",
    hasCompleted: "a complété avec succès la formation",
    duration: "Durée",
    modules: "Modules",
    level: "Niveau",
    issuedOn: "Délivré le",
    scanVerify: "Scanner pour vérifier",
    certIdLabel: "ID du Certificat",
    signatureTitle: "Plateforme de Formation",
    score: "Note",
    downloadPdf: "Télécharger PDF",
    copyLink: "Copier le lien",
    toastCopy: "🔗 Lien de vérification copié !",
    themeLight: "Mode clair",
    themeDark: "Mode sombre",
    close: "Fermer",
    disclaimerTitle: "CLAUSE DE NON-RESPONSABILITÉ",
    disclaimerText:
      "Ce badge reflète une auto-évaluation déclarative du candidat. OOSkills Academy ne certifie pas les compétences mentionnées et décline toute responsabilité quant à l'exactitude des résultats.",
  },
  ar: {
    title: "شهادة",
    subtitle: "إتمام بنجاح",
    preamble: "نشهد بأن",
    hasCompleted:
      "قد أتمّ بنجاح الدورة التدريبية",
    duration: "المدة",
    modules: "الوحدات",
    level: "المستوى",
    issuedOn: "صدرت بتاريخ",
    scanVerify: "امسح للتحقق",
    certIdLabel:
      "رقم الشهادة",
    signatureTitle:
      "منصة التدريب",
    score: "النتيجة",
    downloadPdf: "تحميل PDF",
    copyLink: "نسخ الرابط",
    toastCopy:
      "🔗 تم نسخ رابط التحقق!",
    themeLight:
      "الوضع الفاتح",
    themeDark:
      "الوضع الداكن",
    close: "إغلاق",
    disclaimerTitle: "إخلاء المسؤولية",
    disclaimerText:
      "يعكس هذا الشارة تقييمًا ذاتيًا تصريحيًا من المرشح. لا تصادق أكاديمية OOSkills على المهارات المذكورة وتخلي مسؤوليتها عن دقة النتائج المعلنة.",
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
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const BookIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const CapIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15v-3.572a48.353 48.353 0 0110.5 0V15" />
  </svg>
);

const TrophyIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16.5 3.5H7.5V7c0 2.5 2 5 4.5 5s4.5-2.5 4.5-5V3.5z" />
    <path d="M7.5 5.5H5a2 2 0 00-2 2v.5a3 3 0 003 3h1.5" />
    <path d="M16.5 5.5H19a2 2 0 012 2v.5a3 3 0 01-3 3h-1.5" />
    <path d="M12 12v2.5" />
    <path d="M8 17.5h8" />
    <path d="M7 20.5h10" />
    <path d="M9.5 17.5v3" />
    <path d="M14.5 17.5v3" />
  </svg>
);

const DownloadIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const LinkIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const SunIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
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
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
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
  onClose,
}: {
  data: CertificateData;
  onClose?: () => void;
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
      : `/verify/${data.code}`;

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verifyUrl)}&margin=1&color=1a1a2e&bgcolor=FFFFFF&format=svg`;

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

      // Grab elements we need to temporarily restyle for PDF capture
      const root = cardRef.current.closest(
        `.${s.certificateRoot}`,
      ) as HTMLElement | null;
      const card = cardRef.current;
      const border = card.querySelector(
        `.${s.certificateBorder}`,
      ) as HTMLElement | null;
      const inner = card.querySelector(
        `.${s.certificateInner}`,
      ) as HTMLElement | null;
      const content = card.querySelector(
        `.${s.certificateContent}`,
      ) as HTMLElement | null;
      const watermark = card.querySelector(
        `.${s.watermark}`,
      ) as HTMLElement | null;

      // Save original inline styles
      const saved = {
        root: root?.style.cssText ?? "",
        card: card.style.cssText,
        border: border?.style.cssText ?? "",
        inner: inner?.style.cssText ?? "",
        content: content?.style.cssText ?? "",
        watermark: watermark?.style.cssText ?? "",
      };

      // 1) Resolve CSS custom properties for html2canvas
      if (root) {
        root.style.setProperty("--bg-card", isDark ? "#141428" : "#fffdf7");
        root.style.setProperty(
          "--text-primary",
          isDark ? "#e8e8f0" : "#1a1a2e",
        );
        root.style.setProperty(
          "--text-secondary",
          isDark ? "#b0b0c0" : "#4a4a5e",
        );
        root.style.setProperty("--text-muted", isDark ? "#707088" : "#8a8a9e");
        root.style.setProperty("--gold", "#cfb53b");
        root.style.setProperty("--watermark-opacity", "0.035");
        root.style.setProperty(
          "--divider",
          "linear-gradient(90deg, transparent, #cfb53b 20%, #e8d583 50%, #cfb53b 80%, transparent)",
        );
        root.style.setProperty("--border-inner", "rgba(207, 181, 59, 0.25)");
      }

      // 2) Size card to A4 landscape ratio (297×210mm) edge-to-edge
      // At 96dpi: 297mm = 1123px, 210mm = 794px
      card.style.cssText = `
        display: block;
        max-width: none;
        max-height: none;
        width: 1123px;
        height: 794px;
        margin: 0;
        padding: 0;
        background: transparent;
        overflow: hidden;
      `;

      // Make border and inner fill the full A4 area
      if (border) {
        border.style.boxShadow = "none";
        border.style.borderRadius = "0";
        border.style.height = "100%";
        border.style.boxSizing = "border-box";
      }
      if (inner) {
        inner.style.background = isDark ? "#141428" : "#fffdf7";
        inner.style.borderRadius = "0";
        inner.style.height = "100%";
        inner.style.boxSizing = "border-box";
      }
      // Push content to fill and move corner ornaments to the edges
      if (content) {
        content.style.height = "100%";
        content.style.boxSizing = "border-box";
        content.style.display = "flex";
        content.style.flexDirection = "column";
        content.style.justifyContent = "space-between";
        content.style.padding = "42px 52px";
      }

      // 3) Fix watermark opacity
      if (watermark) {
        watermark.style.opacity = "0.035";
        watermark.style.width = "320px";
      }

      // 3a) Force desktop layout on footer (media queries still fire on narrow viewports)
      const footer = card.querySelector<HTMLElement>(`.${s.certFooter}`);
      const savedFooter = footer?.style.cssText ?? "";
      if (footer) {
        footer.style.flexDirection = "row";
        footer.style.alignItems = "flex-end";
        footer.style.justifyContent = "space-between";
        footer.style.gap = "20px";
      }

      const signature = card.querySelector<HTMLElement>(`.${s.certSignature}`);
      const savedSignature = signature?.style.cssText ?? "";
      if (signature) {
        signature.style.alignItems = "flex-start";
        signature.style.textAlign = "start";
      }

      // 3a-ii) Force desktop font sizes on mobile
      const certTitle = card.querySelector<HTMLElement>(`.${s.certTitle}`);
      const savedCertTitle = certTitle?.style.cssText ?? "";
      if (certTitle) {
        certTitle.style.fontSize = "36px";
        certTitle.style.letterSpacing = "6px";
      }

      const studentName = card.querySelector<HTMLElement>(
        `.${s.certStudentName}`,
      );
      const savedStudentName = studentName?.style.cssText ?? "";
      if (studentName) {
        studentName.style.fontSize = "32px";
      }

      const courseName = card.querySelector<HTMLElement>(
        `.${s.certCourseName}`,
      );
      const savedCourseName = courseName?.style.cssText ?? "";
      if (courseName) {
        courseName.style.fontSize = "22px";
        courseName.style.marginBottom = "24px";
      }

      const certDetails = card.querySelector<HTMLElement>(`.${s.certDetails}`);
      const savedCertDetails = certDetails?.style.cssText ?? "";
      if (certDetails) {
        certDetails.style.gap = "36px";
        certDetails.style.marginBottom = "24px";
      }

      // Force desktop corner ornament sizes
      const corners = Array.from(
        card.querySelectorAll<HTMLElement>(
          `.${s.certificateContent}::before, .${s.certificateContent}::after, .${s.cornerBl}::before, .${s.cornerBr}::before`,
        ),
      );

      // 3b) Force explicit gold gradient on dividers (html2canvas drops CSS var gradients)
      const dividers = Array.from(
        card.querySelectorAll<HTMLElement>(`.${s.goldDivider}`),
      );
      const savedDividers = dividers.map((d) => d.style.cssText);
      dividers.forEach((d) => {
        d.style.background =
          "linear-gradient(90deg, transparent, #cfb53b 20%, #e8d583 50%, #cfb53b 80%, transparent)";
        d.style.height = "1.5px";
        d.style.opacity = "1";
      });

      // 3c) Force gold border on QR frame (html2canvas drops var() border colors)
      const qrFrame = card.querySelector<HTMLElement>(`.${s.qrFrame}`);
      const savedQrFrame = qrFrame?.style.cssText ?? "";
      if (qrFrame) {
        qrFrame.style.border = "2px solid #cfb53b";
        qrFrame.style.borderRadius = "10px";
        qrFrame.style.padding = "3px";
        qrFrame.style.boxShadow =
          "0 0 0 1px rgba(207,181,59,0.3), 0 2px 12px rgba(207,181,59,0.25)";
      }

      // 4) Fix Arabic font rendering — html2canvas can't handle web font ligatures,
      //    so we temporarily switch to system Arabic fonts it renders correctly
      let arStyleTag: HTMLStyleElement | null = null;
      if (isRtl && card) {
        arStyleTag = document.createElement("style");
        arStyleTag.textContent = `
          [dir="rtl"] * {
            font-family: "Tahoma", "Segoe UI", "Arial", sans-serif !important;
            letter-spacing: 0 !important;
            word-spacing: normal !important;
          }
        `;
        document.head.appendChild(arStyleTag);
      }

      await html2pdf()
        .set({
          margin: 0,
          filename: `OOSkills_Certificate_${data.studentName.replace(/\s+/g, "_")}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            windowWidth: 1123,
            useCORS: true,
            allowTaint: true,
            backgroundColor: isDark ? "#0d0d1a" : "#f0ece3",
            logging: false,
            onclone: (clonedDoc: Document) => {
              if (isRtl) {
                const style = clonedDoc.createElement("style");
                style.textContent = `
                  * {
                    font-family: "Tahoma", "Segoe UI", "Arial", sans-serif !important;
                    letter-spacing: 0 !important;
                    word-spacing: normal !important;
                  }
                `;
                clonedDoc.head.appendChild(style);
              }
            },
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
        })
        .from(card)
        .save();

      // Restore all original styles
      if (arStyleTag) document.head.removeChild(arStyleTag);
      if (root) root.style.cssText = saved.root;
      card.style.cssText = saved.card;
      if (border) border.style.cssText = saved.border;
      if (inner) inner.style.cssText = saved.inner;
      if (content) content.style.cssText = saved.content;
      if (watermark) watermark.style.cssText = saved.watermark;
      if (qrFrame) qrFrame.style.cssText = savedQrFrame;
      if (footer) footer.style.cssText = savedFooter;
      if (signature) signature.style.cssText = savedSignature;
      if (certTitle) certTitle.style.cssText = savedCertTitle;
      if (studentName) studentName.style.cssText = savedStudentName;
      if (courseName) courseName.style.cssText = savedCourseName;
      if (certDetails) certDetails.style.cssText = savedCertDetails;
      dividers.forEach((d, i) => {
        d.style.cssText = savedDividers[i];
      });
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
                  <img
                    src={logoSrc}
                    alt="OOSkills Logo"
                    className={s.certLogo}
                  />
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
                        <span className={s.detailIcon}>
                          <ClockIcon />
                        </span>
                        <span className={s.detailValue}>{data.duration}</span>
                        <span className={s.detailLabel}>{t.duration}</span>
                      </div>
                    )}
                    {data.modules && (
                      <div className={s.detailItem}>
                        <span className={s.detailIcon}>
                          <BookIcon />
                        </span>
                        <span className={s.detailValue}>{data.modules}</span>
                        <span className={s.detailLabel}>{t.modules}</span>
                      </div>
                    )}
                    {data.level && (
                      <div className={s.detailItem}>
                        <span className={s.detailIcon}>
                          <CapIcon />
                        </span>
                        <span className={s.detailValue}>{data.level}</span>
                        <span className={s.detailLabel}>{t.level}</span>
                      </div>
                    )}
                    {data.score != null && (
                      <div className={s.detailItem}>
                        <span className={s.detailIcon}>
                          <TrophyIcon />
                        </span>
                        <span className={s.detailValue}>{data.score}%</span>
                        <span className={s.detailLabel}>{t.score}</span>
                      </div>
                    )}
                  </div>

                  <p className={s.certDate}>
                    {t.issuedOn}{" "}
                    <strong>
                      {formatDate(data.issuedAt, dateLocales[lang])}
                    </strong>
                  </p>
                </div>

                <div className={s.goldDivider} />

                {/* Footer */}
                <div className={s.certFooter}>
                  <div className={s.certSignature}>
                    <span 
                      className={s.signatureName}
                      style={{ fontSize: "14px", paddingBottom: "2px" }}
                    >
                      {t.disclaimerTitle}
                    </span>
                    <span
                      className={s.signatureTitle}
                      style={{
                        fontSize: "9px",
                        textTransform: "none",
                        lineHeight: 1.4,
                        maxWidth: "200px",
                        whiteSpace: "normal",
                        textAlign: isRtl ? "right" : "left",
                        letterSpacing: isRtl ? "0" : "0.2px",
                      }}
                    >
                      {t.disclaimerText}
                    </span>
                  </div>

                  <a
                    href={verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={s.certQrSection}
                    title={verifyUrl}
                  >
                    <div className={s.qrFrame}>
                      <div className={s.qrWrapper}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={qrSrc}
                          alt="Verification QR Code"
                          width={90}
                          height={90}
                        />
                      </div>
                    </div>
                    <span className={s.qrLabel}>{t.scanVerify}</span>
                  </a>

                  {/* ── Machine Readable Zone ──── */}
                  <div className={s.mrzSection}>
                    <div className={s.mrzHeader}>
                      MACHINE READABLE ZONE
                    </div>
                    {(() => {
                      const pad = (str: string, len: number) =>
                        str
                          .toUpperCase()
                          .replace(/[^A-Z0-9]/g, "<")
                          .padEnd(len, "<")
                          .slice(0, len);
                      const name = data.studentName || "";
                      const parts = name.split(/\s+/);
                      const surname =
                        parts.length > 1 ? parts.slice(-1)[0] : parts[0] || "";
                      const given =
                        parts.length > 1 ? parts.slice(0, -1).join("<") : "";
                      const code = data.code || "OOSK0000";
                      const score =
                        data.score != null ? String(data.score) : "00";
                      const level = data.level || "ADV";
                      const dateRaw = data.issuedAt || "";
                      const dp = dateRaw.replace(/[^0-9]/g, "").slice(0, 8);
                      const dateFormatted =
                        dp.length >= 6 ? dp.slice(2, 8) : "000000";

                      const line1 = `B<DZA${pad(surname, 20)}<${pad(given, 18)}`;
                      const line2 = `${pad(code, 16)}<${pad(level, 6)}<DZA${dateFormatted}F${dateFormatted}<`;
                      const line3 = `OOSK${pad(score, 4)}H<${pad(level, 8)}<12ECTS${"<".repeat(10)}`;

                      return (
                        <>
                          <div className={s.mrzLine}>{line1}</div>
                          <div className={s.mrzLine}>{line2}</div>
                          <div className={s.mrzLine}>{line3}</div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/*  Floating Toolbar  */}
        <div className={s.toolbar}>
          {/* Close button */}
          {onClose && (
            <>
              <button
                className={s.toolBtn}
                onClick={onClose}
                data-tooltip={t.close}
                aria-label="Close"
              >
                <CloseIcon />
              </button>
              <div className={s.toolbarDivider} />
            </>
          )}

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
            className={`${s.toolBtn} ${downloading ? s.downloadingBtn : ""}`}
            onClick={handleDownload}
            disabled={downloading}
            data-tooltip={downloading ? "" : t.downloadPdf}
            aria-label="Download PDF"
          >
            {downloading ? (
              <span className={s.spinnerWrap}>
                <svg
                  className={s.spinnerRing}
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    opacity="0.2"
                  />
                  <path
                    d="M12 2a10 10 0 019.95 9"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            ) : (
              <DownloadIcon />
            )}
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