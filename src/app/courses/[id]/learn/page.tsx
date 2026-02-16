import { allCourses } from "@/data/courses";
import CoursePlayerClient from "./CoursePlayerClient";

export function generateStaticParams() {
  return allCourses.map((course) => ({ id: String(course.id) }));
}

export default function CoursePlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <CoursePlayerClient params={params} />;
}
