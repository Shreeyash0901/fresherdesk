import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "editor", "recruiter", "candidate"] })
    .notNull()
    .default("candidate"),
  avatarUrl: text("avatar_url"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  lastLoginAt: text("last_login_at"),
});

export const companies = sqliteTable("companies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  initials: text("initials").notNull(),
  logoUrl: text("logo_url"),
  website: text("website"),
  isVerified: integer("is_verified", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const opportunities = sqliteTable("opportunities", {
  id: text("id").primaryKey(),
  companyId: text("company_id").references(() => companies.id),
  companyName: text("company_name").notNull(),
  companyInitials: text("company_initials").notNull(),
  title: text("title").notNull(),
  role: text("role").notNull(),
  type: text("type", { enum: ["Job", "Internship", "Course"] }).notNull(),
  location: text("location").notNull(),
  mode: text("mode", { enum: ["Remote", "Hybrid", "On-site"] }).default("On-site"),
  status: text("status", { enum: ["draft", "published", "expired", "archived"] })
    .notNull()
    .default("published"),
  skills: text("skills").notNull().default("[]"), // JSON string array
  experience: text("experience").notNull(),
  description: text("description").notNull(),
  tone: text("tone").notNull().default("lime"),
  profile: text("profile"),
  isPartTime: integer("is_part_time", { mode: "boolean" }).default(false),
  minExperience: integer("min_experience").default(0),
  maxExperience: integer("max_experience").default(0),
  acceptsFreshers: integer("accepts_freshers", { mode: "boolean" }).default(true),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  salaryText: text("salary_text"),
  stipendMin: integer("stipend_min"),
  stipendMax: integer("stipend_max"),
  stipendText: text("stipend_text"),
  eligibility: text("eligibility").default("[]"), // JSON string array
  activeApplicationUrl: text("active_application_url"),
  sourceStatus: text("source_status").default("active"),
  isImported: integer("is_imported", { mode: "boolean" }).default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const leads = sqliteTable("leads", {
  id: text("id").primaryKey(),
  opportunityId: text("opportunity_id")
    .notNull()
    .references(() => opportunities.id),
  userId: text("userId").references(() => users.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  resumeUrl: text("resume_url"),
  coverLetter: text("cover_letter"),
  source: text("source", {
    enum: [
      "job_application",
      "internship_application",
      "course_enrollment",
      "website",
      "referral",
      "import",
      "manual",
    ],
  })
    .notNull()
    .default("website"),
  status: text("status", {
    enum: [
      "new",
      "contacted",
      "screening",
      "shortlisted",
      "interview",
      "selected",
      "rejected",
      "withdrawn",
    ],
  })
    .notNull()
    .default("new"),
  priority: text("priority", { enum: ["low", "normal", "high", "urgent"] })
    .notNull()
    .default("normal"),
  assignedTo: text("assigned_to").references(() => users.id),
  notes: text("notes"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  lastContactedAt: text("last_contacted_at"),
});

export const leadHistory = sqliteTable("lead_history", {
  id: text("id").primaryKey(),
  leadId: text("lead_id")
    .notNull()
    .references(() => leads.id),
  actorId: text("actor_id").references(() => users.id),
  actorName: text("actor_name").notNull().default("System"),
  action: text("action").notNull(),
  oldStatus: text("old_status"),
  newStatus: text("new_status"),
  oldAssignedTo: text("old_assigned_to"),
  newAssignedTo: text("new_assigned_to"),
  note: text("note"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(),
  actorId: text("actor_id").references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  metadata: text("metadata"), // JSON string
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
