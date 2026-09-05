# Phase 1 — full file output

Complete source for Phase 1 models, types, validation, related changes, tests, scripts and verification notes. Environment values are excluded.

## PHASE-1.md

````
# Phase 1 — Mongoose models

All 14 requested models and matching TypeScript interfaces are implemented. The existing SystemContent model now uses the same base fields and active query helper. No admin routes, authentication screens, upload endpoints or catalogue pages were added.

## Files and responsibilities

| Model file | Interface file | Responsibility |
| --- | --- | --- |
| src/models/user.ts | src/types/user.ts | Admin identities, roles, normalized unique email and hidden password hash. |
| src/models/media.ts | src/types/media.ts | Cloudinary image identity, dimensions, mandatory alt text, usage and uploader. |
| src/models/category.ts | src/types/category.ts | Material taxonomy, hierarchy, visibility, SEO and cover image. |
| src/models/product.ts | src/types/product.ts | Stone catalogue, specifications, formats, prices, ordered media and text search. |
| src/models/project.ts | src/types/project.ts | Completed work and its product/media references. |
| src/models/exhibition.ts | src/types/exhibition.ts | Event dates, media and dynamically evaluated isUpcoming. |
| src/models/blog-post.ts | src/types/blog-post.ts | Rich-text articles, publication state, authors and derived reading time. |
| src/models/testimonial.ts | src/types/testimonial.ts | Client feedback, integer ratings, optional photo and project reference. |
| src/models/faq.ts | src/types/faq.ts | Categorized questions and rich-text answers. |
| src/models/home-section.ts | src/types/home-section.ts | Ordered/toggleable homepage sections and flexible typed items. |
| src/models/site-settings.ts | src/types/site-settings.ts | Singleton settings, contact details, social links and default SEO. |
| src/models/navigation-item.ts | src/types/navigation-item.ts | Hierarchical menus across header, footer and mobile locations. |
| src/models/inquiry.ts | src/types/inquiry.ts | Lead details, product interest, source, status and internal assignment. |
| src/models/audit-log.ts | src/types/audit-log.ts | Append-only administrator events. |
| src/models/system-content.ts | src/types/system-content.ts | Existing foundation screen copy, upgraded to the shared model infrastructure. |

Shared definitions live in content-fields.ts, shared.ts, seo.ts, subdocuments.ts and src/types/base.ts. All enum values live in src/types/enums.ts. Every model has a corresponding Zod validator in src/lib/validation/. Import models from src/models/index.ts when working with populated references so the complete registry is registered.

## Validation and write contract

- Content records have indexed isActive, isDeleted and sortOrder fields, the compound active/deleted/order index, User ObjectId audit references, and timestamps. Null actor references explicitly represent bootstrap/system writes before a User exists. Admin writes must supply the authenticated user's ID.
- AuditLog is an append-only event ledger rather than editable content: it has createdAt, no updatedAt, no visibility toggles and no soft-delete flag. Its schema blocks ordinary updates, deletes and bulk writes. Database permissions must additionally protect raw collection access.
- Each model is guarded with the existing-model check for Next.js hot reload.
- Zod validates complete documents during asynchronous validation/save. Field validators also enforce field constraints through Mongoose. Use await document.validate() for complete validation; validateSync() does not run document middleware.
- Use create() for new records and load/set/save for content edits. Query updates allow only explicit $set lifecycle fields: isActive, isDeleted, sortOrder, updatedBy and timestamp metadata. They enable runValidators automatically. This prevents partial price/date changes and blog updates from bypassing cross-field validation or derived values. Upserts, replacement writes, update pipelines and bulkWrite are rejected for content models.
- Optimistic concurrency is enabled for document saves. Handle version conflicts in future admin forms rather than silently overwriting another editor.
- Soft deletion is a lifecycle update setting isDeleted=true and updatedBy to the actor ID. No delete endpoint exists in this phase. A later confirmed hard-delete service must perform reference checks, remove the associated Cloudinary asset when applicable and append an audit event.
- Password hashing/verification belongs to the authentication phase. passwordHash is required, excluded from normal queries and stripped from User JSON. Credential verification must explicitly select it server-side; never expose that result or password-related data in audit changes.
- Every future admin mutation must append an AuditLog entry with its authenticated actor, ideally in the same MongoDB transaction. There are no admin mutation handlers to wire up in this phase. Schemas do not infer actors or automatically log secret-bearing documents.
- Rich text is stored as HTML. Future write/render boundaries must sanitize HTML and resolve images through active Media records; this phase adds no HTML-rendering surface.
- MongoDB references are not foreign-key constraints. Later mutation services must check target existence and longer hierarchy cycles. Direct self-parent relationships are rejected by these schemas.

## Public queries

The existing public system-content query now uses activeOnly(). The helper adds a database-level AND with isActive=true and isDeleted=false, preserving all existing filters.

```ts
import { Product } from "@/models";
import { publicFilter } from "@/models/content-fields";

const products = await Product.find()
  .activeOnly()
  .populate({ path: "images", match: publicFilter })
  .populate({ path: "primaryImage", match: publicFilter })
  .sort({ sortOrder: 1 })
  .lean();
```

Apply activeOnly to every future public root query, including sitemap queries, and match: publicFilter to all populated content/media references. activeOnly does not automatically filter populated records. Public blog queries additionally need isPublished=true and publishedAt <= now. Do not sort populated image arrays: their stored reference order is intentional. Filter embedded isActive items/social links in MongoDB aggregation projections, not in the frontend.

## Decisions where the brief did not specify a type

- Colour families: White, Black, Grey, Beige, Cream, Brown, Green, Blue, Red, Pink, Yellow, Gold, Multicolour. These are schema tokens; future editable UI labels must be stored in MongoDB.
- Technical measurements: density in kg/m³, water absorption as a percentage by mass, compressive/flexural strengths in MPa. Abrasion resistance is a string to preserve the test method, result and unit.
- Price currency is a three-letter uppercase code; unit is editable text, allowing sq ft, m², piece or other sales units. Prices require nonnegative values with max >= min. A visible price requires a complete range.
- Primary image must also occur in the ordered images array.
- isUpcoming means startDate is strictly in the future. An event already in progress is not upcoming.
- Reading time counts visible HTML prose at 200 words per minute, rounded up with a minimum of one minute. Publishing requires publishedAt; a future date may represent a scheduled post.
- Home items have stable unique keys, optional display fields, Media references and a data map limited to strings, numbers, booleans or string arrays. Each item has isActive and sortOrder.
- businessHours is editable text; inquiry quantity is text so approximate container/project requirements can be recorded.
- SiteSettings uses an immutable unique singletonKey="site". Its unique index must be installed before writes. Soft-deleting settings does not allow a second settings document; restore the existing record.

## Database setup

The .env file was found, but the connection preflight rejected NEXTAUTH_SECRET and NEXT_PUBLIC_WHATSAPP_NUMBER. The secret needs at least 32 characters; the WhatsApp number needs 8–15 digits including country code, without a plus sign or spaces. Values were not printed or changed.

After correcting the environment locally:

```powershell
npm run db:check
npm run db:indexes
npm run seed:categories
```

The category seed inserts Marble, Granite, Onyx, Travertine, Limestone, Quartz, Quartzite, Sandstone, Slate and Porcelain. It preserves existing records, including disabled/deleted records, and is safe to rerun. It uses null bootstrap audit actors and does not create an administrator or invent a password. Initial category copy is seed data stored in MongoDB, never imported by UI components.

db:indexes uses createIndexes, not syncIndexes, and never drops existing indexes. Uniqueness is enforced by MongoDB indexes, not by Mongoose validation alone. Existing duplicate keys must be resolved before index creation can succeed.

If the old Phase 0 seed was already run, execute npm run db:migrate-foundation once. It converts only the exact legacy "system:foundation-seed" actor marker to null; real User references and historical timestamps are preserved. The updated foundation seed already writes ObjectId-compatible null actors.

## Verification before Phase 2

1. Run npm run db:check after fixing the two environment fields.
2. Run db:indexes and verify unique slug/email/cloudinaryPublicId/singleton indexes, the lifecycle compound indexes, category indexes, publishedAt indexes and Product's name/description/tags text index in Atlas.
3. Run seed:categories twice: the first inserts missing materials, the second inserts zero. Verify disabled/deleted existing categories stay unchanged.
4. In a development database, verify duplicate slugs, emails, Cloudinary public IDs and a second SiteSettings document fail with E11000.
5. Verify activeOnly excludes inactive and deleted records; separately verify population hides individual disabled Media documents while retaining the order of the remaining images.
6. Verify blank alt text, invalid SEO lengths, unsafe URLs, inverted price/date ranges and invalid enum values fail.
7. Save a blog post, change its HTML and save again; verify persisted reading time and publication rules. Verify isUpcoming changes when the start time passes without requiring a write.
8. Check null bootstrap actors and migrate legacy foundation actor strings if present.
9. Run npm test, npm run typecheck, npm run lint and npm run build with the real validated environment.

The automated suite uses in-memory documents and issues no database reads/writes. Actual Atlas index creation, seeding, uniqueness enforcement and populated-query integration remain pending a valid environment.

Completed checks: 16 automated tests, TypeScript, ESLint and a Next.js production build with temporary process-local test values. Your .env was not modified, and no database seed or migration was executed.

## References

