import { Suspense } from "react";
import { PublicShell } from "@/components/fresherdesk/public-shell";
import { DbOpportunities } from "@/components/fresherdesk/db-opportunities";
export const metadata = { title: "Discover jobs" };
export default function JobsPage() {
  return (
    <PublicShell>
      <main className="container catalogue-page">
        <Suspense fallback={<p className="page-loading">Loading opportunities…</p>}>
          <DbOpportunities type="Job" />
        </Suspense>
      </main>
    </PublicShell>
  );
}
