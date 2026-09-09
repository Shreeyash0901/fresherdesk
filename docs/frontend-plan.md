**FresherDesk — Frontend Development Plan and Phase Prompts**

Prepared for Shreeyash Helchal · 9 September 2026

**1. Delivery objective and scope**

Build the supplied FresherDesk designs as a responsive Next.js frontend. The first reviewable product consists of the public homepage, public course catalogue and student dashboard. Use deterministic sample data while backend work proceeds, with a small service layer that can later accept real responses.

Confirmed constraints: Next.js is required; Shreeyash will work mostly on frontend; desktop/mobile references and several image assets have been supplied. The repository, backend contracts, deadline, exact brand tokens, and full designs for supporting pages have not been provided in this conversation.

This plan is a proposed implementation sequence. It does not claim that a repository has been created, code implemented, or any checks passed.

| Scope level | Included |
|---|---|
| Reference-backed core | Desktop/mobile homepage; mobile public course catalogue; desktop/mobile student dashboard |
| Proposed supporting screens | Course details, jobs/internships lists/details, login/signup, profile, enrolled-course and project screens |
| Integration work | Frontend adapters and UI states; connection to actual endpoints supplied by the backend team |
| Later backlog | Full video LMS, live classes, assessments engine, certificates, community, employer/admin portal, payments, native mobile applications and AI evaluation |

A native mobile app is not established by the phone mockups. Start with responsive web behaviour. The mockups' phone/laptop hardware is presentation framing; recreate the inner interfaces as components. Device screenshots may separately be used as promotional artwork on the homepage.

**2. Delivery milestones and ownership**

| Milestone | Required phases | Evidence to show |
|---|---|---|
| First visible progress | 0–1, then the header/hero portion of 2 | Running project, reusable styles, responsive navigation and hero |
| Homepage review | 2 | Complete homepage with working supported interactions on phone and desktop |
| Core frontend demo | 0–4 plus the relevant checks in 9 | Browse courses and inspect the populated student dashboard using demo data |
| Expanded frontend | Assigned work in 5–7 | Supporting journeys and form states; design assumptions recorded |
| Integrated candidate | 8 for available APIs, then 9 | Real requests and supported mutations verified; outstanding contracts listed |

Run Phase 9's relevant checks for the first core demo; do not wait for every optional screen or API. The numbered sequence is the default work order, not a reason to delay showing completed work.

Shreeyash owns UI implementation, responsive behaviour, browser interactions, frontend types, states, integration wiring and visual verification. The backend owner supplies real data, authentication/session rules, authorization enforcement, storage, email, application/enrollment persistence and other server capabilities. The supervisor/product owner decides priorities, content and whether proposed screens belong in the current release.

Collect the team repository/branch conventions, original logo/font specifications, larger hero source, required first-demo date and any API examples early. Missing secondary assets or API contracts should be recorded while independently implementable UI work continues.

**3. Architecture and project organization**

Use one Next.js App Router application with TypeScript and Tailwind CSS, respecting the team's existing versions and conventions. An existing repository takes precedence over a new scaffold. For a new application, follow the official [Next.js installation guide](https://nextjs.org/docs/app/getting-started/installation).

