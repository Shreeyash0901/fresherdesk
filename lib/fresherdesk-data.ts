export type Category = "Development" | "Cloud" | "AI / ML" | "Cyber Security" | "Data Science" | "Design";
export type Course = { slug: string; title: string; shortTitle: string; category: Category; summary: string; lessons: number; weeks: number; skills: string[]; tone: string; outcomes: string[]; modules: string[] };
export const categories: Category[] = ["Development", "Cloud", "AI / ML", "Cyber Security", "Data Science", "Design"];
export const courses: Course[] = [
{ slug: "full-stack-development", title: "Full-Stack Software Developer", shortTitle: "Full-Stack Development", category: "Development", summary: "Bring your ideas to life. Learn frontend, backend and everything in between.", lessons: 128, weeks: 16, skills: ["React", "Node.js", "PostgreSQL"], tone: "lime", outcomes: ["Build responsive interfaces with React and Next.js", "Design APIs and connect a relational database", "Ship a complete project for your portfolio"], modules: ["The foundations of the web", "JavaScript and TypeScript essentials", "React & Next.js fundamentals", "APIs, databases and authentication", "Your full-stack capstone project"] },
{ slug: "devops-cloud", title: "DevOps & Cloud Engineer", shortTitle: "DevOps & Cloud", category: "Cloud", summary: "Go from writing code to shipping it. Explore cloud, CI/CD and infrastructure.", lessons: 98, weeks: 12, skills: ["Docker", "Cloud", "CI/CD"], tone: "blue", outcomes: ["Understand cloud infrastructure and networking", "Containerize and deploy an application", "Build a continuous delivery pipeline"], modules: ["Linux and networking", "Cloud fundamentals", "Containers with Docker", "CI/CD pipelines", "Monitoring your application"] },
{ slug: "ai-generative-ai", title: "AI & Generative AI Engineer", shortTitle: "AI & Generative AI", category: "AI / ML", summary: "Build practical AI applications with Python, language models and real projects.", lessons: 110, weeks: 14, skills: ["Python", "LLMs", "Machine Learning"], tone: "purple", outcomes: ["Work with data and machine learning foundations", "Build an application powered by a language model", "Evaluate an AI application with useful examples"], modules: ["Python for AI", "Machine learning foundations", "Language models and prompting", "Retrieval and AI applications", "Your AI capstone project"] },
{ slug: "cyber-security", title: "Cyber Security Foundations", shortTitle: "Cyber Security", category: "Cyber Security", summary: "Understand how systems work, find weaknesses and learn to protect them.", lessons: 72, weeks: 10, skills: ["Networks", "Security", "Linux"], tone: "mint", outcomes: ["Understand common application risks", "Practice safe security analysis in a lab", "Apply secure development principles"], modules: ["Networking essentials", "Security fundamentals", "Application security", "Defensive tools", "Security lab project"] },
{ slug: "data-science", title: "Data Science & Analytics", shortTitle: "Data Science", category: "Data Science", summary: "Turn raw data into useful answers with Python, SQL and clear visualizations.", lessons: 86, weeks: 12, skills: ["Python", "SQL", "Analytics"], tone: "peach", outcomes: ["Clean and explore a dataset", "Write useful SQL queries", "Present insights in a portfolio project"], modules: ["Working with data", "Python and pandas", "SQL for analytics", "Data visualization", "Your analytics project"] },
{ slug: "ui-ux-design", title: "UI / UX & Product Design", shortTitle: "Product Design", category: "Design", summary: "Design thoughtful digital products, from your first wireframe to a polished prototype.", lessons: 64, weeks: 8, skills: ["Figma", "Research", "Prototyping"], tone: "rose", outcomes: ["Understand a user problem", "Create wireframes and interface systems", "Build and explain an interactive prototype"], modules: ["Design foundations", "Research and problem definition", "Wireframes and flows", "Interface and interaction design", "Your product case study"] },
];
export const enrollments = [{ slug: "full-stack-development", progress: 68 }, { slug: "devops-cloud", progress: 0 }, { slug: "ai-generative-ai", progress: 42 }];
export const projects = [
{ id: "task-manager", title: "Task Management App", summary: "Build a workspace where a small team can organize tasks, set priorities and track progress.", status: "In progress", skills: ["React", "Node.js", "MongoDB"], icon: "code", brief: ["Create a responsive task board with clear status columns.", "Add task creation, editing and filtering.", "Document your decisions and include setup instructions."] },
{ id: "ai-assistant", title: "AI Chat Assistant", summary: "Create a helpful assistant with a focused purpose and a clean conversational interface.", status: "Planning", skills: ["Next.js", "AI", "Python"], icon: "ai", brief: ["Choose a focused use case and explain who it helps.", "Design a clear chat interface with loading and error states.", "Document the model integration and evaluate sample conversations."] },
{ id: "portfolio", title: "Developer Portfolio", summary: "Tell the story of your work with an accessible, responsive portfolio.", status: "In progress", skills: ["HTML", "CSS", "React"], icon: "design", brief: ["Introduce yourself and your skills clearly.", "Present two projects with context, decisions and results.", "Check mobile layout and keyboard navigation."] },
];
export const tasks = [
{ id: "project", title: "Project submission", subtitle: "E-commerce website", label: "Next up", tone: "rose", kind: "project", detail: "Review your project requirements, update the README and prepare a shareable repository link." },
{ id: "live", title: "Live session", subtitle: "Node.js & Express", label: "Sample session", tone: "blue", kind: "video", detail: "This sample session covers routes, middleware and API error handling. Live session scheduling will be connected in a later phase." },
{ id: "assessment", title: "Assessment", subtitle: "JavaScript fundamentals", label: "Practice", tone: "mint", kind: "quiz", detail: "Practice arrays, objects, asynchronous code and the fundamentals of working with APIs." },
{ id: "review", title: "Code review", subtitle: "Portfolio project", label: "Upcoming", tone: "purple", kind: "code", detail: "Check your project structure, mobile layout, accessibility and README before requesting a review." },
];
export interface OpportunityEvent {
  url: string;
  sourceDate: string | null;
  sourceStatus: string;
  eventTestLocation: string | null;
  sourceRows: string | null;
  copiesGrouped: number;
}

