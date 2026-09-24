"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Clock, Monitor, CheckCircle2, Sparkles } from "lucide-react";
import { PublicShell } from "@/components/fresherdesk/public-shell";
import { CategoryIcon, CheckList } from "@/components/fresherdesk/common";
import { Curriculum } from "@/components/fresherdesk/curriculum";
import { CourseEnrollModal } from "@/components/fresherdesk/course-enroll-modal";
import type { Course } from "@/lib/fresherdesk-data";

export function CourseDetailClient({ course }: { course: Course }) {
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);

  return (
    <PublicShell>
      <main className="container detail-page">
        <Link className="back-link" href="/courses">
          <ArrowLeft size={16} /> All courses
        </Link>

        <div className="detail-grid">
          <div>
            <span className={"course-icon detail-icon " + course.tone}>
              <CategoryIcon category={course.category} size={36} />
            </span>
            <span className="eyebrow">{course.category}</span>
            <h1>{course.title}</h1>
            <p className="detail-summary">{course.summary}</p>
            <div className="skill-tags">
              {course.skills.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>

            <section className="detail-section">
              <h2>What you’ll learn</h2>
              <CheckList items={course.outcomes} />
            </section>

            <section className="detail-section">
              <h2>Your learning path</h2>
              <p className="muted">A foundation you can build on, one module at a time.</p>
              <Curriculum modules={course.modules} />
            </section>
          </div>

          <aside className="course-overview">
            <span className="eyebrow">YOUR NEXT STEP</span>
            <h2>
              Make room for
              <br />
              what’s next.
            </h2>
            <ul>
              <li>
                <BookOpen size={19} />
                <span>
                  <b>{course.lessons} lessons</b>
                  <small>Learn at your own pace</small>
                </span>
              </li>
              <li>
                <Clock size={19} />
                <span>
                  <b>{course.weeks}-week learning path</b>
                  <small>Suggested course duration</small>
                </span>
              </li>
              <li>
                <Monitor size={19} />
                <span>
                  <b>Hands-on projects</b>
                  <small>Put your skills into practice</small>
                </span>
              </li>
              <li>
                <CheckCircle2 size={19} />
                <span>
                  <b>Beginner friendly</b>
                  <small>Start with the foundations</small>
                </span>
              </li>
            </ul>

            <button
              type="button"
              className="button button-green w-full flex items-center justify-center gap-2"
              onClick={() => setEnrollModalOpen(true)}
            >
              <span>Enroll now</span>
              <ArrowRight size={17} />
            </button>

            <p className="preview-note">Join thousands of students learning industry-ready tech skills.</p>
          </aside>
        </div>
      </main>

      <CourseEnrollModal
        course={course}
        open={enrollModalOpen}
        onOpenChange={setEnrollModalOpen}
      />
    </PublicShell>
  );
}
