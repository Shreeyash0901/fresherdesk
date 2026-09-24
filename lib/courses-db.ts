import { getDb, opportunities } from "@/db";
import { eq, desc } from "drizzle-orm";
import { courses as defaultCourses, type Course, type Category } from "./fresherdesk-data";

/**
 * Fetch all published courses dynamically from SQLite DB, merging with static defaults
 */
export async function getDbCourses(): Promise<Course[]> {
  try {
    const db = getDb();
    const rows = db
      .select()
      .from(opportunities)
      .where(eq(opportunities.type, "Course"))
      .orderBy(desc(opportunities.createdAt))
      .all();

    if (!rows || rows.length === 0) {
      return defaultCourses;
    }

    const publishedRows = rows.filter((r) => r.status === "published");

    const mapped: Course[] = publishedRows.map((r) => {
      // Derive slug from id (e.g. course_full-stack-development -> full-stack-development or custom id)
      const slug = r.id.startsWith("course_") ? r.id.replace("course_", "") : r.id.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      
      let skills: string[] = [];
      try {
        skills = JSON.parse(r.skills || "[]");
      } catch {
        skills = [];
      }

      let outcomes: string[] = [];
      try {
        outcomes = JSON.parse(r.eligibility || "[]");
      } catch {
        outcomes = [];
      }

      // Parse weeks & lessons from experience string (e.g. "16 weeks (128 lessons)")
      let weeks = 12;
      let lessons = 80;
      const match = r.experience?.match(/(\d+)\s*weeks.*?(\d+)\s*lessons/i);
      if (match) {
        weeks = parseInt(match[1], 10) || 12;
        lessons = parseInt(match[2], 10) || 80;
      }

      // If matching default course exists, inherit its structured modules
      const defaultMatch = defaultCourses.find((dc) => dc.slug === slug || dc.title.toLowerCase() === r.role.toLowerCase());
      const modules = defaultMatch?.modules || [
        "Core Concepts & Environment Setup",
        "Foundations and Essential Tools",
        "Guided Hands-on Projects & Architecture",
        "Real-world Deployment & Portfolio Review",
      ];

      return {
        slug,
        title: r.role || r.title,
        shortTitle: r.title || r.role,
        category: (r.location as Category) || "Development",
        summary: r.description,
        lessons,
        weeks,
        skills: skills.length ? skills : ["Tech Skills", "Coding"],
        tone: r.tone || "lime",
        outcomes: outcomes.length ? outcomes : [
          "Hands-on project experience with modern tools",
          "Comprehensive guided lessons and mentorship",
          "Verified FresherDesk certificate of completion"
        ],
        modules,
      };
    });

    return mapped.length ? mapped : defaultCourses;
  } catch (err) {
    console.error("Error fetching courses from DB, using defaults:", err);
    return defaultCourses;
  }
}

/**
 * Fetch a single course by slug from DB or fallback
 */
export async function getDbCourse(slug: string): Promise<Course | null> {
  const all = await getDbCourses();
  const found = all.find((c) => c.slug === slug);
  if (found) return found;
  return defaultCourses.find((c) => c.slug === slug) || null;
}
