import type { Opportunity } from "./fresherdesk-data";

export type WorkMode = "all" | "Remote" | "Hybrid" | "On-site";

export interface OpportunityFilterState {
  q: string;
  profiles: string[];
  locations: string[];
  mode: WorkMode;
  includeWfh: boolean;
  partTime: boolean;
  minSalary: number; // in LPA (0 means any)
  minStipend: number; // in ₹/mo (0 means any)
  experience: string[]; // ["Fresher", "0–1 years", "1–2 years", "2–3 years", "3+ years"]
  eligibility: string[]; // ["Students", "Freshers", "Graduates"]
}

export const INITIAL_FILTER_STATE: OpportunityFilterState = {
  q: "",
  profiles: [],
  locations: [],
  mode: "all",
  includeWfh: false,
  partTime: false,
  minSalary: 0,
  minStipend: 0,
  experience: [],
  eligibility: []
};

export const JOB_EXPERIENCE_OPTIONS = [
  "Fresher",
  "0–1 years",
  "1–2 years",
  "2–3 years",
  "3+ years"
];

export const INTERNSHIP_ELIGIBILITY_OPTIONS = [
  "Students",
  "Freshers",
  "Graduates"
];

export function getAvailableProfiles(opportunities: Opportunity[], type: "Job" | "Internship"): string[] {
  const set = new Set<string>();
  opportunities
    .filter(o => o.type === type)
    .forEach(o => {
      if (o.profile) set.add(o.profile);
    });
  return Array.from(set).sort();
}

export function getAvailableLocations(opportunities: Opportunity[], type: "Job" | "Internship"): string[] {
  const set = new Set<string>();
  opportunities
    .filter(o => o.type === type)
    .forEach(o => {
      if (o.location) {
        // Handle comma-separated cities cleanly
        const parts = o.location.split(",").map(s => s.trim().replace(/\s*\(.*?\)\s*/g, "").replace(/\s*,\s*India$/i, "").replace(/\s*,\s*Karnataka$/i, "").replace(/\s*,\s*Maharashtra$/i, "").replace(/\s*,\s*Tamil Nadu$/i, "").replace(/\s*,\s*Telangana$/i, "").replace(/\s*,\s*Haryana$/i, "")).filter(Boolean);
        parts.forEach(p => {
          if (p && p.length > 2 && !["India", "Karnataka", "Maharashtra", "Tamil Nadu", "Telangana", "Haryana"].includes(p)) {
            set.add(p);
          }
        });
        // Also add the full raw normalized city base if single
        if (parts.length <= 1) {
          const mainCity = o.location.split(",")[0].trim();
          if (mainCity) set.add(mainCity);
        }
      }
    });
  return Array.from(set).sort();
}

export function matchesExperience(o: Opportunity, selectedExp: string): boolean {
  const normalized = selectedExp.trim();
  if (normalized === "Fresher") {
    return (
      o.acceptsFreshers === true ||
      o.minExperience === 0 ||
      (typeof o.experience === "string" && o.experience.toLowerCase().includes("fresher"))
    );
  }
  if (normalized === "0–1 years" || normalized === "0-1 years" || normalized === "0-1") {
    return (
      o.minExperience !== undefined &&
      o.minExperience <= 1 &&
      (o.maxExperience !== undefined ? o.maxExperience >= 0 : true)
    );
  }
  if (normalized === "1–2 years" || normalized === "1-2 years" || normalized === "1-2") {
    return (
      o.minExperience !== undefined &&
      o.minExperience <= 2 &&
      (o.maxExperience !== undefined ? o.maxExperience >= 1 : true)
    );
  }
  if (normalized === "2–3 years" || normalized === "2-3 years" || normalized === "2-3") {
    return (
      o.minExperience !== undefined &&
      o.minExperience <= 3 &&
      (o.maxExperience !== undefined ? o.maxExperience >= 2 : true)
    );
  }
  if (normalized === "3+ years" || normalized === "3+" || normalized === "3+ years") {
    return (
      (o.maxExperience !== undefined && o.maxExperience >= 3) ||
      (o.minExperience !== undefined && o.minExperience >= 3)
    );
  }
  return true;
}

