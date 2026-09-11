"use client";

import React, { useState, useEffect, useRef, useId } from "react";
import {
  Filter,
  Search,
  X,
  SlidersHorizontal,
  Check
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import {
  type OpportunityFilterState,
  type WorkMode,
  type ActiveFilterItem,
  INITIAL_FILTER_STATE,
  JOB_EXPERIENCE_OPTIONS,
  INTERNSHIP_ELIGIBILITY_OPTIONS,
  isAnyFilterActive,
  getActiveFilterCount,
  getActiveFilterItems,
  filterOpportunities
} from "@/lib/opportunity-filter-utils";
import type { Opportunity } from "@/lib/fresherdesk-data";

/* =========================================================================
   SEARCHABLE MULTI-SELECT COMBOBOX (FOR PROFILE & LOCATION)
   ========================================================================= */
interface MultiSelectComboboxProps {
  id: string;
  label: string;
  placeholder: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function MultiSelectCombobox({
  id,
  label,
  placeholder,
  options,
  selected,
  onChange
}: MultiSelectComboboxProps) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = `${id}-listbox`;

  const filteredOptions = options.filter(
    opt =>
      !selected.some(s => s.toLowerCase() === opt.toLowerCase()) &&
      opt.toLowerCase().includes(inputValue.toLowerCase().trim())
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addOption = (opt: string) => {
    if (!selected.some(s => s.toLowerCase() === opt.toLowerCase())) {
      onChange([...selected, opt]);
    }
    setInputValue("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const removeOption = (opt: string) => {
    onChange(selected.filter(s => s !== opt));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(filteredOptions.length - 1);
      } else {
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (isOpen && filteredOptions[highlightedIndex]) {
        addOption(filteredOptions[highlightedIndex]);
      } else if (inputValue.trim()) {
        const exactMatch = options.find(
          o => o.toLowerCase() === inputValue.trim().toLowerCase()
        );
        if (exactMatch) {
          addOption(exactMatch);
        } else {
          addOption(inputValue.trim());
        }
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Backspace" && inputValue === "" && selected.length > 0) {
      removeOption(selected[selected.length - 1]);
    }
  };

  return (
    <div className="filter-group" ref={containerRef}>
      <label htmlFor={id} className="filter-label-title">
        {label}
      </label>
      <div
        className="filter-combobox-wrapper"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="filter-combobox-inner">
          {selected.map(item => (
            <span key={item} className="filter-chip-selected">
              <span>{item}</span>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  removeOption(item);
                }}
                aria-label={`Remove ${item}`}
                className="filter-chip-remove"
              >
                <X size={13} />
              </button>
            </span>
          ))}
          <input
            id={id}
            ref={inputRef}
            type="text"
            className="filter-combobox-input"
            placeholder={selected.length === 0 ? placeholder : ""}
            value={inputValue}
            onChange={e => {
              setInputValue(e.target.value);
              setIsOpen(true);
              setHighlightedIndex(0);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-controls={listboxId}
          />
        </div>
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className="filter-combobox-dropdown"
        >
          {filteredOptions.map((opt, idx) => (
            <li
              key={opt}
              role="option"
              aria-selected={idx === highlightedIndex}
              className={`filter-combobox-option ${
                idx === highlightedIndex ? "highlighted" : ""
              }`}
              onMouseDown={e => {
                e.preventDefault();
                addOption(opt);
              }}
              onMouseEnter={() => setHighlightedIndex(idx)}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* =========================================================================
   REUSABLE FILTER CONTROLS (USED IN DESKTOP SIDEBAR & MOBILE DRAWER)
   ========================================================================= */
interface FilterControlsFormProps {
  type: "Job" | "Internship";
  filters: OpportunityFilterState;
  onChange: (filters: OpportunityFilterState) => void;
  availableProfiles: string[];
  availableLocations: string[];
  onClearAll: () => void;
  isDrawer?: boolean;
}

export function FilterControlsForm({
  type,
  filters,
  onChange,
  availableProfiles,
  availableLocations,
  onClearAll,
  isDrawer = false
}: FilterControlsFormProps) {
  const [prevQ, setPrevQ] = useState(filters.q);
  const [keywordInput, setKeywordInput] = useState(filters.q);
  const prefixId = useId();

  if (filters.q !== prevQ) {
    setPrevQ(filters.q);
    setKeywordInput(filters.q);
  }

  const handleKeywordSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onChange({ ...filters, q: keywordInput });
  };

  const hasActiveFilters = isAnyFilterActive(filters, type);

  return (
    <div className="filter-controls-container">
      {/* 1. Header with Filters icon */}
      <div className="filter-header-row">
        <div className="filter-header-title">
          <span className="filter-header-icon-box" aria-hidden="true">
            <Filter size={17} className="text-[#18a344]" />
          </span>
          <h2 className="filter-heading-text">Filters</h2>
        </div>
        {!isDrawer && (
          <button
            type="button"
            onClick={onClearAll}
            disabled={!hasActiveFilters}
            className="filter-clear-link"
          >
            Clear all
          </button>
        )}
      </div>

      {/* A. Profile Multi-Select */}
      <MultiSelectCombobox
        id={`${prefixId}-profile`}
        label="Profile"
        placeholder={
          type === "Job" ? "e.g. Frontend Developer" : "e.g. Software Engineer"
        }
        options={availableProfiles}
        selected={filters.profiles}
        onChange={profiles => onChange({ ...filters, profiles })}
      />

      {/* B. Location Multi-Select */}
      <MultiSelectCombobox
        id={`${prefixId}-location`}
        label="Location"
        placeholder="e.g. Pune"
        options={availableLocations}
        selected={filters.locations}
        onChange={locations => onChange({ ...filters, locations })}
      />

      {/* C. Work Preferences */}
      <div className="filter-group">
        <span className="filter-label-title">Work preferences</span>
        <div className="filter-checkbox-list">
          <label
            className={`filter-checkbox-item ${
              filters.mode !== "all" ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            <Checkbox
              id={`${prefixId}-wfh`}
              checked={filters.includeWfh && filters.mode === "all"}
              disabled={filters.mode !== "all"}
              onCheckedChange={checked =>
                onChange({ ...filters, includeWfh: checked === true })
              }
            />
            <span className="filter-checkbox-label">
              Include work from home also
            </span>
          </label>
          {filters.mode !== "all" && (
            <p className="filter-hint-note">
              Disabled when an explicit work mode is selected.
            </p>
          )}

          <label className="filter-checkbox-item">
            <Checkbox
              id={`${prefixId}-parttime`}
              checked={filters.partTime}
              onCheckedChange={checked =>
                onChange({ ...filters, partTime: checked === true })
              }
            />
            <span className="filter-checkbox-label">Part-time</span>
          </label>
        </div>

        {/* Work mode selector */}
        <div className="filter-subgroup mt-3">
          <label htmlFor={`${prefixId}-mode`} className="filter-sublabel">
            Work mode
          </label>
          <Select
            value={filters.mode}
            onValueChange={(val: WorkMode) =>
              onChange({
                ...filters,
                mode: val,
                includeWfh: val === "all" ? filters.includeWfh : false
              })
            }
          >
            <SelectTrigger
              id={`${prefixId}-mode`}
              className="filter-select-trigger"
              aria-label="Work mode"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All work modes</SelectItem>
              <SelectItem value="On-site">On-site</SelectItem>
              <SelectItem value="Hybrid">Hybrid</SelectItem>
              <SelectItem value="Remote">Remote</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* D. Compensation Slider */}
      {type === "Job" ? (
        <div className="filter-group">
          <div className="filter-slider-header">
            <label
              htmlFor={`${prefixId}-salary`}
              className="filter-label-title"
            >
              Minimum annual salary (₹ lakh)
            </label>
            <span className="filter-slider-val-badge">
              {filters.minSalary === 0
                ? "Any salary"
                : `₹${filters.minSalary} Lakh/yr+`}
            </span>
          </div>
          <div className="filter-slider-wrapper">
            <Slider
              id={`${prefixId}-salary`}
              min={0}
              max={10}
              step={1}
              value={[filters.minSalary]}
              onValueChange={vals =>
                onChange({ ...filters, minSalary: vals[0] || 0 })
              }
              aria-label="Minimum annual salary in lakhs"
              className="filter-slider-control"
            />
            <div className="filter-slider-marks" aria-hidden="true">
              {[0, 2, 4, 6, 8, 10].map(mark => (
                <button
                  key={mark}
                  type="button"
                  onClick={() => onChange({ ...filters, minSalary: mark })}
                  className={`filter-slider-mark ${
                    filters.minSalary === mark ? "active" : ""
                  }`}
                >
                  {mark}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="filter-group">
          <div className="filter-slider-header">
            <label
              htmlFor={`${prefixId}-stipend`}
              className="filter-label-title"
            >
              Minimum monthly stipend (₹)
            </label>
            <span className="filter-slider-val-badge">
              {filters.minStipend === 0
                ? "Any stipend"
                : `₹${filters.minStipend.toLocaleString("en-IN")}/mo+`}
            </span>
          </div>
          <div className="filter-slider-wrapper">
            <Slider
              id={`${prefixId}-stipend`}
              min={0}
              max={30000}
              step={5000}
              value={[filters.minStipend]}
              onValueChange={vals =>
                onChange({ ...filters, minStipend: vals[0] || 0 })
              }
              aria-label="Minimum monthly stipend in rupees"
              className="filter-slider-control"
            />
            <div className="filter-slider-marks" aria-hidden="true">
              {[
                { val: 0, label: "0" },
                { val: 5000, label: "5k" },
                { val: 10000, label: "10k" },
                { val: 15000, label: "15k" },
                { val: 20000, label: "20k" },
                { val: 25000, label: "25k" },
                { val: 30000, label: "30k" }
              ].map(m => (
                <button
                  key={m.val}
                  type="button"
                  onClick={() => onChange({ ...filters, minStipend: m.val })}
                  className={`filter-slider-mark ${
                    filters.minStipend === m.val ? "active" : ""
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* E. Experience / Eligibility Pills */}
      {type === "Job" ? (
        <div className="filter-group">
          <span className="filter-label-title">Years of experience</span>
          <div className="filter-pills-grid" role="group" aria-label="Years of experience">
            {JOB_EXPERIENCE_OPTIONS.map(exp => {
              const isSelected = filters.experience.includes(exp);
              return (
                <button
                  key={exp}
                  type="button"
                  role="checkbox"
                  aria-checked={isSelected}
                  onClick={() => {
                    const next = isSelected
                      ? filters.experience.filter(e => e !== exp)
                      : [...filters.experience, exp];
                    onChange({ ...filters, experience: next });
                  }}
                  className={`filter-pill-btn ${isSelected ? "selected" : ""}`}
                >
                  {isSelected && <Check size={13} className="mr-1 inline-block" />}
                  {exp}
                  {isSelected && (
                    <span className="filter-pill-x" aria-hidden="true">
                      ×
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="filter-group">
          <span className="filter-label-title">Eligibility</span>
          <div className="filter-pills-grid" role="group" aria-label="Eligibility options">
            {INTERNSHIP_ELIGIBILITY_OPTIONS.map(elig => {
              const isSelected = filters.eligibility.includes(elig);
              return (
                <button
                  key={elig}
                  type="button"
                  role="checkbox"
                  aria-checked={isSelected}
                  onClick={() => {
                    const next = isSelected
                      ? filters.eligibility.filter(e => e !== elig)
                      : [...filters.eligibility, elig];
                    onChange({ ...filters, eligibility: next });
                  }}
                  className={`filter-pill-btn ${isSelected ? "selected" : ""}`}
                >
                  {isSelected && <Check size={13} className="mr-1 inline-block" />}
                  {elig}
                  {isSelected && (
                    <span className="filter-pill-x" aria-hidden="true">
                      ×
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* F. Clear all action for mobile or bottom alignment */}
      {isDrawer && (
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClearAll}
            disabled={!hasActiveFilters}
            className="filter-clear-link"
          >
            Clear all
          </button>
        </div>
      )}

      {/* G. Horizontal Divider */}
      <hr className="filter-divider" />

      {/* H. Keyword Search Box */}
      <div className="filter-group">
        <label htmlFor={`${prefixId}-search`} className="filter-label-title text-center block mb-2 font-semibold">
          Search
        </label>
        <form onSubmit={handleKeywordSubmit} className="filter-search-box">
          <input
            id={`${prefixId}-search`}
            type="text"
            className="filter-search-input"
            placeholder="e.g. React, Pune, Infosys"
            value={keywordInput}
            onChange={e => {
              setKeywordInput(e.target.value);
              // also update real-time if desired or on submit
              if (e.target.value === "") {
                onChange({ ...filters, q: "" });
              }
            }}
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleKeywordSubmit();
              }
            }}
          />
          {keywordInput && (
            <button
              type="button"
              onClick={() => {
                setKeywordInput("");
                onChange({ ...filters, q: "" });
              }}
              className="filter-search-clear"
              aria-label="Clear search input"
            >
              <X size={14} />
            </button>
          )}
          <button
            type="submit"
            className="filter-search-btn"
            aria-label="Submit search"
          >
            <Search size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

/* =========================================================================
   DESKTOP OPPORTUNITY FILTER SIDEBAR
   ========================================================================= */
interface OpportunityFilterSidebarProps {
  type: "Job" | "Internship";
  filters: OpportunityFilterState;
  onChange: (filters: OpportunityFilterState) => void;
  availableProfiles: string[];
  availableLocations: string[];
  onClearAll: () => void;
}

export function OpportunityFilterSidebar({
  type,
  filters,
  onChange,
  availableProfiles,
  availableLocations,
  onClearAll
}: OpportunityFilterSidebarProps) {
  return (
    <aside className="opportunity-sidebar-panel" aria-label="Opportunity filters">
      <FilterControlsForm
        type={type}
        filters={filters}
        onChange={onChange}
        availableProfiles={availableProfiles}
        availableLocations={availableLocations}
        onClearAll={onClearAll}
      />
    </aside>
  );
}

/* =========================================================================
   MOBILE / TABLET OPPORTUNITY FILTERS DRAWER (SHEET)
   ========================================================================= */
interface OpportunityFiltersDrawerProps {
  type: "Job" | "Internship";
  filters: OpportunityFilterState;
  onApply: (draftFilters: OpportunityFilterState) => void;
  allOpportunities: Opportunity[];
  availableProfiles: string[];
  availableLocations: string[];
}

export function OpportunityFiltersDrawer({
  type,
  filters,
  onApply,
  allOpportunities,
  availableProfiles,
  availableLocations
}: OpportunityFiltersDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<OpportunityFilterState>(filters);

  // Sync draft state when drawer opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setDraftFilters(filters);
    }
    setIsOpen(open);
  };

  // Preview result count based on draft selections
  const previewResults = filterOpportunities(allOpportunities, draftFilters, type);
  const activeCount = getActiveFilterCount(filters, type);

  const handleApply = () => {
    onApply(draftFilters);
    setIsOpen(false);
  };

  const handleDraftClearAll = () => {
    setDraftFilters(INITIAL_FILTER_STATE);
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="mobile-filter-trigger-btn"
          aria-label={`Open filters. ${activeCount} active filters`}
        >
          <SlidersHorizontal size={17} />
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="mobile-filter-badge">{activeCount}</span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="mobile-filter-sheet-content">
        <SheetHeader className="mobile-filter-sheet-header">
          <SheetTitle className="flex items-center gap-2 text-lg font-bold text-[#0b2142]">
            <Filter size={18} className="text-[#18a344]" />
            Filters
          </SheetTitle>
        </SheetHeader>

        <div className="mobile-filter-sheet-body">
          <FilterControlsForm
            type={type}
            filters={draftFilters}
            onChange={setDraftFilters}
            availableProfiles={availableProfiles}
            availableLocations={availableLocations}
            onClearAll={handleDraftClearAll}
            isDrawer={true}
          />
        </div>

        <div className="mobile-filter-sheet-footer">
          <button
            type="button"
            onClick={handleDraftClearAll}
            disabled={!isAnyFilterActive(draftFilters, type)}
            className="mobile-drawer-clear-btn"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="button button-green mobile-drawer-apply-btn"
          >
            Show {previewResults.length}{" "}
            {previewResults.length === 1 ? "result" : "results"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* =========================================================================
   ACTIVE FILTER CHIPS BAR (DISPLAYED ABOVE LISTINGS)
   ========================================================================= */
interface ActiveFilterChipsProps {
  type: "Job" | "Internship";
  filters: OpportunityFilterState;
  onChange: (filters: OpportunityFilterState) => void;
  onClearAll: () => void;
}

export function ActiveFilterChips({
  type,
  filters,
  onChange,
  onClearAll
}: ActiveFilterChipsProps) {
  const activeItems = getActiveFilterItems(filters, type);

  if (activeItems.length === 0) return null;

  const removeItem = (item: ActiveFilterItem) => {
    switch (item.category) {
      case "search":
        onChange({ ...filters, q: "" });
        break;
      case "profile":
        onChange({
          ...filters,
          profiles: filters.profiles.filter(p => p !== item.value)
        });
        break;
      case "location":
        onChange({
          ...filters,
          locations: filters.locations.filter(loc => loc !== item.value)
        });
        break;
      case "mode":
        onChange({ ...filters, mode: "all" });
        break;
      case "wfh":
        onChange({ ...filters, includeWfh: false });
        break;
      case "partTime":
        onChange({ ...filters, partTime: false });
        break;
      case "salary":
        onChange({ ...filters, minSalary: 0 });
        break;
      case "stipend":
        onChange({ ...filters, minStipend: 0 });
        break;
      case "experience":
        onChange({
          ...filters,
          experience: filters.experience.filter(e => e !== item.value)
        });
        break;
      case "eligibility":
        onChange({
          ...filters,
          eligibility: filters.eligibility.filter(e => e !== item.value)
        });
        break;
    }
  };

  return (
    <div className="active-filters-bar" aria-label="Active filters">
      <span className="active-filters-label">Active filters:</span>
      <div className="active-chips-wrap">
        {activeItems.map(item => (
          <span key={item.id} className="active-filter-chip">
            <span>{item.label}</span>
            <button
              type="button"
              onClick={() => removeItem(item)}
              aria-label={`Remove filter ${item.label}`}
              className="active-filter-chip-remove"
            >
              <X size={13} />
            </button>
          </span>
        ))}
        <button
          type="button"
          onClick={onClearAll}
          className="active-filters-clear-all"
        >
          Clear all
        </button>
      </div>
    </div>
  );
}