- [Mongoose 8 schema typing](https://mongoosejs.com/docs/8.x/docs/typescript/schemas.html)
- [Mongoose 8 middleware and operation differences](https://mongoosejs.com/docs/8.x/docs/middleware.html)
````

## README.md

```
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
```

## package.json

```
{
  "name": "stone-catalogue",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --max-warnings=0",
    "typecheck": "tsc --noEmit",
    "test": "node --conditions=react-server --import tsx --test tests/*.test.ts",
    "seed:foundation": "node --conditions=react-server --import tsx scripts/seed-foundation.ts",
    "seed:categories": "node --conditions=react-server --import tsx scripts/seed-categories.ts",
    "db:check": "node --conditions=react-server --import tsx scripts/check-database.ts",
    "db:indexes": "node --conditions=react-server --import tsx scripts/create-indexes.ts",
    "db:migrate-foundation": "node --conditions=react-server --import tsx scripts/migrate-foundation-audit.ts"
  },
  "dependencies": {
    "next": "15.5.25",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "mongoose": "^8.0.0",
    "cloudinary": "^2.0.0",
    "next-auth": "5.0.0-beta.32",
    "zod": "^4.0.0",
    "react-hook-form": "^7.0.0",
    "@hookform/resolvers": "^5.0.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.0.0",
    "server-only": "^0.0.1"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "15.5.25",
    "@eslint/eslintrc": "^3.0.0",
    "tsx": "^4.0.0",
    "@next/env": "15.5.25"
  },
  "overrides": {
    "postcss": "8.5.28"
  },
  "engines": {
    "node": ">=22.0.0 <25"
  }
}
```

## scripts/check-database.ts

```
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());
async function main() {
  const { connectDB } = await import("../src/lib/db");
  const db = await connectDB();
  try {
    await db.connection.db?.admin().ping();
    console.info("Environment validation and database ping passed. No records changed.");
  } finally {
    await db.disconnect();
  }
}
main().catch((error: unknown) => {
  if (error instanceof Error && error.message.startsWith("Invalid or missing environment variables:")) {
    console.error(error.message); // env.ts emits field names only, never their values.
  } else {
    console.error("Database check failed. Verify Atlas network access and database permissions.");
  }
  process.exitCode = 1;
});
```

## scripts/create-indexes.ts

```
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());
async function main() {
  const { connectDB } = await import("../src/lib/db");
  const registry = await import("../src/models");
  const db = await connectDB();
  try {
    // createIndexes adds declared indexes; unlike syncIndexes it never drops existing ones.
    for (const model of Object.values(registry)) {
      await model.createIndexes();
      console.info(`Indexes ready: ${model.modelName}`);
    }
  } finally {
    await db.disconnect();
  }
}
main().catch(() => {
  console.error("Index creation failed. Check duplicate keys and database index permissions.");
  process.exitCode = 1;
});

```

## scripts/export-phase1.mjs

```
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

// Explicit source allowlist: no environment values, private directories or build output.
const roots = ["src/models", "src/types", "src/lib/validation"];
const files = [
  "src/lib/content.ts", "src/lib/env.ts", "src/lib/read-time.ts", "package.json",
  "scripts/check-database.ts", "scripts/create-indexes.ts", "scripts/seed-categories.ts",
  "scripts/seed-foundation.ts", "scripts/migrate-foundation-audit.ts",
  "scripts/export-phase1.mjs", "tests/models.test.ts", "PHASE-1.md", "README.md",
];
async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await collect(file);
    else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) files.push(file.replaceAll("\\", "/"));
  }
}
for (const root of roots) await collect(root);
const sections = ["# Phase 1 — full file output\n\nComplete source for Phase 1 models, types, validation, related changes, tests, scripts and verification notes. Environment values are excluded.\n"];
for (const file of files.sort()) {
  const content = await readFile(file, "utf8");
  const fence = "`".repeat(Math.max(3, ...Array.from(content.matchAll(/`+/g), (match) => match[0].length + 1)));
  sections.push(`## ${file}\n\n${fence}\n${content}${content.endsWith("\n") ? "" : "\n"}${fence}\n`);
}
await writeFile("PHASE-1-FILES.md", sections.join("\n"), "utf8");
console.info(`Exported ${files.length} files to PHASE-1-FILES.md.`);
```

## scripts/migrate-foundation-audit.ts

```
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());
async function main() {
  const { connectDB } = await import("../src/lib/db");
  const { SystemContent } = await import("../src/models/system-content");
  const db = await connectDB();
  try {
    // The raw collection is intentional: the previous schema stored this exact string,
    // which the new ObjectId schema cannot cast. Never rewrite real User references.
    let modified = 0;
    for (const field of ["createdBy", "updatedBy"]) {
      const result = await SystemContent.collection.updateMany(
        { [field]: "system:foundation-seed" },
        { $set: { [field]: null } },
      );
      modified += result.modifiedCount;
    }
    console.info(`Foundation audit migration complete: ${modified} field updates.`);
  } finally {
    await db.disconnect();
  }
}
main().catch(() => {
  console.error("Foundation audit migration failed. Verify database access.");
  process.exitCode = 1;
});
```

## scripts/seed-categories.ts

```
import { loadEnvConfig } from "@next/env";
import { slugify } from "../src/lib/utils";

loadEnvConfig(process.cwd());
const names = ["Marble", "Granite", "Onyx", "Travertine", "Limestone", "Quartz", "Quartzite", "Sandstone", "Slate", "Porcelain"];

async function main() {
  const { connectDB } = await import("../src/lib/db");
  const { Category } = await import("../src/models");
  const db = await connectDB();
  try {
    // Build uniqueness before seeding so simultaneous runs cannot create duplicate slugs.
    await Category.createIndexes();
    let inserted = 0;
    for (const [sortOrder, name] of names.entries()) {
      const slug = slugify(name);
      if (await Category.exists({ slug })) continue; // Preserve inactive/deleted records too.
      try {
        await Category.create({
          name, slug, description: `Explore our ${name.toLowerCase()} collection.`,
          sortOrder, createdBy: null, updatedBy: null,
          seo: { metaTitle: name, metaDescription: `Explore our ${name.toLowerCase()} collection.` },
        });
        inserted++;
      } catch (error: unknown) {
        if (!(typeof error === "object" && error !== null && "code" in error && error.code === 11000)) throw error;
      }
    }
    console.info(`Category seed complete: ${inserted} inserted. Existing records preserved.`);
  } finally {
    await db.disconnect();
  }
}
main().catch(() => {
  console.error("Category seed failed. Verify database connectivity and index permissions.");
  process.exitCode = 1;
});

```

## scripts/seed-foundation.ts

```
import { loadEnvConfig } from "@next/env";
import { z } from "zod";

loadEnvConfig(process.cwd());
async function main() {
const { connectDB } = await import("../src/lib/db");
const { SystemContent } = await import("../src/models/system-content");
const copySchema = z.object({
  key: z.enum(["foundation", "error", "notFound", "loading"]),
  heading: z.string().min(1), body: z.string().min(1), actionLabel: z.string().min(1),
  seoTitle: z.string().min(1), seoDescription: z.string().min(1),
});
// Initial database content, never imported by the UI. Existing copy is never overwritten.
const records = [
  { key: "foundation", heading: "A foundation for natural stone.", body: "Our catalogue is being prepared.", actionLabel: "Continue", seoTitle: "Natural stone catalogue", seoDescription: "A catalogue of natural stone, being prepared for launch." },
  { key: "error", heading: "Something went wrong.", body: "Please try loading this page again.", actionLabel: "Try again", seoTitle: "Page unavailable", seoDescription: "This page is temporarily unavailable." },
  { key: "notFound", heading: "Page not found.", body: "The page you requested is unavailable.", actionLabel: "Return home", seoTitle: "Page not found", seoDescription: "The requested page could not be found." },
  { key: "loading", heading: "Loading.", body: "Please wait while this page is prepared.", actionLabel: "Continue", seoTitle: "Loading", seoDescription: "This page is loading." },
];
const db = await connectDB();
try {
  for (const [sortOrder, record] of records.entries()) {
    const copy = copySchema.parse(record);
    if (await SystemContent.exists({ key: copy.key })) continue;
    await SystemContent.create({
      ...copy, sortOrder, isActive: true, isDeleted: false,
      createdBy: null, updatedBy: null,
    });
  }
  await SystemContent.createIndexes();
  console.info("Foundation content seeded.");
} finally {
  await db.disconnect();
}
}
main().catch(() => {
  console.error("Foundation seed failed. Verify environment and database connectivity.");
  process.exitCode = 1;
});
```

## src/lib/content.ts

```
import "server-only";
import { cache } from "react";
import { connectDB } from "@/lib/db";
import { SystemContent } from "@/models/system-content";
import type { SystemCopy, ScreenKey } from "@/types/content";

export const getSystemCopy = cache(async (): Promise<SystemCopy> => {
  try {
    await connectDB();
    const records = await SystemContent.find().activeOnly().sort({ sortOrder: 1 }).lean().exec();
    return Object.fromEntries(records.map((record) => [record.key as ScreenKey, {
      heading: record.heading, body: record.body, actionLabel: record.actionLabel,
      seoTitle: record.seoTitle, seoDescription: record.seoDescription,
    }]));
  } catch {
    console.error("System content unavailable.");
    // No hardcoded substitute copy; a database outage renders a silent shell.
    return {};
  }
});
```

## src/lib/env.ts

```
import { z } from "zod";

