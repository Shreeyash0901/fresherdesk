import Link from "next/link";
import { getSession, requireAuth } from "@/lib/auth/session";
import { Brand } from "@/components/fresherdesk/common";
import {
  Users,
  Briefcase,
  Layers,
  GraduationCap,
  LogOut,
  ShieldAlert,
  LayoutDashboard,
  FolderGit2,
  FileSpreadsheet,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth(["admin", "recruiter", "editor"]);

  const navItems = [
    { label: "Leads Pipeline", href: "/admin/leads", icon: Users },
    { label: "Jobs", href: "/admin/jobs", icon: Briefcase },
    { label: "Internships", href: "/admin/internships", icon: Layers },
    { label: "Courses", href: "/admin/courses", icon: GraduationCap },
    { label: "Bulk Ingest", href: "/admin/import", icon: FileSpreadsheet },
    { label: "Users & Roles", href: "/admin/users", icon: ShieldAlert },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* CMS Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0 border-r border-slate-800">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Brand light />
          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            CMS
          </span>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
              {session.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-width-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{session.name}</p>
              <p className="text-[11px] text-emerald-400 capitalize">{session.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1">
          <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Management
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={17} className="text-slate-400" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight size={14} className="text-slate-600" />
              </Link>
            );
          })}

          <p className="px-3 pt-5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Quick Links
          </p>
          <Link
            href="/jobs"
            target="_blank"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            <ExternalLink size={14} />
            <span>Public Jobs Page</span>
          </Link>
          <Link
            href="/internships"
            target="_blank"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            <ExternalLink size={14} />
            <span>Public Internships Page</span>
          </Link>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800">
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-colors"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">FresherDesk Administration</span>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold text-slate-800">Control Panel</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live DB
            </span>
          </div>
        </header>

        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
