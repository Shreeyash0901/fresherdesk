import { Suspense } from "react";
import { PublicShell } from "@/components/fresherdesk/public-shell";
import { Catalogue } from "@/components/fresherdesk/catalogue";
import { Skeleton } from "@/components/ui/skeleton";
export const metadata = { title: "Explore courses" };
export default function CoursesPage(){return <PublicShell><main className="container catalogue-page"><Suspense fallback={<div className="page-loading"><Skeleton className="h-12 w-72"/><Skeleton className="h-80 w-full"/></div>}><Catalogue/></Suspense></main></PublicShell>;}
