import { Suspense } from "react";
import { PublicShell } from "@/components/fresherdesk/public-shell";
import { Catalogue } from "@/components/fresherdesk/catalogue";
import { Skeleton } from "@/components/ui/skeleton";
import { getDbCourses } from "@/lib/courses-db";

export const metadata = { title: "Explore courses | FresherDesk" };

export default async function CoursesPage() {
  const dbCourses = await getDbCourses();

  return (
    <PublicShell>
      <main className="container catalogue-page">
        <Suspense
          fallback={
            <div className="page-loading">
              <Skeleton className="h-12 w-72" />
              <Skeleton className="h-80 w-full" />
            </div>
          }
        >
          <Catalogue initialCourses={dbCourses} />
        </Suspense>
      </main>
    </PublicShell>
  );
}
