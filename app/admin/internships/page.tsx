import Link from "next/link";
import { getAdminOpportunities } from "@/app/actions/admin-opportunities";
import { Layers, Plus, Upload } from "lucide-react";
import { OpportunityRowActions } from "@/components/fresherdesk/opportunity-row-actions";
import { AdminOpportunitySearchBar } from "@/components/fresherdesk/admin-opportunity-search-bar";

export default async function AdminInternshipsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;

  // Fetch filtered internships
  const internships = await getAdminOpportunities({
    type: "Internship",
    status: params.status,
    q: params.q,
  });

  // Fetch count stats for tabs
  const allInternships = await getAdminOpportunities({ type: "Internship" });
  const publishedCount = allInternships.filter((i) => i.status === "published").length;
  const draftCount = allInternships.filter((i) => i.status === "draft").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Internship Listings Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, edit, and publish student internships and graduate trainee opportunities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/import?type=Internship"
            className="button button-outline compact text-xs flex items-center gap-1.5"
          >
            <Upload size={14} />
            <span>Bulk Import Internships</span>
          </Link>
          <Link
            href="/admin/internships/new"
            className="button button-green compact text-xs flex items-center gap-1.5"
          >
            <Plus size={15} />
            <span>Add Single Internship</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <AdminOpportunitySearchBar
        basePath="/admin/internships"
        currentQuery={params.q || ""}
        currentStatus={params.status || "all"}
        totalCount={allInternships.length}
        publishedCount={publishedCount}
        draftCount={draftCount}
        placeholder="Search internships by title, company, skills, mode, or location..."
        accentColor="purple"
      />

      {/* Internships Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="p-4">Internship Role</th>
                <th className="p-4">Company</th>
                <th className="p-4">Location</th>
                <th className="p-4">Stipend</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {internships.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    <Layers size={32} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-700">No internship listings found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Click "Add Single Internship" or "Bulk Import Internships" to populate.
                    </p>
                  </td>
                </tr>
              ) : (
                internships.map((internship) => (
                  <tr key={internship.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-slate-900">
                      <div>
                        <span>{internship.role}</span>
                        <span className="block text-[11px] font-normal text-slate-400">
                          {internship.mode}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-800">{internship.companyName}</td>
                    <td className="p-4 text-slate-600">{internship.location}</td>
                    <td className="p-4 font-semibold text-purple-700">
                      {internship.stipendText || "Performance Based Stipend"}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${
                          internship.status === "published"
                            ? "bg-purple-100 text-purple-800 border border-purple-200"
                            : internship.status === "draft"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {internship.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 text-[11px]">
                      {new Date(internship.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-4 text-right">
                      <OpportunityRowActions id={internship.id} currentStatus={internship.status} />
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