Use one root layout and route groups for public, account and student experiences. Route groups organize layouts without adding their group names to URLs. Keep the route map collision-free. [Next.js project structure](https://nextjs.org/docs/app/getting-started/project-structure).

| Proposed location | Responsibility |
|---|---|
| src/app/layout.tsx | Root document, global styles/font and necessary providers |
| src/app/(public)/layout.tsx | Public header and footer |
| src/app/(public)/page.tsx | Homepage at / |
| src/app/(public)/courses/ | Public catalogue and [slug] details |
| src/app/(public)/jobs/ and internships/ | Proposed opportunity lists/details |
| src/app/(auth)/ | Proposed /login and /signup with simple account layout |
| src/app/(student)/layout.tsx | Student navigation and dashboard shell |
| src/app/(student)/dashboard/ | Dashboard and its courses/projects/profile children |
| src/components/ui/ | Small reusable controls and state feedback |
| src/components/layout/ | Header, footer, sidebar, mobile navigation and menus |
| src/components/home/, courses/, dashboard/, opportunities/ | Feature components |
| src/types/ | Frontend data models and filter/status types |
| src/data/mock/ | Deterministic synthetic fixtures |
| src/services/ | Feature-level access functions and backend-to-UI mapping |
| public/images/ | Approved brand/artwork assets with descriptive names |
| docs/frontend-plan.md and frontend-progress.md | Agreed scope and phase-by-phase implementation record |

Adapt this structure when an existing project has equivalent conventions. Avoid moving working files only to match folder names.

Keep static presentation and suitable data rendering in Server Components. Isolate browser events/state inside focused Client Components, respecting import and serialization boundaries. There is no reason to mark the whole application with use client. [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components).

A simple feature service, such as getCourses(filters), gives screens a stable data interface. Add a shared state library only when real cross-page state requirements justify one. URLs should hold shareable catalogue filters; local component state can hold transient menu or form state. API request code and fixture selection belong outside visual components.

**4. Screen and route inventory**

| Route | Design evidence | Planned behaviour | Phase |
|---|---|---|---|
| / | Desktop and mobile references | Marketing sections, course previews and opportunity search | 2 |
| /courses | Mobile reference; desktop layout derived | Search, categories, results and course links | 3 |
| /courses/[slug] | Proposed | Public detail template and agreed next action | 3 |
| /dashboard | Desktop and mobile references | Learning, projects, tasks and opportunities | 4 |
| /jobs and /internships | Proposed from navigation and opportunity card | Filtered discovery | 5 |
| /jobs/[slug] and /internships/[slug] | Proposed | Detail template and supported apply action | 5 |
| /login and /signup | Buttons visible; full designs missing | Account form UI and established auth integration | 6 |
| /dashboard/profile | Profile entry visible; full design missing | Profile view/edit draft and supported persistence | 6 |
| /dashboard/courses and /dashboard/courses/[slug] | Dashboard links; full designs missing | Enrolled courses and course overview | 7 |
| /dashboard/projects and /dashboard/projects/[id] | Dashboard links; full designs missing | Project summaries, brief and supported submission interface | 7 |

Assessments, certificates, community, resources and employer navigation imply future scope; their presence in a mockup does not define the complete workflows. Record their destination/status and avoid broken links. Plan them separately if assigned.

**5. Asset and visual specification**

| Supplied filename | Actual dimensions | Intended use |
|---|---|---|
| image(1).png | 864 × 1821 | Desktop homepage reference |
| image (1)(1).png | 863 × 1822 | Mobile homepage and catalogue reference |
| image (2)(1).png | 396 × 306, RGB | Student-group hero artwork |
| image (3).png | 862 × 1825 | Mobile dashboard reference |
| image (4).png | 1536 × 1024 | Desktop dashboard reference and possible promotional artwork |
| image (5).png | 2007 × 784 | Navy/green CTA background |
| image (6).png | 1310 × 1200 | Student cutout for CTA |

The hero artwork is small and has no alpha channel. Request a larger original; meanwhile use it at a restrained size against a compatible background. RGBA file mode alone does not establish that every other asset has meaningful transparency. Preserve aspect ratios and inspect the result.

Use descriptive project names such as hero-students.png, dashboard-promo.png, cta-background.png and cta-student.png. Obtain the original logo rather than presenting a screenshot crop as a clean logo source. Use Next.js Image with appropriate sizing for content images; decorative backgrounds need no redundant spoken description. [Next.js image guidance](https://nextjs.org/docs/app/getting-started/images).

Create centralized values for brand colours, font scale, spacing, content width, radius and shadows. The references suggest navy headings, green primary actions, white/neutral backgrounds and restrained card shadows. Exact colour/font values remain approximations until the original design specifications are available.

Design for 360/390px mobile, 768px tablet, 1024px small desktop and 1440px wide desktop; check 320px for overflow. These are verification widths, not mandatory CSS breakpoint names. Reflow dense card rows instead of forcing the mockup's exact card count at every width. Add room beneath fixed mobile navigation, including safe areas.

**6. Data, interaction and integration contract**

| Frontend model | Minimum useful fields | Consistency rule |
|---|---|---|
| Course | id, slug, title, summary, category, skills, lesson count, image, optional rating/price | Unknown values remain unknown; no invented prices or credentials |
| EnrolledCourse | enrollment id, course id, status, progress, optional next lesson | Reuse the same enrollment data in dashboard and My Courses |
| StudentSummary | demo identity, streak, progress summary | Count-based completion and lesson percentage have explicit labels |
| Task | id, kind, title, due date, status, destination | Deterministic time handling; avoid contradictory due labels |
| ProjectSummary | id, title, skills, status, optional due date | One status definition across dashboard/list/detail |
| Opportunity | id, slug, kind, company, role, location/work mode, skills, posted/closing dates, apply mode/URL | Job vs internship remains explicit; closed listings cannot accept a new application |

These are UI-model proposals, not an assumed backend schema. Coordinate identifiers, nullability, filter names, pagination, authentication/session handling and validation errors with the backend owner before live integration.

For the homepage search, define destination type explicitly: Courses, Internships or Jobs. Pass query/skill inputs and applicable filters to the matching list. Hide or relabel filters that do not apply to the selected destination.

Use a stable fixture source and predictable demonstration dates. Preview datasets must be synthetic. Reference metrics such as 50K+ students, hiring partner counts and satisfaction rates are not evidence of actual activity; replace or confirm them before a real launch.

Every relevant feature needs populated, loading, empty and recoverable error states. Forms additionally need invalid-input, pending and success/failure states; success is valid only when a real supported service confirms it. Distinguish route-level failures from inline expected errors. [Next.js error handling](https://nextjs.org/docs/app/getting-started/error-handling).

A mock service can demonstrate search, filtering and local draft changes. It cannot establish secure authentication, send email, create an account or persist an application. Make mock/live configuration explicit, and never silently return fixtures after a failed live request.

**7. Phase schedule**

The effort ranges below are planning estimates for one developer familiar with the stack, working roughly 5–6 focused hours per day. They exclude waiting for assets/API contracts and major redesign. Re-estimate after Phase 0. The core screens plus review may take roughly 2–3 working weeks; the proposed extensions and live integration add scope. These are not a committed delivery date.

| Phase | Work | Scope | Estimate |
|---|---|---|---|
| 0 | Repository audit, assets and working baseline | Core | 0.5 day |
| 1 | Design system, shared layouts and data boundaries | Core | 1–2 days |
| 2 | Responsive marketing homepage | Core | 2–3 days |
| 3 | Course catalogue and proposed course details | Core + proposed detail screen | 1–2 days |
| 4 | Student dashboard from both references | Core | 2–3 days |
| 5 | Jobs and internships discovery | Proposed extension | 1–2 days |
| 6 | Account forms and profile frontend | Proposed extension | 1–2 days |
| 7 | My Courses and Projects supporting screens | Proposed extension | 1–2 days |
| 8 | API readiness and available backend integration | Integration | 0.5–1 day readiness; live integration estimated after contracts |
| 9 | Final frontend QA, preview and handoff | Core delivery gate and final gate | 1–2 days |

**8. Completion and review process**

For each phase: inspect existing work, implement the bounded scope, verify its user journeys, fix discovered issues, and record the result. Share a concrete preview or screenshots with the supervisor after meaningful milestones. Routine implementation continues within the assigned scope; a design gap should be documented with a reasonable provisional choice where possible.

Run the project's actual scripts. Typical commands are npm run lint, npx tsc --noEmit and npm run build, but inspect package.json first and use the repository's package manager. A successful build is not evidence that browser interactions work, and browser checks do not replace the build. Do not assume that a build also ran lint.

Use a few meaningful browser tests for core interactions where test tooling exists or is justified: combined filters and reset; direct detail routing/not-found; mobile navigation; and a connected mutation's pending/error/success handling. Avoid broad tests that only duplicate static markup. Next.js documents [Playwright setup and usage](https://nextjs.org/docs/app/guides/testing/playwright).

A phase report should contain: delivered scope, changed files/routes, verification commands and results, browser checks and viewport coverage, unresolved dependencies, and next phase. Mark checks not run as not run. Any preview address must be an actual verified address, not an invented deployment claim.

Final delivery distinguishes three states: UI preview with fixtures; API-ready frontend with documented contracts; and integrated candidate with verified real behaviour. Production readiness cannot be inferred from attractive screens or successful compilation.

**9. How to use the prompts**

1. Keep this plan in the repository as docs/frontend-plan.md, or supply it with the coding conversation.
2. Paste the Master Instruction below plus exactly one Phase Prompt.
3. Attach the relevant screenshots and make the real asset files available to that coding environment.
4. Run Phase 0 first. Continue through 1–4 for the core screens and perform Phase 9's applicable review checks.
5. Run proposed extension phases 5–7 only when assigned. Run Phase 8 against the contracts actually available.
6. Start a new coding conversation with the master instruction, the phase prompt and the progress record whenever context becomes unclear. Do not ask the agent to execute all phases in one undifferentiated run.

**10. Master Instruction — paste with each phase**

```text
You are implementing the FresherDesk frontend in Next.js for Shreeyash Helchal.

Read this master instruction together with the single phase prompt provided below. Implement only that phase and the small prerequisites it needs.

Working rules:
1. Inspect the repository, its AGENTS.md instructions, package.json, lockfile, existing routes, components and assets before editing. Preserve unrelated work. Reuse the team's project and conventions; scaffold a new app only if this is an empty/new project.
2. Use the existing compatible Next.js setup. For a new project use the App Router, TypeScript, Tailwind CSS, ESLint and npm unless the team specifies otherwise. Retain the installed Tailwind version's configuration style. Avoid unnecessary package additions or version upgrades.
3. Follow the supplied FresherDesk designs: white surfaces, navy typography, green primary actions, rounded cards, restrained shadows and readable spacing. Record approximate design choices when exact tokens or assets are unavailable.
4. Keep public pages and student pages in separate layouts under one root layout. Public course discovery and a student's enrolled courses must have distinct routes.
5. Use reusable components where there is actual repetition. Keep feature data outside JSX, define TypeScript types and use small feature-level service functions backed initially by deterministic fixtures.
6. Use Server Components for suitable static/data-rendering sections. Put client boundaries around interactive elements. Respect server/client import boundaries and keep credentials out of client bundles.
7. Implement responsive behaviour at 360, 390, 768, 1024 and 1440 CSS-pixel widths; also check 320px as an overflow edge case. Use readable layouts rather than shrinking desktop compositions.
8. Implement semantic elements, visible keyboard focus, labelled controls and accessible menu/dialog behaviour. Every visible action must navigate, perform a supported interaction, or clearly indicate its current availability.
9. Treat all student identities, progress and opportunities in fixtures as demo data. Keep preview-only data/behaviour explicitly configured. Never claim an account, enrollment, application, subscription or upload succeeded unless a connected service confirmed it. A demo session is not authentication.
10. Implement loading, empty, error and pending states when relevant to the phase. Do not silently fall back to mock data when live requests fail.
11. Build the frontend and agreed integration points. Do not add database schemas, payment processing, real authentication infrastructure, employer administration or a complete LMS unless separately assigned.
12. Check the changed user journeys in a browser when available. Run the project's applicable lint, typecheck and build commands. Report actual results; do not describe unrun checks as passing.
13. At completion report: files changed, routes/components delivered, behaviour verified, commands and results, design assumptions, and remaining API/design dependencies. Update the frontend progress record. Finish this phase without automatically starting the next one.
```

**11. Individual phase prompts**
**Phase 0 — Repository audit, assets and working baseline**

Dependency: None. Scope: Core.

Deliverables: A running project, baseline checks, asset inventory, route map, and a short progress record.

Completion gate: The existing app or new scaffold starts; baseline errors are recorded; reference-backed and proposed screens are distinguished.

```text
PHASE 0 — REPOSITORY AUDIT AND BASELINE

Apply the FresherDesk master instructions. Prepare the project for frontend implementation.

Inspect the working tree and repository instructions first. Identify framework versions, package manager, scripts, routing conventions, components, assets and existing features. If a Next.js app already exists, keep it and its lockfile. If the project is empty, initialize one Next.js App Router project with TypeScript, Tailwind CSS and ESLint. Do not create a nested duplicate app.

Inventory the supplied desktop homepage, mobile home/course catalogue, mobile dashboard and desktop dashboard references. Inventory the hero illustration, dashboard promotional image, CTA background and student cutout. Copy available assets to descriptive project paths without overwriting originals. The 396x306 hero is low resolution and RGB; record that a larger original and the original logo would improve fidelity. Do not assume it has transparency.

Create docs/frontend-plan.md and docs/frontend-progress.md, adapting existing documentation if present. Record the proposed routes, phase order, design gaps, current commands and backend questions. If this full plan has already been copied into the repository, preserve it and link the progress record to it.

Establish a baseline by running the available lint/type/build commands and starting the development server where possible. Separate pre-existing errors from changes you introduce.

Deliver a running baseline and evidence. Do not implement whole feature pages in this phase.
```

**Phase 1 — Design system, shared layouts and data boundaries**

Dependency: Phase 0. Scope: Core.

Deliverables: Shared styles, public/student layouts, navigation primitives, core types and fixture services.

Completion gate: Both layouts render with sample content; navigation works on mobile and desktop; shared controls are keyboard usable.

```text
PHASE 1 — DESIGN FOUNDATION AND SHARED LAYOUTS

Apply the master instructions and inspect the Phase 0 output.

Define centralized tokens for the reference's navy, green, white/neutral surfaces, typography, content width, spacing, borders, radius and shadows. Treat exact colours and font choice as provisional if original brand specifications are missing.

Create only the reusable primitives presently needed: Button, labelled Input/Select, Badge, SectionHeading, Card, ProgressBar and state feedback. Prefer existing components. Define suitable Course, EnrolledCourse, StudentSummary, Task, ProjectSummary and Opportunity types as needed.

Create one root layout, a public layout with responsive header/footer, and a student layout with desktop sidebar, top bar and mobile navigation. Use /dashboard as the student root. Public /courses and student /dashboard/courses must remain distinct. Reference navigation for unbuilt features must not lead to broken routes or pretend the features exist.

Implement an accessible mobile menu: meaningful button labels, expanded state, Escape handling and appropriate focus handling. Modal drawers must manage focus correctly. Reserve content space for fixed navigation, including mobile safe-area padding.

Create a small fixture-backed service boundary such as getCourses() and getDashboardSummary(); do not add an unnecessary state framework or backend server.

Verify both layouts with simple sample content at the target widths. Deliver the shared foundation without filling out the homepage or dashboard sections.
```

**Phase 2 — Responsive marketing homepage**

Dependency: Phase 1. Scope: Core.

Deliverables: The full reference-based homepage with real responsive layout and working local interactions.

Completion gate: All ten sections render; supplied assets are used appropriately; menus and search routing work; mobile has no overflow.

```text
PHASE 2 — RESPONSIVE FRESHERDESK HOMEPAGE

Apply the master instructions. Implement the homepage at / using the desktop and mobile homepage references.

Build feature components for: Hero, OpportunitySearch, PopularCourses, WhyFresherDesk, Statistics, HowItWorks, AppPromotion and JoinBanner. Reuse the shared header and footer. Keep the reference's section order, hierarchy, overall proportions and green/navy identity.

Use the supplied student-group hero artwork, dashboard promotional image, CTA background and student cutout where appropriate. Render website text and controls as HTML, not as a screenshot. Preserve image aspect ratios and avoid enlarging the low-resolution hero excessively. Make any missing promotional asset substitution explicit in the completion report.

Adapt the hero to two columns on desktop and a readable vertical composition on mobile. Stack search fields on narrow screens. Let course cards and statistics wrap naturally. Use a sensible content width and consistent section spacing.

Render course previews from typed fixtures. Implement menu interactions and a clearly defined search model: destination type selects Courses, Internships or Jobs; query/skills and applicable filters are forwarded as URL parameters. Until a target route exists, show an honest preview/unavailable state instead of a broken link or unrelated fallback.

Keep newsletter, app-store and account actions honest when services or destinations are missing. Treat reference metrics and partner claims as unverified sample copy.

Verify all sections, keyboard access and target viewport widths. Report any design differences and pending destinations. Complete this phase only.
```

**Phase 3 — Course catalogue and proposed course details**

Dependency: Phases 1–2. Scope: Core + proposed detail screen.

Deliverables: Searchable public catalogue, clear filter states and a proposed course-details route.

Completion gate: Search and filters work together; refresh preserves filters; empty and invalid-course states work; details are reachable.

```text
PHASE 3 — COURSE CATALOGUE AND COURSE DETAILS

Apply the master instructions. Build /courses from the supplied mobile course-list design and derive a consistent desktop layout.

Implement a labelled search field, category selection, active filter feedback, result count, clear/reset action and responsive course cards. Use typed fixture data from the service boundary. Keep public course-card data separate from a student's enrollment/progress data. The default list should include the reference's Full-Stack, DevOps/Cloud and AI courses.

Store shareable search/category/page state in the URL using the installed Next.js version's supported APIs. Search and category filters must combine correctly. Reset pagination when filters change if pagination is needed. Include a no-results state that lets the user clear filters. Implement loading and failure states without introducing random fixture behaviour.

Create /courses/[slug] as a documented design proposal because a detail reference has not been supplied. Include title, description, category, learning outcomes, curriculum summary, prerequisites and the agreed enquiry/enrollment action. Use one reusable detail template and handle unknown slugs with a proper not-found experience.

Do not invent approved prices, instructor credentials or enrollment success. If the action lacks an agreed backend, provide an explicitly limited preview or unavailable state.

Connect homepage course links and search to this page. Verify direct links, browser back/forward, refresh, combined filters, no results and long course titles at mobile/desktop widths.
```

**Phase 4 — Student dashboard from both references**

Dependency: Phases 1 and 3. Scope: Core.

Deliverables: A responsive dashboard with reusable learning, task, project and opportunity widgets.

Completion gate: Desktop/sidebar and mobile/bottom-navigation layouts match the references' intent; fixture values are coherent.

```text
PHASE 4 — RESPONSIVE STUDENT DASHBOARD

Apply the master instructions. Implement /dashboard using both supplied dashboard references and the Phase 1 student layout.

Create reusable widgets for greeting, learning streak, progress summary, Continue Learning, My Courses, My Projects, Upcoming Tasks and Latest Opportunities. Use deterministic student/course/task/project fixtures through getDashboardSummary(), not scattered hardcoded values.

On desktop, retain the sidebar, top search/profile area, broad learning column and narrower tasks/opportunities column. On mobile, stack sections in a readable order, adapt course cards to available width and use the bottom navigation. Keep useful content such as projects reachable even if the mobile reference shows fewer sections. Do not reproduce the surrounding phone or laptop hardware as the app interface.

Define progress labels precisely. Completed-course count and lesson-progress percentage may have different denominators; do not imply that 3 of 5 is 68%. Keep the same course's progress consistent across widgets. Use deterministic date handling for task labels to avoid server/client mismatches.

Implement the profile menu, sidebar/mobile menu and any supported local filtering. Give View All and Continue actions truthful destinations; do not pretend an unbuilt lesson player works. Notifications and global search must have a defined fixture interaction or be visibly unavailable.

Verify populated, empty and loading states, long names/titles, keyboard navigation, fixed-nav spacing and all target widths. Report remaining linked destinations and demo-data boundaries.
```

**Phase 5 — Jobs and internships discovery**

Dependency: Core layout/components; run if assigned. Scope: Proposed extension.

Deliverables: Job/internship listings and shared detail screens with honest application behaviour.

Completion gate: Combined filters, direct detail links, missing/closed opportunities and supported apply actions behave correctly.

```text
PHASE 5 — JOBS AND INTERNSHIPS FRONTEND

Apply the master instructions. This is a proposed extension: full listing/detail designs were not supplied. Implement it only as the assigned scope and record its layout as a proposal consistent with FresherDesk.

Build /jobs, /internships and shared detail templates at /jobs/[slug] and /internships/[slug]. Reuse one typed Opportunity model with a job/internship discriminator and common listing/card/filter components.

Provide keyword/skill, location and work-mode filters, visible selected filters, reset, result count and sorting only where the fixture fields support it. Add pagination only if the data volume requires it. Preserve filters in URL parameters.

Show company, role, location/work mode, experience expectation, skills and posted date. Render salary/stipend only when known; missing values must not become zero or invented numbers. Include details, requirements and a clear open/closed state.

Connect the homepage opportunity search and dashboard opportunity cards. Handle empty results and unknown detail slugs.

If an approved external application URL exists, open it through a normal safe link. If an internal application endpoint is supplied, integrate only that agreed interaction. Otherwise show an explicitly limited preview/unavailable action; never fabricate an application confirmation.

Use synthetic demo companies/roles unless approved content is provided. Verify job/internship separation, filter combinations, closed listings and mobile/desktop layouts.
```

**Phase 6 — Account forms and profile frontend**

Dependency: Phase 1; authentication contract when available. Scope: Proposed extension.

Deliverables: Login/signup forms, profile view/edit UI and defined integration states.

Completion gate: Validation and pending/error states work; preview mode cannot be confused with real authentication or persistence.

```text
PHASE 6 — ACCOUNT AND PROFILE FRONTEND

Apply the master instructions. Implement proposed /login, /signup and /dashboard/profile screens using the shared FresherDesk design system. Follow the team's existing auth UI if present. Authentication-screen designs were not supplied, so document design choices.

Create accessible login/signup forms with agreed fields, client-side validation, password visibility controls where appropriate, submit-pending states and actionable field/form errors. Prevent duplicate submissions. Preserve user input after recoverable errors. Coordinate password requirements with the real backend rather than inventing policy.

Keep authentication behind the team's established integration. When real auth endpoints/session behaviour exist, use that contract. Otherwise keep the forms in an explicitly limited preview state; an optional Preview Dashboard action may navigate to synthetic demo data. Never implement production login by setting a localStorage boolean or describe frontend route hiding as security.

Create profile fields for name, education, skills, preferred role/location and links only as agreed. Support edit/cancel and a clear unsaved state. Show a saved confirmation only after a service confirms persistence. Do not claim resume upload unless an upload endpoint/storage contract exists.

Keep any forgot-password or verification action unavailable until its workflow is defined. In live integration handle unauthenticated/session-expired states without losing form context.

Verify keyboard navigation, invalid input, pending/failed submissions, draft cancellation and the clear boundary between preview and live behaviour.
```

**Phase 7 — My Courses and Projects supporting screens**

Dependency: Phases 3–4; agreed scope. Scope: Proposed extension.

Deliverables: Enrolled-course and project lists/details that complete dashboard navigation.

Completion gate: Shared fixture identities/progress agree; navigation works; unsupported learning/submission actions are not presented as complete.

```text
PHASE 7 — MY COURSES AND PROJECTS FRONTEND

Apply the master instructions. Complete the agreed supporting student screens at /dashboard/courses, /dashboard/courses/[slug], /dashboard/projects and /dashboard/projects/[id]. These screens are design proposals derived from the dashboard.

For My Courses, display enrolled courses with meaningful all/in-progress/completed filters, progress, status and a continue action. Reuse the same fixture identities and progress values as the dashboard. Include an empty-enrollment state leading to public /courses.

For the enrolled-course detail, provide a course overview and lesson-outline UI with sample status. Only navigate to an existing lesson viewer when one is available; do not build video delivery or claim lessons were completed in this phase.

For Projects, provide project cards, skills, status, due date when known, and a detail view with brief, requirements and relevant links. Support only an explicitly local draft for a project-link form unless a submission API is supplied. Validate link format and never fabricate a persisted submission or AI evaluation.

Keep status values consistent across lists and the dashboard. Handle unknown identifiers, empty projects and long content. Leave assessments, certificates, community and employer administration in the later backlog.

Verify navigation from every relevant dashboard View All/Continue action, filter behaviour and responsive layouts. Report remaining LMS and submission API dependencies.
```

**Phase 8 — API readiness and available backend integration**

Dependency: Relevant screens and actual backend contracts. Scope: Integration.

Deliverables: Documented service contracts, explicit mock/live modes and verified integration for available endpoints.

Completion gate: Every feature is labelled frontend-only, contract-ready or integrated with evidence; live failures never silently return fixtures.

```text
PHASE 8 — API READINESS AND AVAILABLE INTEGRATION

Apply the master instructions. Inspect the existing feature services and the backend documentation actually supplied. Preserve current screens and avoid a late rewrite of the data layer.

For each implemented feature document request parameters, response fields, identifiers, pagination, nullability, authentication/session behaviour, field errors and empty/error responses. Treat suggested endpoints as proposals until the backend team confirms them. Keep backend DTO mapping in the service layer.

Provide explicit mock and live configuration. Use deterministic fixtures in mock mode. In live mode call only known endpoints, handle non-success responses, cancellation/stale search results, unauthorized/session-expired states and recoverable errors. Never fall back silently to demo results after a live error. Keep secrets server-side and follow the existing session design.

Integrate supplied endpoints one feature at a time: public courses/opportunities first, then student data and supported account/forms. Do not add database models, auth infrastructure or payment processing.

If APIs or credentials are unavailable, finish the typed adapters, UI states, configuration documentation and handoff examples that can be completed. Mark those features contract-ready or frontend-only rather than integrated. State the specific missing dependency.

Verify actual responses for connected endpoints and pending/error behaviour for supported mutations. Record a feature-by-feature integration status table with evidence and remaining work.
```

**Phase 9 — Final frontend QA, preview and handoff**

Dependency: Run for each delivery scope; repeat only for newly added risk. Scope: Core delivery gate and final gate.

Deliverables: Checked user journeys, documented limitations, a reproducible build and a reviewable frontend handoff.

Completion gate: Delivered routes pass applicable checks; visual/interaction issues are resolved; frontend readiness and live integration status are stated accurately.

```text
PHASE 9 — FRONTEND QA AND HANDOFF

Apply the master instructions. Review the delivered scope against the supplied references and recorded design proposals. Do not add new product modules in this phase.

Check the homepage, catalogue, dashboard and any implemented supporting pages at 360, 390, 768, 1024 and 1440 CSS pixels, plus a 320px overflow check. Compare hierarchy, spacing, alignment, typography, image cropping, wrapping and fixed navigation. Inspect keyboard focus, form labels, drawer/dialog dismissal and readable contrast. Respect reduced-motion preferences if animation exists.

Exercise the complete supported journeys: homepage to filtered catalogue to course detail; dashboard to enrolled-course/project destinations; opportunity filtering to an available application action; account/profile validation and connected behaviour when available. Test direct navigation, refresh, empty results, missing slugs and network failure states. Add a few meaningful browser tests for stable critical interactions if the repository has suitable tooling; avoid static-component test proliferation.

Inspect image dimensions/loading and unnecessary client-side work. Resolve hydration warnings and console errors caused by the implementation. Run the project's applicable lint, typecheck and production build commands and report exact outcomes.

Update docs/frontend-progress.md and the README with setup, routes, configuration, mock/live behaviour, API dependencies, known limitations and verification evidence. Remove unsupported public claims and dead destinations from any launch candidate.

Prepare a reviewable preview through the team's configured workflow when available. Do not invent a URL or publish to a production domain without authorization. Label the outcome accurately as a UI preview, API-ready frontend, or integrated release candidate based on evidence.
```

**12. First work session**

Start with Phase 0 and then Phase 1. The first visual implementation task in Phase 2 is the responsive header, mobile menu and hero. Finish and review the remaining homepage sections before expanding into the course catalogue and dashboard.

**13. Later backlog — separate scoping required**

If the team requests a full learning/placement platform, create separate plans for video/lesson delivery and progress rules; live classes; assessment submission/scoring; certificate eligibility and issuance; community moderation; employer posting/applicant workflows; payments/refunds; notifications/email; and AI training/evaluation. Each needs workflow decisions, backend contracts and additional designs. Those capabilities are not included merely because their labels appear in a screenshot.

