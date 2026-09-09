"use client";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { BookOpen } from "lucide-react";
export function Curriculum({modules}:{modules:string[]}) {return <Accordion type="single" collapsible className="curriculum">{modules.map((m,i)=><AccordionItem key={m} value={m}><AccordionTrigger><span className="module-num">{String(i+1).padStart(2,"0")}</span><span>{m}</span></AccordionTrigger><AccordionContent><p>Explore the key concepts, practise with guided exercises and apply what you learn in a focused project.</p><span className="module-note"><BookOpen size={15}/>Course outline preview</span></AccordionContent></AccordionItem>)}</Accordion>;}
