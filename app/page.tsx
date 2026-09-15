import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Code2, Briefcase, Rocket, Layers3, ArrowUpRight, Apple, Play } from "lucide-react";
import { PublicShell } from "@/components/fresherdesk/public-shell";
import { CourseCard, CheckList, SectionTitle } from "@/components/fresherdesk/common";
import { HomeSearch } from "@/components/fresherdesk/home-search";
import { getCourses } from "@/lib/fresherdesk-data";

export default async function Home() {
  const courses = await getCourses();
  return (
    <PublicShell>
      <main>
        {/* Hero */}
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">

              <p className="hero-kicker">Learn. Build. Get Hired.</p>
              <h1>Your career<br />starts <span>here.</span></h1>
              <p className="hero-description">Industry-ready courses, real-world projects, internships and job opportunities — all in one place.</p>
              <div className="hero-actions">
                <Link className="button button-green" href="/courses">Explore courses<ArrowRight size={18} /></Link>
                <Link className="button button-outline" href="/internships">Find internships<ArrowUpRight size={17} /></Link>
              </div>
              <div className="hero-proof">
                <div className="avatar-stack">
                  <span>AS</span><span>RK</span><span>NP</span><span>MJ</span>
                </div>
                <p><strong>50K+
                  Students are building
                  their future with us</strong><br />Built for your first big opportunity.</p>
              </div>
            </div>
            <div className="hero-art">
              <Image
                src="/images/hero-students.png"
                alt="Three students ready to begin their careers"
                width={860}
                height={660}
                priority
                className="hero-students"
              />
            </div>
          </div>
        </section>

        <HomeSearch />

        {/* Courses */}
        <section className="container home-courses section-space">
          <SectionTitle title="Popular Courses" href="/courses" action="Explore all courses" />
          <p className="section-intro">Practical skills for the career you want to build.</p>
          <div className="course-grid">
            {courses.slice(0, 3).map(c => <CourseCard key={c.slug} course={c} />)}
          </div>
        </section>

        {/* Why panel */}
        <section className="container">
          <div className="why-panel">
            <div className="why-copy">
              <span className="eyebrow light">MORE THAN JUST COURSES</span>
              <h2>Everything you need.<br />One step ahead.</h2>
              <p>From your first line of code to your first opportunity, build a future that feels like you.</p>
              <CheckList items={["Industry-focused learning paths", "Projects that become your portfolio", "Internships and job discovery", "A workspace for your progress"]} />
              <Link href="/dashboard" className="button button-white">Explore the workspace<ArrowRight size={17} /></Link>
            </div>
            <div className="why-art">
              <div className="device-showcase">
                <Image
                  className="why-laptop"
                  src="/images/dashboard-promo.png"
                  alt="FresherDesk student dashboard shown on a laptop"
                  width={1320}
                  height={1024}
                />
                <Image
                  className="why-phone"
                  src="/images/phone_transparent.png"
                  alt="FresherDesk student dashboard on a mobile phone"
                  width={1152}
                  height={2016}
                  style={{ marginRight: "50px" }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Value strip */}
        <section className="container value-strip" aria-label="What you can explore">
          {[
            { icon: BookOpen, value: "6", label: "Learning paths" },
            { icon: Code2, value: "Hands-on", label: "Portfolio projects" },
            { icon: Briefcase, value: "Career-ready", label: "Skills that matter" },
            { icon: Layers3, value: "One place", label: "Your learning journey" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label}>
              <span className="value-icon"><Icon size={25} /></span>
              <div><strong>{value}</strong><p>{label}</p></div>
            </div>
          ))}
        </section>

        {/* How it works */}
        <section id="how-it-works" className="container how-section section-space">
          <div className="center-heading">
            <span className="eyebrow">A LITTLE PROGRESS, EVERY DAY</span>
            <h2>Your ambition. A clear path.</h2>
            <p>Four steps to turn &ldquo;one day&rdquo; into day one.</p>
          </div>
          <div className="steps">
            {[
              { icon: BookOpen, title: "Learn", text: "Build a strong foundation with a learning path that fits your interests." },
              { icon: Code2, title: "Build", text: "Put your skills into practice with projects you can show the world." },
              { icon: Briefcase, title: "Get experience", text: "Explore internships and discover what working in your field feels like." },
              { icon: Rocket, title: "Get hired", text: "Find relevant opportunities and take your next step with confidence." },
            ].map(({ icon: Icon, title, text }, i) => (
              <div className="step" key={title}>
                {i < 3 && (
                  <svg className="step-connector" viewBox="0 0 200 67" preserveAspectRatio="none" aria-hidden="true" focusable="false" style={{ overflow: "visible" }}>
                    <path
                      d="M0 34 C60 16 140 16 200 34"
                      fill="none"
                      stroke="#9ec6b0"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray="0 8"
                    />
                  </svg>
                )}
                <span className="step-icon"><Icon size={31} /></span>
                <span className="step-number">0{i + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Mobile app */}
        <section className="container mobile-promo">
          <div className="mobile-promo-art">
            <Image
              className="mobile-promo-phones"
              src="/images/phone2.png"
              alt="FresherDesk mobile app shown on two phones"
              width={1056}
              height={2208}
            />
          </div>
          <div className="mobile-promo-copy">
            <span className="eyebrow">MOBILE APP</span>
            <h2>Learn on the Go with FresherDesk App</h2>
            <p>Access your courses, projects, internships and job updates anytime, anywhere.</p>
            <div className="store-buttons">
              <button type="button" className="store-button" aria-label="Get the FresherDesk app on Google Play">
                <Play size={22} />
                <span><small>Get it on</small><strong>Google Play</strong></span>
              </button>
              <button type="button" className="store-button" aria-label="Download the FresherDesk app on the App Store">
                <Apple size={22} />
                <span><small>Download on the</small><strong>App Store</strong></span>
              </button>
            </div>
          </div>
        </section>

        {/* Join banner */}
        <section className="container join-section">
          <div className="join-banner">
            <Image src="/images/cta-background.png" alt="" fill sizes="1200px" className="join-bg" />
            <div className="join-copy">
              <p>Ready to start your journey?</p>
              <h2>Your future is waiting.</h2>
              <Link className="button button-white" href="/courses">Find your starting point<ArrowRight size={17} /></Link>
            </div>
            <Image className="join-student" src="/images/cta-student.png" alt="Student smiling and giving a thumbs-up" width={1310} height={1200} />
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