// This module is also imported by next.config.ts: invalid builds fail before compilation.
// Never import it from a Client Component or log the input environment.
const httpUrl = z.url().refine((value) => {
  if (!URL.canParse(value)) return false;
  const url = new URL(value);
  return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password;
}, "Must be an HTTP(S) URL without credentials");
export const envSchema = z.object({
  MONGODB_URI: z.string().regex(/^mongodb(?:\+srv)?:\/\/\S+$/),
  CLOUDINARY_CLOUD_NAME: z.string().regex(/^[a-zA-Z0-9_-]+$/),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: httpUrl,
  NEXT_PUBLIC_SITE_URL: httpUrl,
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().regex(/^[1-9]\d{7,14}$/),
});
const result = envSchema.safeParse(process.env);
if (!result.success) {
  const fields = [...new Set(result.error.issues.map((issue) => issue.path.join(".")))];
  throw new Error(`Invalid or missing environment variables: ${fields.join(", ")}. See .env.example.`);
}
export const env = Object.freeze(result.data);
```

## src/lib/read-time.ts

```
/** Estimate visible HTML prose at 200 words/minute without counting markup/scripts. */
export function calculateReadTime(html: string): number {
  const prose = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/<[^>]*>/g, " ").replace(/&(?:#\d+|#x[\da-f]+|\w+);/gi, " ");
  const words = prose.trim().split(/\s+/u).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
```

## src/lib/validation/audit-log.ts

```
import { z } from "zod";
import { AUDIT_ACTIONS } from "@/types/enums";
import { objectId, text } from "@/lib/validation/common";
export const auditLogValidation = z.object({
  user: objectId, action: z.enum(AUDIT_ACTIONS), collectionName: text,
  documentId: objectId.nullable().optional(),
  changes: z.record(z.string(), z.unknown()),
  ipAddress: z.union([z.ipv4(), z.ipv6()]).optional(),
  createdAt: z.date().optional(),
});
```

## src/lib/validation/blog-post.ts

```
import { z } from "zod";
import * as E from "@/types/enums";
import { baseValidation, text, optionalText, objectId, slug, seoValidation } from "@/lib/validation/common";

export const blogPostValidation = baseValidation.extend({
  title: text,
  slug: slug,
  excerpt: optionalText,
  content: text,
  coverImage: objectId.nullable().optional(),
  author: objectId,
  category: z.enum(E.BLOG_CATEGORIES),
  tags: z.array(text),
  readTimeMinutes: z.number().int().min(1),
  publishedAt: z.date().optional(),
  isPublished: z.boolean(),
  viewCount: z.number().int().nonnegative(),
  seo: seoValidation,
}).refine((value) => !value.isPublished || Boolean(value.publishedAt), { path: ["publishedAt"], message: "Published posts require a publication date." });

```

## src/lib/validation/category.ts

```
import { z } from "zod";
import { baseValidation, text, optionalText, objectId, slug, seoValidation } from "@/lib/validation/common";

export const categoryValidation = baseValidation.extend({
  name: text,
  slug: slug,
  description: text,
  shortDescription: optionalText,
  parentCategory: objectId.nullable().optional(),
  coverImage: objectId.nullable().optional(),
  iconKey: optionalText,
  seo: seoValidation,
  isFeatured: z.boolean(),
  showInMenu: z.boolean(),
  showOnHomepage: z.boolean(),
});

```

## src/lib/validation/common.ts

```
import { z } from "zod";
import type { Types } from "mongoose";

// Accept hydrated ObjectIds here. Form DTOs must explicitly parse ID strings.
export const objectId = z.custom<Types.ObjectId>((value) =>
  typeof value === "object" && value !== null && "toHexString" in value &&
  typeof value.toHexString === "function" && /^[a-f\d]{24}$/i.test(value.toHexString()),
  "Expected an ObjectId",
);
export const text = z.string().trim().min(1);
export const optionalText = z.string().trim().optional();
export const httpUrl = z.url().refine((value) => {
  if (!URL.canParse(value)) return false;
  const url = new URL(value);
  return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password;
}, "Expected an HTTP(S) URL without credentials");
export const linkUrl = z.string().refine((value) => {
  if (/[\s\\\u0000-\u001f]/.test(value)) return false;
  if (/^\/(?!\/)/.test(value) || /^#[\w-]+$/.test(value)) return true;
  if (/^mailto:[^@]+@[^@]+\.[^@]+$/.test(value) || /^tel:\+?[\d()-]+$/.test(value)) return true;
  return httpUrl.safeParse(value).success;
}, "Expected a safe internal, HTTP(S), mailto or tel link");
export const slug = text.regex(/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u);
export const baseValidation = z.object({
  isActive: z.boolean(), isDeleted: z.boolean(), sortOrder: z.number().int(),
  createdBy: objectId.nullable(), updatedBy: objectId.nullable(),
  createdAt: z.date().optional(), updatedAt: z.date().optional(),
});
export const seoValidation = z.object({
  metaTitle: z.string().trim().max(60).optional(),
  metaDescription: z.string().trim().max(160).optional(),
  keywords: z.array(text),
  ogImage: objectId.nullable().optional(),
  canonicalUrl: httpUrl.optional(),
  noIndex: z.boolean(),
});
```

## src/lib/validation/exhibition.ts

```
import { z } from "zod";
import { baseValidation, text, objectId, slug, seoValidation } from "@/lib/validation/common";

export const exhibitionValidation = baseValidation.extend({
  name: text,
  slug: slug,
  venue: text,
  city: text,
  country: text,
  startDate: z.date(),
  endDate: z.date(),
  description: text,
  coverImage: objectId.nullable().optional(),
  gallery: z.array(objectId),
  seo: seoValidation,
}).refine((value) => value.endDate >= value.startDate, { path: ["endDate"], message: "End date must be on or after start date." });

```

## src/lib/validation/faq.ts

```
import { z } from "zod";
import * as E from "@/types/enums";
import { baseValidation, text } from "@/lib/validation/common";

export const faqValidation = baseValidation.extend({
  question: text,
  answer: text,
  category: z.enum(E.FAQ_CATEGORIES),
});

```

## src/lib/validation/home-section.ts

```
import { z } from "zod";
import * as E from "@/types/enums";
import { baseValidation, optionalText, objectId, linkUrl } from "@/lib/validation/common";
import { homeItemValidation } from "@/lib/validation/subdocuments";

export const homeSectionValidation = baseValidation.extend({
  sectionKey: z.enum(E.HOME_SECTION_KEYS),
  heading: optionalText,
  subheading: optionalText,
  eyebrowLabel: optionalText,
  bodyText: optionalText,
  ctaLabel: optionalText,
  ctaUrl: linkUrl.optional(),
  backgroundImage: objectId.nullable().optional(),
  items: z.array(homeItemValidation).refine((items) => new Set(items.map((item) => item.key)).size === items.length, {
    message: "Homepage item keys must be unique within the section.",
  }),
});
```

## src/lib/validation/inquiry.ts

```
import { z } from "zod";
import * as E from "@/types/enums";
import { baseValidation, text, optionalText, objectId, httpUrl } from "@/lib/validation/common";

export const inquiryValidation = baseValidation.extend({
  name: text,
  email: z.email(),
  phone: optionalText,
  country: optionalText,
  company: optionalText,
  inquiryType: z.enum(E.INQUIRY_TYPES),
  productInterest: z.array(objectId),
  quantity: optionalText,
  unit: optionalText,
  message: text,
  source: z.enum(E.INQUIRY_SOURCES),
  pageUrl: httpUrl.optional(),
  ipAddress: z.union([z.ipv4(), z.ipv6()]).optional(),
  userAgent: z.string().max(2048).optional(),
  status: z.enum(E.INQUIRY_STATUSES),
  adminNotes: optionalText,
  assignedTo: objectId.nullable().optional(),
  isRead: z.boolean(),
});

```

## src/lib/validation/media.ts

```
import { z } from "zod";
import * as E from "@/types/enums";
import { baseValidation, text, optionalText, objectId, httpUrl } from "@/lib/validation/common";

export const mediaValidation = baseValidation.extend({
  cloudinaryPublicId: text,
  secureUrl: httpUrl.refine((value) => {
    if (!URL.canParse(value)) return false;
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "res.cloudinary.com" && url.pathname.includes("/image/upload/");
  }, "Expected a Cloudinary HTTPS image upload URL"),
  format: text,
  width: z.number().int().min(1),
  height: z.number().int().min(1),
  bytes: z.number().int().min(1),
  altText: text,
  caption: optionalText,
  title: optionalText,
  folder: optionalText,
  tags: z.array(text),
  usageContext: z.enum(E.MEDIA_CONTEXTS),
  blurDataUrl: z.string().max(16384).regex(/^data:image\/(?:png|jpeg|webp|avif);base64,[a-zA-Z0-9+/]+=*$/).optional(),
  uploadedBy: objectId,
});
```

## src/lib/validation/navigation-item.ts

```
import { z } from "zod";
import * as E from "@/types/enums";
import { baseValidation, text, objectId, linkUrl } from "@/lib/validation/common";

export const navigationItemValidation = baseValidation.extend({
  label: text,
  url: linkUrl,
  parentItem: objectId.nullable().optional(),
  openInNewTab: z.boolean(),
  location: z.enum(E.NAV_LOCATIONS),
});

```

## src/lib/validation/product.ts

```
import { z } from "zod";
import * as E from "@/types/enums";
import { baseValidation, text, optionalText, objectId, slug, seoValidation } from "@/lib/validation/common";
import { priceRangeValidation, technicalSpecsValidation } from "@/lib/validation/subdocuments";

export const productValidation = baseValidation.extend({
  name: text,
  slug: slug,
  category: objectId,
  description: text,
  origin: optionalText,
  colourFamily: z.enum(E.COLOUR_FAMILIES),
  finishes: z.array(z.enum(E.FINISHES)),
  availableFormats: z.array(z.enum(E.PRODUCT_FORMATS)),
  thicknessOptions: z.array(text),
  sizeOptions: z.array(text),
  applications: z.array(z.enum(E.APPLICATIONS)),
  technicalSpecs: technicalSpecsValidation.optional(),
  priceRange: priceRangeValidation.optional(),
  isPriceVisible: z.boolean(),
  images: z.array(objectId),
  primaryImage: objectId.nullable().optional(),
  tags: z.array(text),
  isFeatured: z.boolean(),
  isExportAvailable: z.boolean(),
  stockStatus: z.enum(E.STOCK_STATUSES),
  seo: seoValidation,
}).superRefine((value, ctx) => {
  if (value.isPriceVisible && !value.priceRange) ctx.addIssue({ code: "custom", path: ["priceRange"], message: "Visible prices require a price range." });
  if (value.primaryImage && !value.images.some((id) => id.equals(value.primaryImage))) ctx.addIssue({ code: "custom", path: ["primaryImage"], message: "Primary image must appear in the ordered image list." });
});

```

## src/lib/validation/project.ts

```
import { z } from "zod";
import * as E from "@/types/enums";
import { baseValidation, text, optionalText, objectId, slug, seoValidation } from "@/lib/validation/common";

export const projectValidation = baseValidation.extend({
  title: text,
  slug: slug,
  client: optionalText,
  location: text,
  country: text,
  projectType: z.enum(E.PROJECT_TYPES),
  year: z.number().int().min(1000).max(9999),
  description: text,
  materialsUsed: z.array(objectId),
  finishesUsed: z.array(text),
  coverImage: objectId.nullable().optional(),
  gallery: z.array(objectId),
  isFeatured: z.boolean(),
  seo: seoValidation,
});

```

## src/lib/validation/site-settings.ts

```
import { z } from "zod";
import { baseValidation, text, optionalText, objectId, seoValidation } from "@/lib/validation/common";
import { addressValidation, socialLinkValidation, announcementValidation } from "@/lib/validation/subdocuments";

export const siteSettingsValidation = baseValidation.extend({
  singletonKey: z.literal("site"),
  siteName: text,
  tagline: optionalText,
  logo: objectId.nullable().optional(),
  logoLight: objectId.nullable().optional(),
  favicon: objectId.nullable().optional(),
  phone: z.array(text),
  whatsappNumber: z.string().regex(/^[1-9]\d{7,14}$/).optional(),
  email: z.array(z.email()),
  addresses: z.array(addressValidation),
  businessHours: optionalText,
  socialLinks: z.array(socialLinkValidation),
  defaultSeo: seoValidation,
  googleAnalyticsId: z.string().regex(/^G-[A-Z0-9]+$/).optional(),
  googleTagManagerId: z.string().regex(/^GTM-[A-Z0-9]+$/).optional(),
  facebookPixelId: z.string().regex(/^\d+$/).optional(),
  whatsappDefaultMessage: optionalText,
  maintenanceMode: z.boolean(),
  announcementBar: announcementValidation,
});

```

## src/lib/validation/subdocuments.ts

```
import { z } from "zod";
import { text, optionalText, objectId, httpUrl, linkUrl } from "@/lib/validation/common";

// Density: kg/m³; absorption: % by mass; strengths: MPa.
// Abrasion varies by test method, so retain the reported value and unit together.
export const technicalSpecsValidation = z.object({
  density: z.number().positive().optional(),
  waterAbsorption: z.number().min(0).max(100).optional(),
  compressiveStrength: z.number().nonnegative().optional(),
  flexuralStrength: z.number().nonnegative().optional(),
  abrasionResistance: optionalText,
});
export const priceRangeValidation = z.object({
  min: z.number().nonnegative(),
  max: z.number().nonnegative(),
  currency: z.string().regex(/^[A-Z]{3}$/),
  unit: text,
}).refine((price) => price.max >= price.min, {
  path: ["max"], message: "Maximum price must be at least the minimum price.",
});
export const homeItemValidation = z.object({
  key: text, title: optionalText, body: optionalText, value: optionalText, iconKey: optionalText,
  image: objectId.nullable().optional(), ctaLabel: optionalText, ctaUrl: linkUrl.optional(),
  data: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])),
  isActive: z.boolean(), sortOrder: z.number().int(),
});
export const addressValidation = z.object({
  label: text, line1: text, city: text, country: text,
  mapUrl: httpUrl.optional(), latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
}).refine((address) => (address.latitude === undefined) === (address.longitude === undefined), {
  path: ["longitude"], message: "Provide both coordinates or neither.",
});
export const socialLinkValidation = z.object({ platform: text, url: httpUrl, isActive: z.boolean() });
export const announcementValidation = z.object({
  text: optionalText, url: linkUrl.optional(), isActive: z.boolean(),
}).refine((bar) => !bar.isActive || Boolean(bar.text), {
  path: ["text"], message: "Active announcements require text.",
});
```

## src/lib/validation/system-content.ts

```
import { z } from "zod";
import { baseValidation, text } from "@/lib/validation/common";
export const systemContentValidation = baseValidation.extend({
  key: z.enum(["foundation", "error", "notFound", "loading"]),
  heading: text, body: text, actionLabel: text,
  seoTitle: text.max(60), seoDescription: text.max(160),
});

