import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';

export interface OpportunityEvent {
  url: string;
  sourceDate: string | null;
  sourceStatus: string;
  eventTestLocation: string | null;
  sourceRows: string | null;
  copiesGrouped: number;
}

export interface Opportunity {
  id: string;
  company: string;
  initials: string;
  role: string;
  type: "Internship" | "Job";
  location: string;
  mode?: "Remote" | "Hybrid" | "On-site";
  skills: string[];
  experience: string;
  description: string;
  tone: string;
  profile?: string;
  isPartTime?: boolean;
  minExperience?: number;
  maxExperience?: number;
  acceptsFreshers?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  salaryText?: string;
  stipendMin?: number;
  stipendMax?: number;
  stipendText?: string;
  eligibility?: string[];
  // Extended fields for imported & auditable records
  isImported?: boolean;
  sourceStatus?: "active" | "expired" | "unverified";
  sourceBatch?: string | null;
  sourceCompensationRaw?: string | number | null;
  compensationNotes?: string | null;
  referralReward?: number | null;
  logoUrl?: string | null;
  events?: OpportunityEvent[];
  activeApplicationUrl?: string | null;
  reviewFlags?: string[];
}

export interface ImportReport {
  timestamp: string;
  sourceFile: string;
  totalSourceRows: number;
  distinctListingLinks: number;
  totalUniqueJobs: number;
  jobCount: number;
  internshipCount: number;
  expiredCount: number;
  unverifiedCount: number;
  activeCount: number;
  recordsNeedingReview: {
    id: string;
    company: string;
    role: string;
    type: string;
    status: string;
    flags: string[];
    eventsCount: number;
  }[];
  jobsSummary: {
    id: string;
    company: string;
    role: string;
    type: "Job" | "Internship";
    location: string;
    status: "active" | "expired" | "unverified";
    eventsCount: number;
    batch: string | null;
    compensationRaw: string | number | null;
    stipend: number | null;
    referral: number | null;
    flags: string[];
  }[];
}

const TONES = ["purple", "peach", "blue", "lime", "mint", "rose", "neutral"];

function getCompanyInitials(name: string): string {
  if (!name) return "FD";
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
}

function getToneForString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % TONES.length;
  return TONES[idx];
}

function parseExcelDate(val: unknown): string | null {
  if (!val) return null;
  if (typeof val === 'number') {
    try {
      const date = xlsx.SSF.parse_date_code(val);
      if (date && date.y && date.m && date.d) {
        return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
      }
    } catch {
      return String(val);
    }
  }
  return String(val);
}

function inferProfile(role: string): string | undefined {
  const r = role.toLowerCase();
  if (r.includes('frontend')) return 'Frontend Developer';
  if (r.includes('backend')) return 'Backend Developer';
  if (r.includes('full stack') || r.includes('fullstack')) return 'Full Stack Engineer';
  if (r.includes('data') || r.includes('analytics')) return 'Data Analyst';
  if (r.includes('ai') || r.includes('machine learning') || r.includes('ml')) return 'AI / ML Engineer';
  if (r.includes('design') || r.includes('ui') || r.includes('ux')) return 'UI / UX Designer';
  if (r.includes('devops') || r.includes('cloud')) return 'Cloud / DevOps Engineer';
  if (r.includes('qa') || r.includes('quality') || r.includes('sdet') || r.includes('test')) return 'QA / Test Engineer';
  if (r.includes('software') || r.includes('developer') || r.includes('engineer') || r.includes('apprentice') || r.includes('trainee')) {
    return 'Software Engineer';
  }
  return undefined;
}

