"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export function AdminOpportunitySearchBar({
  basePath,
  currentQuery = "",
  currentStatus = "all",
  totalCount,
  publishedCount,
  draftCount,
  placeholder = "Search by title, role, company, skills, or location...",
  accentColor = "emerald",
}: {
  basePath: string;
  currentQuery?: string;
  currentStatus?: string;
  totalCount: number;
  publishedCount: number;
  draftCount: number;
  placeholder?: string;
  accentColor?: "emerald" | "purple";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(currentQuery);
  const [isPending, startTransition] = useTransition();

  function buildUrl(q: string, status: string) {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (status && status !== "all") params.set("status", status);
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(() => {
      router.push(buildUrl(searchTerm, currentStatus));
    });
  }

  function handleClear() {
    setSearchTerm("");
    startTransition(() => {
      router.push(buildUrl("", currentStatus));
    });
  }

  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
      {/* Live / Form Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            className="pl-9 pr-9 h-10 text-xs bg-slate-50 border-slate-200 focus:bg-white transition-colors"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="button button-navy compact text-xs px-4 flex items-center gap-1.5 shrink-0"
        >
          {isPending ? <Loader2 size={13} className="animate-spin" /> : null}
          <span>Search</span>
        </button>
      </form>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto shrink-0">
        <Link
          href={buildUrl(searchTerm, "all")}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
            !currentStatus || currentStatus === "all"
              ? "bg-slate-900 text-white shadow-2xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          All ({totalCount})
        </Link>
        <Link
          href={buildUrl(searchTerm, "published")}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
            currentStatus === "published"
              ? accentColor === "purple"
                ? "bg-purple-600 text-white shadow-2xs"
                : "bg-emerald-600 text-white shadow-2xs"
              : accentColor === "purple"
              ? "bg-purple-50 text-purple-700 hover:bg-purple-100"
              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          }`}
        >
          Published ({publishedCount})
        </Link>
        <Link
          href={buildUrl(searchTerm, "draft")}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
            currentStatus === "draft"
              ? "bg-amber-600 text-white shadow-2xs"
              : "bg-amber-50 text-amber-700 hover:bg-amber-100"
          }`}
        >
          Drafts ({draftCount})
        </Link>
      </div>
    </div>
  );
}