```

## src/lib/validation/testimonial.ts

```
import { z } from "zod";
import { baseValidation, text, optionalText, objectId } from "@/lib/validation/common";

export const testimonialValidation = baseValidation.extend({
  clientName: text,
  clientTitle: optionalText,
  company: optionalText,
  city: optionalText,
  country: optionalText,
  rating: z.number().int().min(1).max(5),
  message: text,
  clientPhoto: objectId.nullable().optional(),
  projectRef: objectId.nullable().optional(),
  isFeatured: z.boolean(),
});

```

## src/lib/validation/user.ts

```
import { z } from "zod";
import * as E from "@/types/enums";
import { baseValidation, text } from "@/lib/validation/common";

export const userValidation = baseValidation.extend({
  name: text,
  email: z.email(),
  passwordHash: text,
  role: z.enum(E.USER_ROLES),
  lastLoginAt: z.date().optional(),
});

```

## src/models/audit-log.ts

```
import "server-only";
import { Schema, model, models, type Model } from "mongoose";
import type { IAuditLog } from "@/types/audit-log";
import { AUDIT_ACTIONS } from "@/types/enums";
import { auditLogValidation } from "@/lib/validation/audit-log";

const schema = new Schema<IAuditLog>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, immutable: true },
  action: { type: String, enum: AUDIT_ACTIONS, required: true, immutable: true },
  collectionName: { type: String, trim: true, required: true, immutable: true },
  documentId: { type: Schema.Types.ObjectId, immutable: true },
  changes: { type: Schema.Types.Mixed, default: () => ({}), immutable: true },
  ipAddress: { type: String, immutable: true, select: false },
}, { timestamps: { createdAt: true, updatedAt: false }, strict: "throw" });
schema.index({ createdAt: -1 });
schema.index({ collectionName: 1, documentId: 1, createdAt: -1 });
schema.index({ user: 1, createdAt: -1 });
schema.pre("validate", function () {
  const result = auditLogValidation.safeParse(this.toObject({ depopulate: true }));
  if (!result.success) for (const issue of result.error.issues) this.invalidate(issue.path.join("."), issue.message);
});
schema.pre("save", function () {
  if (!this.isNew) throw new Error("Audit logs are append-only.");
});
schema.pre(["updateOne", "updateMany", "findOneAndUpdate", "replaceOne", "findOneAndReplace", "deleteOne", "deleteMany", "findOneAndDelete"], function () {
  throw new Error("Audit logs are append-only.");
});
schema.pre("deleteOne", { document: true, query: false }, function () {
  throw new Error("Audit logs are append-only.");
});
schema.pre("bulkWrite", function () {
  throw new Error("Use create() to append audit events.");
});
export const AuditLog = (models.AuditLog as Model<IAuditLog> | undefined) ?? model<IAuditLog>("AuditLog", schema);
```

## src/models/blog-post.ts

```
import "server-only";
import { Schema, model, models } from "mongoose";
import * as E from "@/types/enums";
import type { IBlogPost } from "@/types/blog-post";
import { createContentSchema, addZodValidation, type ContentModel } from "@/models/shared";
import { blogPostValidation } from "@/lib/validation/blog-post";
import { seoSchema } from "@/models/seo";
import { calculateReadTime } from "@/lib/read-time";

const schema = createContentSchema<IBlogPost>();
schema.add({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
  excerpt: { type: String, trim: true },
  content: { type: String, required: true, trim: true },
  coverImage: { type: Schema.Types.ObjectId, ref: "Media" },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, enum: E.BLOG_CATEGORIES, required: true },
  tags: { type: [String], default: [] },
  readTimeMinutes: { type: Number, min: 1, default: 1, required: true },
  publishedAt: { type: Date },
  isPublished: { type: Boolean, default: false, required: true },
  viewCount: { type: Number, default: 0, min: 0, required: true },
  seo: { type: seoSchema, default: () => ({}) },
});
// Compute before validation as well as save, including insertMany validation.
schema.pre("validate", function () {
  if (this.isNew || this.isSelected("content")) this.readTimeMinutes = calculateReadTime(this.content ?? "");
});
schema.pre("save", function () {
  if (this.isNew || this.isSelected("content")) this.readTimeMinutes = calculateReadTime(this.content ?? "");
});
addZodValidation(schema, blogPostValidation);
schema.index({ category: 1 });
schema.index({ publishedAt: -1 });
schema.index({ isActive: 1, isDeleted: 1, isPublished: 1, publishedAt: -1 });
export const BlogPost = (models.BlogPost as ContentModel<IBlogPost> | undefined)
  ?? model<IBlogPost, ContentModel<IBlogPost>>("BlogPost", schema);
```

## src/models/category.ts

```
import "server-only";
import { Schema, model, models } from "mongoose";
import type { ICategory } from "@/types/category";
import { createContentSchema, addZodValidation, type ContentModel } from "@/models/shared";
import { categoryValidation } from "@/lib/validation/category";
import { seoSchema } from "@/models/seo";

const schema = createContentSchema<ICategory>();
schema.add({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
  description: { type: String, required: true, trim: true },
  shortDescription: { type: String, trim: true },
  parentCategory: { type: Schema.Types.ObjectId, ref: "Category" },
  coverImage: { type: Schema.Types.ObjectId, ref: "Media" },
  iconKey: { type: String, trim: true },
  seo: { type: seoSchema, default: () => ({}) },
  isFeatured: { type: Boolean, default: false, required: true },
  showInMenu: { type: Boolean, default: true, required: true },
  showOnHomepage: { type: Boolean, default: false, required: true },
});

addZodValidation(schema, categoryValidation);
schema.index({ parentCategory: 1 });
schema.pre("validate", function () {
  if (this.parentCategory?.equals(this._id)) this.invalidate("parentCategory", "A category cannot be its own parent.");
});
export const Category = (models.Category as ContentModel<ICategory> | undefined)
  ?? model<ICategory, ContentModel<ICategory>>("Category", schema);

```

## src/models/content-fields.ts

```
import { Schema } from "mongoose";