export function runImport(workbookPath = 'data/imports/Book1.xlsx'): { opportunities: Opportunity[]; report: ImportReport } {
  const fullPath = path.resolve(process.cwd(), workbookPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Workbook not found at ${fullPath}`);
  }

  const wb = xlsx.readFile(fullPath);
  const ws = wb.Sheets['Sorted listings'];
  if (!ws) {
    throw new Error('Sheet "Sorted listings" not found in workbook');
  }

  const rawData: unknown[][] = xlsx.utils.sheet_to_json(ws, { header: 1 });

  // Locate header row
  let headerIdx = -1;
  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (row && row.includes('Company') && row.includes('Role') && row.includes('Listing URL')) {
      headerIdx = i;
      break;
    }
  }

  if (headerIdx === -1) {
    throw new Error('Could not detect header row containing "Company", "Role", and "Listing URL"');
  }

  const headers = rawData[headerIdx].map((h: unknown) => (h ? String(h).trim() : ''));
  const rows = rawData.slice(headerIdx + 1).filter(r => r && r.length > 0 && r[0]);

  const parsedRows = rows.map((r, i) => {
    const item: Record<string, unknown> = {};
    headers.forEach((h, hIdx) => {
      item[h] = r[hIdx] !== undefined ? r[hIdx] : null;
    });
    item._excelRow = headerIdx + 2 + i;
    return item;
  });

  // Group by eLitmus Job ID
  const jobGroups = new Map<string, typeof parsedRows>();

  for (const row of parsedRows) {
    const url = String(row['Listing URL'] || '').trim();
    const match = url.match(/\/jobs\/(\d+)-/);
    const jobId = match ? `elitmus-${match[1]}` : `elitmus-row-${row._excelRow}`;
    if (!jobGroups.has(jobId)) {
      jobGroups.set(jobId, []);
    }
    jobGroups.get(jobId)!.push(row);
  }

  const importedList: Opportunity[] = [];
  const recordsNeedingReview: ImportReport['recordsNeedingReview'] = [];
  const jobsSummary: ImportReport['jobsSummary'] = [];

  let jobCount = 0;
  let internshipCount = 0;
  let expiredCount = 0;
  let unverifiedCount = 0;
  const activeCount = 0;

  for (const [jobId, records] of jobGroups.entries()) {
    const first = records[0];
    const company = String(first['Company'] || '').trim();
    const role = String(first['Role'] || '').trim();
    const jobLocation = String(first['Job location'] || '').trim();
    const empTypeSource = String(first['Employment type (source)'] || '').trim();
    const batchSource = first['Experience / batch'] ? String(first['Experience / batch']).trim() : null;
    const compRaw = first['Compensation (source)'] as string | number | null;
    const monthlyStipend = typeof first['Monthly stipend (₹)'] === 'number' ? first['Monthly stipend (₹)'] : null;
    const compNotes = first['Compensation notes'] ? String(first['Compensation notes']).trim() : null;
    const referralReward = typeof first['Referral reward (₹)'] === 'number' ? first['Referral reward (₹)'] : null;
    const logoUrl = first['Logo URL'] ? String(first['Logo URL']).trim() : null;

    // Check for conflicting fields across events
    const conflicts: string[] = [];
    const compVariants = new Set(records.map(r => r['Compensation (source)']));
    if (compVariants.size > 1) {
      conflicts.push(`Conflicting compensation values across events: ${Array.from(compVariants).join(', ')}`);
    }
    const locVariants = new Set(records.map(r => r['Job location']));
    if (locVariants.size > 1) {
      conflicts.push(`Conflicting job locations across events: ${Array.from(locVariants).join(' | ')}`);
    }

    // Classify Type: Job vs Internship
    // Rule: Use explicit employment type where available.
    // If role has "Intern" but source says "Full Time", preserve both and flag for review.
    let classifiedType: "Internship" | "Job" = "Job";
    if (empTypeSource.toLowerCase().includes('internship')) {
      classifiedType = "Internship";
    } else if (empTypeSource.toLowerCase().includes('full time')) {
      classifiedType = "Job";
    }

    const reviewFlags: string[] = [...conflicts];
    if (role.toLowerCase().includes('intern') && empTypeSource.toLowerCase().includes('full time')) {
      reviewFlags.push('Role title says "Intern" but source Employment Type is "Full Time". Preserved as Job, flagged for review.');
    }

    // Process events
    const events: OpportunityEvent[] = records.map(r => ({
      url: String(r['Listing URL'] || '').trim(),
      sourceDate: parseExcelDate(r['Source date']),
      sourceStatus: String(r['Status (source)'] || 'Not stated').trim(),
      eventTestLocation: r['Event / test location text'] ? String(r['Event / test location text']).trim() : null,
      sourceRows: r['Source rows'] ? String(r['Source rows']).trim() : null,
      copiesGrouped: typeof r['Copies grouped'] === 'number' ? r['Copies grouped'] : 1
    }));

    // Status classification
    // Rules:
    // "Expired" means expired.
    // "Not stated" means unverified, not active.
    // Do not infer active from missing expiry marker.
    // If all events are expired => expired
    // Otherwise => unverified (unless verified data exists)
    const eventStatuses = events.map(e => e.sourceStatus);
    const allExpired = eventStatuses.every(s => s.toLowerCase() === 'expired');
    const hasExpired = eventStatuses.some(s => s.toLowerCase() === 'expired');
    const hasNotStated = eventStatuses.some(s => s.toLowerCase() === 'not stated');

    let overallStatus: "active" | "expired" | "unverified" = "unverified";
    if (allExpired) {
      overallStatus = "expired";
      expiredCount++;
    } else {
      overallStatus = "unverified";
      unverifiedCount++;
    }

    if (hasExpired && hasNotStated) {
      reviewFlags.push('Mixed event statuses: some events are Expired while others are Not stated.');
    }
    if (compNotes) {
      reviewFlags.push(`Compensation note preserved: ${compNotes}`);
    }
    if (referralReward) {
      reviewFlags.push(`Referral reward preserved: ₹${referralReward.toLocaleString('en-IN')}`);
    }

    if (classifiedType === "Internship") {
      internshipCount++;
    } else {
      jobCount++;
    }

    // Determine activeApplicationUrl:
    // If there is an event with "Not stated" (unverified current candidate), pick the latest by date or first non-expired.
    // Never pick an expired event as active application link if unexpired exists.
    const nonExpiredEvent = events.find(e => e.sourceStatus.toLowerCase() !== 'expired');
    const activeApplicationUrl = nonExpiredEvent ? nonExpiredEvent.url : events[0]?.url || null;

    // Experience / batch mapping:
    // "Fresher (2026)" -> acceptsFreshers: true, eligibility: ["2026 Batch", "Freshers"], experience: "Fresher (2026)"
    // Do not convert batch to work-experience years.
    const isFresher = batchSource ? batchSource.toLowerCase().includes('fresher') : false;
    const eligibilityList: string[] = [];
    if (batchSource) {
      eligibilityList.push(batchSource);
    }
    if (isFresher) {
      eligibilityList.push("Freshers");
    }

    // Compensation display text:
    // Format raw compensation cleanly without asserting annual/monthly unless verified.
    let salaryText: string | undefined = undefined;
    let stipendText: string | undefined = undefined;
    let stipendMin: number | undefined = undefined;
    let stipendMax: number | undefined = undefined;

    if (monthlyStipend) {
      stipendMin = monthlyStipend;
      stipendMax = monthlyStipend;
      stipendText = `₹${monthlyStipend.toLocaleString('en-IN')} / mo (Stipend)`;
    }

    if (compRaw !== null && compRaw !== undefined) {
      if (typeof compRaw === 'number') {
        salaryText = `₹${compRaw.toLocaleString('en-IN')}`;
      } else {
        salaryText = String(compRaw);
      }
    }

    const initials = getCompanyInitials(company);
    const tone = getToneForString(company);
    const profile = inferProfile(role);

    const opportunity: Opportunity = {
      id: jobId,
      company,
      initials,
      role,
      type: classifiedType,
      location: jobLocation,
      // mode left unspecified as per rules
      skills: [], // do not invent skills
      experience: batchSource || "Fresher",
      description: `${role} opportunity at ${company}. Imported from eLitmus recruitment listing.`,
      tone,
      profile,
      acceptsFreshers: isFresher,
      minExperience: isFresher ? 0 : undefined,
      maxExperience: isFresher ? 0 : undefined,
      // Do not set normalized LPA salaryMin/salaryMax to avoid satisfying annual salary filters incorrectly
      salaryMin: undefined,
      salaryMax: undefined,
      salaryText,
      stipendMin,
      stipendMax,
      stipendText,
      eligibility: eligibilityList.length > 0 ? eligibilityList : undefined,
      // Extended fields
      isImported: true,
      sourceStatus: overallStatus,
      sourceBatch: batchSource,
      sourceCompensationRaw: compRaw,
      compensationNotes: compNotes,
      referralReward,
      logoUrl,
      events,
      activeApplicationUrl,
      reviewFlags: reviewFlags.length > 0 ? reviewFlags : undefined
    };

    importedList.push(opportunity);

    if (reviewFlags.length > 0) {
      recordsNeedingReview.push({
        id: jobId,
        company,
        role,
        type: classifiedType,
        status: overallStatus,
        flags: reviewFlags,
        eventsCount: events.length
      });
    }

    jobsSummary.push({
      id: jobId,
      company,
      role,
      type: classifiedType,
      location: jobLocation,
      status: overallStatus,
      eventsCount: events.length,
      batch: batchSource,
      compensationRaw: compRaw,
      stipend: monthlyStipend,
      referral: referralReward,
      flags: reviewFlags
    });
  }

  const report: ImportReport = {
    timestamp: new Date().toISOString(),
    sourceFile: workbookPath,
    totalSourceRows: rows.length,
    distinctListingLinks: new Set(parsedRows.map(r => r['Listing URL'])).size,
    totalUniqueJobs: jobGroups.size,
    jobCount,
    internshipCount,
    expiredCount,
    unverifiedCount,
    activeCount,
    recordsNeedingReview,
    jobsSummary
  };

  return { opportunities: importedList, report };
}

// If executed directly via `node scripts/import-elitmus.ts` or `tsx`
if (process.argv[1] && process.argv[1].includes('import-elitmus')) {
  try {
    const { opportunities, report } = runImport();
    
    // Write generated typed dataset to lib/imported-opportunities.ts
    const outputPath = path.resolve(process.cwd(), 'lib/imported-opportunities.ts');
    const fileContent = `// AUTO-GENERATED FILE FROM scripts/import-elitmus.ts
// DO NOT EDIT MANUALLY - Rerun import via: npm run import:elitmus

import type { Opportunity } from "./fresherdesk-data";

export const importedOpportunities: Opportunity[] = ${JSON.stringify(opportunities, null, 2)};
`;

    fs.writeFileSync(outputPath, fileContent, 'utf-8');
    console.log(`\nSuccessfully generated ${opportunities.length} imported opportunities at lib/imported-opportunities.ts`);

    // Write import report to data/imports/import-report.json
    const reportPath = path.resolve(process.cwd(), 'data/imports/import-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`Saved import report to data/imports/import-report.json`);

    console.log(`\n=== IMPORT SUMMARY ===`);
    console.log(`Source Rows Processed: ${report.totalSourceRows}`);
    console.log(`Distinct Listing URLs: ${report.distinctListingLinks}`);
    console.log(`Total Unique Jobs: ${report.totalUniqueJobs}`);
    console.log(`- Jobs: ${report.jobCount}`);
    console.log(`- Internships: ${report.internshipCount}`);
    console.log(`- Status Expired: ${report.expiredCount}`);
    console.log(`- Status Unverified: ${report.unverifiedCount}`);
    console.log(`- Status Active: ${report.activeCount}`);
    console.log(`Records Needing Manual Review: ${report.recordsNeedingReview.length}`);
  } catch (err) {
    console.error('Import failed:', err);
    process.exit(1);
  }
}
