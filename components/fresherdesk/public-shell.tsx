"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Menu, BookOpen, Briefcase, Home, User, FolderCode, Code2, Users } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Brand, InfoDialog } from "./common";
const nav = [{ label:"Courses", href:"/courses" }, { label:"Internships", href:"/internships" }, { label:"Jobs", href:"/jobs" }];
export function PublicHeader() {
 const pathname=usePathname();
 return <header className="public-header"><div className="container header-inner"><Brand/><nav className="desktop-nav" aria-label="Main navigation">{nav.map(n=><Link key={n.href} href={n.href} className={pathname.startsWith(n.href)?"active":""}>{n.label}</Link>)}<Link href="/#how-it-works">How it works</Link></nav><div className="header-actions"><Link className="button button-outline compact" href="/login">Log in</Link><Link className="button button-green compact" href="/signup">Sign up<ArrowRight size={15}/></Link></div><Sheet><SheetTrigger asChild><button className="icon-button mobile-menu" aria-label="Open navigation"><Menu size={23}/></button></SheetTrigger><SheetContent side="right" className="mobile-sheet"><SheetHeader><SheetTitle>Explore FresherDesk</SheetTitle></SheetHeader><nav>{[...nav,{label:"How it works",href:"/#how-it-works"},{label:"Log in",href:"/login"},{label:"Sign up",href:"/signup"}].map(n=><SheetClose asChild key={n.href}><Link href={n.href}>{n.label}<ArrowRight size={16}/></Link></SheetClose>)}</nav></SheetContent></Sheet></div></header>;
}
export function PublicFooter() {
 return <footer className="public-footer"><div className="container"><div className="footer-grid"><div className="footer-brand"><Brand light/><p>A place to learn, build and take the first step in your career.</p><div className="social-row"><InfoDialog title="Let's stay connected" description="Our social channels are being prepared. For now, explore our learning paths, internships, and job opportunities."><button className="social" aria-label="Community information"><Users size={17}/></button></InfoDialog></div></div><div><h3>Explore</h3><Link href="/courses">Courses</Link><Link href="/internships">Internships</Link><Link href="/jobs">Jobs</Link><Link href="/#how-it-works">How it works</Link></div><div><h3>Get Started</h3><Link href="/courses">All Courses</Link><Link href="/internships">Internship Openings</Link><Link href="/jobs">Job Listings</Link><Link href="/signup">Create Free Account</Link></div><div className="footer-cta"><h3>Your next chapter starts here.</h3><p>Find a path that fits your interests. Build something you can be proud of.</p><Link className="button button-green" href="/courses">Find your course<ArrowRight size={16}/></Link></div></div><div className="footer-bottom"><span>© 2026 FresherDesk. Learn. Build. Get hired.</span><span>Made for a future full of possibilities.</span></div></div></footer>;
}
export function PublicBottomNav() {
 const path=usePathname();
 const links=[{href:"/",label:"Home",icon:Home},{href:"/courses",label:"Courses",icon:BookOpen},{href:"/internships",label:"Internships",icon:Briefcase},{href:"/jobs",label:"Jobs",icon:FolderCode}];
 return <nav className="bottom-nav public-bottom" aria-label="Mobile navigation">{links.map(({href,label,icon:Icon})=><Link key={href} href={href} className={(href==="/" ? path==="/" : path.startsWith(href))?"active":""}><Icon size={21}/><span>{label}</span></Link>)}</nav>;
}
export function PublicShell({children}:{children:React.ReactNode}) { return <><PublicHeader/>{children}<PublicFooter/><PublicBottomNav/></>; }

