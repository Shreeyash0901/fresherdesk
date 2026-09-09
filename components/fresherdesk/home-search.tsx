"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowUpRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories } from "@/lib/fresherdesk-data";
export function HomeSearch() {
 const [type,setType]=useState("courses"),[category,setCategory]=useState("all"),[q,setQ]=useState("");
 const router=useRouter();
 function submit(e:React.FormEvent){e.preventDefault();const p=new URLSearchParams();if(q.trim())p.set("q",q.trim());if(type==="courses"&&category!=="all")p.set("category",category);router.push("/"+type+(p.size?"?"+p.toString():""));}
 return <section className="home-search container"><form onSubmit={submit}><div className="search-heading"><h2>Find the right opportunity for you</h2><span>Your next step, made simple<ArrowUpRight size={16}/></span></div><div className="opportunity-controls"><Select value={type} onValueChange={setType}><SelectTrigger className="search-select" aria-label="Opportunity type"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="courses">Explore courses</SelectItem><SelectItem value="internships">Find internships</SelectItem><SelectItem value="jobs">Discover jobs</SelectItem></SelectContent></Select><Select value={category} onValueChange={setCategory} disabled={type!=="courses"}><SelectTrigger className="search-select" aria-label="Course category"><SelectValue placeholder="All categories"/></SelectTrigger><SelectContent><SelectItem value="all">All categories</SelectItem>{categories.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><div className="search-input"><Search size={18}/><input aria-label="Keyword or skill" placeholder="Keyword or skill" value={q} onChange={e=>setQ(e.target.value)}/></div><button className="button button-navy" type="submit">Search<ArrowUpRight size={17}/></button></div></form></section>;
}

