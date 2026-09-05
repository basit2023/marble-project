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
