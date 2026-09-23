"use server";

import { getDb, opportunities, companies, auditLogs } from "@/db";
import { eq, desc, and, or, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import * as xlsx from "xlsx";

export type AdminOpportunityListItem = {
  id: string;
  title: string;
  role: string;
  type: "Job" | "Internship";
  companyName: string;
  companyInitials: string;
  location: string;
  mode: string;
  status: "draft" | "published" | "expired" | "archived";
  skills: string;
  experience: string;
  salaryText: string | null;
  stipendText: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  stipendMin: number | null;
  stipendMax: number | null;
  createdAt: string;
};

/**
 * Fetch opportunity listings for admin table
 */
export async function getAdminOpportunities(params?: {
  type?: "Job" | "Internship";
  status?: string;
  q?: string;
}) {
  const session = await getSession();
  if (!session || !["admin", "recruiter", "editor"].includes(session.role)) {
    throw new Error("Unauthorized");
  }

  const db = getDb();
  let query = db
    .select({
      id: opportunities.id,
      title: opportunities.title,
      role: opportunities.role,
      type: opportunities.type,
      companyName: opportunities.companyName,
      companyInitials: opportunities.companyInitials,
      location: opportunities.location,
      mode: opportunities.mode,
      status: opportunities.status,
      skills: opportunities.skills,
      experience: opportunities.experience,
      salaryText: opportunities.salaryText,
      stipendText: opportunities.stipendText,
      salaryMin: opportunities.salaryMin,
      salaryMax: opportunities.salaryMax,
      stipendMin: opportunities.stipendMin,
      stipendMax: opportunities.stipendMax,
      createdAt: opportunities.createdAt,
    })
    .from(opportunities)
    .orderBy(desc(opportunities.createdAt));

  let results = query.all();

  if (params?.type) {
    results = results.filter((o) => o.type === params.type);
  }

  if (params?.status && params.status !== "all") {
    results = results.filter((o) => o.status === params.status);
  }

  if (params?.q?.trim()) {
    const term = params.q.trim().toLowerCase();
    results = results.filter((o) => {
      const titleMatch = o.title?.toLowerCase().includes(term);
      const roleMatch = o.role?.toLowerCase().includes(term);
      const companyMatch = o.companyName?.toLowerCase().includes(term);
      const locationMatch = o.location?.toLowerCase().includes(term);
      const modeMatch = o.mode?.toLowerCase().includes(term);
      const skillsMatch = o.skills?.toLowerCase().includes(term);
      const expMatch = o.experience?.toLowerCase().includes(term);
      return (
        titleMatch ||
        roleMatch ||
        companyMatch ||
        locationMatch ||
        modeMatch ||
        skillsMatch ||
        expMatch
      );
    });
  }

  return results as unknown as AdminOpportunityListItem[];
}

/**
 * Create a single Job or Internship
 */
export async function createOpportunityAction(formData: FormData) {
  const session = await getSession();
  if (!session || !["admin", "editor", "recruiter"].includes(session.role)) {
    return { error: "Unauthorized" };
  }

  const role = (formData.get("role") as string)?.trim();
  const company = (formData.get("company") as string)?.trim();
  const type = (formData.get("type") as string) as "Job" | "Internship";
  const location = (formData.get("location") as string)?.trim();
  const mode = (formData.get("mode") as string) as "Remote" | "Hybrid" | "On-site";
  const status = ((formData.get("status") as string) || "published") as
    | "draft"
    | "published"
    | "expired"
    | "archived";
  const experience = (formData.get("experience") as string)?.trim() || "0-1 Years";
  const description = (formData.get("description") as string)?.trim() || "";
  const skillsRaw = (formData.get("skills") as string)?.trim() || "";
  const eligibilityRaw = (formData.get("eligibility") as string)?.trim() || "";
  const salaryText = (formData.get("salaryText") as string)?.trim() || null;
  const stipendText = (formData.get("stipendText") as string)?.trim() || null;
  const activeApplicationUrl = (formData.get("activeApplicationUrl") as string)?.trim() || null;

  if (!role || !company || !type || !location) {
    return { error: "Please provide Role title, Company name, Type, and Location." };
  }

  const skills = skillsRaw
    ? skillsRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const eligibility = eligibilityRaw
    ? eligibilityRaw.split(",").map((e) => e.trim()).filter(Boolean)
    : [];

  const initials = company
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();

  const id = "opp_" + randomUUID();
  const db = getDb();

  // Create or lookup company
  const compId = "comp_" + company.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 20);
  try {
    db.insert(companies)
      .values({
        id: compId,
        name: company,
        initials,
        isVerified: true,
      })
      .onConflictDoNothing()
      .run();
  } catch {}

  try {
    db.insert(opportunities)
      .values({
        id,
        companyId: compId,
        companyName: company,
        companyInitials: initials,
        title: role,
        role: role,
        type,
        location,
        mode: mode || "On-site",
        status,
        skills: JSON.stringify(skills),
        experience,
        description: description || `Exciting opportunity for ${role} at ${company}.`,
        tone: type === "Internship" ? "purple" : "lime",
        salaryText: type === "Job" ? salaryText : null,
        stipendText: type === "Internship" ? stipendText : null,
        eligibility: JSON.stringify(eligibility),
        activeApplicationUrl,
        acceptsFreshers: true,
      })
      .run();

    // Audit log
    db.insert(auditLogs)
      .values({
        id: "aud_" + randomUUID(),
        actorId: session.userId,
        action: "OPPORTUNITY_CREATED",
        entityType: "opportunity",
        entityId: id,
        metadata: JSON.stringify({ role, company, type, status }),
      })
      .run();

    revalidatePath("/admin/jobs");
    revalidatePath("/admin/internships");
    revalidatePath("/jobs");
    revalidatePath("/internships");
    revalidatePath("/");

    return { success: true, id };
  } catch (error: any) {
    console.error("Error creating opportunity:", error);
    return { error: "Failed to create listing: " + error.message };
  }
}

