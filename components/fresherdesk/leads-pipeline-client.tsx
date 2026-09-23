"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  LayoutGrid,
  List,
  Plus,
  RefreshCw,
  Search,
  ChevronDown,
  Eye,
  Phone,
  Building2,
  Calendar,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { LeadBoardView } from "@/components/fresherdesk/lead-board-view";
import { NewLeadModal } from "@/components/fresherdesk/new-lead-modal";
import type { AdminLeadListItem, LeadMetrics } from "@/app/actions/admin-leads";
import { useRouter } from "next/navigation";

export function LeadsPipelineClient({
  leads,
  metrics,
  recruiters,
  opportunities,
  currentQuery,
  currentAssignedTo,
  defaultView = "board",
}: {
  leads: AdminLeadListItem[];
  metrics: LeadMetrics;
  recruiters: { id: string; name: string; role: string }[];
  opportunities: { id: string; title: string; companyName: string; type: string }[];
  currentQuery?: string;
  currentAssignedTo?: string;
  defaultView?: "board" | "list";
}) {
  const router = useRouter();
  const [view, setView] = useState<"board" | "list">(defaultView);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [assignedFilter, setAssignedFilter] = useState(currentAssignedTo || "all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  function handleRecruiterFilterChange(val: string) {
    setAssignedFilter(val);
    const p = new URLSearchParams();
    if (currentQuery) p.set("q", currentQuery);
    if (val && val !== "all") p.set("assignedTo", val);
    router.push("/admin/leads" + (p.size ? `?${p.toString()}` : ""));
  }

  function handleRefresh() {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 500);
  }

  const statusBadgeColor: Record<string, string> = {
    new: "bg-blue-100 text-blue-800 border-blue-200",
    contacted: "bg-sky-100 text-sky-800 border-sky-200",
    screening: "bg-amber-100 text-amber-800 border-amber-200",
    interview: "bg-purple-100 text-purple-800 border-purple-200",
    shortlisted: "bg-emerald-100 text-emerald-800 border-emerald-200",
    selected: "bg-teal-100 text-teal-800 border-teal-200",
    rejected: "bg-rose-100 text-rose-800 border-rose-200",
    withdrawn: "bg-slate-100 text-slate-800 border-slate-200",
  };

  return (
    <div className="space-y-5">
      {/* Top Header Row matching Reference Design */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Lead pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            <span className="font-semibold text-slate-700">{leads.length} open leads</span> · pipeline active
          </p>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Recruiter / Everyone Filter Dropdown */}
          <div className="relative">
            <select
              value={assignedFilter}
              onChange={(e) => handleRecruiterFilterChange(e.target.value)}
              className="h-9 px-3 pr-8 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 focus:outline-emerald-500 appearance-none cursor-pointer"
            >
              <option value="all">Everyone</option>
              {recruiters.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Refresh button */}
          <button
            type="button"
            onClick={handleRefresh}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-2xs transition-colors"
            title="Refresh pipeline"
          >
            <RefreshCw size={15} className={isRefreshing ? "animate-spin" : ""} />
          </button>

          {/* View Switcher: Board vs List */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setView("board")}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                view === "board"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutGrid size={13} />
              <span>Board</span>
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                view === "list"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <List size={13} />
              <span>List</span>
            </button>
          </div>

          {/* + New Lead Primary Button */}
          <button
            type="button"
            onClick={() => setNewModalOpen(true)}
            className="button button-navy compact text-xs flex items-center gap-1.5 shadow-2xs"
          >
            <Plus size={15} />
            <span>New lead</span>
          </button>
        </div>
      </div>

      {/* Render View: Board vs List */}
      {view === "board" ? (
        <LeadBoardView leads={leads} />
      ) : (
        /* Tabular List View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="p-4">Candidate</th>
                  <th className="p-4">Opportunity</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Assigned To</th>
                  <th className="p-4">Applied Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">
                      <Users size={32} className="mx-auto mb-2 text-slate-300" />
                      <p className="font-semibold text-slate-700">No leads found in this filter</p>
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-medium text-slate-900">
                        <Link
                          href={`/admin/leads/${lead.id}`}
                          className="font-bold text-slate-900 hover:text-emerald-700 block"
                        >
                          {lead.name}
                        </Link>
                        <span className="text-[11px] text-slate-500">{lead.email}</span>
                        <span className="text-[11px] text-slate-400 block">{lead.phone}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-800 block">{lead.opportunityTitle}</span>
                        <span className="text-[11px] text-slate-400">{lead.companyName}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {lead.opportunityType}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold capitalize border ${statusBadgeColor[lead.status] || "bg-slate-100"}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="p-4 capitalize">{lead.priority}</td>
                      <td className="p-4 text-slate-600">
                        {lead.assignedToName || <span className="text-slate-400 italic">Unassigned</span>}
                      </td>
                      <td className="p-4 text-slate-400 text-[11px]">
                        {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/admin/leads/${lead.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
                        >
                          <Eye size={13} />
                          <span>Manage</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual "+ New Lead" Modal */}
      <NewLeadModal
        open={newModalOpen}
        onOpenChange={setNewModalOpen}
        opportunities={opportunities}
        recruiters={recruiters}
      />
    </div>
  );
}
