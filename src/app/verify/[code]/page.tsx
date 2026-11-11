"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import CertificateTemplate, {
  type CertificateData,
} from "@/components/certificate/CertificateTemplate";
import { API_BASE_URL } from "@/lib/axios";
import s from "@/components/certificate/Certificate.module.css";
import { useI18n } from "@/lib/i18n";

export default function VerifyCertificatePage() {
  const { code } = useParams<{ code: string }>();
  const { t, locale } = useI18n();
  const tv = (key: string) => t(`verifyCertificate.${key}`);
  const [data, setData] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!code) return;

    (async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/formation/certificates/verify/${code}/`,
        );
        if (!res.ok) throw new Error("Not found");
        const json = await res.json();

        setData({
          code: json.code ?? code,
          studentName: json.user_name ?? "—",
          courseName: json.course_title ?? "—",
          // backend now returns these directly
          duration: json.duration ?? undefined,
          modules: json.modules ?? undefined,
          level: json.level ?? undefined,
          // handle both issued_at (new snake_case) and issuedAt (legacy camelCase)
          issuedAt:
            json.issued_at ?? json.issuedAt ?? new Date().toISOString(),
          score:
            json.score != null ? Math.round(Number(json.score)) : undefined,
        });
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [code]);

  /* ── Loading ─────────────── */
  if (loading) {
    return (
      <div className={s.certificateRoot}>
        <div className={s.loadingWrapper}>
          <div className={s.loadingSpinner} />
          <span className={s.loadingText}>{tv("loading")}</span>
        </div>
      </div>
    );
  }

  /* ── Error / Not Found ───── */
  if (error || !data) {
    return (
      <div className={s.certificateRoot}>
        <div className={s.errorWrapper}>
          <span className={s.errorIcon}>🔍</span>
          <h2 className={s.errorTitle}>{tv("notFoundTitle")}</h2>
          <p className={s.errorDesc}>
            {tv("notFoundBefore")} <strong>{code}</strong> {tv("notFoundAfter")}
          </p>
          <Link href="/" className={s.errorLink}>
            {tv("back")}
          </Link>
        </div>
      </div>
    );
  }

  /* ── Certificate ─────────── */
  // Shown in the visitor's language (it used to be English for everyone).
  return <CertificateTemplate data={data} initialLang={locale} />;
}
