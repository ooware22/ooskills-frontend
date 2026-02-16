import { allCourses } from "@/data/courses";
import CourseDetailClient from "./CourseDetailClient";

export function generateStaticParams() {
  return allCourses.map((course) => ({ id: String(course.id) }));
}

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <CourseDetailClient params={params} />;
}
