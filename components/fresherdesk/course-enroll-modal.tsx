"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Send, CheckCircle2, AlertCircle, Info, Sparkles } from "lucide-react";
import { submitLeadApplicationAction } from "@/app/actions/leads";
import type { Course } from "@/lib/fresherdesk-data";

export function CourseEnrollModal({
  course,
  open,
  onOpenChange,
}: {
  course: Course | null;
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

  if (!course) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    formData.set("opportunityId", `course_${course!.slug}`);

    try {
      const res = await submitLeadApplicationAction(formData);
      setResult(res);
      if (res.success) {
        const form = e.target as HTMLFormElement;
        form?.reset();
      }
    } catch {
      setResult({ error: "Unable to submit enrollment. Please check your network connection." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fd-dialog max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase rounded bg-indigo-100 text-indigo-800 flex items-center gap-1">
              <Sparkles size={12} />
              Course Enrollment
            </span>
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Enroll in {course.title}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {course.category} • {course.lessons} lessons • {course.weeks} weeks
          </DialogDescription>
        </DialogHeader>

        {result?.success ? (
          <div className="py-6 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Enrollment Successful!</h3>
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
            <h3 className="text-base font-bold text-slate-900">Already Registered</h3>
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
                <label htmlFor="course-lead-name" className="text-xs font-semibold text-slate-700">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  id="course-lead-name"
                  name="name"
                  required
                  placeholder="e.g. Priya Sharma"
                  disabled={isSubmitting}
                  className="h-10 text-xs"
                />
              </div>

              <div className="form-field">
                <label htmlFor="course-lead-email" className="text-xs font-semibold text-slate-700">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <Input
                  id="course-lead-email"
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
                <label htmlFor="course-lead-phone" className="text-xs font-semibold text-slate-700">
                  Phone / WhatsApp Number <span className="text-rose-500">*</span>
                </label>
                <Input
                  id="course-lead-phone"
                  name="phone"
                  required
                  placeholder="+91 98765 43210"
                  disabled={isSubmitting}
                  className="h-10 text-xs"
                />
              </div>

              <div className="form-field">
                <label htmlFor="course-lead-portfolio" className="text-xs font-semibold text-slate-700">
                  Portfolio / LinkedIn Link (Optional)
                </label>
                <Input
                  id="course-lead-portfolio"
                  name="resumeUrl"
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  disabled={isSubmitting}
                  className="h-10 text-xs"
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="course-lead-note" className="text-xs font-semibold text-slate-700">
                Learning Goals or Current Background (Optional)
              </label>
              <Textarea
                id="course-lead-note"
                name="coverLetter"
                rows={3}
                placeholder="Tell us what you hope to achieve with this course (e.g. looking for a fresher job, college final year project)..."
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
                {isSubmitting ? "Enrolling..." : "Enroll & Start Learning"}
                <Send size={14} />
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
