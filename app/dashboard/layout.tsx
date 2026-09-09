import { DashboardShell } from "@/components/fresherdesk/dashboard-shell";
export const metadata = {title:"Student workspace"};
export default function DashboardLayout({children}:{children:React.ReactNode}){return <DashboardShell>{children}</DashboardShell>;}
