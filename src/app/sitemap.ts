import type { MetadataRoute } from "next";
import { API_URL, SITE_URL } from "@/lib/site";

// Rebuilt at most once an hour, so a newly published course appears without a
// new deployment.
export const revalidate = 3600;

interface SitemapCourse {
  slug?: string;
  date?: string;
  updated_at?: string;
}

/** Published courses, straight from the API. An unreachable API yields none. */
async function fetchCourses(): Promise<SitemapCourse[]> {
  if (!API_URL) return [];
  const courses: SitemapCourse[] = [];
  let url: string | null = `${API_URL}/formation/courses/?page_size=100`;

  try {
    // Follow pagination, with a hard stop so a bad "next" link cannot loop.
    for (let page = 0; url && page < 20; page++) {
      const response: Response = await fetch(url, { next: { revalidate } });
      if (!response.ok) break;
      const data: unknown = await response.json();
      if (Array.isArray(data)) {
        courses.push(...(data as SitemapCourse[]));
        break;
      }
      const paginated = data as { results?: SitemapCourse[]; next?: string | null };
      courses.push(...(paginated.results ?? []));
      url = paginated.next ?? null;
    }
  } catch {
    // The sitemap must still be served when the API is down.
  }
  return courses;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const courses = await fetchCourses();

  // Login and sign-up pages are deliberately absent: robots.txt blocks /auth/.
  const pages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/courses`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/privacy-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms-of-service`, changeFrequency: "yearly", priority: 0.3 },
  ];

  for (const course of courses) {
    if (!course.slug) continue;
    const modified = course.updated_at || course.date;
    const lastModified = modified ? new Date(modified) : undefined;
    pages.push({
      url: `${SITE_URL}/courses/${encodeURIComponent(course.slug)}`,
      // Only a real modification date is published, never the build date.
      ...(lastModified && !Number.isNaN(lastModified.getTime()) ? { lastModified } : {}),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  return pages;
}
