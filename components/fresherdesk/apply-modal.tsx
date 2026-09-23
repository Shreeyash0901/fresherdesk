"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, Send, CheckCircle2, AlertCircle, Info, FileText } from "lucide-react";
import { submitLeadApplicationAction } from "@/app/actions/leads";
import type { Opportunity } from "@/lib/fresherdesk-data";

export function ApplyModal({
  opportunity,
  open,
  onOpenChange,
}: {
  opportunity: Opportunity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    duplicate?: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  if (!opportunity) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    formData.set("opportunityId", opportunity!.id);

    try {
      const res = await submitLeadApplicationAction(formData);
      setResult(res);
      if (res.success) {
        // Reset form if success
        const form = e.target as HTMLFormElement;
        form?.reset();
      }
    } catch (err: any) {
      setResult({ error: "Unable to submit application. Please check your network connection." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fd-dialog max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase rounded bg-emerald-100 text-emerald-800">
              {opportunity.type} Application
            </span>
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Apply for {opportunity.role}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {opportunity.company} • {opportunity.location} • {opportunity.experience}
          </DialogDescription>
        </DialogHeader>

        {result?.success ? (
          <div className="py-6 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Application Submitted!</h3>
            <p className="text-sm text-slate-600 max-w-sm">{result.message}</p>
            <button
              type="button"
              className="button button-navy mt-4"
              onClick={() => {
                setResult(null);
                onOpenChange(false);
              }}
            >
              Done
            </button>
          </div>
        ) : result?.duplicate ? (
          <div className="py-4 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <Info size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-900">Already Applied</h3>
            <p className="text-xs text-slate-600 max-w-sm">{result.message}</p>
            <button
              type="button"
              className="button button-outline mt-3"
              onClick={() => {
                setResult(null);
                onOpenChange(false);
              }}
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 mt-2">
            {result?.error && (
              <div className="flex items-center gap-2 p-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-md">
                <AlertCircle size={16} className="shrink-0" />
                <span>{result.error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="form-field">
                <label htmlFor="lead-name" className="text-xs font-semibold text-slate-700">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  id="lead-name"
                  name="name"
                  required
                  placeholder="e.g. Priya Sharma"
                  disabled={isSubmitting}
                  className="h-10 text-xs"
                />
              </div>

              <div className="form-field">
                <label htmlFor="lead-email" className="text-xs font-semibold text-slate-700">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <Input
                  id="lead-email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  disabled={isSubmitting}
                  className="h-10 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="form-field">
                <label htmlFor="lead-phone" className="text-xs font-semibold text-slate-700">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <Input
                  id="lead-phone"
                  name="phone"
                  required
                  placeholder="+91 98765 43210"
                  disabled={isSubmitting}
                  className="h-10 text-xs"
                />
              </div>

              <div className="form-field">
                <label htmlFor="lead-resume" className="text-xs font-semibold text-slate-700">
                  Resume Link (Google Drive / LinkedIn / Portfolio)
                </label>
                <Input
                  id="lead-resume"
                  name="resumeUrl"
                  type="url"
                  placeholder="https://drive.google.com/..."
                  disabled={isSubmitting}
                  className="h-10 text-xs"
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="lead-cover" className="text-xs font-semibold text-slate-700">
                Brief Note / Cover Letter (Optional)
              </label>
              <Textarea
                id="lead-cover"
                name="coverLetter"
                rows={3}
                placeholder="Highlight your key skills, availability, or relevant projects..."
                disabled={isSubmitting}
                className="text-xs resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                className="button button-outline compact"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="button button-green compact"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
                <Send size={14} />
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
