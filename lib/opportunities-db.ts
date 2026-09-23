import { getDb, opportunities, companies } from "@/db";
import { eq, desc, and } from "drizzle-orm";
import { allOpportunities, type Opportunity } from "./fresherdesk-data";

/**
 * Fetch opportunities from the SQLite database, falling back to in-memory static data if needed.
 */
export async function getDbOpportunities(options?: {
  type?: "Job" | "Internship";
  status?: string;
  limit?: number;
}): Promise<Opportunity[]> {
  try {
    const db = getDb();
    const query = db
      .select({
        id: opportunities.id,
        company: opportunities.companyName,
        initials: opportunities.companyInitials,
        role: opportunities.role,
        type: opportunities.type,
        location: opportunities.location,
        mode: opportunities.mode,
        skills: opportunities.skills,
        experience: opportunities.experience,
        description: opportunities.description,
        tone: opportunities.tone,
        profile: opportunities.profile,
        isPartTime: opportunities.isPartTime,
        minExperience: opportunities.minExperience,
        maxExperience: opportunities.maxExperience,
        acceptsFreshers: opportunities.acceptsFreshers,
        salaryMin: opportunities.salaryMin,
        salaryMax: opportunities.salaryMax,
        salaryText: opportunities.salaryText,
        stipendMin: opportunities.stipendMin,
        stipendMax: opportunities.stipendMax,
        stipendText: opportunities.stipendText,
        eligibility: opportunities.eligibility,
        activeApplicationUrl: opportunities.activeApplicationUrl,
        sourceStatus: opportunities.sourceStatus,
        isImported: opportunities.isImported,
      })
      .from(opportunities)
      .orderBy(desc(opportunities.createdAt));

    const rows = query.all();

    if (!rows || rows.length === 0) {
      return allOpportunities;
    }

    return rows.map((r) => {
      let parsedSkills: string[] = [];
      let parsedEligibility: string[] = [];
      try {
        parsedSkills = JSON.parse(r.skills || "[]");
      } catch {}
      try {
        parsedEligibility = JSON.parse(r.eligibility || "[]");
      } catch {}

      return {
        id: r.id,
        company: r.company,
        initials: r.initials,
        role: r.role,
        type: r.type as "Job" | "Internship",
        location: r.location,
        mode: (r.mode as "Remote" | "Hybrid" | "On-site") || "On-site",
        skills: parsedSkills,
        experience: r.experience,
        description: r.description,
        tone: r.tone,
        profile: r.profile || undefined,
        isPartTime: Boolean(r.isPartTime),
        minExperience: r.minExperience || 0,
        maxExperience: r.maxExperience || 0,
        acceptsFreshers: Boolean(r.acceptsFreshers),
        salaryMin: r.salaryMin || undefined,
        salaryMax: r.salaryMax || undefined,
        salaryText: r.salaryText || undefined,
        stipendMin: r.stipendMin || undefined,
        stipendMax: r.stipendMax || undefined,
        stipendText: r.stipendText || undefined,
        eligibility: parsedEligibility.length ? parsedEligibility : undefined,
        activeApplicationUrl: r.activeApplicationUrl || undefined,
        sourceStatus: (r.sourceStatus as "active" | "expired" | "unverified") || "active",
        isImported: Boolean(r.isImported),
      };
    });
  } catch (error) {
    console.error("Failed to query opportunities from DB, using fallback dataset:", error);
    return allOpportunities;
  }
}