/**
 * Quick toggle status action
 */
export async function toggleOpportunityStatusAction(
  id: string,
  newStatus: "draft" | "published" | "expired" | "archived"
) {
  const session = await getSession();
  if (!session || !["admin", "editor"].includes(session.role)) {
    return { error: "Unauthorized" };
  }

  const db = getDb();
  db.update(opportunities)
    .set({
      status: newStatus,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(opportunities.id, id))
    .run();

  db.insert(auditLogs)
    .values({
      id: "aud_" + randomUUID(),
      actorId: session.userId,
      action: "OPPORTUNITY_STATUS_CHANGED",
      entityType: "opportunity",
      entityId: id,
      metadata: JSON.stringify({ newStatus }),
    })
    .run();

  revalidatePath("/admin/jobs");
  revalidatePath("/admin/internships");
  revalidatePath("/jobs");
  revalidatePath("/internships");
  return { success: true };
}

/**
 * Bulk import opportunities from raw JSON or CSV/Excel parsed array
 */
export async function bulkImportOpportunitiesAction(
  items: Array<{
    role: string;
    company: string;
    type: "Job" | "Internship";
    location: string;
    mode?: string;
    skills?: string | string[];
    experience?: string;
    description?: string;
    salaryText?: string;
    stipendText?: string;
    eligibility?: string | string[];
    activeApplicationUrl?: string;
    status?: "draft" | "published";
  }>
) {
  const session = await getSession();
  if (!session || !["admin", "editor"].includes(session.role)) {
    return { error: "Unauthorized" };
  }

  if (!items || items.length === 0) {
    return { error: "No records provided for bulk import." };
  }

  const db = getDb();
  let importedCount = 0;
  let errorsCount = 0;

  for (const item of items) {
    if (!item.role || !item.company) {
      errorsCount++;
      continue;
    }

    const type = item.type === "Internship" ? "Internship" : "Job";
    const initials = item.company
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();

    const compId = "comp_" + item.company.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 20);
    try {
      db.insert(companies)
        .values({
          id: compId,
          name: item.company,
          initials,
          isVerified: true,
        })
        .onConflictDoNothing()
        .run();
    } catch {}

    const parsedSkills = Array.isArray(item.skills)
      ? item.skills
      : typeof item.skills === "string"
      ? item.skills.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const parsedEligibility = Array.isArray(item.eligibility)
      ? item.eligibility
      : typeof item.eligibility === "string"
      ? item.eligibility.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const id = "opp_" + randomUUID();

    try {
      db.insert(opportunities)
        .values({
          id,
          companyId: compId,
          companyName: item.company,
          companyInitials: initials,
          title: item.role,
          role: item.role,
          type,
          location: item.location || "Multiple Locations (India)",
          mode: (item.mode as any) || "On-site",
          status: item.status || "published",
          skills: JSON.stringify(parsedSkills),
          experience: item.experience || "0-1 Years",
          description:
            item.description || `Exciting opportunity for ${item.role} at ${item.company}.`,
          tone: type === "Internship" ? "purple" : "lime",
          salaryText: type === "Job" ? item.salaryText || null : null,
          stipendText: type === "Internship" ? item.stipendText || null : null,
          eligibility: JSON.stringify(parsedEligibility),
          activeApplicationUrl: item.activeApplicationUrl || null,
          isImported: true,
        })
        .run();

      importedCount++;
    } catch (e) {
      console.error("Failed to insert bulk record:", item, e);
      errorsCount++;
    }
  }

  // Audit log
  db.insert(auditLogs)
    .values({
      id: "aud_" + randomUUID(),
      actorId: session.userId,
      action: "BULK_OPPORTUNITIES_IMPORTED",
      entityType: "opportunity",
      metadata: JSON.stringify({ importedCount, errorsCount }),
    })
    .run();

  revalidatePath("/admin/jobs");
  revalidatePath("/admin/internships");
  revalidatePath("/jobs");
  revalidatePath("/internships");
  revalidatePath("/");

  return {
    success: true,
    importedCount,
    errorsCount,
    message: `Successfully imported ${importedCount} opportunities into the database!`,
  };
}
