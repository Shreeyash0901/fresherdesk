"use server";

import { getDb, leads, leadHistory, opportunities, auditLogs } from "@/db";
import { eq, and, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { randomUUID } from "node:crypto";
import { z } from "zod";

const LeadSchema = z.object({
  opportunityId: z.string().min(1, "Opportunity ID is required"),
  name: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z.string().trim().email("Please provide a valid email address"),
  phone: z.string().trim().min(7, "Please provide a valid phone number"),
  resumeUrl: z.string().url("Please provide a valid URL").optional().or(z.literal("")),
  coverLetter: z.string().trim().max(2000, "Cover letter cannot exceed 2000 characters").optional(),
});

export type LeadSubmissionResult = {
  success?: boolean;
  message?: string;
  duplicate?: boolean;
  error?: string;
};

export async function submitLeadApplicationAction(
  formData: FormData
): Promise<LeadSubmissionResult> {
  const opportunityId = formData.get("opportunityId") as string;
  const name = formData.get("name") as string;
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const phone = formData.get("phone") as string;
  const resumeUrl = (formData.get("resumeUrl") as string) || "";
  const coverLetter = (formData.get("coverLetter") as string) || "";

  // Validation
  const validated = LeadSchema.safeParse({
    opportunityId,
    name,
    email,
    phone,
    resumeUrl,
    coverLetter,
  });

  if (!validated.success) {
    const firstError = validated.error.issues[0]?.message || "Invalid input";
    return { error: firstError };
  }

  const db = getDb();

  // Verify opportunity exists
  const opp = db
    .select()
    .from(opportunities)
    .where(eq(opportunities.id, opportunityId))
    .get();

  if (!opp) {
    return { error: "The requested opportunity could not be found or is no longer accepting applications." };
  }

  // Duplicate Check: Same email + same opportunity
  const existingLead = db
    .select()
    .from(leads)
    .where(
      and(
        eq(leads.opportunityId, opportunityId),
        eq(leads.email, email)
      )
    )
    .get();

  if (existingLead) {
    return {
      duplicate: true,
      message: "You have already registered interest / applied for this opportunity. Our recruitment team has your application on file.",
    };
  }

  // Optional user link
  const session = await getSession();
  const leadId = "lead_" + randomUUID();
  const leadSource =
    opp.type === "Internship"
      ? "internship_application"
      : opp.type === "Course"
      ? "course_enrollment"
      : "job_application";

  try {
    // 1. Create Lead
    db.insert(leads)
      .values({
        id: leadId,
        opportunityId: opp.id,
        userId: session?.userId || null,
        name: validated.data.name,
        email: validated.data.email,
        phone: validated.data.phone,
        resumeUrl: validated.data.resumeUrl || null,
        coverLetter: validated.data.coverLetter || null,
        source: leadSource,
        status: "new",
        priority: "normal",
      })
      .run();

    // 2. Create Lead History
    db.insert(leadHistory)
      .values({
        id: "hist_" + randomUUID(),
        leadId,
        actorId: session?.userId || null,
        actorName: session?.name || "Public Portal Visitor",
        action: "LEAD_CREATED",
        newStatus: "new",
        note: `Applicant ${opp.type === "Course" ? "enrolled/registered interest for Course" : `applied for ${opp.type}`}: "${opp.title}" at ${opp.companyName}.`,
      })
      .run();

    // 3. Create Audit Log
    db.insert(auditLogs)
      .values({
        id: "aud_" + randomUUID(),
        actorId: session?.userId || null,
        action: "LEAD_CREATED",
        entityType: "lead",
        entityId: leadId,
        metadata: JSON.stringify({
          opportunityId: opp.id,
          candidateName: validated.data.name,
          candidateEmail: validated.data.email,
          opportunityType: opp.type,
        }),
      })
      .run();

    return {
      success: true,
      message:
        opp.type === "Course"
          ? `You have successfully enrolled in "${opp.title}"! Our admissions team will reach out with course details and next steps.`
          : `Your application for "${opp.title}" has been successfully submitted! Our talent team will review your profile shortly.`,
    };
  } catch (error: any) {
    console.error("Error creating lead application:", error);
    return { error: "An unexpected error occurred while saving your application. Please try again." };
  }
}
