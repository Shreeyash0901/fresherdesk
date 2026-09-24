"use server";

import { getDb, leads, leadHistory, opportunities, auditLogs } from "@/db";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  DEFAULT_WORKSHOP_ID,
  DEFAULT_WORKSHOP_CONFIG,
  ensureWorkshopOpportunityExists,
} from "@/lib/workshop-config";
import { type WorkshopConfig } from "@/lib/workshop-config-shared";
import { normalizePhoneNumber } from "@/lib/phone-utils";
import { revalidatePath } from "next/cache";


const PhoneSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(10, "Please enter a valid mobile number (at least 10 digits)")
    .max(16, "Mobile number too long"),
  countryCode: z.string().default("+91"),
  workshopId: z.string().optional(),
});

const CompleteFormSchema = z.object({
  leadId: z.string().min(1, "Lead ID is required"),
  name: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  city: z.string().trim().min(2, "Please enter your city"),
  occupation: z.string().trim().optional(),
  workshopId: z.string().optional(),
});

export type WorkshopStartResult = {
  success: boolean;
  leadId?: string;
  phone?: string;
  status?: "new" | "contacted" | "selected" | string;
  isExisting?: boolean;
  message?: string;
  error?: string;
};

export type WorkshopCompleteResult = {
  success: boolean;
  leadId?: string;
  message?: string;
  error?: string;
};

/**
 * STEP 1: MOBILE NUMBER SUBMISSION = LEAD IMMEDIATELY CREATED
 * Saves the mobile number as a POTENTIAL Lead (status = "new", source = "workshop_popup").
 * If the user abandons after this step, this record remains in the database.
 */
export async function startWorkshopLeadAction(
  rawPhone: string,
  rawCountryCode = "+91",
  workshopId?: string
): Promise<WorkshopStartResult> {
  const parseResult = PhoneSchema.safeParse({
    phone: rawPhone,
    countryCode: rawCountryCode,
    workshopId,
  });

  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message || "Please enter a valid mobile number.",
    };
  }

  const normalizedPhone = normalizePhoneNumber(parseResult.data.phone, parseResult.data.countryCode);
  // Basic validation: ensure digits count is between 10 and 15
  const digitsOnly = normalizedPhone.replace(/[^\d]/g, "");
  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    return {
      success: false,
      error: "Please enter a valid 10-digit mobile number.",
    };
  }

  const db = getDb();
  const targetWorkshopId = workshopId || ensureWorkshopOpportunityExists();

  // Verify workshop exists
  let opp = db
    .select()
    .from(opportunities)
    .where(eq(opportunities.id, targetWorkshopId))
    .get();

  if (!opp) {
    ensureWorkshopOpportunityExists();
    opp = db.select().from(opportunities).where(eq(opportunities.id, targetWorkshopId)).get();
  }

  const session = await getSession();

  // Duplicate Check: Look for an existing lead with same opportunityId AND phone
  const existingLead = db
    .select()
    .from(leads)
    .where(
      and(
        eq(leads.opportunityId, targetWorkshopId),
        eq(leads.phone, normalizedPhone)
      )
    )
    .get();

  if (existingLead) {
    // Re-use existing lead! Update last activity timestamp and note
    db.update(leads)
      .set({
        updatedAt: new Date().toISOString(),
        lastContactedAt: new Date().toISOString(),
      })
      .where(eq(leads.id, existingLead.id))
      .run();

    db.insert(leadHistory)
      .values({
        id: "hist_" + randomUUID(),
        leadId: existingLead.id,
        actorId: session?.userId || null,
        actorName: session?.name || "Workshop Visitor",
        action: "WORKSHOP_POPUP_REENGAGED",
        oldStatus: existingLead.status,
        newStatus: existingLead.status,
        note: `Visitor re-opened workshop registration for "${opp?.title || "Workshop"}". Reusing existing lead.`,
      })
      .run();

    return {
      success: true,
      leadId: existingLead.id,
      phone: existingLead.phone,
      status: existingLead.status,
      isExisting: true,
      message: "Welcome back! Please complete your registration details.",
    };
  }

  // Create NEW Lead immediately with mobile number
  const leadId = "lead_ws_" + randomUUID();
  const placeholderName = `Workshop Prospect (${normalizedPhone.slice(-4)})`;
  const placeholderEmail = `prospect_${digitsOnly.slice(-6)}@lead.fresherdesk.local`;

  try {
    // 1. Insert Lead (POTENTIAL stage)
    db.insert(leads)
      .values({
        id: leadId,
        opportunityId: targetWorkshopId,
        userId: session?.userId || null,
        name: placeholderName,
        email: placeholderEmail,
        phone: normalizedPhone,
        source: "workshop_popup",
        status: "new", // "new" corresponds to POTENTIAL / Abandoned if never finished
        priority: "high", // Workshop leads have high intent
        notes: `[Funnel Stage: Step 1 - Mobile Captured]\nCaptured on: ${new Date().toLocaleString("en-IN")}\nPhone: ${normalizedPhone}\nWorkshop: ${opp?.title || "AI Masterclass"}`,
      })
      .run();

    // 2. Insert Lead History
    db.insert(leadHistory)
      .values({
        id: "hist_" + randomUUID(),
        leadId,
        actorId: session?.userId || null,
        actorName: session?.name || "Workshop Visitor",
        action: "WORKSHOP_PHONE_CAPTURED",
        newStatus: "new",
        note: `Mobile number captured via Homepage Workshop Popup. Lead initialized as POTENTIAL.`,
      })
      .run();

    // 3. Audit Log
    db.insert(auditLogs)
      .values({
        id: "aud_" + randomUUID(),
        actorId: session?.userId || null,
        action: "WORKSHOP_LEAD_STARTED",
        entityType: "lead",
        entityId: leadId,
        metadata: JSON.stringify({
          phone: normalizedPhone,
          opportunityId: targetWorkshopId,
          source: "workshop_popup",
        }),
      })
      .run();

    revalidatePath("/admin/leads");

    return {
      success: true,
      leadId,
      phone: normalizedPhone,
      status: "new",
      isExisting: false,
      message: "Mobile verified! Complete your details to reserve your spot.",
    };
  } catch (error: any) {
    console.error("Error creating workshop lead:", error);
    return {
      success: false,
      error: "Failed to initialize workshop registration. Please try again.",
    };
  }
}

