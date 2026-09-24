import Link from "next/link";
import { getAdminOpportunities } from "@/app/actions/admin-opportunities";
import { GraduationCap, Plus, BookOpen } from "lucide-react";
import { OpportunityRowActions } from "@/components/fresherdesk/opportunity-row-actions";
import { AdminOpportunitySearchBar } from "@/components/fresherdesk/admin-opportunity-search-bar";

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;

  // Fetch filtered courses
  const courses = await getAdminOpportunities({
    type: "Course",
    status: params.status,
    q: params.q,
  });

  // Fetch count stats for tabs
  const allCourses = await getAdminOpportunities({ type: "Course" });
  const publishedCount = allCourses.filter((c) => c.status === "published").length;
  const draftCount = allCourses.filter((c) => c.status === "draft").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Course Programs Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, edit, and publish technology learning paths and track student enrollments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/courses"
            target="_blank"
            className="button button-outline compact text-xs flex items-center gap-1.5"
          >
            <BookOpen size={14} />
            <span>Public Courses Page</span>
          </Link>
          <Link
            href="/admin/courses/new"
            className="button button-green compact text-xs flex items-center gap-1.5"
          >
            <Plus size={15} />
            <span>Add Single Course</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <AdminOpportunitySearchBar
        basePath="/admin/courses"
        currentQuery={params.q || ""}
        currentStatus={params.status || "all"}
        totalCount={allCourses.length}
        publishedCount={publishedCount}
        draftCount={draftCount}
        placeholder="Search courses by title, skills, category, or curriculum..."
        accentColor="purple"
      />

      {/* Courses Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="p-4">Course Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Curriculum / Duration</th>
                <th className="p-4">Skills Covered</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    <GraduationCap size={32} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-700">No course programs found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Click "Add Single Course" to create a new learning program.
                    </p>
                  </td>
                </tr>
              ) : (
                courses.map((course) => {
                  let skillsList: string[] = [];
                  try {
                    skillsList = JSON.parse(course.skills || "[]");
                  } catch {
                    skillsList = [];
                  }

                  return (
                    <tr key={course.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-bold text-slate-900">
                        <div>
                          <span>{course.title}</span>
                          <span className="block text-[11px] font-normal text-slate-400">
                            {course.companyName}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-slate-800">{course.location}</td>
                      <td className="p-4 font-medium text-slate-600">
                        {course.experience}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {skillsList.map((skill) => (
                            <span
                              key={skill}
                              className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${
                            course.status === "published"
                              ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                              : course.status === "draft"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {course.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 text-[11px]">
                        {new Date(course.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-4 text-right">
                        <OpportunityRowActions id={course.id} currentStatus={course.status} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
