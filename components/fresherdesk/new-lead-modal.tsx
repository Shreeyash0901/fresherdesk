"use client";

import { useState } from "react";
import { createManualLeadAction } from "@/app/actions/admin-leads";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, CheckCircle2, AlertCircle, Send } from "lucide-react";
import { useRouter } from "next/navigation";

export function NewLeadModal({
  open,
  onOpenChange,
  opportunities,
  recruiters,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunities: { id: string; title: string; companyName: string; type: string }[];
  recruiters: { id: string; name: string; role: string }[];
}) {
  const router = useRouter();
  const [opportunityId, setOpportunityId] = useState(opportunities[0]?.id || "");
  const [status, setStatus] = useState("new");
  const [priority, setPriority] = useState("normal");
  const [assignedTo, setAssignedTo] = useState("unassigned");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("opportunityId", opportunityId);
    formData.set("status", status);
    formData.set("priority", priority);
    formData.set("assignedTo", assignedTo);

    try {
      const res = await createManualLeadAction(formData);
      if (res.success) {
        onOpenChange(false);
        router.refresh();
      } else {
        setError(res.error || "Failed to create lead");
      }
    } catch {
      setError("Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fd-dialog max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-md bg-blue-50 text-blue-700">
              <UserPlus size={18} />
            </span>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Create New Candidate Lead
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            Add a prospect or candidate lead directly to your recruitment pipeline.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-2.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              Associated Job / Internship <span className="text-rose-500">*</span>
            </label>
            <Select value={opportunityId} onValueChange={setOpportunityId}>
              <SelectTrigger className="h-10 text-xs bg-slate-50 border-slate-200">
                <SelectValue placeholder="Select an opportunity" />
              </SelectTrigger>
              <SelectContent className="max-h-56">
                {opportunities.map((opp) => (
                  <SelectItem key={opp.id} value={opp.id}>
                    [{opp.type}] {opp.title} - {opp.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Candidate Name <span className="text-rose-500">*</span>
              </label>
              <Input
                name="name"
                required
                placeholder="e.g. Madhav Sharma"
                className="h-9 text-xs bg-slate-50"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Contact Phone <span className="text-rose-500">*</span>
              </label>
              <Input
                name="phone"
                required
                placeholder="e.g. 9811100008"
                className="h-9 text-xs bg-slate-50"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <Input
                name="email"
                type="email"
                required
                placeholder="candidate@example.com"
                className="h-9 text-xs bg-slate-50"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Assign Recruiter
              </label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger className="h-9 text-xs bg-slate-50 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">-- Unassigned --</SelectItem>
                  {recruiters.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Pipeline Stage
              </label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-9 text-xs bg-slate-50 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New Lead</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="screening">Screening</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="selected">Selected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Priority Tier
              </label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="h-9 text-xs bg-slate-50 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="normal">Normal Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              Initial Note / Requirement
            </label>
            <Textarea
              name="notes"
              rows={2}
              placeholder="Candidate background, experience level..."
              className="text-xs resize-none bg-slate-50"
              disabled={isSubmitting}
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              className="button button-outline compact text-xs"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="button button-navy compact text-xs flex items-center gap-1.5"
            >
              <Send size={13} />
              {isSubmitting ? "Creating..." : "Create Lead"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
