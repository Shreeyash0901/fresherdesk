import { Suspense } from "react";
import { PublicShell } from "@/components/fresherdesk/public-shell";
import { Opportunities } from "@/components/fresherdesk/opportunities";
export const metadata={title:"Discover jobs"};
export default function JobsPage(){return <PublicShell><main className="container catalogue-page"><Suspense fallback={<p className="page-loading">Loading opportunities…</p>}><Opportunities type="Job"/></Suspense></main></PublicShell>;}
