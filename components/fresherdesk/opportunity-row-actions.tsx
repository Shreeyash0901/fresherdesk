"use client";

import { useState } from "react";
import { toggleOpportunityStatusAction } from "@/app/actions/admin-opportunities";
import { Eye, EyeOff, Archive, CheckCircle, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

export function OpportunityRowActions({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle(newStatus: "draft" | "published" | "archived") {
    setLoading(true);
    try {
      await toggleOpportunityStatusAction(id, newStatus);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      {currentStatus === "published" ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => handleToggle("draft")}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
          title="Unpublish (Save as draft)"
        >
          <EyeOff size={12} />
          <span>Unpublish</span>
        </button>
      ) : (
        <button
          type="button"
          disabled={loading}
          onClick={() => handleToggle("published")}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
          title="Publish listing"
        >
          <CheckCircle size={12} />
          <span>Publish</span>
        </button>
      )}

      <button
        type="button"
        disabled={loading}
        onClick={() => handleToggle("archived")}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
        title="Archive listing"
      >
        <Archive size={12} />
        <span>Archive</span>
      </button>
    </div>
  );
}
