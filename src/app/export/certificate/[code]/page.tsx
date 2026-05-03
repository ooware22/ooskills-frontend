"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CertificateTemplate, {
  type CertificateData,
} from "@/components/certificate/CertificateTemplate";
import { API_BASE_URL } from "@/lib/axios";

// Declare global printReady so Playwright can await it
declare global {
  interface Window {
    printReady?: boolean;
  }
}

export default function ExportCertificatePage() {
  const { code } = useParams<{ code: string }>();
  const [data, setData] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) return;

    (async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/formation/certificates/verify/${code}/`
        );
        if (!res.ok) throw new Error("Not found");
        const json = await res.json();

        setData({
          code: json.code ?? code,
          studentName: json.user_name ?? "—",
          courseName: json.course_title ?? "—",
          duration: json.duration ?? undefined,
          modules: json.modules ?? undefined,
          level: json.level ?? undefined,
          issuedAt: json.issued_at ?? json.issuedAt ?? new Date().toISOString(),
          score: json.score != null ? Math.round(Number(json.score)) : undefined,
        });

        // Small delay to ensure CSS fonts and images have loaded before signaling
        setTimeout(() => {
          window.printReady = true;
        }, 1000);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [code]);

  if (loading || !data) {
    return <div>Loading...</div>; // Keep it simple, Playwright waits for printReady anyway
  }

  return (
    <>
      <style>{`
        /* Hide the interactive toolbar and toast in export mode */
        div[class*="toolbar"], 
        div[class*="toast"] {
          display: none !important;
        }
      `}</style>
      <CertificateTemplate data={data} />
    </>
  );
}
