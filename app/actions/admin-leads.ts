"use server";

import { getDb, leads, leadHistory, opportunities, users, auditLogs } from "@/db";
import { eq, desc, and, like, or, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";

export type AdminLeadListItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  resumeUrl: string | null;
  coverLetter: string | null;
  source: string;
  status: "new" | "contacted" | "screening" | "shortlisted" | "interview" | "selected" | "rejected" | "withdrawn";
  priority: "low" | "normal" | "high" | "urgent";
  assignedTo: string | null;
  assignedToName: string | null;
  opportunityId: string;
  opportunityTitle: string;
  companyName: string;
  opportunityType: "Job" | "Internship";
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LeadMetrics = {
  total: number;
  newCount: number;
  contactedCount: number;
  screeningCount: number;
  interviewCount: number;
  shortlistedCount: number;
  selectedCount: number;
  rejectedCount: number;
};

export async function getAdminLeads(params?: {
  q?: string;
  status?: string;
  priority?: string;
  type?: string;
  assignedTo?: string;
}) {
  const session = await getSession();
  if (!session || !["admin", "recruiter", "editor"].includes(session.role)) {
    throw new Error("Unauthorized");
  }

  const db = getDb();

  // Query leads with opportunity and assigned recruiter
  const allLeads = db
    .select({
      id: leads.id,
      name: leads.name,
      email: leads.email,
      phone: leads.phone,
      resumeUrl: leads.resumeUrl,
      coverLetter: leads.coverLetter,
      source: leads.source,
      status: leads.status,
      priority: leads.priority,
      assignedTo: leads.assignedTo,
      assignedToName: users.name,
      opportunityId: opportunities.id,
      opportunityTitle: opportunities.title,
      companyName: opportunities.companyName,
      opportunityType: opportunities.type,
      notes: leads.notes,
      createdAt: leads.createdAt,
      updatedAt: leads.updatedAt,
    })
    .from(leads)
    .leftJoin(opportunities, eq(leads.opportunityId, opportunities.id))
    .leftJoin(users, eq(leads.assignedTo, users.id))
    .orderBy(desc(leads.createdAt))
    .all();

  // Calculate metrics
  const metrics: LeadMetrics = {
    total: allLeads.length,
    newCount: allLeads.filter((l) => l.status === "new").length,
    contactedCount: allLeads.filter((l) => l.status === "contacted").length,
    screeningCount: allLeads.filter((l) => l.status === "screening").length,
    interviewCount: allLeads.filter((l) => l.status === "interview").length,
    shortlistedCount: allLeads.filter((l) => l.status === "shortlisted").length,
    selectedCount: allLeads.filter((l) => l.status === "selected").length,
    rejectedCount: allLeads.filter((l) => l.status === "rejected").length,
  };

  // Filter based on role (recruiter only sees assigned unless admin/editor)
  let filtered = allLeads;
  if (session.role === "recruiter") {
    // If recruiter, show assigned to them or unassigned
    filtered = filtered.filter(
      (l) => l.assignedTo === session.userId || !l.assignedTo
    );
  }

  // Filter by search query
  if (params?.q?.trim()) {
    const term = params.q.trim().toLowerCase();
    filtered = filtered.filter(
      (l) =>
        l.name.toLowerCase().includes(term) ||
        l.email.toLowerCase().includes(term) ||
        l.phone.toLowerCase().includes(term) ||
        l.opportunityTitle?.toLowerCase().includes(term) ||
        l.companyName?.toLowerCase().includes(term)
    );
  }

  // Filter by status
  if (params?.status && params.status !== "all") {
    filtered = filtered.filter((l) => l.status === params.status);
  }

  // Filter by priority
  if (params?.priority && params.priority !== "all") {
    filtered = filtered.filter((l) => l.priority === params.priority);
  }

  // Filter by type
  if (params?.type && params.type !== "all") {
    filtered = filtered.filter((l) => l.opportunityType === params.type);
  }

  // Filter by assigned user
  if (params?.assignedTo && params.assignedTo !== "all") {
    filtered = filtered.filter((l) => l.assignedTo === params.assignedTo);
  }

  return {
    leads: filtered as unknown as AdminLeadListItem[],
    metrics,
  };
}

export async function getLeadDetail(leadId: string) {
  const session = await getSession();
  if (!session || !["admin", "recruiter", "editor"].includes(session.role)) {
    throw new Error("Unauthorized");
  }

  const db = getDb();

  const lead = db
    .select({
      id: leads.id,
      name: leads.name,
      email: leads.email,
      phone: leads.phone,
      resumeUrl: leads.resumeUrl,
      coverLetter: leads.coverLetter,
      source: leads.source,
      status: leads.status,
      priority: leads.priority,
      assignedTo: leads.assignedTo,
      assignedToName: users.name,
      notes: leads.notes,
      createdAt: leads.createdAt,
      updatedAt: leads.updatedAt,
      lastContactedAt: leads.lastContactedAt,
      opportunityId: opportunities.id,
      opportunityTitle: opportunities.title,
      companyName: opportunities.companyName,
      companyInitials: opportunities.companyInitials,
      opportunityType: opportunities.type,
      location: opportunities.location,
      experience: opportunities.experience,
    })
    .from(leads)
    .leftJoin(opportunities, eq(leads.opportunityId, opportunities.id))
    .leftJoin(users, eq(leads.assignedTo, users.id))
    .where(eq(leads.id, leadId))
    .get();

  if (!lead) return null;

  // Authorization check for recruiter
  if (session.role === "recruiter" && lead.assignedTo && lead.assignedTo !== session.userId) {
    throw new Error("You are not authorized to view this candidate lead.");
  }

  // Fetch History
  const history = db
    .select()
    .from(leadHistory)
    .where(eq(leadHistory.leadId, leadId))
    .orderBy(desc(leadHistory.createdAt))
    .all();

  // Fetch Recruiters list for assignment dropdown
  const recruiters = db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(or(eq(users.role, "admin"), eq(users.role, "recruiter")))
    .all();

  return {
    lead,
    history,
    recruiters,
  };
}

export async function updateLeadStatusAction(
  leadId: string,
  newStatus: string,
  note?: string
) {
  const session = await getSession();
  if (!session || !["admin", "recruiter", "editor"].includes(session.role)) {
    return { error: "Unauthorized" };
  }

  const db = getDb();
  const currentLead = db.select().from(leads).where(eq(leads.id, leadId)).get();
  if (!currentLead) return { error: "Lead not found" };

  const oldStatus = currentLead.status;

  db.update(leads)
    .set({
      status: newStatus as any,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(leads.id, leadId))
    .run();

  // Record history
  db.insert(leadHistory)
    .values({
      id: "hist_" + randomUUID(),
      leadId,
      actorId: session.userId,
      actorName: session.name,
      action: "LEAD_STATUS_CHANGED",
      oldStatus,
      newStatus,
      note: note || `Status updated from ${oldStatus} to ${newStatus}.`,
    })
    .run();

  // Audit log
  db.insert(auditLogs)
    .values({
      id: "aud_" + randomUUID(),
      actorId: session.userId,
      action: "LEAD_STATUS_CHANGED",
      entityType: "lead",
      entityId: leadId,
      metadata: JSON.stringify({ oldStatus, newStatus, note }),
    })
    .run();

  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin/leads");
  return { success: true };
}

export async function updateLeadPriorityAction(
  leadId: string,
  newPriority: string
) {
  const session = await getSession();
  if (!session || !["admin", "recruiter", "editor"].includes(session.role)) {
    return { error: "Unauthorized" };
  }

  const db = getDb();
  db.update(leads)
    .set({
      priority: newPriority as any,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(leads.id, leadId))
    .run();

  db.insert(leadHistory)
    .values({
      id: "hist_" + randomUUID(),
      leadId,
      actorId: session.userId,
      actorName: session.name,
      action: "LEAD_PRIORITY_CHANGED",
      note: `Priority set to ${newPriority}.`,
    })
    .run();

  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin/leads");
  return { success: true };
}

export async function assignLeadRecruiterAction(
  leadId: string,
  newAssignedTo: string | null,
  note?: string
) {
  const session = await getSession();
  if (!session || !["admin", "recruiter"].includes(session.role)) {
    return { error: "Unauthorized" };
  }

  const db = getDb();
  const currentLead = db.select().from(leads).where(eq(leads.id, leadId)).get();
  if (!currentLead) return { error: "Lead not found" };

  const oldAssignedTo = currentLead.assignedTo;

  let recruiterName = "Unassigned";
  if (newAssignedTo) {
    const recruiter = db.select().from(users).where(eq(users.id, newAssignedTo)).get();
    if (recruiter) recruiterName = recruiter.name;
  }

  db.update(leads)
    .set({
      assignedTo: newAssignedTo,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(leads.id, leadId))
    .run();

  db.insert(leadHistory)
    .values({
      id: "hist_" + randomUUID(),
      leadId,
      actorId: session.userId,
      actorName: session.name,
      action: "LEAD_ASSIGNED",
      oldAssignedTo,
      newAssignedTo,
      note: note || `Assigned to ${recruiterName}.`,
    })
    .run();

  db.insert(auditLogs)
    .values({
      id: "aud_" + randomUUID(),
      actorId: session.userId,
      action: "LEAD_ASSIGNED",
      entityType: "lead",
      entityId: leadId,
      metadata: JSON.stringify({ oldAssignedTo, newAssignedTo, recruiterName }),
    })
    .run();

  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin/leads");
  return { success: true };
}

export async function addLeadNoteAction(leadId: string, noteText: string) {
  const session = await getSession();
  if (!session || !["admin", "recruiter", "editor"].includes(session.role)) {
    return { error: "Unauthorized" };
  }

  if (!noteText.trim()) return { error: "Note cannot be empty" };

  const db = getDb();
  const currentLead = db.select().from(leads).where(eq(leads.id, leadId)).get();
  if (!currentLead) return { error: "Lead not found" };

  const existingNotes = currentLead.notes ? `${currentLead.notes}\n---\n` : "";
  const updatedNotes = `${existingNotes}[${session.name} - ${new Date().toLocaleDateString("en-IN")}]: ${noteText.trim()}`;

  db.update(leads)
    .set({
      notes: updatedNotes,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(leads.id, leadId))
    .run();

  db.insert(leadHistory)
    .values({
      id: "hist_" + randomUUID(),
      leadId,
      actorId: session.userId,
      actorName: session.name,
      action: "LEAD_NOTE_ADDED",
      note: noteText.trim(),
    })
    .run();

  revalidatePath(`/admin/leads/${leadId}`);
  return { success: true };
}

export async function createManualLeadAction(formData: FormData) {
  const session = await getSession();
  if (!session || !["admin", "recruiter", "editor"].includes(session.role)) {
    return { error: "Unauthorized" };
  }

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const phone = (formData.get("phone") as string)?.trim();
  const opportunityId = formData.get("opportunityId") as string;
  const status = (formData.get("status") as string) || "new";
  const priority = (formData.get("priority") as string) || "normal";
  const assignedTo = (formData.get("assignedTo") as string) || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!name || !email || !phone || !opportunityId) {
    return { error: "Name, email, phone, and opportunity are required." };
  }

  const db = getDb();
  const opp = db.select().from(opportunities).where(eq(opportunities.id, opportunityId)).get();
  if (!opp) return { error: "Selected opportunity not found." };

  const leadId = "lead_" + randomUUID();

  try {
    db.insert(leads)
      .values({
        id: leadId,
        opportunityId: opp.id,
        name,
        email,
        phone,
        source: "manual",
        status: status as any,
        priority: priority as any,
        assignedTo: assignedTo === "unassigned" ? null : assignedTo,
        notes,
      })
      .run();

    db.insert(leadHistory)
      .values({
        id: "hist_" + randomUUID(),
        leadId,
        actorId: session.userId,
        actorName: session.name,
        action: "LEAD_CREATED_MANUALLY",
        newStatus: status,
        note: `Lead created manually by ${session.name}.`,
      })
      .run();

    db.insert(auditLogs)
      .values({
        id: "aud_" + randomUUID(),
        actorId: session.userId,
        action: "LEAD_CREATED_MANUALLY",
        entityType: "lead",
        entityId: leadId,
        metadata: JSON.stringify({ name, email, opportunityId }),
      })
      .run();

    revalidatePath("/admin/leads");
    return { success: true, leadId };
  } catch (e: any) {
    return { error: "Failed to create lead: " + e.message };
  }
}
