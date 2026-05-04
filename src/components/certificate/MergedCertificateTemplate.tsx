"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import QRCode from "react-qr-code";
import { useTheme } from "next-themes";
import s from "./Certificate.module.css";

/* ─── Translations ───────────────────────────────────────────── */
const translations = {
  en: {
    title: "Certificate",
    subtitle: "of Multiple Achievements",
    preamble: "This is to certify that",
    hasCompleted: "has successfully completed the following courses",
    course: "Course",
    score: "Score",
    issuedOn: "Issued on",
    scanVerify: "Scan to verify",
    certIdLabel: "Certificate ID",
    signatureTitle: "Training Platform",
    downloadPdf: "Download PDF",
    copyLink: "Copy Link",
    toastCopy: "🔗 Verification link copied!",
    themeLight: "Light mode",
    themeDark: "Dark mode",
    close: "Close",
    disclaimerTitle: "DISCLAIMER",
    disclaimerText:
      "This badge reflects the candidate's self-assessment. OOSkills Academy does not certify the skills listed herein and disclaims all liability regarding the accuracy of declared results.",
  },
  fr: {
    title: "Certificat",
    subtitle: "de Réalisations Multiples",
    preamble: "Ceci certifie que",
    hasCompleted: "a complété avec succès les formations suivantes",
    course: "Formation",
    score: "Note",
    issuedOn: "Délivré le",
    scanVerify: "Scanner pour vérifier",
    certIdLabel: "ID du Certificat",
    signatureTitle: "Plateforme de Formation",
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
    subtitle: "إنجازات متعددة",
    preamble: "نشهد بأن",
    hasCompleted: "قد أتمّ بنجاح الدورات التدريبية التالية",
    course: "الدورة",
    score: "النتيجة",
    issuedOn: "صدرت بتاريخ",
    scanVerify: "امسح للتحقق",
    certIdLabel: "رقم الشهادة",
    signatureTitle: "منصة التدريب",
    downloadPdf: "تحميل PDF",
    copyLink: "نسخ الرابط",
    toastCopy: "🔗 تم نسخ رابط التحقق!",
    themeLight: "الوضع الفاتح",
    themeDark: "الوضع الداكن",
    close: "إغلاق",
    disclaimerTitle: "إخلاء المسؤولية",
    disclaimerText:
      "يعكس هذا الشارة تقييمًا ذاتيًا تصريحيًا من المرشح. لا تصادق أكاديمية OOSkills على المهارات المذكورة وتخلي مسؤوليتها عن دقة النتائج المعلنة.",
  },
} as const;

type Lang = keyof typeof translations;

/* ─── Types ──────────────────────────────────────────────────── */
export interface MergedCourseEntry {
  courseName: string;
  score: number;
}

export interface MergedCertificateData {
  code: string;
  studentName: string;
  courses: MergedCourseEntry[];
  issuedAt: string;
}

/* ─── Inline SVG Icons ───────────────────────────────────────── */
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

/* ─── Helpers ────────────────────────────────────────────────── */
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

function scoreColor(score: number) {
  if (score >= 80) return "#22C55E";
  if (score >= 60) return "#CFB53B";
  return "#EF4444";
}

/* ═══════════════════════════════════════════════════════════════
   MergedCertificateTemplate
   ═══════════════════════════════════════════════════════════════ */
export default function MergedCertificateTemplate({
  data,
  onClose,
}: {
  data: MergedCertificateData;
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

  const logoSrc = isDark
    ? "/images/logo/logo_DarkMood2.png"
    : "/images/logo/logo_LightMood2.png";

  /* ── Toast ── */
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }, []);

  /* ── Copy ── */
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

  /* ── Download PDF (via Playwright backend) ── */
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { API_BASE_URL } = await import("@/lib/axios");
      const { getAccessToken } = await import("@/lib/tokenStore");

      const token = getAccessToken();
      const res = await fetch(
        `${API_BASE_URL}/formation/certificates/export/merged/pdf/`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `PDF generation failed (${res.status})`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `OOSkills_MergedBadge_${data.studentName.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download error:", err);
      showToast("❌ PDF download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  /* ── Average score ── */
  const avgScore = Math.round(
    data.courses.reduce((sum, c) => sum + c.score, 0) / data.courses.length,
  );

  return (
    <div className={s.certificateRoot} dir={isRtl ? "rtl" : "ltr"}>
      <div className={s.pageWrapper}>
        {/* ━━ Certificate Card ━━ */}
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

                {/* Body — with courses table */}
                <div className={s.certBody}>
                  <p className={s.certPreamble}>{t.preamble}</p>
                  <h2 className={s.certStudentName}>{data.studentName}</h2>
                  <p className={s.certHasCompleted}>{t.hasCompleted}</p>

                  {/* Courses table */}
                  <div className={s.coursesTableWrapper}>
                    <table
                      className={s.coursesTable}
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        tableLayout: "fixed",
                        wordBreak: "break-word",
                      }}
                    >
                      <thead>
                        <tr style={{ background: "rgba(207,181,59,0.1)" }}>
                          <th
                            style={{
                              textAlign: isRtl ? "right" : "left",
                              fontWeight: 600,
                              color: "var(--gold)",
                              fontSize: 11,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            {t.course}
                          </th>
                          <th
                            style={{
                              textAlign: "center",
                              fontWeight: 600,
                              color: "var(--gold)",
                              fontSize: 11,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              width: 80,
                            }}
                          >
                            {t.score}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.courses.map((c, i) => (
                          <tr
                            key={i}
                            style={{
                              borderTop: "1px solid var(--border-inner)",
                              background:
                                i % 2 === 0
                                  ? "transparent"
                                  : "rgba(207,181,59,0.03)",
                            }}
                          >
                            <td
                              style={{
                                color: "var(--text-primary)",
                                fontWeight: 500,
                              }}
                            >
                              {c.courseName}
                            </td>
                            <td
                              style={{
                                textAlign: "center",
                                fontWeight: 700,
                                color: scoreColor(c.score),
                              }}
                            >
                              {c.score}%
                            </td>
                          </tr>
                        ))}
                        {/* Average row */}
                        <tr
                          style={{
                            borderTop: "2px solid var(--gold)",
                            background: "rgba(207,181,59,0.08)",
                          }}
                        >
                          <td
                            style={{
                              fontWeight: 700,
                              color: "var(--gold)",
                            }}
                          >
                            Average
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              fontWeight: 800,
                              color: scoreColor(avgScore),
                            }}
                          >
                            {avgScore}%
                          </td>
                        </tr>
                      </tbody>
                    </table>
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
                        <QRCode 
                          value={verifyUrl} 
                          size={90} 
                          fgColor="#1a1a2e" 
                          level="M" 
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
                      const dateRaw = data.issuedAt || "";
                      const dp = dateRaw.replace(/[^0-9]/g, "").slice(0, 8);
                      const dateFormatted =
                        dp.length >= 6 ? dp.slice(2, 8) : "000000";
                      const courseCount = String(data.courses.length).padStart(
                        2,
                        "0",
                      );

                      const line1 = `B<DZA${pad(surname, 20)}<${pad(given, 18)}`;
                      const line2 = `${pad(code, 16)}<MRG${courseCount}<DZA${dateFormatted}F${dateFormatted}<`;
                      const line3 = `OOSK${pad(String(avgScore), 4)}H<MERGED<${courseCount}CRS${"<".repeat(10)}`;

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

        {/* ━━ Floating Toolbar ━━ */}
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

      {/* Toast */}
      <div className={`${s.toast} ${toast ? s.toastShow : ""}`}>{toast}</div>
    </div>
  );
}