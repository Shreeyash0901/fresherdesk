"use client";

import { useState } from "react";
import { createOpportunityAction } from "@/app/actions/admin-opportunities";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  GraduationCap,
  Layers,
  BookOpen,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function CourseForm() {
  const router = useRouter();
  const [category, setCategory] = useState("Development");
  const [tone, setTone] = useState("lime");
  const [mode, setMode] = useState<"Remote" | "Hybrid" | "On-site">("Remote");
  const [status, setStatus] = useState<"published" | "draft">("published");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    formData.set("type", "Course");
    formData.set("mode", mode);
    formData.set("status", status);
    formData.set("company", "FresherDesk Academy");
    formData.set("location", category); // Store course category in location field
    formData.set("tone", tone);

    // Combine weeks and lessons into experience field format: "16 weeks (128 lessons)"
    const weeks = formData.get("weeks") || "12";
    const lessons = formData.get("lessons") || "80";
    formData.set("experience", `${weeks} weeks (${lessons} lessons)`);

    try {
      const res = await createOpportunityAction(formData);
      if (res.success) {
        setResult({ success: true });
        setTimeout(() => {
          router.push("/admin/courses");
          router.refresh();
        }, 1200);
      } else {
        setResult({ error: res.error || "Failed to create course" });
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
        href="/admin/courses"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={15} />
        Back to Courses
      </Link>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
          <GraduationCap size={22} className="text-indigo-600" />
          Add New Course Program
        </h1>
        <p className="text-xs text-slate-500 mb-6">
          Create and publish a curriculum learning path for students and freshers.
        </p>

        {result?.success && (
          <div className="p-3 mb-5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>Course program created successfully! Redirecting...</span>
          </div>
        )}

        {result?.error && (
          <div className="p-3 mb-5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{result.error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Top Row: Category, Mode & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Course Category <span className="text-rose-500">*</span>
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-10 text-xs bg-slate-50 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Development">Development</SelectItem>
                  <SelectItem value="Cloud">Cloud & DevOps</SelectItem>
                  <SelectItem value="AI / ML">AI & Machine Learning</SelectItem>
                  <SelectItem value="Cyber Security">Cyber Security</SelectItem>
                  <SelectItem value="Data Science">Data Science</SelectItem>
                  <SelectItem value="Design">UI / UX & Design</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Delivery Mode</label>
              <Select value={mode} onValueChange={(v: any) => setMode(v)}>
                <SelectTrigger className="h-10 text-xs bg-slate-50 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Remote">Online (Self-Paced / Live)</SelectItem>
                  <SelectItem value="Hybrid">Hybrid (Online + Mentorship)</SelectItem>
                  <SelectItem value="On-site">Classroom / Bootcamp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Publishing Status</label>
              <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                <SelectTrigger className="h-10 text-xs bg-slate-50 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published (Live on Website)</SelectItem>
                  <SelectItem value="draft">Draft (Private)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Course Title & Short Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="role" className="text-xs font-semibold text-slate-700">
                Full Course Title <span className="text-rose-500">*</span>
              </label>
              <Input
                id="role"
                name="role"
                required
                placeholder="e.g. Full-Stack Software Developer"
                className="h-10 text-xs bg-slate-50 border-slate-200"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="title" className="text-xs font-semibold text-slate-700">
                Short Name / Badge Title <span className="text-rose-500">*</span>
              </label>
              <Input
                id="title"
                name="title"
                required
                placeholder="e.g. Full-Stack Development"
                className="h-10 text-xs bg-slate-50 border-slate-200"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Lessons, Weeks Duration & Certificate */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label htmlFor="lessons" className="text-xs font-semibold text-slate-700">
                Number of Lessons
              </label>
              <Input
                id="lessons"
                name="lessons"
                type="number"
                defaultValue="90"
                placeholder="e.g. 120"
                className="h-10 text-xs bg-slate-50 border-slate-200"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="weeks" className="text-xs font-semibold text-slate-700">
                Duration (in Weeks)
              </label>
              <Input
                id="weeks"
                name="weeks"
                type="number"
                defaultValue="12"
                placeholder="e.g. 16"
                className="h-10 text-xs bg-slate-50 border-slate-200"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="salaryText" className="text-xs font-semibold text-slate-700">
                Tuition / Certification Perk
              </label>
              <Input
                id="salaryText"
                name="salaryText"
                defaultValue="Certificate Included"
                placeholder="e.g. Free / Certificate Included / ₹4,999"
                className="h-10 text-xs bg-slate-50 border-slate-200"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Skills Covered & Visual Tone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="skills" className="text-xs font-semibold text-slate-700">
                Technologies / Skills Covered (Comma separated)
              </label>
              <Input
                id="skills"
                name="skills"
                placeholder="e.g. React, Node.js, Next.js, PostgreSQL"
                className="h-10 text-xs bg-slate-50 border-slate-200"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Card Color Accent</label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="h-10 text-xs bg-slate-50 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lime">Lime / Green</SelectItem>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="purple">Purple</SelectItem>
                  <SelectItem value="mint">Mint</SelectItem>
                  <SelectItem value="peach">Peach</SelectItem>
                  <SelectItem value="rose">Rose</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Key Outcomes */}
          <div className="space-y-1">
            <label htmlFor="eligibility" className="text-xs font-semibold text-slate-700">
              What Students Will Learn (Comma separated bullet points)
            </label>
            <Input
              id="eligibility"
              name="eligibility"
              placeholder="e.g. Build real-world React apps, Master backend REST APIs, Deploy on AWS & Vercel"
              className="h-10 text-xs bg-slate-50 border-slate-200"
              disabled={isSubmitting}
            />
          </div>

          {/* Course Summary */}
          <div className="space-y-1">
            <label htmlFor="description" className="text-xs font-semibold text-slate-700">
              Course Summary & Overview <span className="text-rose-500">*</span>
            </label>
            <Textarea
              id="description"
              name="description"
              required
              rows={4}
              placeholder="Provide a compelling overview of what students will achieve in this program..."
              className="text-xs resize-none bg-slate-50 border-slate-200"
              disabled={isSubmitting}
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <Link
              href="/admin/courses"
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
              {isSubmitting ? "Creating Course..." : "Publish Course Program"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
