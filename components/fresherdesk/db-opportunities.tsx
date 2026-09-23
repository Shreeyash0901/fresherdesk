import { getDbOpportunities } from "@/lib/opportunities-db";
import { Opportunities } from "@/components/fresherdesk/opportunities";

export async function DbOpportunities({ type }: { type: "Job" | "Internship" }) {
  // Query live opportunities from the database
  const opps = await getDbOpportunities({ type });
  return <Opportunities type={type} initialOpportunities={opps} />;
}
