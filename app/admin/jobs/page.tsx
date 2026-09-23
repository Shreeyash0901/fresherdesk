import Link from "next/link";
import { getAdminOpportunities } from "@/app/actions/admin-opportunities";
import { Briefcase, Plus, Upload } from "lucide-react";
import { OpportunityRowActions } from "@/components/fresherdesk/opportunity-row-actions";
import { AdminOpportunitySearchBar } from "@/components/fresherdesk/admin-opportunity-search-bar";

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  
  // Fetch filtered jobs
  const jobs = await getAdminOpportunities({
    type: "Job",
    status: params.status,
    q: params.q,
  });

  // Fetch count stats for tabs
  const allJobs = await getAdminOpportunities({ type: "Job" });
  const publishedCount = allJobs.filter((j) => j.status === "published").length;
  const draftCount = allJobs.filter((j) => j.status === "draft").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Job Listings Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, edit, and publish full-time and fresher job openings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/import?type=Job"
            className="button button-outline compact text-xs flex items-center gap-1.5"
          >
            <Upload size={14} />
            <span>Bulk Import Jobs</span>
          </Link>
          <Link
            href="/admin/jobs/new"
            className="button button-green compact text-xs flex items-center gap-1.5"
          >
            <Plus size={15} />
            <span>Add Single Job</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <AdminOpportunitySearchBar
        basePath="/admin/jobs"
        currentQuery={params.q || ""}
        currentStatus={params.status || "all"}
        totalCount={allJobs.length}
        publishedCount={publishedCount}
        draftCount={draftCount}
        placeholder="Search jobs by title, company, skills, mode, or location..."
        accentColor="emerald"
      />

      {/* Jobs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="p-4">Role Title</th>
                <th className="p-4">Company</th>
                <th className="p-4">Location</th>
                <th className="p-4">Salary / Package</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    <Briefcase size={32} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-700">No job listings found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Click "Add Single Job" or "Bulk Import Jobs" to populate.
                    </p>
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-slate-900">
                      <div>
                        <span>{job.role}</span>
                        <span className="block text-[11px] font-normal text-slate-400">
                          {job.mode}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-800">{job.companyName}</td>
                    <td className="p-4 text-slate-600">{job.location}</td>
                    <td className="p-4 font-semibold text-emerald-700">
                      {job.salaryText || "Best in Industry"}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${
                          job.status === "published"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : job.status === "draft"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 text-[11px]">
                      {new Date(job.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-4 text-right">
                      <OpportunityRowActions id={job.id} currentStatus={job.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
