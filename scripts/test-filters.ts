import { opportunities } from "../lib/fresherdesk-data.js";
import {
  filterOpportunities,
  searchParamsToFilters,
  filtersToSearchParams,
  INITIAL_FILTER_STATE,
  matchesExperience,
  isAnyFilterActive,
  getActiveFilterCount
} from "../lib/opportunity-filter-utils.js";

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    passed++;
    console.log(`✓ PASS: ${msg}`);
  } else {
    failed++;
    console.error(`✗ FAIL: ${msg}`);
  }
}

console.log("--- Testing Opportunity Filter Logic ---");

// 1. Initial / default state on Jobs
const allJobs = filterOpportunities(opportunities, INITIAL_FILTER_STATE, "Job");
assert(allJobs.length === 7, `All jobs returned with empty filters (got ${allJobs.length}, expected 7)`);

// 2. Initial / default state on Internships
const allInternships = filterOpportunities(opportunities, INITIAL_FILTER_STATE, "Internship");
assert(allInternships.length === 6, `All internships returned with empty filters (got ${allInternships.length}, expected 6)`);

// 3. Profile filtering
const frontendJobs = filterOpportunities(
  opportunities,
  { ...INITIAL_FILTER_STATE, profiles: ["Frontend Developer"] },
  "Job"
);
assert(frontendJobs.length === 1 && frontendJobs[0].role === "Junior Frontend Developer", "Profile filter matches Frontend Developer");

const multiProfileJobs = filterOpportunities(
  opportunities,
  { ...INITIAL_FILTER_STATE, profiles: ["Frontend Developer", "Software Engineer"] },
  "Job"
);
assert(multiProfileJobs.length === 2, `Multi-profile filter matches 2 jobs (got ${multiProfileJobs.length})`);

// 4. Location filtering
const puneJobs = filterOpportunities(
  opportunities,
  { ...INITIAL_FILTER_STATE, locations: ["Pune"] },
  "Job"
);
assert(puneJobs.length === 2, `Location filter for Pune returns 2 jobs (got ${puneJobs.length})`);

// 5. WFH inclusion logic:
// When locations: ["Pune"], mode: "all", and includeWfh: true -> should match Pune jobs PLUS Remote jobs
const punePlusRemoteJobs = filterOpportunities(
  opportunities,
  { ...INITIAL_FILTER_STATE, locations: ["Pune"], mode: "all", includeWfh: true },
  "Job"
);
// Pune jobs (2) + Remote jobs in other locations (Bengaluru AI: 1, Delhi NCR Analyst: 1) = 4 jobs
assert(punePlusRemoteJobs.length === 4, `Pune location + WFH inclusion returns Pune & Remote jobs (got ${punePlusRemoteJobs.length}, expected 4)`);

// 6. Explicit work mode overrides
const remoteOnlyJobs = filterOpportunities(
  opportunities,
  { ...INITIAL_FILTER_STATE, mode: "Remote" },
  "Job"
);
assert(remoteOnlyJobs.length === 3, `Explicit Remote mode returns 3 remote jobs (got ${remoteOnlyJobs.length})`);

// 7. Part-time filter
const partTimeJobs = filterOpportunities(
  opportunities,
  { ...INITIAL_FILTER_STATE, partTime: true },
  "Job"
);
assert(partTimeJobs.length === 2, `Part-time filter returns only part-time jobs (got ${partTimeJobs.length}, expected 2)`);

// 8. Minimum salary slider
const minSalary6Jobs = filterOpportunities(
  opportunities,
  { ...INITIAL_FILTER_STATE, minSalary: 6 },
  "Job"
);
// Max salary >= 6: Orbit (6), Cloudline (9), Apex (8), Quantum (12), Synthetix (15), DataVibe (6.5) -> 6 jobs
assert(minSalary6Jobs.length === 6, `Min salary 6 LPA matches jobs with max salary >= 6 (got ${minSalary6Jobs.length})`);

const minSalary10Jobs = filterOpportunities(
  opportunities,
  { ...INITIAL_FILTER_STATE, minSalary: 10 },
  "Job"
);
// Quantum (12), Synthetix (15) -> 2 jobs
assert(minSalary10Jobs.length === 2, `Min salary 10 LPA matches high salary jobs (got ${minSalary10Jobs.length})`);

// 9. Minimum stipend slider
const minStipend20kInternships = filterOpportunities(
  opportunities,
  { ...INITIAL_FILTER_STATE, minStipend: 20000 },
  "Internship"
);
// Northstar (20k), Mint (25k), HyperScale (35k), QuantData (22k) -> 4 internships
assert(minStipend20kInternships.length === 4, `Min stipend 20k matches internships (got ${minStipend20kInternships.length})`);

// 10. Experience matching
const fresherJobs = filterOpportunities(
  opportunities,
  { ...INITIAL_FILTER_STATE, experience: ["Fresher"] },
  "Job"
);
assert(fresherJobs.length === 4, `Fresher filter matches 4 fresher-accepting jobs (got ${fresherJobs.length})`);

// 11. Internship eligibility
const studentInternships = filterOpportunities(
  opportunities,
  { ...INITIAL_FILTER_STATE, eligibility: ["Students"] },
  "Internship"
);
assert(studentInternships.length === 5, `Students eligibility matches 5 internships (got ${studentInternships.length})`);

// 12. Keyword search
const keywordSearch = filterOpportunities(
  opportunities,
  { ...INITIAL_FILTER_STATE, q: "FastAPI" },
  "Job"
);
assert(keywordSearch.length === 1 && keywordSearch[0].company === "Apex Logic", "Keyword search matches FastAPI skill");

// 13. URL search params round-trip
const stateToEncode = {
  q: "React",
  profiles: ["Frontend Developer", "Software Engineer"],
  locations: ["Pune", "Bengaluru"],
  mode: "Hybrid" as const,
  includeWfh: false,
  partTime: true,
  minSalary: 6,
  minStipend: 0,
  experience: ["Fresher", "0–1 years"],
  eligibility: []
};
const sp = filtersToSearchParams(stateToEncode, "Job");
const decodedState = searchParamsToFilters(sp, "Job");
assert(decodedState.q === stateToEncode.q, "Decoded q matches");
assert(decodedState.profiles.length === 2, "Decoded profiles length matches");
assert(decodedState.locations.length === 2, "Decoded locations length matches");
assert(decodedState.mode === "Hybrid", "Decoded mode matches");
assert(decodedState.partTime === true, "Decoded partTime matches");
assert(decodedState.minSalary === 6, "Decoded minSalary matches");
assert(decodedState.experience.length === 2, "Decoded experience length matches");

console.log(`\nResults: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
