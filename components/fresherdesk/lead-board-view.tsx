"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Phone,
  Building2,
  Calendar,
  AlertTriangle,
  ChevronRight,
  MoreVertical,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";
import { updateLeadStatusAction, type AdminLeadListItem } from "@/app/actions/admin-leads";
import { useRouter } from "next/navigation";

// 1. Job / Internship Pipeline Stages
const JOB_PIPELINE_COLUMNS = [
  {
    id: "new",
    label: "New Lead",
    dotColor: "bg-indigo-600",
    headerBg: "border-indigo-200 text-indigo-900",
  },
  {
    id: "contacted",
    label: "Contacted",
    dotColor: "bg-sky-500",
    headerBg: "border-sky-200 text-sky-900",
  },
  {
    id: "screening",
    label: "Screening",
    dotColor: "bg-blue-600",
    headerBg: "border-blue-200 text-blue-900",
  },
  {
    id: "interview",
    label: "Interview",
    dotColor: "bg-purple-600",
    headerBg: "border-purple-200 text-purple-900",
  },
  {
    id: "shortlisted",
    label: "Shortlisted",
    dotColor: "bg-amber-500",
    headerBg: "border-amber-200 text-amber-900",
  },
  {
    id: "selected",
    label: "Selected / Hired",
    dotColor: "bg-emerald-600",
    headerBg: "border-emerald-200 text-emerald-900",
  },
];

// 2. Course Inquiries & Enrollment Pipeline Stages (Concise clean labels)
const COURSE_PIPELINE_COLUMNS = [
  {
    id: "new",
    label: "New Inquiry",
    dotColor: "bg-indigo-600",
    headerBg: "border-indigo-200 text-indigo-900",
  },
  {
    id: "contacted",
    label: "Contacted",
    dotColor: "bg-sky-500",
    headerBg: "border-sky-200 text-sky-900",
  },
  {
    id: "screening",
    label: "Counselling",
    dotColor: "bg-blue-600",
    headerBg: "border-blue-200 text-blue-900",
  },
  {
    id: "interview",
    label: "Demo Review",
    dotColor: "bg-purple-600",
    headerBg: "border-purple-200 text-purple-900",
  },
  {
    id: "shortlisted",
    label: "Batch & Fee",
    dotColor: "bg-amber-500",
    headerBg: "border-amber-200 text-amber-900",
  },
  {
    id: "selected",
    label: "Enrolled",
    dotColor: "bg-emerald-600",
    headerBg: "border-emerald-200 text-emerald-900",
  },
];

// 3. Workshop Leads & Funnel Stages (Mobile Capture -> Form -> Spot Reserved)
const WORKSHOP_PIPELINE_COLUMNS = [
  {
    id: "new",
    label: "Potential (Phone Only)",
    dotColor: "bg-amber-500",
    headerBg: "border-amber-200 text-amber-900",
  },
  {
    id: "contacted",
    label: "Contacted / Follow-up",
    dotColor: "bg-sky-500",
    headerBg: "border-sky-200 text-sky-900",
  },
  {
    id: "screening",
    label: "Form Started",
    dotColor: "bg-blue-600",
    headerBg: "border-blue-200 text-blue-900",
  },
  {
    id: "shortlisted",
    label: "VIP Waitlist",
    dotColor: "bg-purple-600",
    headerBg: "border-purple-200 text-purple-900",
  },
  {
    id: "selected",
    label: "Spot Confirmed",
    dotColor: "bg-emerald-600",
    headerBg: "border-emerald-200 text-emerald-900",
  },
  {
    id: "withdrawn",
    label: "Abandoned / Cancelled",
    dotColor: "bg-rose-500",
    headerBg: "border-rose-200 text-rose-900",
  },
];

