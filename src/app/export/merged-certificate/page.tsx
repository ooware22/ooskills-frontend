"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import MergedCertificateTemplate, {
  type MergedCertificateData,
} from "@/components/certificate/MergedCertificateTemplate";
import { API_BASE_URL } from "@/lib/axios";

// Declare global printReady so Playwright can await it
declare global {
  interface Window {
    printReady?: boolean;
  }
}

export default function ExportMergedCertificatePage() {
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");
  const [data, setData] = useState<MergedCertificateData | null>(null);
  const [loading, setLoading] = useState(true);

  // Force light theme for consistent PDF rendering in headless Chromium
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.setAttribute("data-theme", "light");
  }, []);

  useEffect(() => {
    if (!uid) {
      window.printReady = true;
      setLoading(false);
      return;
    }

    (async () => {
      try {
        // Check for pre-fetched data passed by Playwright via base64 query param.
        // This avoids a deadlock where the headless browser calls back to the
        // same Django server that spawned it.
        const encodedData = searchParams.get("d");
        let json: Record<string, unknown>;

        if (encodedData) {
          // Playwright pre-fetched the data — decode it directly
          const decoded = atob(
            encodedData.replace(/-/g, "+").replace(/_/g, "/")
          );
          json = JSON.parse(decoded);
        } else {
          // Normal browser navigation — fetch from API
          const res = await fetch(
            `${API_BASE_URL}/formation/certificates/merged-export/?uid=${uid}`
          );
          if (!res.ok)
            throw new Error("Failed to fetch merged certificate data");
          json = await res.json();
        }

        setData({
          code:
            (json.code as string) ??
            `MERGED-${uid.slice(0, 8).toUpperCase()}`,
          studentName: (json.student_name as string) ?? "—",
          courses: (
            (json.courses as { course_name: string; score: number }[]) ?? []
          ).map((c) => ({
            courseName: c.course_name,
            score: c.score,
          })),
          issuedAt:
            (json.issued_at as string) ?? new Date().toISOString(),
        });

        // Wait for all fonts to be loaded before signaling ready
        await document.fonts.ready;
        window.printReady = true;
      } catch (err) {
        console.error(err);
        // Signal Playwright even on error so it doesn't hang
        window.printReady = true;
      } finally {
        setLoading(false);
      }
    })();
  }, [uid, searchParams]);

  if (loading || !data) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <style>{`
        /* Hide the interactive toolbar and toast in export mode */
        div[class*="toolbar"], 
        div[class*="toast"] {
          display: none !important;
        }

        /* Force the certificate card to fill the entire A4 PDF area */
        div[class*="pageWrapper"] {
          padding: 0 !important;
          height: 100vh !important;
          width: 100vw !important;
          align-items: stretch !important;
          justify-content: stretch !important;
        }
        
        div[class*="certificateCard"] {
          max-width: none !important;
          max-height: none !important;
          width: 1123px !important;
          height: 794px !important;
          border-radius: 0 !important;
          margin: 0 !important;
        }
        
        div[class*="certificateBorder"] {
          border-radius: 0 !important;
          padding: 8px !important; /* Nice thick gold border for print */
        }
        
        div[class*="certificateInner"] {
          border-radius: 0 !important;
          height: 100% !important;
        }

        div[class*="certificateContent"] {
          height: 100% !important;
          box-sizing: border-box !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-between !important;
          padding: 42px 52px !important;
        }
      `}</style>
      <MergedCertificateTemplate data={data} />
    </>
  );
}
