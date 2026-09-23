import Link from "next/link";
import { notFound } from "next/navigation";
import { getLeadDetail } from "@/app/actions/admin-leads";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Briefcase,
  Layers,
  MapPin,
  Calendar,
  ExternalLink,
  Clock,
  History,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { LeadManageControls } from "./lead-controls";

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getLeadDetail(id);

  if (!data || !data.lead) {
    notFound();
  }

  const { lead, history, recruiters } = data;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Back Link */}
      <Link
        href="/admin/leads"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={15} />
        Back to Leads Pipeline
      </Link>

      {/* Main Header Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                lead.opportunityType === "Internship"
                  ? "bg-purple-100 text-purple-700 border border-purple-200"
                  : "bg-blue-100 text-blue-700 border border-blue-200"
              }`}
            >
              {lead.opportunityType} Lead
            </span>
            <span className="text-xs text-slate-400">ID: {lead.id}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{lead.name}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Applied for{" "}
            <span className="font-semibold text-slate-800">
              {lead.opportunityTitle}
            </span>{" "}
            at{" "}
            <span className="font-semibold text-slate-800">
              {lead.companyName}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Current Status</span>
            <span className="text-sm font-bold capitalize text-emerald-700">
              {lead.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Management */}
        <div className="lg:col-span-2 space-y-6">
          {/* Candidate Profile Details */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User size={18} className="text-slate-400" />
              Candidate Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1 flex items-center gap-1">
                  <Mail size={13} /> Email Address
                </span>
                <span className="font-semibold text-slate-800 break-all">{lead.email}</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1 flex items-center gap-1">
                  <Phone size={13} /> Contact Number
                </span>
                <span className="font-semibold text-slate-800">{lead.phone}</span>
              </div>
            </div>

            {lead.resumeUrl && (
              <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <FileText size={16} className="text-emerald-700" />
                  <span className="font-semibold text-emerald-900">
                    Candidate Resume / Portfolio
                  </span>
                </div>
                <a
                  href={lead.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline"
                >
                  View Link <ExternalLink size={12} />
                </a>
              </div>
            )}

            {lead.coverLetter && (
              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-700 block mb-1">
                  Cover Letter / Candidate Note:
                </span>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {lead.coverLetter}
                </div>
              </div>
            )}
          </div>

          {/* Opportunity Summary Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Briefcase size={18} className="text-slate-400" />
              Opportunity Context
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Company</span>
                <span className="font-semibold text-slate-800">{lead.companyName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Location</span>
                <span className="font-semibold text-slate-800">{lead.location}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Experience Requirement</span>
                <span className="font-semibold text-slate-800">{lead.experience}</span>
              </div>
            </div>
          </div>

          {/* Activity Timeline / History */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History size={18} className="text-slate-400" />
              Lead Audit & Activity Timeline
            </h2>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {history.map((hist) => (
                <div key={hist.id} className="relative">
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-white" />
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="font-semibold text-slate-800">
                        {hist.action.replace(/_/g, " ")}
                      </span>
                      <span className="text-[10px]">
                        {new Date(hist.createdAt).toLocaleString("en-IN")}
                      </span>
                    </div>
                    {hist.note && (
                      <p className="text-slate-600 font-medium">{hist.note}</p>
                    )}
                    <p className="text-[10px] text-slate-400">
                      By: {hist.actorName || "System"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Lead Control Center */}
        <div className="space-y-6">
          <LeadManageControls
            leadId={lead.id}
            currentStatus={lead.status}
            currentPriority={lead.priority}
            currentAssignedTo={lead.assignedTo}
            recruiters={recruiters}
            existingNotes={lead.notes}
          />
        </div>
      </div>
    </div>
  );
}