export type Opportunity = {
  id: string;
  company: string;
  initials: string;
  role: string;
  type: "Internship" | "Job";
  location: string;
  mode?: "Remote" | "Hybrid" | "On-site";
  skills: string[];
  experience: string;
  description: string;
  tone: string;
  profile?: string;
  isPartTime?: boolean;
  minExperience?: number;
  maxExperience?: number;
  acceptsFreshers?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  salaryText?: string;
  stipendMin?: number;
  stipendMax?: number;
  stipendText?: string;
  eligibility?: string[];
  // Extended fields for imported & auditable records
  isImported?: boolean;
  sourceStatus?: "active" | "expired" | "unverified";
  sourceBatch?: string | null;
  sourceCompensationRaw?: string | number | null;
  compensationNotes?: string | null;
  referralReward?: number | null;
  logoUrl?: string | null;
  events?: OpportunityEvent[];
  activeApplicationUrl?: string | null;
  reviewFlags?: string[];
};
export const opportunities: Opportunity[] = [
  // Jobs
  {
    id: "orbit-frontend",
    company: "Orbit Labs",
    initials: "O",
    role: "Junior Frontend Developer",
    type: "Job",
    profile: "Frontend Developer",
    location: "Pune",
    mode: "On-site",
    isPartTime: false,
    minExperience: 0,
    maxExperience: 1,
    acceptsFreshers: true,
    salaryMin: 4,
    salaryMax: 6,
    salaryText: "₹4 – 6 LPA",
    skills: ["React", "TypeScript", "CSS", "Tailwind"],
    experience: "0–1 years",
    description: "Build accessible, responsive interfaces and collaborate with designers and backend developers. This is a sample opportunity.",
    tone: "purple"
  },
  {
    id: "cloud-dev",
    company: "Cloudline",
    initials: "C",
    role: "Associate Software Engineer",
    type: "Job",
    profile: "Software Engineer",
    location: "Bengaluru",
    mode: "Hybrid",
    isPartTime: false,
    minExperience: 0,
    maxExperience: 2,
    acceptsFreshers: true,
    salaryMin: 6,
    salaryMax: 9,
    salaryText: "₹6 – 9 LPA",
    skills: ["JavaScript", "SQL", "Git", "Node.js"],
    experience: "0–2 years",
    description: "Contribute to web products, learn from code reviews and build dependable software. This is a sample opportunity.",
    tone: "peach"
  },
  {
    id: "apex-backend",
    company: "Apex Logic",
    initials: "A",
    role: "Backend Engineer",
    type: "Job",
    profile: "Backend Developer",
    location: "Pune",
    mode: "Remote",
    isPartTime: true,
    minExperience: 1,
    maxExperience: 2,
    acceptsFreshers: false,
    salaryMin: 5,
    salaryMax: 8,
    salaryText: "₹5 – 8 LPA",
    skills: ["Python", "FastAPI", "PostgreSQL", "Docker"],
    experience: "1–2 years",
    description: "Design robust APIs and scalable microservices for financial data workflows. This is a sample opportunity.",
    tone: "blue"
  },
  {
    id: "quantum-fullstack",
    company: "QuantumStack",
    initials: "Q",
    role: "Full Stack Developer",
    type: "Job",
    profile: "Full Stack Engineer",
    location: "Nagpur",
    mode: "Hybrid",
    isPartTime: false,
    minExperience: 2,
    maxExperience: 3,
    acceptsFreshers: false,
    salaryMin: 8,
    salaryMax: 12,
    salaryText: "₹8 – 12 LPA",
    skills: ["Next.js", "React", "Node.js", "MongoDB"],
    experience: "2–3 years",
    description: "Lead end-to-end feature delivery across frontend and backend services for an enterprise SaaS platform. This is a sample opportunity.",
    tone: "lime"
  },
  {
    id: "synthetix-ai",
    company: "Synthetix AI",
    initials: "S",
    role: "Machine Learning Engineer",
    type: "Job",
    profile: "AI / ML Engineer",
    location: "Bengaluru",
    mode: "Remote",
    isPartTime: false,
    minExperience: 3,
    maxExperience: 5,
    acceptsFreshers: false,
    salaryMin: 10,
    salaryMax: 15,
    salaryText: "₹10 – 15 LPA",
    skills: ["Python", "PyTorch", "LLMs", "LangChain"],
    experience: "3+ years",
    description: "Train and deploy deep learning pipelines and generative AI solutions in production. This is a sample opportunity.",
    tone: "mint"
  },
  {
    id: "canvas-design",
    company: "Canvas Interactive",
    initials: "C",
    role: "Junior UI / UX Designer",
    type: "Job",
    profile: "UI / UX Designer",
    location: "Mumbai",
    mode: "On-site",
    isPartTime: true,
    minExperience: 0,
    maxExperience: 0,
    acceptsFreshers: true,
    salaryMin: 3.5,
    salaryMax: 5,
    salaryText: "₹3.5 – 5 LPA",
    skills: ["Figma", "Design Systems", "Prototyping"],
    experience: "Fresher",
    description: "Create intuitive user journeys and polished design components alongside product leads. This is a sample opportunity.",
    tone: "rose"
  },
  {
    id: "datavibe-analyst",
    company: "DataVibe Systems",
    initials: "D",
    role: "Junior Data Analyst",
    type: "Job",
    profile: "Data Analyst",
    location: "Delhi NCR",
    mode: "Remote",
    isPartTime: false,
    minExperience: 0,
    maxExperience: 0,
    acceptsFreshers: true,
    salaryMin: 4,
    salaryMax: 6.5,
    salaryText: "₹4 – 6.5 LPA",
    skills: ["SQL", "PowerBI", "Python", "Excel"],
    experience: "Fresher",
    description: "Analyze user behavior metrics and generate actionable dashboards for business stakeholders. This is a sample opportunity.",
    tone: "blue"
  },

  // Internships
  {
    id: "northstar-intern",
    company: "Northstar Studio",
    initials: "N",
    role: "Software Developer Intern",
    type: "Internship",
    profile: "Software Engineer",
    location: "Pune",
    mode: "Hybrid",
    isPartTime: false,
    stipendMin: 15000,
    stipendMax: 20000,
    stipendText: "₹15,000 – 20,000 / mo",
    eligibility: ["Students", "Freshers"],
    skills: ["React", "Node.js", "MongoDB"],
    experience: "Students & freshers",
    description: "Work alongside a product team on responsive web interfaces and small API integrations. This is a sample opportunity for exploring FresherDesk.",
    tone: "blue"
  },
  {
    id: "mint-ai",
    company: "Mint Technologies",
    initials: "M",
    role: "AI Application Intern",
    type: "Internship",
    profile: "AI / ML Engineer",
    location: "India",
    mode: "Remote",
    isPartTime: true,
    stipendMin: 20000,
    stipendMax: 25000,
    stipendText: "₹20,000 – 25,000 / mo",
    eligibility: ["Students", "Freshers", "Graduates"],
    skills: ["Python", "AI", "APIs", "LLMs"],
    experience: "Students & freshers",
    description: "Prototype useful AI experiences and evaluate how they behave with real examples. This is a sample opportunity.",
    tone: "mint"
  },
  {
    id: "pixel-design",
    company: "Pixel & Co.",
    initials: "P",
    role: "UI / UX Design Intern",
    type: "Internship",
    profile: "UI / UX Designer",
    location: "Pune",
    mode: "Remote",
    isPartTime: false,
    stipendMin: 10000,
    stipendMax: 15000,
    stipendText: "₹10,000 – 15,000 / mo",
    eligibility: ["Students"],
    skills: ["Figma", "Design", "Research", "Wireframing"],
    experience: "Students & freshers",
    description: "Explore user needs and translate ideas into thoughtful interfaces. This is a sample opportunity.",
    tone: "rose"
  },
  {
    id: "hyperscale-cloud",
    company: "HyperScale Labs",
    initials: "H",
    role: "Cloud & DevOps Intern",
    type: "Internship",
    profile: "Cloud / DevOps Engineer",
    location: "Bengaluru",
    mode: "On-site",
    isPartTime: false,
    stipendMin: 25000,
    stipendMax: 35000,
    stipendText: "₹25,000 – 35,000 / mo",
    eligibility: ["Freshers", "Graduates"],
    skills: ["Linux", "Docker", "AWS", "CI/CD"],
    experience: "Freshers & graduates",
    description: "Learn infrastructure automation and assist in managing containerized deployments on cloud. This is a sample opportunity.",
    tone: "peach"
  },
  {
    id: "codecraft-web",
    company: "CodeCraft Labs",
    initials: "C",
    role: "Frontend Web Intern",
    type: "Internship",
    profile: "Frontend Developer",
    location: "Nagpur",
    mode: "Hybrid",
    isPartTime: true,
    stipendMin: 12000,
    stipendMax: 18000,
    stipendText: "₹12,000 – 18,000 / mo",
    eligibility: ["Students", "Freshers"],
    skills: ["HTML", "CSS", "JavaScript", "React"],
    experience: "Students & freshers",
    description: "Build clean web modules and practice component-driven architecture with React. This is a sample opportunity.",
    tone: "purple"
  },
  {
    id: "quantdata-intern",
    company: "QuantData Insights",
    initials: "Q",
    role: "Data Analytics Intern",
    type: "Internship",
    profile: "Data Analyst",
    location: "Mumbai",
    mode: "Remote",
    isPartTime: false,
    stipendMin: 18000,
    stipendMax: 22000,
    stipendText: "₹18,000 – 22,000 / mo",
    eligibility: ["Students", "Graduates"],
    skills: ["Python", "SQL", "Pandas", "Tableau"],
    experience: "Students & graduates",
    description: "Work with exploratory data analysis, data wrangling, and metric dashboards for marketing campaigns. This is a sample opportunity.",
    tone: "lime"
  }
];
export { importedOpportunities } from "./imported-opportunities";
import { importedOpportunities } from "./imported-opportunities";

export const allOpportunities: Opportunity[] = [...opportunities, ...importedOpportunities];

export function getOpportunities(includeImportedReview = false): Opportunity[] {
  if (includeImportedReview) {
    return allOpportunities;
  }
  // Public default feed: only return standard sample opportunities and verified active imported opportunities
  return allOpportunities.filter(o => !o.isImported || o.sourceStatus === "active");
}

export async function getCourses() { return courses; }
export async function getCourse(slug: string) { return courses.find(c => c.slug === slug); }

