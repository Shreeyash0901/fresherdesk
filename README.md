# FresherDesk

A responsive frontend built with **Next.js 16 App Router, React, TypeScript and Tailwind CSS** from the supplied FresherDesk references.

## Run locally

Use a compatible Node.js version (the project declares Node 22.13 or newer).

```sh
npm ci
npm run dev
```

Open http://localhost:3000.

```sh
npm run typecheck
npm run build
npm start
```

The build uses the actual Next.js compiler and produces a static export in `out/`. The start command serves that export locally after a build. No database or API keys are required for this frontend preview.

## Included

- Responsive homepage using supplied hero, CTA and dashboard artwork
- Course catalogue with URL-backed search/category filters
- Six statically generated course-detail pages and curriculum accordions
- Student dashboard with desktop sidebar and mobile navigation
- My Courses overview and outline preview
- Project list, filters, details and URL-format validation
- Profile form with explicitly temporary preview changes
- Sample job/internship listings, work-mode/search filters, details and visit-only bookmarks
- Login/signup form validation and password visibility controls
- Not-found page and clear unavailable-action states

## Data and integration

`lib/fresherdesk-data.ts` owns synthetic course, enrollment, task, project and opportunity data. Student progress and notifications are samples. Opportunity companies are fictional. Bookmark/read/profile edits are temporary browser-memory state and do not persist across sessions.

Account forms do not send or store credentials. Profile edits are not account updates. Project-link checking validates the URL format; it does not check the remote page or submit the project. Applications, course enrollment, video lessons, payments, certificates, real notifications and backend persistence are not implemented.

Small course access functions are included; a full backend adapter/contract layer is still future work. Keep mock/live behaviour explicit when integrating APIs and follow the backend team's session model. Static export must be reconsidered if future features require Next.js server routes or server actions.

## Organization

- `app/`: Next.js routes, metadata and global styles
- `components/fresherdesk/`: product layouts, shared controls and feature views
- `components/ui/`: supplied UI primitives
- `lib/fresherdesk-data.ts`: typed demo data
- `public/images/`: supplied image assets
- `docs/frontend-plan.md`: detailed plan, master instruction and ten phase prompts
- `docs/frontend-progress.md`: implementation status and remaining work

The starter's additional development dependencies and UI catalog were retained. The active dev/build commands run Next.js, not Vinext. The Sites manifest selects the `out` static export.

## Verification

The Next.js production build and TypeScript checks succeeded. All 18 generated pages completed, including framework error pages. Core route and local-asset checks are documented in the progress record. Browser/visual testing has not been performed in this session.

## Design notes

The implementation follows the supplied green/navy identity and layout references. The original vector logo was not supplied, so a typographic mark is provisional. The hero illustration is only 396 × 306; replacing it with a larger source will improve large-screen sharpness. Marketing statistics and app-store links that could not be verified were replaced with truthful learning-path and responsive-workspace content.
