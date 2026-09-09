"use client";
import Link from "next/link";
import { ArrowRight, BrainCircuit, Cloud, Code2, Shield, BarChart3, Palette, Check } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import type { Course, Category } from "@/lib/fresherdesk-data";
import type { ReactNode } from "react";

export function Brand({ light = false }: { light?: boolean }) {
 return <Link href="/" className={"brand" + (light ? " brand-light" : "")} aria-label="FresherDesk home"><span className="brand-mark" aria-hidden="true"><b>F</b><i>D</i></span><span>FresherDesk</span></Link>;
}
export function CategoryIcon({ category, size = 28 }: { category: Category; size?: number }) {
 const Icon = { Development: Code2, Cloud, "AI / ML": BrainCircuit, "Cyber Security": Shield, "Data Science": BarChart3, Design: Palette }[category];
 return <Icon size={size} strokeWidth={1.7} aria-hidden="true" />;
}
export function SectionTitle({ title, href, action = "View all" }: { title: string; href?: string; action?: string }) {
 return <div className="section-title"><h2>{title}</h2>{href && <Link className="text-link" href={href}>{action}<ArrowRight size={16}/></Link>}</div>;
}
export function CourseCard({ course, progress }: { course: Course; progress?: number }) {
 const href = progress === undefined ? "/courses/" + course.slug : "/dashboard/courses?course=" + course.slug;
 return <article className={"course-card" + (progress !== undefined ? " enrolled" : "")}>
  <div className="course-card-top"><span className={"course-icon " + course.tone}><CategoryIcon category={course.category}/></span>{progress !== undefined ? <span className={"badge " + (progress ? "mint" : "neutral")}>{progress ? "In progress" : "Not started"}</span> : <span className="course-category">{course.category}</span>}</div>
  <h3><Link href={href}>{progress === undefined ? course.title : course.shortTitle}</Link></h3>
  {progress === undefined && <p>{course.summary}</p>}
  <div className="course-meta"><span><b>{course.lessons}</b> lessons</span>{progress === undefined && <span>{course.weeks} weeks</span>}</div>
  {progress !== undefined ? <div className="progress-row"><Progress value={progress} aria-label={course.shortTitle + " progress"} /><b>{progress}%</b></div> : <Link href={href} className="course-link">Explore course<ArrowRight size={17}/></Link>}
 </article>;
}
export function InfoDialog({ title, description, children, content }: { title: string; description: string; children: ReactNode; content?: ReactNode }) {
 return <Dialog><DialogTrigger asChild>{children}</DialogTrigger><DialogContent className="fd-dialog"><DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>{content}</DialogContent></Dialog>;
}
export function CheckList({ items }: { items: string[] }) { return <ul className="check-list">{items.map(item=><li key={item}><span><Check size={15}/></span>{item}</li>)}</ul>; }