export function LeadBoardView({
  leads,
  type = "all",
}: {
  leads: AdminLeadListItem[];
  type?: string;
}) {
  const router = useRouter();
  const [movingId, setMovingId] = useState<string | null>(null);

  const activeColumns =
    type === "Course"
      ? COURSE_PIPELINE_COLUMNS
      : type === "Workshop"
      ? WORKSHOP_PIPELINE_COLUMNS
      : JOB_PIPELINE_COLUMNS;

  async function handleMoveStage(leadId: string, nextStatus: string) {
    setMovingId(leadId);
    try {
      await updateLeadStatusAction(leadId, nextStatus);
      router.refresh();
    } finally {
      setMovingId(null);
    }
  }

  return (
    <div className="bg-slate-50/60 p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs w-full min-h-[620px]">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 divide-y sm:divide-y-0 xl:divide-x divide-slate-200/90 select-none items-stretch w-full gap-y-3 xl:gap-y-0">
        {activeColumns.map((col, idx) => {
          const columnLeads = leads.filter((l) => l.status === col.id);

          return (
            <div
              key={col.id}
              className={`flex flex-col min-w-0 ${
                idx === 0
                  ? "xl:pr-2"
                  : idx === activeColumns.length - 1
                  ? "xl:pl-2"
                  : "xl:px-2"
              } py-1 sm:py-0`}
            >
              {/* Column Container */}
              <div className="w-full bg-slate-100/70 rounded-xl p-2 border border-slate-200/80 flex flex-col flex-1 max-h-[calc(100vh-210px)] min-w-0">
                {/* Column Header */}
                <div className="flex items-center justify-between px-1 py-1 mb-1.5 gap-1">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${col.dotColor}`} />
                    <h2
                      title={col.label}
                      className="text-[11px] font-bold text-slate-800 tracking-tight truncate"
                    >
                      {col.label}
                    </h2>
                  </div>
                  <span className="w-4.5 h-4.5 shrink-0 rounded-full bg-white text-slate-700 text-[10px] font-bold flex items-center justify-center shadow-2xs border border-slate-200">
                    {columnLeads.length}
                  </span>
                </div>

                {/* Column Card List */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 scrollbar-thin">
                  {columnLeads.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-slate-200/80 rounded-lg">
                      <p className="text-[11px] text-slate-400 font-medium">No leads here</p>
                    </div>
                  ) : (
                columnLeads.map((lead) => {
                  const isUrgent = lead.priority === "urgent" || lead.priority === "high";
                  const currentStageIndex = activeColumns.findIndex((c) => c.id === lead.status);
                  const nextStage =
                    currentStageIndex >= 0 && currentStageIndex < activeColumns.length - 1
                      ? activeColumns[currentStageIndex + 1]
                      : null;

                  return (
                    <div
                      key={lead.id}
                      className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all space-y-2 relative group"
                    >
                      {/* Top row: Name & Quick Stage advance */}
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/admin/leads/${lead.id}`}
                          className="font-bold text-slate-900 text-xs hover:text-emerald-700 hover:underline transition-colors block truncate"
                        >
                          {lead.name}
                        </Link>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                            lead.opportunityType === "Internship"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : lead.opportunityType === "Course"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              : lead.opportunityType === "Workshop"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {lead.opportunityType}
                        </span>
                      </div>

                      {/* Opportunity Role / Pill */}
                      <div className="bg-slate-50 p-1.5 rounded border border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-700 truncate">
                          {lead.opportunityTitle || "General Application"}
                        </span>
                        <span className="text-slate-400 text-[10px] shrink-0">
                          {lead.companyName}
                        </span>
                      </div>

                      {/* Phone & Value/Date Row */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                        <span className="flex items-center gap-1">
                          <Phone size={11} className="text-slate-400" />
                          <span className="font-mono text-[11px]">{lead.phone}</span>
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>

                      {/* Bottom row: Assigned Recruiter & Priority / Manage */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                        <span className="text-slate-600 font-medium truncate max-w-[130px]">
                          {lead.assignedToName ? (
                            lead.assignedToName
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </span>

                        {isUrgent ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600">
                            <AlertTriangle size={11} />
                            <span>Urgent</span>
                          </span>
                        ) : (
                          <Link
                            href={`/admin/leads/${lead.id}`}
                            className="text-[10px] font-semibold text-emerald-700 hover:underline flex items-center gap-0.5"
                          >
                            <span>Manage</span>
                            <ChevronRight size={10} />
                          </Link>
                        )}
                      </div>

                      {/* Single Action Advance Button */}
                      <div className="pt-1.5 flex items-center justify-between gap-1.5 border-t border-slate-100">
                        {nextStage ? (
                          <button
                            type="button"
                            disabled={movingId === lead.id}
                            onClick={() => handleMoveStage(lead.id, nextStage.id)}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 shadow-2xs transition-all active:scale-[0.99]"
                          >
                            <span>Advance to {nextStage.label}</span>
                            <ArrowRight size={12} className="text-emerald-700" />
                          </button>
                        ) : (
                          <div className="w-full flex items-center justify-center gap-1 py-1 px-2 rounded-md text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200">
                            <CheckCircle2 size={12} className="text-emerald-600" />
                            <span>{lead.opportunityType === "Course" ? "Enrolled & Active" : "Candidate Converted"}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      );
    })}
  </div>
</div>
  );
}
