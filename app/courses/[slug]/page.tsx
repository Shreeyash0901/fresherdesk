import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, Clock, Monitor, CheckCircle2 } from "lucide-react";
import { courses, getCourse } from "@/lib/fresherdesk-data";
import { PublicShell } from "@/components/fresherdesk/public-shell";
import { CategoryIcon, CheckList } from "@/components/fresherdesk/common";
import { Curriculum } from "@/components/fresherdesk/curriculum";
export function generateStaticParams(){return courses.map(c=>({slug:c.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const c=await getCourse((await params).slug);return {title:c?.title||"Course not found"};}
export default async function CourseDetail({params}:{params:Promise<{slug:string}>}) {
 const c=await getCourse((await params).slug);if(!c)notFound();
 return <PublicShell><main className="container detail-page"><Link className="back-link" href="/courses"><ArrowLeft size={16}/>All courses</Link><div className="detail-grid"><div><span className={"course-icon detail-icon "+c.tone}><CategoryIcon category={c.category} size={36}/></span><span className="eyebrow">{c.category}</span><h1>{c.title}</h1><p className="detail-summary">{c.summary}</p><div className="skill-tags">{c.skills.map(s=><span key={s}>{s}</span>)}</div><section className="detail-section"><h2>What you’ll learn</h2><CheckList items={c.outcomes}/></section><section className="detail-section"><h2>Your learning path</h2><p className="muted">A foundation you can build on, one module at a time.</p><Curriculum modules={c.modules}/></section></div><aside className="course-overview"><span className="eyebrow">YOUR NEXT STEP</span><h2>Make room for<br/>what’s next.</h2><ul><li><BookOpen size={19}/><span><b>{c.lessons} lessons</b><small>Learn at your own pace</small></span></li><li><Clock size={19}/><span><b>{c.weeks}-week learning path</b><small>Suggested course duration</small></span></li><li><Monitor size={19}/><span><b>Hands-on projects</b><small>Put your skills into practice</small></span></li><li><CheckCircle2 size={19}/><span><b>Beginner friendly</b><small>Start with the foundations</small></span></li></ul><Link className="button button-green" href="/dashboard/courses">Preview the workspace<ArrowRight size={17}/></Link><p className="preview-note">Course outline preview. Enrollment and lesson delivery are not connected yet.</p></aside></div></main></PublicShell>;
}
