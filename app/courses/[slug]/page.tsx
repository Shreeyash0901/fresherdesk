import { notFound } from "next/navigation";
import { getDbCourse } from "@/lib/courses-db";
import { courses } from "@/lib/fresherdesk-data";
import { CourseDetailClient } from "@/components/fresherdesk/course-detail-client";

export function generateStaticParams() {
  return courses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const c = await getDbCourse(resolvedParams.slug);
  return { title: c?.title ? `${c.title} | FresherDesk` : "Course not found" };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const course = await getDbCourse(resolvedParams.slug);

  if (!course) {
    notFound();
  }

  return <CourseDetailClient course={course} />;
}
