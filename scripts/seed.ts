import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { hashPassword } from "../lib/auth/password";
import { allOpportunities } from "../lib/fresherdesk-data";

function runSeed() {
  console.log("🌱 Starting FresherDesk database seed...");

  const dataDir = path.resolve(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, "fresherdesk.db");
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  // Read and apply migration SQL
  const migrationFile = path.resolve(process.cwd(), "drizzle", "0000_rare_vertigo.sql");
  if (fs.existsSync(migrationFile)) {
    console.log("Executing migration schema...");
    const migrationSql = fs.readFileSync(migrationFile, "utf-8");
    const statements = migrationSql.split("--> statement-breakpoint");
    for (const stmt of statements) {
      if (stmt.trim()) {
        try {
          db.exec(stmt.trim());
        } catch (e: any) {
          if (!e.message.includes("already exists")) {
            console.error("Migration error on statement:", stmt, e);
          }
        }
      }
    }
  }

  console.log("Seeding core users...");
  const insertUser = db.prepare(`
    INSERT OR REPLACE INTO users (id, name, email, password_hash, role, avatar_url, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `);

  // Admin user
  insertUser.run(
    "usr_admin_1",
    "FresherDesk Admin",
    "admin@fresherdesk.com",
    hashPassword("Admin@123456"),
    "admin",
    null
  );

  // Recruiter user
  insertUser.run(
    "usr_recruiter_1",
    "Sarah Jenkins (Senior Talent Partner)",
    "recruiter@fresherdesk.com",
    hashPassword("Recruiter@123456"),
    "recruiter",
    null
  );

  // Editor user
  insertUser.run(
    "usr_editor_1",
    "Content Editor",
    "editor@fresherdesk.com",
    hashPassword("Editor@123456"),
    "editor",
    null
  );

  // Candidate user
  insertUser.run(
    "usr_candidate_1",
    "Aarav Patel",
    "candidate@fresherdesk.com",
    hashPassword("Candidate@123456"),
    "candidate",
    null
  );

  console.log("Seeding opportunities and companies...");
  const insertCompany = db.prepare(`
    INSERT OR IGNORE INTO companies (id, name, initials, logo_url, website, is_verified, created_at)
    VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
  `);

  const insertOpportunity = db.prepare(`
    INSERT OR REPLACE INTO opportunities (
      id, company_id, company_name, company_initials, title, role, type,
      location, mode, status, skills, experience, description, tone, profile,
      is_part_time, min_experience, max_experience, accepts_freshers,
      salary_min, salary_max, salary_text, stipend_min, stipend_max, stipend_text,
      eligibility, active_application_url, source_status, is_imported, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )
  `);

  // Group companies from existing opportunities
  const uniqueCompanies = new Map<string, { id: string; name: string; initials: string }>();
  for (const opp of allOpportunities) {
    const compId = "comp_" + opp.company.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 20);
    if (!uniqueCompanies.has(opp.company)) {
      uniqueCompanies.set(opp.company, { id: compId, name: opp.company, initials: opp.initials });
      insertCompany.run(compId, opp.company, opp.initials, null, null);
    }
  }

  // Insert all opportunities
  for (const opp of allOpportunities) {
    const comp = uniqueCompanies.get(opp.company);
    insertOpportunity.run(
      opp.id,
      comp ? comp.id : null,
      opp.company,
      opp.initials,
      opp.role,
      opp.role,
      opp.type,
      opp.location,
      opp.mode || "On-site",
      opp.sourceStatus === "expired" ? "expired" : "published",
      JSON.stringify(opp.skills || []),
      opp.experience,
      opp.description,
      opp.tone || "lime",
      opp.profile || null,
      opp.isPartTime ? 1 : 0,
      opp.minExperience || 0,
      opp.maxExperience || 0,
      opp.acceptsFreshers ? 1 : 0,
      opp.salaryMin || null,
      opp.salaryMax || null,
      opp.salaryText || null,
      opp.stipendMin || null,
      opp.stipendMax || null,
      opp.stipendText || null,
      JSON.stringify(opp.eligibility || []),
      opp.activeApplicationUrl || null,
      opp.sourceStatus || "active",
      opp.isImported ? 1 : 0
    );
  }

  console.log("Seeding sample leads and lead history...");
  const insertLead = db.prepare(`
    INSERT OR REPLACE INTO leads (
      id, opportunity_id, userId, name, email, phone, resume_url, cover_letter,
      source, status, priority, assigned_to, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `);

  const insertLeadHistory = db.prepare(`
    INSERT OR REPLACE INTO lead_history (
      id, lead_id, actor_id, actor_name, action, old_status, new_status, old_assigned_to, new_assigned_to, note, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);

  const firstOpp = allOpportunities[0];
  const secondOpp = allOpportunities[1] || allOpportunities[0];

  // Lead 1 - New
  insertLead.run(
    "lead_demo_1",
    firstOpp.id,
    "usr_candidate_1",
    "Rohan Deshmukh",
    "rohan.deshmukh@example.com",
    "+91 9876543210",
    "https://example.com/resumes/rohan-deshmukh.pdf",
    "Excited to apply for this full-stack role. I have completed several Next.js and React projects.",
    "job_application",
    "new",
    "high",
    null,
    "Candidate has strong React portfolio project links."
  );

  insertLeadHistory.run(
    "hist_demo_1",
    "lead_demo_1",
    null,
    "Public Application",
    "LEAD_CREATED",
    null,
    "new",
    null,
    null,
    "Application received through FresherDesk portal."
  );

  // Lead 2 - Interview
  insertLead.run(
    "lead_demo_2",
    secondOpp.id,
    null,
    "Priya Sharma",
    "priya.sharma@example.com",
    "+91 9823456789",
    "https://example.com/resumes/priya-sharma.pdf",
    "I am an enthusiastic pre-final year student looking for an internship in frontend development.",
    "internship_application",
    "interview",
    "urgent",
    "usr_recruiter_1",
    "Passed initial screening round. Technical round scheduled."
  );

  insertLeadHistory.run(
    "hist_demo_2a",
    "lead_demo_2",
    null,
    "Public Application",
    "LEAD_CREATED",
    null,
    "new",
    null,
    null,
    "Application received."
  );

  insertLeadHistory.run(
    "hist_demo_2b",
    "lead_demo_2",
    "usr_admin_1",
    "FresherDesk Admin",
    "LEAD_ASSIGNED",
    "new",
    "screening",
    null,
    "usr_recruiter_1",
    "Assigned to Senior Talent Partner Sarah Jenkins."
  );

  insertLeadHistory.run(
    "hist_demo_2c",
    "lead_demo_2",
    "usr_recruiter_1",
    "Sarah Jenkins",
    "LEAD_STATUS_CHANGED",
    "screening",
    "interview",
    "usr_recruiter_1",
    "usr_recruiter_1",
    "Moved to interview stage after reviewing GitHub profile."
  );

  console.log("✅ FresherDesk Database seed completed successfully!");
  console.log("--------------------------------------------------");
  console.log("Test Credentials:");
  console.log("👑 Admin:      admin@fresherdesk.com      / Admin@123456");
  console.log("💼 Recruiter:  recruiter@fresherdesk.com  / Recruiter@123456");
  console.log("✍️ Editor:     editor@fresherdesk.com     / Editor@123456");
  console.log("🎓 Candidate:  candidate@fresherdesk.com  / Candidate@123456");
  console.log("--------------------------------------------------");
}

runSeed();