/**
 * STEP 2: COMPLETE WORKSHOP REGISTRATION
 * Updates the existing Lead created in Step 1 with full name, email, city, occupation.
 * Sets status to "selected" (REGISTERED) or "screening" (FORM_COMPLETED).
 */
export async function completeWorkshopLeadAction(
  data: z.infer<typeof CompleteFormSchema>
): Promise<WorkshopCompleteResult> {
  const validated = CompleteFormSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || "Invalid registration details.",
    };
  }

  const { leadId, name, email, city, occupation } = validated.data;
  const db = getDb();

  const existingLead = db.select().from(leads).where(eq(leads.id, leadId)).get();
  if (!existingLead) {
    return {
      success: false,
      error: "Registration session expired or lead not found. Please re-enter your mobile number.",
    };
  }

  const session = await getSession();
  const notesUpdate = `${existingLead.notes || ""}\n\n[Funnel Stage: Step 2 - Form Completed & Spot Reserved]\nCity: ${city}\nOccupation: ${occupation || "Student / Fresh Graduate"}\nRegistered at: ${new Date().toLocaleString("en-IN")}`;

  try {
    // Update Lead with actual details
    db.update(leads)
      .set({
        name,
        email: email.toLowerCase().trim(),
        status: "selected", // Selected / Registered for Workshop
        coverLetter: `City: ${city} | Occupation: ${occupation || "Student"}`,
        notes: notesUpdate,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(leads.id, leadId))
      .run();

    // Record History
    db.insert(leadHistory)
      .values({
        id: "hist_" + randomUUID(),
        leadId,
        actorId: session?.userId || null,
        actorName: session?.name || name,
        action: "WORKSHOP_REGISTRATION_COMPLETED",
        oldStatus: existingLead.status,
        newStatus: "selected",
        note: `Registration completed by ${name} (${email}, ${city}). Workshop spot confirmed.`,
      })
      .run();

    // Audit Log
    db.insert(auditLogs)
      .values({
        id: "aud_" + randomUUID(),
        actorId: session?.userId || null,
        action: "WORKSHOP_REGISTRATION_COMPLETED",
        entityType: "lead",
        entityId: leadId,
        metadata: JSON.stringify({
          name,
          email,
          city,
          occupation,
        }),
      })
      .run();

    revalidatePath("/admin/leads");
    revalidatePath(`/admin/leads/${leadId}`);

    return {
      success: true,
      leadId,
      message: "Spot confirmed! We've sent workshop details to your contact info.",
    };
  } catch (error: any) {
    console.error("Error completing workshop lead:", error);
    return {
      success: false,
      error: "An unexpected error occurred while confirming your registration. Please try again.",
    };
  }
}

/**
 * Public action to retrieve active workshop configuration for popup display.
 */
export async function getWorkshopConfigAction(): Promise<WorkshopConfig> {
  ensureWorkshopOpportunityExists();
  return DEFAULT_WORKSHOP_CONFIG;
}