export function filterOpportunities(
  opportunities: Opportunity[],
  filters: OpportunityFilterState,
  type: "Job" | "Internship"
): Opportunity[] {
  return opportunities.filter(o => {
    // 1. Type filter
    if (o.type !== type) return false;

    // 2. Keyword search
    if (filters.q.trim()) {
      const searchTerms = filters.q.toLowerCase().trim();
      const searchableString = [
        o.role,
        o.company,
        o.location,
        o.profile || "",
        o.description,
        ...(o.skills || [])
      ]
        .join(" ")
        .toLowerCase();
      if (!searchableString.includes(searchTerms)) {
        return false;
      }
    }

    // 3. Profiles (OR within group)
    if (filters.profiles.length > 0) {
      const matchesProfile = filters.profiles.some(p => {
        const pLower = p.toLowerCase();
        return (
          (o.profile && o.profile.toLowerCase() === pLower) ||
          o.role.toLowerCase().includes(pLower)
        );
      });
      if (!matchesProfile) return false;
    }

    // 4. Location, Mode & WFH preference
    if (filters.mode !== "all") {
      // Explicit mode takes precedence (if mode is unspecified on the opportunity, it does not match Remote/Hybrid/On-site)
      if (!o.mode || o.mode !== filters.mode) return false;
      if (filters.locations.length > 0) {
        const matchesLoc = filters.locations.some(loc => {
          const lLower = loc.toLowerCase();
          return o.location.toLowerCase().includes(lLower);
        });
        if (!matchesLoc) return false;
      }
    } else {
      // Mode is "all"
      if (filters.locations.length > 0) {
        const matchesLoc = filters.locations.some(loc => {
          const lLower = loc.toLowerCase();
          return o.location.toLowerCase().includes(lLower);
        });
        if (filters.includeWfh) {
          // Include remote opportunities also
          if (!matchesLoc && o.mode !== "Remote") {
            return false;
          }
        } else {
          if (!matchesLoc) {
            return false;
          }
        }
      }
    }

    // 5. Part-time
    if (filters.partTime) {
      if (!o.isPartTime) return false;
    }

    // 6. Compensation
    if (type === "Job" && filters.minSalary > 0) {
      const hasSalary = o.salaryMax !== undefined || o.salaryMin !== undefined;
      if (!hasSalary) return false;
      const meetsSalary =
        (o.salaryMax !== undefined && o.salaryMax >= filters.minSalary) ||
        (o.salaryMin !== undefined && o.salaryMin >= filters.minSalary);
      if (!meetsSalary) return false;
    }

    if (type === "Internship" && filters.minStipend > 0) {
      const hasStipend = o.stipendMax !== undefined || o.stipendMin !== undefined;
      if (!hasStipend) return false;
      const meetsStipend =
        (o.stipendMax !== undefined && o.stipendMax >= filters.minStipend) ||
        (o.stipendMin !== undefined && o.stipendMin >= filters.minStipend);
      if (!meetsStipend) return false;
    }

    // 7. Experience / Eligibility
    if (type === "Job" && filters.experience.length > 0) {
      const matchesAnyExp = filters.experience.some(exp => matchesExperience(o, exp));
      if (!matchesAnyExp) return false;
    }

    if (type === "Internship" && filters.eligibility.length > 0) {
      const matchesAnyElig = filters.eligibility.some(e =>
        o.eligibility?.some(oe => oe.toLowerCase() === e.toLowerCase())
      );
      if (!matchesAnyElig) return false;
    }

    return true;
  });
}

export function searchParamsToFilters(
  searchParams: URLSearchParams,
  type: "Job" | "Internship"
): OpportunityFilterState {
  const q = searchParams.get("q") || "";
  const profileParam = searchParams.get("profile");
  const profiles = profileParam ? profileParam.split(",").map(s => s.trim()).filter(Boolean) : [];

  const locationParam = searchParams.get("location");
  const locations = locationParam ? locationParam.split(",").map(s => s.trim()).filter(Boolean) : [];

  const modeParam = searchParams.get("mode");
  const mode: WorkMode =
    modeParam === "Remote" || modeParam === "Hybrid" || modeParam === "On-site"
      ? modeParam
      : "all";

  const includeWfh = searchParams.get("wfh") === "true" || searchParams.get("wfh") === "1";
  const partTime = searchParams.get("partTime") === "true" || searchParams.get("partTime") === "1";

  const salaryParam = searchParams.get("salary");
  const minSalary = salaryParam ? Math.max(0, parseFloat(salaryParam) || 0) : 0;

  const stipendParam = searchParams.get("stipend");
  const minStipend = stipendParam ? Math.max(0, parseInt(stipendParam, 10) || 0) : 0;

  const expParam = searchParams.get("exp");
  const experience = expParam ? expParam.split(",").map(s => s.trim()).filter(Boolean) : [];

  const eligParam = searchParams.get("eligibility");
  const eligibility = eligParam ? eligParam.split(",").map(s => s.trim()).filter(Boolean) : [];

  return {
    q,
    profiles,
    locations,
    mode,
    includeWfh,
    partTime,
    minSalary: type === "Job" ? minSalary : 0,
    minStipend: type === "Internship" ? minStipend : 0,
    experience: type === "Job" ? experience : [],
    eligibility: type === "Internship" ? eligibility : []
  };
}

