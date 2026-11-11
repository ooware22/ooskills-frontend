import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { API_URL, SITE_NAME, SITE_URL } from "@/lib/site";

interface CourseSummary {
  title?: string | Record<string, string>;
  description?: string | Record<string, string>;
  image?: string;
  price?: number | string;
}

type Lookup =
  | { status: "found"; course: CourseSummary }
  | { status: "missing" }
  | { status: "unknown" };

function plain(value: CourseSummary["title"]): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.fr || value.en || value.ar || "";
}

/**
 * Ask the API for the course once per request (shared by the metadata and the
 * layout). Only a real 404 counts as "missing": when the API is down or slow,
 * the page renders normally and the client shows its own state.
 */
const lookupCourse = cache(async (slug: string): Promise<Lookup> => {
  if (!API_URL) return { status: "unknown" };
  try {
    const response = await fetch(
      `${API_URL}/formation/courses/${encodeURIComponent(slug)}/`,
      { next: { revalidate: 300 }, signal: AbortSignal.timeout(5000) },
    );
    if (response.status === 404) return { status: "missing" };
    if (!response.ok) return { status: "unknown" };
    return { status: "found", course: (await response.json()) as CourseSummary };
  } catch {
    return { status: "unknown" };
  }
});

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const path = `/courses/${encodeURIComponent(id)}`;
  const lookup = await lookupCourse(id);

  if (lookup.status !== "found") {
    return { alternates: { canonical: path }, openGraph: { url: path } };
  }

  const title = plain(lookup.course.title);
  const description = plain(lookup.course.description)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
  return {
    title: title || undefined,
    description: description || undefined,
    alternates: { canonical: path },
    openGraph: {
      url: path,
      title: title || undefined,
      description: description || undefined,
      ...(lookup.course.image ? { images: [{ url: lookup.course.image }] } : {}),
    },
  };
}

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lookup = await lookupCourse(id);
  // An unknown course answers HTTP 404 (it used to be a 200 "soft 404").
  if (lookup.status === "missing") notFound();
  if (lookup.status !== "found") return children;

  // schema.org Course, so search engines can show the course (audit LAN-08).
  const course = lookup.course;
  const url = `${SITE_URL}/courses/${encodeURIComponent(id)}`;
  const price = Number(course.price ?? 0);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: plain(course.title),
    description: plain(course.description).replace(/\s+/g, " ").trim().slice(0, 500),
    url,
    ...(course.image ? { image: course.image } : {}),
    provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    offers: {
      "@type": "Offer",
      category: price > 0 ? "Paid" : "Free",
      price: Number.isFinite(price) ? price : 0,
      priceCurrency: "DZD",
      url,
    },
    hasCourseInstance: { "@type": "CourseInstance", courseMode: "Online" },
  };
  return (
    <>
      <script
        type="application/ld+json"
        // Escape "<" so course text can never close the script element.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      {children}
    </>
  );
}
