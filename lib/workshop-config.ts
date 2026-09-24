import { getDb, opportunities, companies } from "@/db";
import { eq } from "drizzle-orm";

// Re-export from shared browser-safe config (keeps the server-only db logic isolated here)
export { DEFAULT_WORKSHOP_ID, DEFAULT_WORKSHOP_CONFIG, type WorkshopConfig } from "@/lib/workshop-config-shared";
import { DEFAULT_WORKSHOP_ID, DEFAULT_WORKSHOP_CONFIG } from "@/lib/workshop-config-shared";


/**
 * Ensures the default workshop opportunity exists in the database.
 */
export function ensureWorkshopOpportunityExists(): string {
  const db = getDb();
  const existing = db
    .select()
    .from(opportunities)
    .where(eq(opportunities.id, DEFAULT_WORKSHOP_ID))
    .get();

  if (existing) {
    return existing.id;
  }

  // Ensure default company
  const company = db
    .select()
    .from(companies)
    .where(eq(companies.id, "cmp_fresherdesk_academy"))
    .get();

  if (!company) {
    db.insert(companies)
      .values({
        id: "cmp_fresherdesk_academy",
        name: "FresherDesk Academy",
        initials: "FA",
        logoUrl: "/images/brand-logo.png",
        website: "https://fresherdesk.com",
        isVerified: true,
      })
      .run();
  }

  db.insert(opportunities)
    .values({
      id: DEFAULT_WORKSHOP_ID,
      companyId: "cmp_fresherdesk_academy",
      companyName: "FresherDesk Academy",
      companyInitials: "FA",
      title: DEFAULT_WORKSHOP_CONFIG.title,
      role: "Live Workshop Participant",
      type: "Workshop",
      location: DEFAULT_WORKSHOP_CONFIG.location,
      mode: "Remote",
      status: "published",
      skills: JSON.stringify(["Next.js", "AI Agents", "Cloud Deployment", "Drizzle ORM", "TypeScript"]),
      experience: "Beginners & Freshers Welcome",
      description: DEFAULT_WORKSHOP_CONFIG.description,
      tone: "purple",
      salaryText: DEFAULT_WORKSHOP_CONFIG.priceText,
      stipendText: "Certificate & Project Kit Included",
    })
    .run();

  return DEFAULT_WORKSHOP_ID;
}