export function filtersToSearchParams(
  filters: OpportunityFilterState,
  type: "Job" | "Internship",
  existingParams?: URLSearchParams
): URLSearchParams {
  const p = new URLSearchParams(existingParams ? existingParams.toString() : "");

  // Update filters
  if (filters.q.trim()) p.set("q", filters.q.trim());
  else p.delete("q");

  if (filters.profiles.length > 0) p.set("profile", filters.profiles.join(","));
  else p.delete("profile");

  if (filters.locations.length > 0) p.set("location", filters.locations.join(","));
  else p.delete("location");

  if (filters.mode && filters.mode !== "all") p.set("mode", filters.mode);
  else p.delete("mode");

  if (filters.includeWfh && filters.mode === "all") p.set("wfh", "true");
  else p.delete("wfh");

  if (filters.partTime) p.set("partTime", "true");
  else p.delete("partTime");

  if (type === "Job") {
    if (filters.minSalary > 0) p.set("salary", filters.minSalary.toString());
    else p.delete("salary");
    p.delete("stipend");
    p.delete("eligibility");

    if (filters.experience.length > 0) p.set("exp", filters.experience.join(","));
    else p.delete("exp");
  } else {
    if (filters.minStipend > 0) p.set("stipend", filters.minStipend.toString());
    else p.delete("stipend");
    p.delete("salary");
    p.delete("exp");

    if (filters.eligibility.length > 0) p.set("eligibility", filters.eligibility.join(","));
    else p.delete("eligibility");
  }

  return p;
}

export function isAnyFilterActive(filters: OpportunityFilterState, type: "Job" | "Internship"): boolean {
  if (filters.q.trim()) return true;
  if (filters.profiles.length > 0) return true;
  if (filters.locations.length > 0) return true;
  if (filters.mode !== "all") return true;
  if (filters.includeWfh && filters.mode === "all") return true;
  if (filters.partTime) return true;
  if (type === "Job") {
    if (filters.minSalary > 0) return true;
    if (filters.experience.length > 0) return true;
  } else {
    if (filters.minStipend > 0) return true;
    if (filters.eligibility.length > 0) return true;
  }
  return false;
}

export function getActiveFilterCount(filters: OpportunityFilterState, type: "Job" | "Internship"): number {
  let count = 0;
  if (filters.q.trim()) count++;
  count += filters.profiles.length;
  count += filters.locations.length;
  if (filters.mode !== "all") count++;
  if (filters.includeWfh && filters.mode === "all") count++;
  if (filters.partTime) count++;
  if (type === "Job") {
    if (filters.minSalary > 0) count++;
    count += filters.experience.length;
  } else {
    if (filters.minStipend > 0) count++;
    count += filters.eligibility.length;
  }
  return count;
}

export interface ActiveFilterItem {
  id: string;
  category: "search" | "profile" | "location" | "mode" | "wfh" | "partTime" | "salary" | "stipend" | "experience" | "eligibility";
  label: string;
  value?: string;
}

export function getActiveFilterItems(filters: OpportunityFilterState, type: "Job" | "Internship"): ActiveFilterItem[] {
  const items: ActiveFilterItem[] = [];

  if (filters.q.trim()) {
    items.push({
      id: `search-${filters.q}`,
      category: "search",
      label: `Search: "${filters.q.trim()}"`
    });
  }

  filters.profiles.forEach(p => {
    items.push({
      id: `profile-${p}`,
      category: "profile",
      label: `Profile: ${p}`,
      value: p
    });
  });

  filters.locations.forEach(loc => {
    items.push({
      id: `location-${loc}`,
      category: "location",
      label: `Location: ${loc}`,
      value: loc
    });
  });

  if (filters.mode !== "all") {
    items.push({
      id: `mode-${filters.mode}`,
      category: "mode",
      label: `Mode: ${filters.mode}`,
      value: filters.mode
    });
  }

  if (filters.includeWfh && filters.mode === "all") {
    items.push({
      id: "wfh",
      category: "wfh",
      label: "Include WFH"
    });
  }

  if (filters.partTime) {
    items.push({
      id: "partTime",
      category: "partTime",
      label: "Part-time"
    });
  }

  if (type === "Job") {
    if (filters.minSalary > 0) {
      items.push({
        id: `salary-${filters.minSalary}`,
        category: "salary",
        label: `Min Salary: ₹${filters.minSalary} LPA+`
      });
    }

    filters.experience.forEach(exp => {
      items.push({
        id: `exp-${exp}`,
        category: "experience",
        label: `Exp: ${exp}`,
        value: exp
      });
    });
  } else {
    if (filters.minStipend > 0) {
      items.push({
        id: `stipend-${filters.minStipend}`,
        category: "stipend",
        label: `Min Stipend: ₹${filters.minStipend.toLocaleString("en-IN")}/mo+`
      });
    }

    filters.eligibility.forEach(e => {
      items.push({
        id: `eligibility-${e}`,
        category: "eligibility",
        label: `Eligibility: ${e}`,
        value: e
      });
    });
  }

  return items;
}
