"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verifyUrl)}&margin=1&color=1a1a2e&bgcolor=FFFFFF&format=svg`;

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

  /* ── Download PDF ── */
  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;

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

      const saved = {
        root: root?.style.cssText ?? "",
        card: card.style.cssText,
        border: border?.style.cssText ?? "",
        inner: inner?.style.cssText ?? "",
        content: content?.style.cssText ?? "",
        watermark: watermark?.style.cssText ?? "",
      };

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

      card.style.cssText = `display:block;max-width:none;max-height:none;width:1123px;height:794px;margin:0;padding:0;background:transparent;overflow:hidden;`;
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
      if (content) {
        content.style.height = "100%";
        content.style.boxSizing = "border-box";
        content.style.display = "flex";
        content.style.flexDirection = "column";
        content.style.justifyContent = "space-between";
        content.style.padding = "32px 44px";
      }
      if (watermark) {
        watermark.style.opacity = "0.035";
        watermark.style.width = "320px";
      }

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

      const qrFrame = card.querySelector<HTMLElement>(`.${s.qrFrame}`);
      const savedQrFrame = qrFrame?.style.cssText ?? "";
      if (qrFrame) {
        qrFrame.style.border = "2px solid #cfb53b";
        qrFrame.style.borderRadius = "10px";
        qrFrame.style.padding = "3px";
        qrFrame.style.boxShadow =
          "0 0 0 1px rgba(207,181,59,0.3), 0 2px 12px rgba(207,181,59,0.25)";
      }

      let arStyleTag: HTMLStyleElement | null = null;
      if (isRtl) {
        arStyleTag = document.createElement("style");
        arStyleTag.textContent = `[dir="rtl"] * { font-family: "Tahoma","Segoe UI","Arial",sans-serif !important; letter-spacing:0 !important; word-spacing:normal !important; }`;
        document.head.appendChild(arStyleTag);
      }

      await html2pdf()
        .set({
          margin: 0,
          filename: `OOSkills_MergedBadge_${data.studentName.replace(/\s+/g, "_")}.pdf`,
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
                const st = clonedDoc.createElement("style");
                st.textContent = `* { font-family:"Tahoma","Segoe UI","Arial",sans-serif !important; letter-spacing:0 !important; word-spacing:normal !important; }`;
                clonedDoc.head.appendChild(st);
              }
            },
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
        })
        .from(card)
        .save();

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
      dividers.forEach((d, i) => {
        d.style.cssText = savedDividers[i];
      });
    } catch (err) {
      console.error("PDF generation error:", err);
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