"use client";

import { useState } from "react";
import {
  updateLeadStatusAction,
  updateLeadPriorityAction,
  assignLeadRecruiterAction,
  addLeadNoteAction,
} from "@/app/actions/admin-leads";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ShieldCheck, UserCheck, AlertCircle, Save, CheckCircle2, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

export function LeadManageControls({
  leadId,
  currentStatus,
  currentPriority,
  currentAssignedTo,
  opportunityType = "Job",
  recruiters,
  existingNotes,
}: {
  leadId: string;
  currentStatus: string;
  currentPriority: string;
  currentAssignedTo: string | null;
  opportunityType?: string;
  recruiters: { id: string; name: string; email: string; role: string }[];
  existingNotes: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [priority, setPriority] = useState(currentPriority);
  const [assignedTo, setAssignedTo] = useState(currentAssignedTo || "unassigned");
  const [newNote, setNewNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const isCourse = opportunityType === "Course";

  async function handleStatusChange(val: string) {
    setStatus(val);
    setIsUpdating(true);
    setMessage(null);
    try {
      await updateLeadStatusAction(leadId, val);
      setMessage({ text: "Status updated successfully!", type: "success" });
      router.refresh();
    } catch {
      setMessage({ text: "Failed to update status", type: "error" });
    } finally {
      setIsUpdating(false);
    }
  }

  async function handlePriorityChange(val: string) {
    setPriority(val);
    setIsUpdating(true);
    setMessage(null);
    try {
      await updateLeadPriorityAction(leadId, val);
      setMessage({ text: "Priority updated!", type: "success" });
      router.refresh();
    } catch {
      setMessage({ text: "Failed to update priority", type: "error" });
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleAssigneeChange(val: string) {
    setAssignedTo(val);
    setIsUpdating(true);
    setMessage(null);
    try {
      const assignee = val === "unassigned" ? null : val;
      await assignLeadRecruiterAction(leadId, assignee);
      setMessage({ text: "Advisor assigned!", type: "success" });
      router.refresh();
    } catch {
      setMessage({ text: "Failed to assign advisor", type: "error" });
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsUpdating(true);
    setMessage(null);
    try {
      await addLeadNoteAction(leadId, newNote.trim());
      setNewNote("");
      setMessage({ text: "Internal note added!", type: "success" });
      router.refresh();
    } catch {
      setMessage({ text: "Failed to add note", type: "error" });
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
      <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
        <ShieldCheck size={18} className="text-slate-400" />
        {isCourse ? "Course Admissions & Enrollment Controls" : "Lead Action Controls"}
      </h2>

      {message && (
        <div
          className={`p-2.5 rounded-md text-xs flex items-center gap-1.5 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 size={15} />
          ) : (
            <AlertCircle size={15} />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Status Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700">Pipeline Stage</label>
        <Select value={status} onValueChange={handleStatusChange} disabled={isUpdating}>
          <SelectTrigger className="h-10 text-xs bg-slate-50 border-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {isCourse ? (
              <>
                <SelectItem value="new">New Inquiry</SelectItem>
                <SelectItem value="contacted">Contacted / Intro Call</SelectItem>
                <SelectItem value="screening">Career Counselling Done</SelectItem>
                <SelectItem value="interview">Demo / Curriculum Review</SelectItem>
                <SelectItem value="shortlisted">Fee / Batch Discussion</SelectItem>
                <SelectItem value="selected">Enrolled & Active</SelectItem>
                <SelectItem value="rejected">Declined / Dropped</SelectItem>
                <SelectItem value="withdrawn">Postponed</SelectItem>
              </>
            ) : (
              <>
                <SelectItem value="new">New / Uncontacted</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="screening">Initial Screening</SelectItem>
                <SelectItem value="interview">Interview Scheduled</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="selected">Offer Extended / Selected</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Priority Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700">Priority Tier</label>
        <Select value={priority} onValueChange={handlePriorityChange} disabled={isUpdating}>
          <SelectTrigger className="h-10 text-xs bg-slate-50 border-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low Priority</SelectItem>
            <SelectItem value="normal">Normal Priority</SelectItem>
            <SelectItem value="high">High Priority</SelectItem>
            <SelectItem value="urgent">Urgent / Fast-Track</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Recruiter Assignee */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700">Assign Recruiter</label>
        <Select value={assignedTo} onValueChange={handleAssigneeChange} disabled={isUpdating}>
          <SelectTrigger className="h-10 text-xs bg-slate-50 border-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">-- Unassigned --</SelectItem>
            {recruiters.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name} ({r.role})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Add Note Section */}
      <form onSubmit={handleAddNote} className="space-y-2 pt-3 border-t border-slate-100">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
          <MessageSquare size={13} /> Add Internal Review Note
        </label>
        <Textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          rows={3}
          placeholder="e.g. Cleared technical round, scheduled HR discussion on Friday..."
          className="text-xs resize-none bg-slate-50"
          disabled={isUpdating}
        />
        <button
          type="submit"
          disabled={isUpdating || !newNote.trim()}
          className="button button-navy compact w-full text-xs"
        >
          <Save size={13} />
          Save Note
        </button>
      </form>

      {/* Existing Notes Display */}
      {existingNotes && (
        <div className="pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Historical Notes
          </span>
          <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-700 whitespace-pre-wrap leading-relaxed border border-slate-200">
            {existingNotes}
          </div>
        </div>
      )}
    </div>
  );
}
