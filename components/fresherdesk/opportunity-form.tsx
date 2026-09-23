"use client";

import { useState } from "react";
import { createOpportunityAction } from "@/app/actions/admin-opportunities";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Building2, MapPin, IndianRupee, Layers, CheckCircle2, AlertCircle, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function OpportunityForm({ defaultType = "Job" }: { defaultType?: "Job" | "Internship" }) {
  const router = useRouter();
  const [type, setType] = useState<"Job" | "Internship">(defaultType);
  const [mode, setMode] = useState<"Remote" | "Hybrid" | "On-site">("On-site");
  const [status, setStatus] = useState<"published" | "draft">("published");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    formData.set("type", type);
    formData.set("mode", mode);
    formData.set("status", status);

    try {
      const res = await createOpportunityAction(formData);
      if (res.success) {
        setResult({ success: true });
        setTimeout(() => {
          router.push(type === "Job" ? "/admin/jobs" : "/admin/internships");
          router.refresh();
        }, 1200);
      } else {
        setResult({ error: res.error || "Failed to create listing" });
      }
    } catch {
      setResult({ error: "A network error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href={type === "Job" ? "/admin/jobs" : "/admin/internships"}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={15} />
        Back to {type === "Job" ? "Jobs" : "Internships"}
      </Link>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Briefcase size={20} className="text-emerald-600" />
          Add New {type} Opportunity
        </h1>
        <p className="text-xs text-slate-500 mb-6">
          Publish a new {type.toLowerCase()} listing directly to the database and live website.
        </p>

        {result?.success && (
          <div className="p-3 mb-5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>Listing created successfully! Redirecting...</span>
          </div>
        )}

        {result?.error && (
          <div className="p-3 mb-5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{result.error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Top Row: Type & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Opportunity Type</label>
              <Select value={type} onValueChange={(v: any) => setType(v)}>
                <SelectTrigger className="h-10 text-xs bg-slate-50 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Job">Job Opening</SelectItem>
                  <SelectItem value="Internship">Internship Opening</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Workplace Mode</label>
              <Select value={mode} onValueChange={(v: any) => setMode(v)}>
                <SelectTrigger className="h-10 text-xs bg-slate-50 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="On-site">On-site</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                  <SelectItem value="Remote">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Initial Status</label>
              <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                <SelectTrigger className="h-10 text-xs bg-slate-50 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published (Live immediately)</SelectItem>
                  <SelectItem value="draft">Draft (Hidden from public)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Role & Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="role" className="text-xs font-semibold text-slate-700">
                Job / Internship Title <span className="text-rose-500">*</span>
              </label>
              <Input
                id="role"
                name="role"
                required
                placeholder="e.g. Associate Software Engineer / Frontend Intern"
                className="h-10 text-xs bg-slate-50 border-slate-200"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="company" className="text-xs font-semibold text-slate-700">
                Hiring Company Name <span className="text-rose-500">*</span>
              </label>
              <Input
                id="company"
                name="company"
                required
                placeholder="e.g. Google, Flipkart, Razorpay"
                className="h-10 text-xs bg-slate-50 border-slate-200"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Location & Experience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="location" className="text-xs font-semibold text-slate-700">
                Location(s) <span className="text-rose-500">*</span>
              </label>
              <Input
                id="location"
                name="location"
                required
                placeholder="e.g. Bengaluru / Pune / Remote"
                className="h-10 text-xs bg-slate-50 border-slate-200"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="experience" className="text-xs font-semibold text-slate-700">
                Experience / Eligible Batch
              </label>
              <Input
                id="experience"
                name="experience"
                placeholder="e.g. 0-1 Years / 2025-2026 Batch"
                defaultValue="0-1 Years"
                className="h-10 text-xs bg-slate-50 border-slate-200"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Compensation */}
          {type === "Job" ? (
            <div className="space-y-1">
              <label htmlFor="salaryText" className="text-xs font-semibold text-slate-700">
                Salary / CTC Package Details
              </label>
              <Input
                id="salaryText"
                name="salaryText"
                placeholder="e.g. ₹6,00,000 - ₹9,00,000 / yr"
                className="h-10 text-xs bg-slate-50 border-slate-200"
                disabled={isSubmitting}
              />
            </div>
          ) : (
            <div className="space-y-1">
              <label htmlFor="stipendText" className="text-xs font-semibold text-slate-700">
                Stipend Details
              </label>
              <Input
                id="stipendText"
                name="stipendText"
                placeholder="e.g. ₹25,000 - ₹35,000 / month"
                className="h-10 text-xs bg-slate-50 border-slate-200"
                disabled={isSubmitting}
              />
            </div>
          )}

          {/* Skills & Eligibility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="skills" className="text-xs font-semibold text-slate-700">
                Required Skills (Comma separated)
              </label>
              <Input
                id="skills"
                name="skills"
                placeholder="e.g. React, TypeScript, Tailwind, Node.js"
                className="h-10 text-xs bg-slate-50 border-slate-200"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="eligibility" className="text-xs font-semibold text-slate-700">
                Eligibility Criteria (Comma separated)
              </label>
              <Input
                id="eligibility"
                name="eligibility"
                placeholder="e.g. B.Tech / BE in CS/IT, 60%+ in Graduation"
                className="h-10 text-xs bg-slate-50 border-slate-200"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Direct External URL */}
          <div className="space-y-1">
            <label htmlFor="activeApplicationUrl" className="text-xs font-semibold text-slate-700">
              Direct Application Link (Optional)
            </label>
            <Input
              id="activeApplicationUrl"
              name="activeApplicationUrl"
              type="url"
              placeholder="https://company.careers/job/123"
              className="h-10 text-xs bg-slate-50 border-slate-200"
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label htmlFor="description" className="text-xs font-semibold text-slate-700">
              Role Summary & Description
            </label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Provide key responsibilities, requirements, or perks..."
              className="text-xs resize-none bg-slate-50 border-slate-200"
              disabled={isSubmitting}
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <Link
              href={type === "Job" ? "/admin/jobs" : "/admin/internships"}
              className="button button-outline compact text-xs"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="button button-green compact text-xs flex items-center gap-1.5"
            >
              <Send size={13} />
              {isSubmitting ? "Creating Listing..." : `Publish ${type}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