export const contentFields = {
  isActive: { type: Boolean, default: true, required: true, index: true },
  isDeleted: { type: Boolean, default: false, required: true, index: true },
  sortOrder: { type: Number, default: 0, required: true, index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
} as const;
// Include these fields and { timestamps: true } in every content schema.
// Actor IDs come from the authenticated session, never a submitted form.
export const publicFilter = { isActive: true, isDeleted: false } as const;
```

## src/models/exhibition.ts

```
import "server-only";
import { Schema, model, models } from "mongoose";
import type { IExhibition } from "@/types/exhibition";
import { createContentSchema, addZodValidation, type ContentModel } from "@/models/shared";
import { exhibitionValidation } from "@/lib/validation/exhibition";
import { seoSchema } from "@/models/seo";

const schema = createContentSchema<IExhibition>();
schema.add({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
  venue: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  description: { type: String, required: true, trim: true },
  coverImage: { type: Schema.Types.ObjectId, ref: "Media" },
  gallery: { type: [Schema.Types.ObjectId], ref: "Media", default: [] },
  seo: { type: seoSchema, default: () => ({}) },
});

addZodValidation(schema, exhibitionValidation);
schema.index({ startDate: 1, endDate: 1 });
schema.virtual("isUpcoming").get(function () {
  return this.startDate instanceof Date && this.startDate.getTime() > Date.now();
});
export const Exhibition = (models.Exhibition as ContentModel<IExhibition> | undefined)
  ?? model<IExhibition, ContentModel<IExhibition>>("Exhibition", schema);

```

## src/models/faq.ts

```
import "server-only";
import { model, models } from "mongoose";
import * as E from "@/types/enums";
import type { IFaq } from "@/types/faq";
import { createContentSchema, addZodValidation, type ContentModel } from "@/models/shared";
import { faqValidation } from "@/lib/validation/faq";

const schema = createContentSchema<IFaq>();
schema.add({
  question: { type: String, required: true, trim: true },
  answer: { type: String, required: true, trim: true },
  category: { type: String, enum: E.FAQ_CATEGORIES, required: true, default: "General" },
});

addZodValidation(schema, faqValidation);
schema.index({ category: 1 });
export const Faq = (models.Faq as ContentModel<IFaq> | undefined)
  ?? model<IFaq, ContentModel<IFaq>>("Faq", schema);

```

## src/models/home-section.ts

```
import "server-only";
import { Schema, model, models } from "mongoose";
import * as E from "@/types/enums";
import type { IHomeSection } from "@/types/home-section";
import { createContentSchema, addZodValidation, type ContentModel } from "@/models/shared";
import { homeSectionValidation } from "@/lib/validation/home-section";
import { homeItemSchema } from "@/models/subdocuments";

const schema = createContentSchema<IHomeSection>();
schema.add({
  sectionKey: { type: String, enum: E.HOME_SECTION_KEYS, unique: true, required: true },
  heading: { type: String, trim: true },
  subheading: { type: String, trim: true },
  eyebrowLabel: { type: String, trim: true },
  bodyText: { type: String, trim: true },
  ctaLabel: { type: String, trim: true },
  ctaUrl: { type: String, trim: true },
  backgroundImage: { type: Schema.Types.ObjectId, ref: "Media" },
  items: { type: [homeItemSchema], default: [] },
});

addZodValidation(schema, homeSectionValidation);

export const HomeSection = (models.HomeSection as ContentModel<IHomeSection> | undefined)
  ?? model<IHomeSection, ContentModel<IHomeSection>>("HomeSection", schema);

```

## src/models/index.ts

```
export { User } from "./user";
export { Media } from "./media";
export { Category } from "./category";
export { Product } from "./product";
export { Project } from "./project";
export { Exhibition } from "./exhibition";
export { BlogPost } from "./blog-post";
export { Testimonial } from "./testimonial";
export { Faq } from "./faq";
export { HomeSection } from "./home-section";
export { SiteSettings } from "./site-settings";
export { NavigationItem } from "./navigation-item";
export { Inquiry } from "./inquiry";
export { AuditLog } from "./audit-log";
export { SystemContent } from "./system-content";

```

## src/models/inquiry.ts

```
import "server-only";
import { Schema, model, models } from "mongoose";
import * as E from "@/types/enums";
import type { IInquiry } from "@/types/inquiry";
import { createContentSchema, addZodValidation, type ContentModel } from "@/models/shared";
import { inquiryValidation } from "@/lib/validation/inquiry";

const schema = createContentSchema<IInquiry>();
schema.add({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  country: { type: String, trim: true },
  company: { type: String, trim: true },
  inquiryType: { type: String, enum: E.INQUIRY_TYPES, required: true },
  productInterest: { type: [Schema.Types.ObjectId], ref: "Product", default: [] },
  quantity: { type: String, trim: true },
  unit: { type: String, trim: true },
  message: { type: String, required: true, trim: true },
  source: { type: String, enum: E.INQUIRY_SOURCES, required: true },
  pageUrl: { type: String, trim: true },
  ipAddress: { type: String, select: false },
  userAgent: { type: String, select: false },
  status: { type: String, enum: E.INQUIRY_STATUSES, required: true, default: "New" },
  adminNotes: { type: String, select: false },
  assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
  isRead: { type: Boolean, default: false, required: true },
});

addZodValidation(schema, inquiryValidation);
schema.index({ status: 1, createdAt: -1 });
schema.index({ assignedTo: 1, isRead: 1 });
export const Inquiry = (models.Inquiry as ContentModel<IInquiry> | undefined)
  ?? model<IInquiry, ContentModel<IInquiry>>("Inquiry", schema);

```

## src/models/media.ts

```
import "server-only";
import { Schema, model, models } from "mongoose";
import * as E from "@/types/enums";
import type { IMedia } from "@/types/media";
import { createContentSchema, addZodValidation, type ContentModel } from "@/models/shared";
import { mediaValidation } from "@/lib/validation/media";

const schema = createContentSchema<IMedia>();
schema.add({
  cloudinaryPublicId: { type: String, required: true, trim: true, unique: true },
  secureUrl: { type: String, required: true, trim: true },
  format: { type: String, required: true, trim: true },
  width: { type: Number, min: 1, required: true },
  height: { type: Number, min: 1, required: true },
  bytes: { type: Number, min: 1, required: true },
  altText: { type: String, required: true, trim: true },
  caption: { type: String, trim: true },
  title: { type: String, trim: true },
  folder: { type: String, trim: true },
  tags: { type: [String], default: [] },
  usageContext: { type: String, enum: E.MEDIA_CONTEXTS, required: true, default: "other" },
  blurDataUrl: { type: String },
  uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

addZodValidation(schema, mediaValidation);

export const Media = (models.Media as ContentModel<IMedia> | undefined)
  ?? model<IMedia, ContentModel<IMedia>>("Media", schema);

```

## src/models/navigation-item.ts

```
import "server-only";
import { Schema, model, models } from "mongoose";
import * as E from "@/types/enums";
import type { INavigationItem } from "@/types/navigation-item";
import { createContentSchema, addZodValidation, type ContentModel } from "@/models/shared";
import { navigationItemValidation } from "@/lib/validation/navigation-item";

const schema = createContentSchema<INavigationItem>();
schema.add({
  label: { type: String, required: true, trim: true },
  url: { type: String, required: true, trim: true },
  parentItem: { type: Schema.Types.ObjectId, ref: "NavigationItem" },
  openInNewTab: { type: Boolean, default: false, required: true },
  location: { type: String, enum: E.NAV_LOCATIONS, required: true },
});

addZodValidation(schema, navigationItemValidation);
schema.index({ location: 1, isActive: 1, isDeleted: 1, sortOrder: 1 });
schema.index({ parentItem: 1 });
schema.pre("validate", function () {
  if (this.parentItem?.equals(this._id)) this.invalidate("parentItem", "A navigation item cannot be its own parent.");
});
export const NavigationItem = (models.NavigationItem as ContentModel<INavigationItem> | undefined)
  ?? model<INavigationItem, ContentModel<INavigationItem>>("NavigationItem", schema);

```

## src/models/product.ts

```
import "server-only";
import { Schema, model, models } from "mongoose";
import * as E from "@/types/enums";
import type { IProduct } from "@/types/product";
import { createContentSchema, addZodValidation, type ContentModel } from "@/models/shared";
import { productValidation } from "@/lib/validation/product";
import { seoSchema } from "@/models/seo";
import { priceRangeSchema, technicalSpecsSchema } from "@/models/subdocuments";

const schema = createContentSchema<IProduct>();
schema.add({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  description: { type: String, required: true, trim: true },
  origin: { type: String, trim: true },
  colourFamily: { type: String, enum: E.COLOUR_FAMILIES, required: true },
  finishes: { type: [String], enum: E.FINISHES, default: [] },
  availableFormats: { type: [String], enum: E.PRODUCT_FORMATS, default: [] },
  thicknessOptions: { type: [String], default: [] },
  sizeOptions: { type: [String], default: [] },
  applications: { type: [String], enum: E.APPLICATIONS, default: [] },
  technicalSpecs: { type: technicalSpecsSchema },
  priceRange: { type: priceRangeSchema },
  isPriceVisible: { type: Boolean, default: false, required: true },
  images: { type: [Schema.Types.ObjectId], ref: "Media", default: [] },
  primaryImage: { type: Schema.Types.ObjectId, ref: "Media" },
  tags: { type: [String], default: [] },
  isFeatured: { type: Boolean, default: false, required: true },
  isExportAvailable: { type: Boolean, default: false, required: true },
  stockStatus: { type: String, enum: E.STOCK_STATUSES, required: true, default: "Made to Order" },
  seo: { type: seoSchema, default: () => ({}) },
});

addZodValidation(schema, productValidation);
schema.index({ category: 1, isActive: 1, isDeleted: 1, sortOrder: 1 });
schema.index({ name: "text", description: "text", tags: "text" }, { weights: { name: 10, tags: 5, description: 1 }, name: "product_search" });
export const Product = (models.Product as ContentModel<IProduct> | undefined)
  ?? model<IProduct, ContentModel<IProduct>>("Product", schema);

```

## src/models/project.ts

```
import "server-only";
import { Schema, model, models } from "mongoose";
import * as E from "@/types/enums";
import type { IProject } from "@/types/project";
import { createContentSchema, addZodValidation, type ContentModel } from "@/models/shared";
import { projectValidation } from "@/lib/validation/project";
import { seoSchema } from "@/models/seo";

const schema = createContentSchema<IProject>();
schema.add({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
  client: { type: String, trim: true },
  location: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  projectType: { type: String, enum: E.PROJECT_TYPES, required: true },
  year: { type: Number, required: true, min: 1000, max: 9999 },
  description: { type: String, required: true, trim: true },
  materialsUsed: { type: [Schema.Types.ObjectId], ref: "Product", default: [] },
  finishesUsed: { type: [String], default: [] },
  coverImage: { type: Schema.Types.ObjectId, ref: "Media" },
  gallery: { type: [Schema.Types.ObjectId], ref: "Media", default: [] },
  isFeatured: { type: Boolean, default: false, required: true },
  seo: { type: seoSchema, default: () => ({}) },
});

addZodValidation(schema, projectValidation);

export const Project = (models.Project as ContentModel<IProject> | undefined)
  ?? model<IProject, ContentModel<IProject>>("Project", schema);

```

## src/models/seo.ts

```
import { Schema } from "mongoose";
import type { ISeo } from "@/types/base";
export const seoSchema = new Schema<ISeo>({
  metaTitle: { type: String, trim: true, maxlength: 60 },
  metaDescription: { type: String, trim: true, maxlength: 160 },
  keywords: { type: [String], default: [] },
  ogImage: { type: Schema.Types.ObjectId, ref: "Media" },
  canonicalUrl: { type: String, trim: true },
  noIndex: { type: Boolean, default: false, required: true },
}, { _id: false, strict: "throw" });

```

## src/models/shared.ts

```
import "server-only";
import { Schema, type Model, type QueryWithHelpers } from "mongoose";
import { z } from "zod";
import type { IBaseContent } from "@/types/base";
import { contentFields, publicFilter } from "@/models/content-fields";

export interface ActiveQueryHelpers<T> {
  activeOnly<Result, Doc, Raw, Op extends string, Overrides>(
    this: QueryWithHelpers<Result, Doc, ActiveQueryHelpers<T>, Raw, Op, Overrides>,
  ): QueryWithHelpers<Result, Doc, ActiveQueryHelpers<T>, Raw, Op, Overrides>;
}
export type ContentModel<T> = Model<T, ActiveQueryHelpers<T>>;
export type ContentSchema<T> = Schema<T, ContentModel<T>, object, ActiveQueryHelpers<T>>;

export function createContentSchema<T extends IBaseContent>(): ContentSchema<T> {
  const schema = new Schema<T, ContentModel<T>, object, ActiveQueryHelpers<T>>({}, {
    timestamps: true, strict: "throw", optimisticConcurrency: true,
    toJSON: { virtuals: true }, toObject: { virtuals: true },
  });
  schema.add(new Schema(contentFields));
  schema.index({ isActive: 1, isDeleted: 1, sortOrder: 1 });
  schema.query.activeOnly = function () {
    // AND preserves existing caller constraints, including contradictory filters.
    return this.and([publicFilter]);
  };
  // Raw bulk writes bypass document middleware and cross-field validation.
  schema.pre("bulkWrite", function () {
    throw new Error("Use validated create/save operations or lifecycle query updates.");
  });
  return schema;
}
export function addZodValidation<T>(schema: ContentSchema<T>, validation: z.ZodType): void {
  // Mirror field-level Zod checks into Mongoose's validation paths.
  // This also supports validateSync() for field constraints.
  if (validation instanceof z.ZodObject) {
    const shape = validation.shape as Record<string, z.ZodType>;
    for (const [path, validator] of Object.entries(shape)) {
      schema.path(path)?.validate({
        validator: (value: unknown) => validator.safeParse(value).success,
        message: `Invalid ${path}.`,
      });
    }
  }
  schema.pre("validate", function () {
    const result = validation.safeParse(this.toObject({ virtuals: false, depopulate: true }));
    if (!result.success) {
      for (const issue of result.error.issues) {
        const rootPath = String(issue.path[0] ?? "_id");
        if (!this.isNew && !this.isSelected(rootPath)) continue;
        this.invalidate(issue.path.join(".") || "_id", issue.message);
      }
    }
  });
  // Partial query writes cannot safely validate a complete record or run save hooks.
  // Permit lifecycle updates; require load/set/save for content and cross-field edits.
  schema.pre(["updateOne", "updateMany", "findOneAndUpdate", "replaceOne", "findOneAndReplace"], function () {
    const update = this.getUpdate();
    const lifecycleFields = new Set(["isActive", "isDeleted", "sortOrder", "updatedBy", "updatedAt"]);
    if (this.getOptions().upsert || !update || Array.isArray(update)) {
      throw new Error("Use create() or document.save() for content writes.");
    }
    for (const [operator, fields] of Object.entries(update)) {
      const allowed = operator === "$set" ? lifecycleFields : operator === "$setOnInsert" ? new Set(["createdAt"]) : new Set<string>();
      if (typeof fields !== "object" || fields === null || Object.keys(fields).some((field) => !allowed.has(field))) {
        throw new Error("Use document.save() for content edits; query writes support lifecycle fields only.");
      }
    }
    this.setOptions({ runValidators: true, context: "query" });
  });
}
```

## src/models/site-settings.ts

```
import "server-only";
import { Schema, model, models } from "mongoose";
import type { ISiteSettings } from "@/types/site-settings";
import { createContentSchema, addZodValidation, type ContentModel } from "@/models/shared";
import { siteSettingsValidation } from "@/lib/validation/site-settings";
import { seoSchema } from "@/models/seo";
import { addressSchema, socialLinkSchema, announcementSchema } from "@/models/subdocuments";

const schema = createContentSchema<ISiteSettings>();
schema.add({
  singletonKey: { type: String, enum: ["site"], default: "site", required: true, unique: true, immutable: true },
  siteName: { type: String, required: true, trim: true },
  tagline: { type: String, trim: true },
  logo: { type: Schema.Types.ObjectId, ref: "Media" },
  logoLight: { type: Schema.Types.ObjectId, ref: "Media" },
  favicon: { type: Schema.Types.ObjectId, ref: "Media" },
  phone: { type: [String], default: [] },
  whatsappNumber: { type: String, trim: true },
  email: { type: [String], default: [] },
  addresses: { type: [addressSchema], default: [] },
  businessHours: { type: String, trim: true },
  socialLinks: { type: [socialLinkSchema], default: [] },
  defaultSeo: { type: seoSchema, default: () => ({}) },
  googleAnalyticsId: { type: String, trim: true },
  googleTagManagerId: { type: String, trim: true },
  facebookPixelId: { type: String, trim: true },
  whatsappDefaultMessage: { type: String, trim: true },
  maintenanceMode: { type: Boolean, default: false, required: true },
  announcementBar: { type: announcementSchema, default: () => ({}) },
});

addZodValidation(schema, siteSettingsValidation);

export const SiteSettings = (models.SiteSettings as ContentModel<ISiteSettings> | undefined)
  ?? model<ISiteSettings, ContentModel<ISiteSettings>>("SiteSettings", schema);

```

## src/models/subdocuments.ts

```
import { Schema } from "mongoose";
import type { ITechnicalSpecs, IPriceRange, IHomeItem, IAddress, ISocialLink, IAnnouncementBar } from "@/types/subdocuments";

const options = { _id: false, strict: "throw" } as const;
export const technicalSpecsSchema = new Schema<ITechnicalSpecs>({
  density: { type: Number, min: 0 },
  waterAbsorption: { type: Number, min: 0, max: 100 },
  compressiveStrength: { type: Number, min: 0 },
  flexuralStrength: { type: Number, min: 0 },
  abrasionResistance: { type: String, trim: true },
}, options);
export const priceRangeSchema = new Schema<IPriceRange>({
  min: { type: Number, min: 0, required: true },
  max: { type: Number, min: 0, required: true },
  currency: { type: String, uppercase: true, trim: true, match: /^[A-Z]{3}$/, required: true },
  unit: { type: String, trim: true, required: true },
}, options);
export const homeItemSchema = new Schema<IHomeItem>({
  key: { type: String, trim: true, required: true },
  title: { type: String, trim: true }, body: { type: String }, value: { type: String },
  iconKey: { type: String }, image: { type: Schema.Types.ObjectId, ref: "Media" },
  ctaLabel: { type: String, trim: true }, ctaUrl: { type: String, trim: true },
  data: { type: Schema.Types.Mixed, default: () => ({}) },
  isActive: { type: Boolean, default: true, required: true },
  sortOrder: { type: Number, default: 0, required: true },
}, options);
export const addressSchema = new Schema<IAddress>({
  label: { type: String, trim: true, required: true },
  line1: { type: String, trim: true, required: true },
  city: { type: String, trim: true, required: true },
  country: { type: String, trim: true, required: true },
  mapUrl: { type: String, trim: true },
  latitude: { type: Number, min: -90, max: 90 },
  longitude: { type: Number, min: -180, max: 180 },
}, options);
export const socialLinkSchema = new Schema<ISocialLink>({
  platform: { type: String, trim: true, required: true },
  url: { type: String, trim: true, required: true },
  isActive: { type: Boolean, default: true, required: true },
}, options);
export const announcementSchema = new Schema<IAnnouncementBar>({
  text: { type: String, trim: true }, url: { type: String, trim: true },
  isActive: { type: Boolean, default: false, required: true },
}, options);
```

## src/models/system-content.ts

```
import "server-only";
import { model, models } from "mongoose";
import type { ISystemContent } from "@/types/system-content";
import { createContentSchema, addZodValidation, type ContentModel } from "@/models/shared";
import { systemContentValidation } from "@/lib/validation/system-content";
const schema = createContentSchema<ISystemContent>();
schema.add({
  key: { type: String, enum: ["foundation", "error", "notFound", "loading"], required: true, unique: true },
  heading: { type: String, required: true },
  body: { type: String, required: true },
  actionLabel: { type: String, required: true },
  seoTitle: { type: String, required: true },
  seoDescription: { type: String, required: true },
});
addZodValidation(schema, systemContentValidation);
export const SystemContent = (models.SystemContent as ContentModel<ISystemContent> | undefined)
  ?? model<ISystemContent, ContentModel<ISystemContent>>("SystemContent", schema);
```

## src/models/testimonial.ts

```
import "server-only";
import { Schema, model, models } from "mongoose";
import type { ITestimonial } from "@/types/testimonial";
import { createContentSchema, addZodValidation, type ContentModel } from "@/models/shared";
import { testimonialValidation } from "@/lib/validation/testimonial";

const schema = createContentSchema<ITestimonial>();
schema.add({
  clientName: { type: String, required: true, trim: true },
  clientTitle: { type: String, trim: true },
  company: { type: String, trim: true },
  city: { type: String, trim: true },
  country: { type: String, trim: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  message: { type: String, required: true, trim: true },
  clientPhoto: { type: Schema.Types.ObjectId, ref: "Media" },
  projectRef: { type: Schema.Types.ObjectId, ref: "Project" },
  isFeatured: { type: Boolean, default: false, required: true },
});

addZodValidation(schema, testimonialValidation);

export const Testimonial = (models.Testimonial as ContentModel<ITestimonial> | undefined)
  ?? model<ITestimonial, ContentModel<ITestimonial>>("Testimonial", schema);

```

## src/models/user.ts

```
import "server-only";
import { model, models } from "mongoose";
import * as E from "@/types/enums";
import type { IUser } from "@/types/user";
import { createContentSchema, addZodValidation, type ContentModel } from "@/models/shared";
import { userValidation } from "@/lib/validation/user";

const schema = createContentSchema<IUser>();
schema.add({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: E.USER_ROLES, required: true, default: "editor" },
  lastLoginAt: { type: Date },
});

addZodValidation(schema, userValidation);
schema.set("toJSON", { transform: (_doc, ret) => { Reflect.deleteProperty(ret, "passwordHash"); return ret; } });
export const User = (models.User as ContentModel<IUser> | undefined)
  ?? model<IUser, ContentModel<IUser>>("User", schema);

```

## src/types/audit-log.ts

```
import type { Types } from "mongoose";
import type { AUDIT_ACTIONS } from "@/types/enums";

// An append-only security event, not an editable public content document.
export interface IAuditLog {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  action: (typeof AUDIT_ACTIONS)[number];
  collectionName: string;
  documentId?: Types.ObjectId | null;
  changes: Record<string, unknown>;
  ipAddress?: string;
  createdAt: Date;
}
```

## src/types/base.ts

```
import type { Types } from "mongoose";

export interface IBaseContent {
  _id: Types.ObjectId;
  isActive: boolean;
  isDeleted: boolean;
  sortOrder: number;
  // Null identifies bootstrap/system writes before an administrator exists.
  createdBy: Types.ObjectId | null;
  updatedBy: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}
export interface ISeo {
  metaTitle?: string;
  metaDescription?: string;
  keywords: string[];
  ogImage?: Types.ObjectId | null;
  canonicalUrl?: string;
  noIndex: boolean;
}

```

## src/types/blog-post.ts

```
import type { Types } from "mongoose";
import type * as E from "@/types/enums";
import type { IBaseContent, ISeo } from "@/types/base";

export interface IBlogPost extends IBaseContent {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: Types.ObjectId | null;
  author: Types.ObjectId;
  category: (typeof E.BLOG_CATEGORIES)[number];
  tags: string[];
  readTimeMinutes: number;
  publishedAt?: Date;
  isPublished: boolean;
  viewCount: number;
  seo: ISeo;
}

```

## src/types/category.ts

```
import type { Types } from "mongoose";
import type { IBaseContent, ISeo } from "@/types/base";

export interface ICategory extends IBaseContent {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  parentCategory?: Types.ObjectId | null;
  coverImage?: Types.ObjectId | null;
  iconKey?: string;
  seo: ISeo;
  isFeatured: boolean;
  showInMenu: boolean;
  showOnHomepage: boolean;
}

```

## src/types/content.ts

```
export type ScreenKey = "foundation" | "error" | "notFound" | "loading";
export interface ScreenCopy {
  heading: string;
  body: string;
  actionLabel: string;
  seoTitle: string;
  seoDescription: string;
}
export type SystemCopy = Partial<Record<ScreenKey, ScreenCopy>>;

```

## src/types/enums.ts

```
export const USER_ROLES = ["superadmin", "admin", "editor"] as const;
export const MEDIA_CONTEXTS = ["product", "gallery", "project", "exhibition", "blog", "hero", "logo", "team", "certificate", "other"] as const;
export const COLOUR_FAMILIES = ["White", "Black", "Grey", "Beige", "Cream", "Brown", "Green", "Blue", "Red", "Pink", "Yellow", "Gold", "Multicolour"] as const;
export const FINISHES = ["Polished", "Honed", "Leathered", "Brushed", "Flamed", "Sandblasted", "Bush Hammered", "Split Face", "Tumbled"] as const;
export const PRODUCT_FORMATS = ["Slab", "Tile", "Countertop", "Block", "Custom Cut"] as const;
export const APPLICATIONS = ["Flooring", "Wall Cladding", "Countertop", "Facade", "Stairs", "Bathroom", "Kitchen", "Landscaping"] as const;
export const STOCK_STATUSES = ["In Stock", "Made to Order", "Limited"] as const;
export const PROJECT_TYPES = ["Residential", "Commercial", "Hospitality", "Public", "Religious", "Landscape"] as const;
export const BLOG_CATEGORIES = ["Buying Guide", "Stone Care", "Design Trends", "Industry News", "Projects"] as const;
export const FAQ_CATEGORIES = ["General", "Products", "Pricing", "Export", "Installation", "Care"] as const;
export const HOME_SECTION_KEYS = ["hero", "stats", "materials", "about", "whyUs", "process", "featuredProducts", "gallery", "projects", "export", "exhibitions", "testimonials", "faq", "blog", "cta", "newsletter"] as const;
export const NAV_LOCATIONS = ["header", "footer-1", "footer-2", "footer-3", "mobile"] as const;
export const INQUIRY_TYPES = ["Quote", "Export", "General", "Sample Request", "Careers"] as const;
export const INQUIRY_SOURCES = ["Contact Form", "Quote Form", "Product Page", "WhatsApp", "Newsletter"] as const;
export const INQUIRY_STATUSES = ["New", "Contacted", "Quoted", "Won", "Lost", "Spam"] as const;
export const AUDIT_ACTIONS = ["create", "update", "delete", "toggle", "login", "upload"] as const;

```

## src/types/exhibition.ts

```
import type { Types } from "mongoose";
import type { IBaseContent, ISeo } from "@/types/base";

export interface IExhibition extends IBaseContent {
  name: string;
  slug: string;
  venue: string;
  city: string;
  country: string;
  startDate: Date;
  endDate: Date;
  description: string;
  coverImage?: Types.ObjectId | null;
  gallery: Types.ObjectId[];
  seo: ISeo;
  readonly isUpcoming: boolean;
}

```

## src/types/faq.ts

```
import type * as E from "@/types/enums";
import type { IBaseContent } from "@/types/base";

export interface IFaq extends IBaseContent {
  question: string;
  answer: string;
  category: (typeof E.FAQ_CATEGORIES)[number];
}

```

## src/types/home-section.ts

```
import type { Types } from "mongoose";
import type * as E from "@/types/enums";
import type { IBaseContent } from "@/types/base";
import type { IHomeItem } from "@/types/subdocuments";

export interface IHomeSection extends IBaseContent {
  sectionKey: (typeof E.HOME_SECTION_KEYS)[number];
  heading?: string;
  subheading?: string;
  eyebrowLabel?: string;
  bodyText?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  backgroundImage?: Types.ObjectId | null;
  items: IHomeItem[];
}

```

## src/types/index.ts

```
export type { IBaseContent, ISeo } from "./base";
export type { IUser } from "./user";
export type { IMedia } from "./media";
export type { ICategory } from "./category";
export type { IProduct } from "./product";
export type { IProject } from "./project";
export type { IExhibition } from "./exhibition";
export type { IBlogPost } from "./blog-post";
export type { ITestimonial } from "./testimonial";
export type { IFaq } from "./faq";
export type { IHomeSection } from "./home-section";
export type { ISiteSettings } from "./site-settings";
export type { INavigationItem } from "./navigation-item";
export type { IInquiry } from "./inquiry";
export type { IAuditLog } from "./audit-log";
export type { ISystemContent } from "./system-content";
export type * from "./subdocuments";

```

## src/types/inquiry.ts

```
import type { Types } from "mongoose";
import type * as E from "@/types/enums";
import type { IBaseContent } from "@/types/base";

export interface IInquiry extends IBaseContent {
  name: string;
  email: string;
  phone?: string;
  country?: string;
  company?: string;
  inquiryType: (typeof E.INQUIRY_TYPES)[number];
  productInterest: Types.ObjectId[];
  quantity?: string;
  unit?: string;
  message: string;
  source: (typeof E.INQUIRY_SOURCES)[number];
  pageUrl?: string;
  ipAddress?: string;
  userAgent?: string;
  status: (typeof E.INQUIRY_STATUSES)[number];
  adminNotes?: string;
  assignedTo?: Types.ObjectId | null;
  isRead: boolean;
}

```

## src/types/media.ts

```
import type { Types } from "mongoose";
import type * as E from "@/types/enums";
import type { IBaseContent } from "@/types/base";

export interface IMedia extends IBaseContent {
  cloudinaryPublicId: string;
  secureUrl: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  altText: string;
  caption?: string;
  title?: string;
  folder?: string;
  tags: string[];
  usageContext: (typeof E.MEDIA_CONTEXTS)[number];
  blurDataUrl?: string;
  uploadedBy: Types.ObjectId;
}

```

## src/types/navigation-item.ts

```
import type { Types } from "mongoose";
import type * as E from "@/types/enums";
import type { IBaseContent } from "@/types/base";

export interface INavigationItem extends IBaseContent {
  label: string;
  url: string;
  parentItem?: Types.ObjectId | null;
  openInNewTab: boolean;
  location: (typeof E.NAV_LOCATIONS)[number];
}

```

## src/types/product.ts

```
import type { Types } from "mongoose";
import type * as E from "@/types/enums";
import type { IBaseContent, ISeo } from "@/types/base";
import type { IPriceRange, ITechnicalSpecs } from "@/types/subdocuments";

export interface IProduct extends IBaseContent {
  name: string;
  slug: string;
  category: Types.ObjectId;
  description: string;
  origin?: string;
  colourFamily: (typeof E.COLOUR_FAMILIES)[number];
  finishes: Array<(typeof E.FINISHES)[number]>;
  availableFormats: Array<(typeof E.PRODUCT_FORMATS)[number]>;
  thicknessOptions: string[];
  sizeOptions: string[];
  applications: Array<(typeof E.APPLICATIONS)[number]>;
  technicalSpecs?: ITechnicalSpecs;
  priceRange?: IPriceRange;
  isPriceVisible: boolean;
  images: Types.ObjectId[];
  primaryImage?: Types.ObjectId | null;
  tags: string[];
  isFeatured: boolean;
  isExportAvailable: boolean;
  stockStatus: (typeof E.STOCK_STATUSES)[number];
  seo: ISeo;
}

```

## src/types/project.ts

```
import type { Types } from "mongoose";
import type * as E from "@/types/enums";
import type { IBaseContent, ISeo } from "@/types/base";

export interface IProject extends IBaseContent {
  title: string;
  slug: string;
  client?: string;
  location: string;
  country: string;
  projectType: (typeof E.PROJECT_TYPES)[number];
  year: number;
  description: string;
  materialsUsed: Types.ObjectId[];
  finishesUsed: string[];
  coverImage?: Types.ObjectId | null;
  gallery: Types.ObjectId[];
  isFeatured: boolean;
  seo: ISeo;
}

```

## src/types/site-settings.ts

```
import type { Types } from "mongoose";
import type { IBaseContent, ISeo } from "@/types/base";
import type { IAddress, ISocialLink, IAnnouncementBar } from "@/types/subdocuments";

export interface ISiteSettings extends IBaseContent {
  singletonKey: "site";
  siteName: string;
  tagline?: string;
  logo?: Types.ObjectId | null;
  logoLight?: Types.ObjectId | null;
  favicon?: Types.ObjectId | null;
  phone: string[];
  whatsappNumber?: string;
  email: string[];
  addresses: IAddress[];
  businessHours?: string;
  socialLinks: ISocialLink[];
  defaultSeo: ISeo;
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  facebookPixelId?: string;
  whatsappDefaultMessage?: string;
  maintenanceMode: boolean;
  announcementBar: IAnnouncementBar;
}

```

## src/types/subdocuments.ts

```
import type { Types } from "mongoose";

export interface ITechnicalSpecs {
  density?: number;
  waterAbsorption?: number;
  compressiveStrength?: number;
  flexuralStrength?: number;
  abrasionResistance?: string;
}
export interface IPriceRange {
  min: number;
  max: number;
  currency: string;
  unit: string;
}
export interface IHomeItem {
  key: string;
  title?: string;
  body?: string;
  value?: string;
  iconKey?: string;
  image?: Types.ObjectId | null;
  ctaLabel?: string;
  ctaUrl?: string;
  data: Record<string, string | number | boolean | string[]>;
  isActive: boolean;
  sortOrder: number;
}
export interface IAddress {
  label: string;
  line1: string;
  city: string;
  country: string;
  mapUrl?: string;
  latitude?: number;
  longitude?: number;
}
export interface ISocialLink {
  platform: string;
  url: string;
  isActive: boolean;
}
export interface IAnnouncementBar {
  text?: string;
  url?: string;
  isActive: boolean;
}
```

## src/types/system-content.ts

```
import type { IBaseContent } from "@/types/base";
import type { ScreenKey } from "@/types/content";
export interface ISystemContent extends IBaseContent {
  key: ScreenKey;
  heading: string;
  body: string;
  actionLabel: string;
  seoTitle: string;
  seoDescription: string;
}

```

## src/types/testimonial.ts

```
import type { Types } from "mongoose";
import type { IBaseContent } from "@/types/base";

export interface ITestimonial extends IBaseContent {
  clientName: string;
  clientTitle?: string;
  company?: string;
  city?: string;
  country?: string;
  rating: number;
  message: string;
  clientPhoto?: Types.ObjectId | null;
  projectRef?: Types.ObjectId | null;
  isFeatured: boolean;
}

```

## src/types/user.ts

```
import type * as E from "@/types/enums";
import type { IBaseContent } from "@/types/base";

export interface IUser extends IBaseContent {
  name: string;
  email: string;
  passwordHash: string;
  role: (typeof E.USER_ROLES)[number];
  lastLoginAt?: Date;
}

```

## tests/models.test.ts

```
import assert from "node:assert/strict";
import test from "node:test";
import mongoose, { Types } from "mongoose";
import {
  User, Media, Category, Product, Project, Exhibition, BlogPost, Testimonial,
  Faq, HomeSection, SiteSettings, NavigationItem, Inquiry, AuditLog, SystemContent,
} from "../src/models";
import { calculateReadTime } from "../src/lib/read-time";
import { linkUrl } from "../src/lib/validation/common";

// No environment, network or persisted fixtures: model validation runs in memory.
const actor = new Types.ObjectId();
const imageId = new Types.ObjectId();
const categoryId = new Types.ObjectId();
const audit = { createdBy: actor, updatedBy: actor };
const image = {
  cloudinaryPublicId: "test/stone", secureUrl: "https://res.cloudinary.com/test/image/upload/stone.jpg",
  format: "jpg", width: 1200, height: 800, bytes: 10000, altText: "White stone slab with grey veins",
  usageContext: "product", uploadedBy: actor, ...audit,
};
const product = {
  name: "Stone", slug: "stone", category: categoryId, description: "Stone description",
  colourFamily: "White", images: [imageId], primaryImage: imageId, ...audit,
};
const exhibition = {
  name: "Exhibition", slug: "exhibition", venue: "Venue", city: "Karachi", country: "Pakistan",
  startDate: new Date(Date.now() + 86400000), endDate: new Date(Date.now() + 172800000),
  description: "Exhibition description", ...audit,
};
const blog = {
  title: "Stone guide", slug: "stone-guide", content: "<p>Stone care guide.</p>",
  author: actor, category: "Stone Care", ...audit,
};

test("all content models accept valid fixtures and apply shared lifecycle defaults", async () => {
  const docs = [
    new User({ name: "Test Admin", email: "ADMIN@example.com", passwordHash: "test-only-hash", ...audit }),
    new Media(image),
    new Category({ name: "Marble", slug: "marble", description: "Marble", ...audit }),
    new Product(product),
    new Project({ title: "Project", slug: "project", location: "Karachi", country: "Pakistan", projectType: "Residential", year: 2026, description: "Project", ...audit }),
    new Exhibition(exhibition),
    new BlogPost(blog),
    new Testimonial({ clientName: "Client", rating: 5, message: "Review", ...audit }),
    new Faq({ question: "Question?", answer: "<p>Answer</p>", ...audit }),
    new HomeSection({ sectionKey: "stats", items: [{ key: "years", value: "20", data: { unit: "years" } }], ...audit }),
    new SiteSettings({ siteName: "Site", ...audit }),
    new NavigationItem({ label: "Home", url: "/", location: "header", ...audit }),
    new Inquiry({ name: "Buyer", email: "buyer@example.com", inquiryType: "Quote", source: "Quote Form", message: "Quote", ...audit }),
    new SystemContent({ key: "error", heading: "Error", body: "Retry", actionLabel: "Retry", seoTitle: "Error", seoDescription: "Retry", ...audit }),
  ];
  for (const doc of docs) {
    await doc.validate();
    assert.ok(doc._id instanceof Types.ObjectId);
    assert.equal(doc.isActive, true);
    assert.equal(doc.isDeleted, false);
    assert.equal(doc.sortOrder, 0);
    assert.ok(doc.createdBy?.equals(actor));
  }
});

test("content indexes and User references exist on every content schema", () => {
  for (const model of [User, Media, Category, Product, Project, Exhibition, BlogPost, Testimonial, Faq, HomeSection, SiteSettings, NavigationItem, Inquiry, SystemContent]) {
    const indexes = model.schema.indexes().map(([keys]) => keys);
    assert.ok(indexes.some((keys) => keys.isActive === 1 && keys.isDeleted === 1 && keys.sortOrder === 1), model.modelName);
    for (const name of ["isActive", "isDeleted", "sortOrder"]) assert.ok(indexes.some((keys) => keys[name] === 1 && Object.keys(keys).length === 1));
    assert.equal(model.schema.paths.createdBy.options.ref, "User");
    assert.equal(model.schema.paths.updatedBy.instance, "ObjectId");
    assert.ok(model.schema.paths.createdAt);
    assert.ok(model.schema.paths.updatedAt);
    assert.equal(mongoose.models[model.modelName], model);
  }
});

test("activeOnly preserves caller constraints and supports find, findOne, count and lean", () => {
  const find = Product.find({ isActive: false }).activeOnly();
  assert.deepEqual(find.getFilter(), { isActive: false, $and: [{ isActive: true, isDeleted: false }] });
  assert.deepEqual(Media.findOne().activeOnly().getFilter(), { $and: [{ isActive: true, isDeleted: false }] });
  assert.deepEqual(Category.countDocuments().activeOnly().getFilter(), { $and: [{ isActive: true, isDeleted: false }] });
  const typedLeanQuery = Product.find().activeOnly().lean();
  assert.ok(typedLeanQuery.getFilter().$and);
});

test("Media rejects blank alt text, external URLs, invalid dimensions and SVG blur payloads", async () => {
  for (const invalid of [
    { altText: "" }, { altText: "   " }, { width: 0 }, { width: 1.5 }, { secureUrl: "https://example.com/image.jpg" },
    { secureUrl: "http://res.cloudinary.com/test/image/upload/a.jpg" }, { blurDataUrl: "data:image/svg+xml;base64,PHN2Zz4=" },
  ]) await assert.rejects(new Media({ ...image, ...invalid }).validate());
  const media = new Media(image);
  assert.ok(media.validateSync() === undefined);
  assert.ok(new Media({ ...image, altText: " " }).validateSync());
});

test("SEO lengths, canonical schemes and Media references are validated", async () => {
  for (const seo of [
    { metaTitle: "x".repeat(61) }, { metaDescription: "x".repeat(161) },
    { canonicalUrl: "javascript:alert(1)" }, { ogImage: "not-an-id" },
  ]) await assert.rejects(new Product({ ...product, seo }).validate());
  const valid = new Product({ ...product, seo: { ogImage: imageId, metaTitle: "x".repeat(60), metaDescription: "x".repeat(160) } });
  await valid.validate();
  assert.equal(valid.seo.noIndex, false);
});

test("Product validates complete price ranges, primary image membership and enums", async () => {
  for (const invalid of [
    { isPriceVisible: true },
    { priceRange: { min: 10, max: 1, currency: "PKR", unit: "sq ft" } },
    { priceRange: { min: -1, max: 1, currency: "PKR", unit: "sq ft" } },
    { primaryImage: new Types.ObjectId() }, { finishes: ["Painted"] }, { colourFamily: "Invalid" },
    { technicalSpecs: { waterAbsorption: 101 } },
  ]) await assert.rejects(new Product({ ...product, ...invalid }).validate());
  await new Product({ ...product, isPriceVisible: true, priceRange: { min: 1, max: 2, currency: "pkr", unit: "sq ft" } }).validate();
});

test("Exhibition date order and dynamic isUpcoming virtual are correct", async () => {
  const upcoming = new Exhibition(exhibition);
  await upcoming.validate();
  assert.equal(upcoming.isUpcoming, true);
  upcoming.startDate = new Date(Date.now() - 86400000);
  assert.equal(upcoming.isUpcoming, false);
  assert.equal(upcoming.toJSON().isUpcoming, false);
  assert.equal(Exhibition.schema.path("isUpcoming"), undefined);
  await assert.rejects(new Exhibition({ ...exhibition, endDate: new Date(0) }).validate());
});

test("Blog reading time ignores scripts and is recalculated when HTML changes", async () => {
  const post = new BlogPost({ ...blog, content: "<p>" + "stone ".repeat(401) + "</p>", readTimeMinutes: 99 });
  await post.validate();
  assert.equal(post.readTimeMinutes, 3);
  post.content = "<p>Short article</p>";
  await post.validate();
  assert.equal(post.readTimeMinutes, 1);
  assert.equal(calculateReadTime("<script>" + "word ".repeat(1000) + "</script><p>Stone.</p>"), 1);
  await assert.rejects(new BlogPost({ ...blog, isPublished: true }).validate());
  await new BlogPost({ ...blog, isPublished: true, publishedAt: new Date() }).validate();
});

test("User normalizes email and omits password hashes from JSON/default selection", async () => {
  const user = new User({ name: "Admin", email: " ADMIN@EXAMPLE.COM ", passwordHash: "test-only-hash", ...audit });
  await user.validate();
  assert.equal(user.email, "admin@example.com");
  assert.equal(User.schema.path("passwordHash").options.select, false);
  assert.equal(JSON.stringify(user).includes("test-only-hash"), false);
  const projected = User.hydrate({ _id: actor, name: "Admin", email: "a@example.com", role: "admin", ...audit }, { passwordHash: 0 });
  await projected.validate();
  await assert.rejects(new User({ name: "Admin", email: "invalid", passwordHash: "test" }).validate());
  await assert.rejects(new User({ name: "Admin", email: "a@example.com", passwordHash: "test", role: "owner" }).validate());
});

test("query content updates cannot bypass full validation or reading-time middleware", async () => {
  await assert.rejects(BlogPost.updateOne({ _id: actor }, { $set: { content: "Changed" } }).exec(), /document.save/);
  await assert.rejects(Product.updateOne({ _id: actor }, { $set: { "priceRange.min": 200 } }).exec(), /document.save/);
  await assert.rejects(SiteSettings.updateOne({}, { $set: { siteName: "New" } }, { upsert: true }).exec(), /create/);
});

test("self-referencing parents, invalid ratings and unsafe navigation links are rejected", async () => {
  const category = new Category({ name: "Marble", slug: "marble", description: "Marble", ...audit });
  category.parentCategory = category._id;
  await assert.rejects(category.validate());
  const item = new NavigationItem({ label: "Home", url: "/", location: "header", ...audit });
  item.parentItem = item._id;
  await assert.rejects(item.validate());
  for (const rating of [0, 6, 2.5]) await assert.rejects(new Testimonial({ clientName: "Client", message: "Review", rating }).validate());
  for (const url of ["javascript:alert(1)", "//evil.example", "/\\evil.example", "data:text/html,test"]) assert.equal(linkUrl.safeParse(url).success, false);
  for (const url of ["/", "/products/stone", "#gallery", "https://example.com", "mailto:a@example.com", "tel:+923001234567"]) assert.equal(linkUrl.safeParse(url).success, true);
});

test("SiteSettings enforces a unique singleton discriminator and nested constraints", async () => {
  assert.ok(SiteSettings.schema.indexes().some(([keys, options]) => keys.singletonKey === 1 && options.unique));
  await assert.rejects(new SiteSettings({ siteName: "Site", singletonKey: "second-site" }).validate());
  await assert.rejects(new SiteSettings({ siteName: "Site", announcementBar: { isActive: true } }).validate());
  await assert.rejects(new SiteSettings({ siteName: "Site", addresses: [{ label: "Office", line1: "Street", city: "Karachi", country: "Pakistan", latitude: 24 }] }).validate());
  await assert.rejects(new SiteSettings({ siteName: "Site", socialLinks: [{ platform: "Social", url: "javascript:alert(1)" }] }).validate());
});

test("AuditLog is validated and rejects query updates/deletion", async () => {
  const log = new AuditLog({ user: actor, action: "create", collectionName: "products", documentId: actor, changes: { after: { name: "Stone" } } });
  await log.validate();
  assert.equal(AuditLog.schema.path("updatedAt"), undefined);
  await assert.rejects(new AuditLog({ user: actor, action: "invalid", collectionName: "products" }).validate());
  await assert.rejects(AuditLog.updateOne({}, { $set: { action: "delete" } }).exec(), /append-only/);
  await assert.rejects(AuditLog.deleteMany({}).exec(), /append-only/);
  await assert.rejects(log.deleteOne(), /append-only/);
});

test("required unique/search/publication indexes are declared", () => {
  for (const model of [Category, Product, Project, Exhibition, BlogPost]) {
    assert.ok(model.schema.indexes().some(([keys, options]) => keys.slug === 1 && options.unique));
  }
  assert.ok(Product.schema.indexes().some(([keys]) => keys.name === "text" && keys.description === "text" && keys.tags === "text"));
  assert.ok(BlogPost.schema.indexes().some(([keys]) => keys.publishedAt === -1));
  assert.ok(User.schema.indexes().some(([keys, options]) => keys.email === 1 && options.unique));
  assert.ok(Media.schema.indexes().some(([keys, options]) => keys.cloudinaryPublicId === 1 && options.unique));
});
```
