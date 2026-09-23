import { getAdminLeads } from "@/app/actions/admin-leads";
import { LeadsPipelineClient } from "@/components/fresherdesk/leads-pipeline-client";
import { getDb, users, opportunities } from "@/db";
import { or, eq, desc } from "drizzle-orm";

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    priority?: string;
    type?: string;
    assignedTo?: string;
  }>;
}) {
  const resolvedParams = await searchParams;
  const { leads, metrics } = await getAdminLeads(resolvedParams);

  const db = getDb();

  // Fetch list of recruiters
  const recruiters = db
    .select({
      id: users.id,
      name: users.name,
      role: users.role,
    })
    .from(users)
    .where(or(eq(users.role, "admin"), eq(users.role, "recruiter")))
    .all();

  // Fetch active opportunities for the creation modal
  const oppList = db
    .select({
      id: opportunities.id,
      title: opportunities.title,
      companyName: opportunities.companyName,
      type: opportunities.type,
    })
    .from(opportunities)
    .where(eq(opportunities.status, "published"))
    .orderBy(desc(opportunities.createdAt))
    .limit(50)
    .all();

  return (
    <LeadsPipelineClient
      leads={leads}
      metrics={metrics}
      recruiters={recruiters}
      opportunities={oppList}
      currentQuery={resolvedParams.q}
      currentAssignedTo={resolvedParams.assignedTo}
      defaultView="board"
    />
  );
}
