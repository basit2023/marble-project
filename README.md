# Stone catalogue — Phase 0

Phase 1 model infrastructure is now implemented. See [PHASE-1.md](PHASE-1.md) for the current model/write contract, database setup and verification steps. The Phase 0 notes below describe the original foundation.

Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 4, Mongoose and Cloudinary foundation. Auth.js v5, React Hook Form and Zod are installed for subsequent phases. No catalogue, login, lead form or admin CRUD is implemented in Phase 0.

## Setup

1. Use Node.js 22 LTS and run `npm ci`.
2. Copy `.env.example` to `.env.local` and fill every value. No existing environment file was present when this project was created.
3. Use at least 32 random characters for NEXTAUTH_SECRET. URLs must include their scheme. Use your HTTPS origin in production. WhatsApp numbers contain country code and digits only.
4. Run `npm run seed:foundation` once against your intended database. This inserts only missing system screen records and creates their indexes; it does not overwrite existing copy. Review the initial text in the script before running it.
5. Run `npm run dev`; visit localhost:3000.
6. Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.

Environment validation runs when Next.js reads its configuration, including builds. Errors list invalid field names without printing secret values. Do not import the environment module into client components. Vercel must have all eight variables configured in each applicable environment. Google font files are downloaded during builds and self-hosted by Next.js.

## Directory guide

| Path | Purpose |
| --- | --- |
| src/app/(public)/ | Public URLs; the route-group name is omitted from URLs. |
| src/app/(admin)/admin/ | Admin URL namespace and its fallback boundaries. It currently returns 404 and exposes no admin operations. |
| src/app/api/ | Future route handlers; intentionally no unauthenticated data endpoints. |
| src/components/ui/ | Reusable Button, Input, native-dialog Modal, Toast, Table and system screen renderer. All copy is passed in. |
| src/components/public/ | Future database-driven public sections. |
| src/components/admin/ | Future authenticated admin widgets. |
| src/lib/ | Environment, cached database connection, Cloudinary, utilities, content reads, security and SEO helpers; future auth configuration belongs here. |
| src/models/ | Shared content lifecycle fields and foundation system-content schema. |
| src/types/ | Serializable shared content types. |
| src/hooks/ | Future custom interaction hooks. |
| scripts/ | Explicit administrative setup commands. |
| tests/ | Utility regression tests. |

## Foundation decisions

- All displayed headings, paragraphs, actions and page SEO text come from active, non-deleted SystemContent documents. Seed text is initial database data, never imported by UI code.
- Every content record has isActive, isDeleted, sortOrder, timestamps and actor IDs. Future authenticated writes must assign actor IDs from the session. No deletion endpoints exist in this phase.
- A missing or disabled foundation record returns 404. A disabled fallback record renders an empty semantic shell. If MongoDB is unreachable, no invented copy is substituted; previously delivered copy can still support the client error boundary. A cold database outage cannot supply editable fallback text. This is a deliberate consequence of the database-only copy requirement.
- Root, public and admin segments have error, loading and not-found boundaries. Root-layout failures are outside the root error boundary under Next.js semantics. The admin catch-all ensures unknown admin URLs use the admin not-found boundary. Next.js streamed not-found responses can carry HTTP 200 with noindex metadata; references to 404 above describe the not-found UI, not a guaranteed transport status.
- Mongoose caches one connection and one in-flight promise per warm process. Failed attempts release the promise so later requests retry. Separate Vercel instances necessarily maintain separate pools.
- CSP middleware creates a request-specific nonce for framework scripts and overrides the baseline CSP from next.config.ts. Pages are dynamic and private/no-store to prevent nonce reuse. Development permits eval for tooling; production does not. Inline styles remain allowed for framework/component style attributes. Cloudinary images and Google Fonts origins are permitted.
- The Cloudinary SDK is server-only. buildImageUrl uses f_auto, q_auto and dpr_auto. buildImageSrcSet uses explicit widths with DPR 1 to avoid double density scaling. Future UI images must use next/image with dimensions and active Media references; there are no image records or displayed images in Phase 0.
- The WhatsApp helper has the requested environment default and accepts a database-owned number override. No phone number is displayed by the foundation.
- SEO helpers provide canonical metadata and safe JSON-LD serialization. Business structured data, production sitemap and admin authentication belong to their later phases, when the relevant records exist.
- No business identity or export claims have been invented. Replace seed copy in MongoDB before launch.

## Verification before Phase 1

- Supply real environment values and confirm a missing value rejects the build without revealing secrets.
- Seed a development database and confirm the home page uses its text and metadata.
- Change copy in MongoDB; refresh. Disable a record or set isDeleted=true and confirm it disappears.
- Verify MongoDB connection reuse under concurrent requests and reconnect behavior after an outage.
- Verify Cloudinary URLs against a real asset in your account.
- Confirm CSP, HSTS, frame, referrer and MIME headers on a production build; inspect for CSP violations and confirm a different nonce on each response.
- Check loading, retry and unknown URLs, including /admin/unknown. Confirm no admin functionality is accessible yet.
- Check keyboard focus, modal Escape/focus return, toast announcements and horizontal table scrolling.
- Review 360, 390, 768, 1024, 1440 and 1920 pixel layouts and reduced-motion behavior.
- Run Lighthouse against production with real content and 4G throttling. Scores and LCP are targets, not claims verified by this skeleton.

## Checks performed

- TypeScript and ESLint passed.
- Two utility regression tests passed.
- npm install audit reported zero vulnerabilities after pinning the PostCSS transitive override to 8.5.28.
- A build without environment values failed as expected and printed only field names.
- Production compilation passed with process-local synthetic environment values; no credentials were saved. This does not verify Atlas or Cloudinary connectivity.
- Production HTTP smoke checks confirmed CSP nonce injection, nonce variation and all five requested security headers.
- Real database seeding, cloud delivery, browser interaction, responsive visual QA and Lighthouse remain unverified because real environment/content was unavailable. No database was seeded or external asset changed.

## Implementation references

- [Next.js typed routes](https://nextjs.org/docs/app/api-reference/config/next-config-js/typedRoutes)
- [Next.js CSP and nonces](https://nextjs.org/docs/app/guides/content-security-policy)
- [Cloudinary responsive delivery](https://cloudinary.com/documentation/responsive_html)
