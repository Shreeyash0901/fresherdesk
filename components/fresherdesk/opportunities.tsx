"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import {
  Search,
  MapPin,
  ArrowUpRight,
  Briefcase,
  Bookmark,
  Check,
  Banknote,
  GraduationCap
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import {
  opportunities,
  allOpportunities,
  getOpportunities,
  type Opportunity
} from "@/lib/fresherdesk-data";
import {
  type OpportunityFilterState,
  getAvailableProfiles,
  getAvailableLocations,
  filterOpportunities,
  searchParamsToFilters,
  filtersToSearchParams
} from "@/lib/opportunity-filter-utils";
import {
  OpportunityFilterSidebar,
  OpportunityFiltersDrawer,
  ActiveFilterChips
} from "@/components/fresherdesk/opportunity-filters";

export function Opportunities({ type }: { type: "Job" | "Internship" }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const route = type === "Job" ? "/jobs" : "/internships";

  const [saved, setSaved] = useState<string[]>([]);
  const statusParam = searchParams.get("status");
  const isReviewMode = statusParam === "all" || statusParam === "unverified" || statusParam === "expired";

  // Data source based on review mode
  const dataset = useMemo(() => {
    if (isReviewMode) {
      if (statusParam === "unverified") {
        return allOpportunities.filter(o => o.sourceStatus === "unverified");
      }
      if (statusParam === "expired") {
        return allOpportunities.filter(o => o.sourceStatus === "expired");
      }
      return allOpportunities;
    }
    return getOpportunities(false);
  }, [isReviewMode, statusParam]);

  // Parse filters from URL search params
  const filters = useMemo(() => {
    return searchParamsToFilters(searchParams, type);
  }, [searchParams, type]);

  // Extract available filter options dynamically from current dataset
  const availableProfiles = useMemo(() => {
    return getAvailableProfiles(dataset, type);
  }, [dataset, type]);

  const availableLocations = useMemo(() => {
    return getAvailableLocations(dataset, type);
  }, [dataset, type]);

  // Filter opportunities using unified filter utility
  const filteredResults = useMemo(() => {
    return filterOpportunities(dataset, filters, type);
  }, [dataset, filters, type]);

  // Selected opportunity for detail modal
  const selectedOpportunityId = searchParams.get("opportunity");
  const selectedOpportunity = allOpportunities.find(
    o => o.id === selectedOpportunityId && o.type === type
  );

  // Update URL search parameters
  const updateFilters = (newFilters: OpportunityFilterState) => {
    const p = filtersToSearchParams(newFilters, type, searchParams);
    // Keep opportunity modal open if present
    if (selectedOpportunityId) {
      p.set("opportunity", selectedOpportunityId);
    }
    const queryString = p.toString();
    router.replace(route + (queryString ? `?${queryString}` : ""), {
      scroll: false
    });
  };

  const handleClearAll = () => {
    const p = new URLSearchParams();
    if (selectedOpportunityId) {
      p.set("opportunity", selectedOpportunityId);
    }
    const queryString = p.toString();
    router.replace(route + (queryString ? `?${queryString}` : ""), {
      scroll: false
    });
  };

  const openOpportunityModal = (id: string) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set("opportunity", id);
    router.replace(route + `?${p.toString()}`, { scroll: false });
  };

  const closeOpportunityModal = () => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete("opportunity");
    const queryString = p.toString();
    router.replace(route + (queryString ? `?${queryString}` : ""), {
      scroll: false
    });
  };

  const toggleSave = (o: Opportunity) => {
    setSaved(prev =>
      prev.includes(o.id) ? prev.filter(id => id !== o.id) : [...prev, o.id]
    );
  };

  return (
    <>
      {/* Hero Header Section */}
      <div className="catalogue-heading opportunities-heading">
        <div>
          <span className="eyebrow">TAKE YOUR NEXT STEP</span>
          <h1>
            {type === "Internship"
              ? "Your first experience."
              : "Your next opportunity."}
            <br />
            <span>A place to grow.</span>
          </h1>
          <p>
            {type === "Internship"
              ? "Put your learning into practice and explore the world of work."
              : "Discover roles that give your skills a place to shine."}
          </p>
        </div>
        <span className="demo-badge">Sample listings</span>
      </div>

      {/* Main Two-Column Layout */}
      <div className="opportunity-page-layout">
        {/* Desktop Filter Sidebar */}
        <OpportunityFilterSidebar
          type={type}
          filters={filters}
          onChange={updateFilters}
          availableProfiles={availableProfiles}
          availableLocations={availableLocations}
          onClearAll={handleClearAll}
        />

        {/* Results Column */}
        <section
          className="opportunity-results-column"
          aria-label={type === "Internship" ? "Internship listings" : "Job listings"}
        >
          {/* Mobile & Tablet Filter Drawer Trigger */}
          <div className="opportunity-mobile-toolbar">
            <OpportunityFiltersDrawer
              type={type}
              filters={filters}
              onApply={updateFilters}
              allOpportunities={opportunities}
              availableProfiles={availableProfiles}
              availableLocations={availableLocations}
            />
            <span className="results-count-mobile">
              {filteredResults.length}{" "}
              {filteredResults.length === 1 ? "opportunity" : "opportunities"}
            </span>
          </div>

          {/* Review View Indicator / Toolbar */}
          {isReviewMode && (
            <div className="import-review-banner">
              <div className="import-review-info">
                <strong>Imported Records Review Mode</strong>
                <span>
                  Showing {statusParam === "all" ? "all records (active, unverified, expired)" : statusParam === "unverified" ? "unverified imports" : "expired imports"}
                </span>
              </div>
              <div className="import-review-filters">
                <button
                  type="button"
                  className={"review-tab-btn " + (statusParam === "all" ? "active" : "")}
                  onClick={() => {
                    const p = new URLSearchParams(searchParams.toString());
                    p.set("status", "all");
                    router.replace(route + `?${p.toString()}`, { scroll: false });
                  }}
                >
                  All ({allOpportunities.filter(o => o.type === type).length})
                </button>
                <button
                  type="button"
                  className={"review-tab-btn " + (statusParam === "unverified" ? "active" : "")}
                  onClick={() => {
                    const p = new URLSearchParams(searchParams.toString());
                    p.set("status", "unverified");
                    router.replace(route + `?${p.toString()}`, { scroll: false });
                  }}
                >
                  Unverified ({allOpportunities.filter(o => o.type === type && o.sourceStatus === "unverified").length})
                </button>
                <button
                  type="button"
                  className={"review-tab-btn " + (statusParam === "expired" ? "active" : "")}
                  onClick={() => {
                    const p = new URLSearchParams(searchParams.toString());
                    p.set("status", "expired");
                    router.replace(route + `?${p.toString()}`, { scroll: false });
                  }}
                >
                  Expired ({allOpportunities.filter(o => o.type === type && o.sourceStatus === "expired").length})
                </button>
                <button
                  type="button"
                  className="review-tab-btn exit"
                  onClick={() => {
                    const p = new URLSearchParams(searchParams.toString());
                    p.delete("status");
                    router.replace(route + (p.toString() ? `?${p.toString()}` : ""), { scroll: false });
                  }}
                >
                  Exit Review
                </button>
              </div>
            </div>
          )}

          {/* Results Heading */}
          <div className="results-heading">
            <h2>{type === "Internship" ? "Explore internships" : "Explore jobs"}</h2>
            <div className="flex items-center gap-3">
              {!isReviewMode && (
                <button
                  type="button"
                  className="text-xs font-semibold text-slate-500 hover:text-emerald-700 underline"
                  onClick={() => {
                    const p = new URLSearchParams(searchParams.toString());
                    p.set("status", "all");
                    router.replace(route + `?${p.toString()}`, { scroll: false });
                  }}
                >
                  Inspect imported ({allOpportunities.filter(o => o.isImported && o.type === type).length} records)
                </button>
              )}
              <span aria-live="polite" className="desktop-results-count">
                {filteredResults.length}{" "}
                {filteredResults.length === 1 ? "opportunity" : "opportunities"}
              </span>
            </div>
          </div>

          {/* Active Filter Chips */}
          <ActiveFilterChips
            type={type}
            filters={filters}
            onChange={updateFilters}
            onClearAll={handleClearAll}
          />

          {/* Opportunity Listing Grid */}
          {filteredResults.length > 0 ? (
            <div className="opportunity-grid">
              {filteredResults.map(o => {
                const isSaved = saved.includes(o.id);
                return (
                  <article key={o.id} className="opportunity-card">
                    <div className="opportunity-card-top">
                      <div className="flex items-center gap-2">
                        <span className={"company-logo " + o.tone}>
                          {o.initials}
                        </span>
                        {o.isImported && (
                          <span
                            className={
                              "status-badge " +
                              (o.sourceStatus === "expired"
                                ? "status-expired"
                                : o.sourceStatus === "active"
                                ? "status-active"
                                : "status-unverified")
                            }
                          >
                            {o.sourceStatus === "expired"
                              ? "Expired"
                              : o.sourceStatus === "active"
                              ? "Active"
                              : "Unverified"}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        className={"icon-button " + (isSaved ? "green-text" : "")}
                        onClick={() => toggleSave(o)}
                        aria-label={
                          isSaved
                            ? `Unsave ${o.role} at ${o.company}`
                            : `Save ${o.role} at ${o.company} for this visit`
                        }
                        aria-pressed={isSaved}
                      >
                        <Bookmark
                          size={19}
                          fill={isSaved ? "currentColor" : "none"}
                        />
                      </button>
                    </div>

                    <span className="company-name">{o.company}</span>
                    <h3>
                      <button
                        type="button"
                        onClick={() => openOpportunityModal(o.id)}
                      >
                        {o.role}
                      </button>
                    </h3>

                    <p className="location">
                      <MapPin size={15} />
                      {o.location}
                      {o.mode && (
                        <>
                          <span>·</span>
                          {o.mode}
                        </>
                      )}
                      {o.isPartTime && (
                        <>
                          <span>·</span>
                          <span className="font-semibold text-emerald-600">
                            Part-time
                          </span>
                        </>
                      )}
                      {o.events && o.events.length > 1 && (
                        <>
                          <span>·</span>
                          <span className="text-slate-500 font-medium">
                            {o.events.length} recruitment events
                          </span>
                        </>
                      )}
                    </p>

                    {o.skills && o.skills.length > 0 && (
                      <div className="skill-tags">
                        {o.skills.map(s => (
                          <span key={s}>{s}</span>
                        ))}
                      </div>
                    )}

                    <div className="opportunity-card-bottom">
                      <div className="flex flex-col gap-1">
                        <span>
                          <Briefcase size={14} />
                          {o.experience}
                        </span>
                        {(o.salaryText || o.stipendText) && (
                          <span className="opportunity-salary-badge">
                            <Banknote size={13} />
                            {o.salaryText || o.stipendText}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => openOpportunityModal(o.id)}
                        className="text-link"
                      >
                        View role
                        <ArrowUpRight size={17} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-result">
              <Search size={32} />
              <h3>No opportunities found</h3>
              <p>Try changing your search or clearing a few filters.</p>
              <button
                type="button"
                className="button button-outline"
                onClick={handleClearAll}
              >
                Clear all filters
              </button>
            </div>
          )}

          <p className="listing-note">
            {isReviewMode
              ? "Inspection feed displays imported eLitmus listings grouped by stable Job ID."
              : "These sample roles demonstrate opportunity discovery. They are not live vacancies."}
          </p>
        </section>
      </div>

      {/* Role Detail Modal */}
      <Dialog
        open={!!selectedOpportunity}
        onOpenChange={open => {
          if (!open) closeOpportunityModal();
        }}
      >
        <DialogContent className="fd-dialog">
          {selectedOpportunity && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={"company-logo " + selectedOpportunity.tone}
                  >
                    {selectedOpportunity.initials}
                  </span>
                  <div>
                    <span className="company-name !mt-0">
                      {selectedOpportunity.company}
                    </span>
                    <DialogTitle className="!mt-0">
                      {selectedOpportunity.role}
                    </DialogTitle>
                  </div>
                </div>
                <DialogDescription>
                  {selectedOpportunity.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 my-2 text-sm text-[#506782]">
                {selectedOpportunity.isImported && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Status:</span>
                    <span
                      className={
                        "status-badge " +
                        (selectedOpportunity.sourceStatus === "expired"
                          ? "status-expired"
                          : selectedOpportunity.sourceStatus === "active"
                          ? "status-active"
                          : "status-unverified")
                      }
                    >
                      {selectedOpportunity.sourceStatus === "expired"
                        ? "Expired"
                        : selectedOpportunity.sourceStatus === "active"
                        ? "Active (Verified)"
                        : "Unverified"}
                    </span>
                  </div>
                )}

                <p className="location !mt-0">
                  <MapPin size={15} />
                  {selectedOpportunity.location}
                  {selectedOpportunity.mode && ` · ${selectedOpportunity.mode}`}
                  {selectedOpportunity.isPartTime && " · Part-time"}
                </p>

                {(selectedOpportunity.salaryText ||
                  selectedOpportunity.stipendText) && (
                  <p className="flex items-center gap-2 font-semibold text-[#18a344]">
                    <Banknote size={16} />
                    {selectedOpportunity.salaryText ||
                      selectedOpportunity.stipendText}
                  </p>
                )}

                {selectedOpportunity.compensationNotes && (
                  <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
                    <strong>Compensation note:</strong> {selectedOpportunity.compensationNotes}
                  </p>
                )}

                {selectedOpportunity.referralReward && (
                  <p className="text-xs text-indigo-800 bg-indigo-50 p-2 rounded border border-indigo-200">
                    <strong>Referral Reward:</strong> ₹{selectedOpportunity.referralReward.toLocaleString("en-IN")}
                  </p>
                )}

                <p className="flex items-center gap-2">
                  <Briefcase size={15} />
                  Experience / Batch: {selectedOpportunity.experience}
                </p>

                {selectedOpportunity.eligibility && (
                  <p className="flex items-center gap-2">
                    <GraduationCap size={15} />
                    Eligibility: {selectedOpportunity.eligibility.join(", ")}
                  </p>
                )}

                {/* Preserved recruitment events list */}
                {selectedOpportunity.events && selectedOpportunity.events.length > 0 && (
                  <div className="border-t border-slate-200 pt-3 mt-3">
                    <span className="text-xs font-semibold text-slate-700 block mb-2">
                      Recruitment Events ({selectedOpportunity.events.length})
                    </span>
                    <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                      {selectedOpportunity.events.map((evt, idx) => (
                        <div key={evt.url + idx} className="text-xs bg-slate-50 p-2 rounded border border-slate-200 flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-slate-700">Event #{idx + 1}</span>
                            <span
                              className={
                                "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase " +
                                (evt.sourceStatus.toLowerCase() === "expired"
                                  ? "bg-rose-100 text-rose-700"
                                  : "bg-slate-200 text-slate-700")
                              }
                            >
                              {evt.sourceStatus}
                            </span>
                          </div>
                          {evt.sourceDate && <div><span className="text-slate-500">Source Date:</span> {evt.sourceDate}</div>}
                          {evt.eventTestLocation && <div><span className="text-slate-500">Test Location:</span> {evt.eventTestLocation}</div>}
                          <a
                            href={evt.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:underline flex items-center gap-1 mt-1 font-medium"
                          >
                            View source link <ArrowUpRight size={12} />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {selectedOpportunity.skills && selectedOpportunity.skills.length > 0 && (
                <div className="skill-tags">
                  {selectedOpportunity.skills.map(s => (
                    <span key={s}>{s}</span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3 mt-4">
                <button
                  type="button"
                  className="button button-outline flex-1"
                  onClick={() => toggleSave(selectedOpportunity)}
                >
                  {saved.includes(selectedOpportunity.id) ? (
                    <Check size={17} />
                  ) : (
                    <Bookmark size={17} />
                  )}{" "}
                  {saved.includes(selectedOpportunity.id)
                    ? "Saved"
                    : "Save"}
                </button>

                {selectedOpportunity.activeApplicationUrl ? (
                  <a
                    href={selectedOpportunity.activeApplicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button button-green flex-1"
                  >
                    Apply on site <ArrowUpRight size={16} />
                  </a>
                ) : (
                  <button type="button" disabled className="button button-navy flex-1 opacity-50 cursor-not-allowed">
                    No active link
                  </button>
                )}
              </div>

              <p className="preview-note">
                {selectedOpportunity.isImported
                  ? "Imported listing. Application URL opens the source listing with safe attributes."
                  : "Applications will be enabled for live opportunities when the backend is connected."}
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
