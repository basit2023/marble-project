import "server-only";
import mongoose, { Types, type ClientSession, type FilterQuery } from "mongoose";
import sanitizeHtml from "sanitize-html";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import "@/models";
import { AuditLog } from "@/models";
import { slugify } from "@/lib/utils";
import { hashPassword } from "@/lib/password";
import { AdminApiError } from "./http";
import { getResourceConfig, type AdminField, type ResourceConfig, type ResourceKey } from "./resources";

type LooseRecord = Record<string, unknown> & {
  _id: Types.ObjectId; __v?: number; isActive?: boolean; isDeleted?: boolean; sortOrder?: number;
  createdAt?: Date; updatedAt?: Date; createdBy?: Types.ObjectId | null; updatedBy?: Types.ObjectId | null;
};
export const listInputSchema = z.object({
  search: z.string().trim().max(100).default(""), state: z.enum(["all", "active", "inactive", "deleted"]).default("all"),
  page: z.coerce.number().int().positive().max(10000).default(1),
  sort: z.string().default("sortOrder"), direction: z.enum(["asc", "desc"]).default("asc"),
  status: z.string().trim().max(50).optional(),
});
export const mutationSchema = z.object({
  data: z.record(z.string(), z.unknown()),
  intent: z.enum(["save", "saveAdd", "draft"]).default("save"),
  version: z.number().int().nonnegative().optional(),
}).strict();
export const bulkSchema = z.object({
  ids: z.array(z.string().regex(/^[a-f\d]{24}$/i)).min(1).max(100),
  action: z.enum(["enable", "disable", "delete"]),
}).strict();
export const reorderSchema = z.object({
  orderedIds: z.array(z.string().regex(/^[a-f\d]{24}$/i)).min(1).max(100),
}).strict().refine((value) => new Set(value.orderedIds).size === value.orderedIds.length);

function ModelFor(config: ResourceConfig) {
  return mongoose.model<LooseRecord>(config.modelName);
}
function getPath(source: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((value, key) =>
    typeof value === "object" && value !== null ? (value as Record<string, unknown>)[key] : undefined, source);
}
function setPath(target: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split(".");
  let current = target;
  for (const key of keys.slice(0, -1)) {
    if (typeof current[key] !== "object" || current[key] === null || Array.isArray(current[key])) current[key] = {};
    current = current[key] as Record<string, unknown>;
  }
  current[keys.at(-1) ?? path] = value;
}
function normalize(field: AdminField, value: unknown): unknown {
  if (value === undefined || value === null || value === "") return field.required ? value : undefined;
  if (field.kind === "number") {
    const number = typeof value === "number" ? value : Number(value);
    return Number.isFinite(number) ? number : value;
  }
  if (field.kind === "date" || field.kind === "datetime") return value instanceof Date ? value : new Date(String(value));
  if (field.kind === "tags" || field.kind === "mediaMany") {
    if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
    return String(value).split(",").map((item) => item.trim()).filter(Boolean);
  }
  if (field.kind === "json") {
    if (typeof value !== "string") return value;
    try { return JSON.parse(value) as unknown; } catch { throw new AdminApiError(400, "VALIDATION"); }
  }
  if (field.kind === "richtext") return sanitizeHtml(String(value), {
    allowedTags: ["p", "h2", "h3", "h4", "blockquote", "ul", "ol", "li", "strong", "em", "s", "br", "hr", "a", "code", "pre"],
    allowedAttributes: { a: ["href", "target", "rel"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: { a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }, true) },
  });
  return value;
}
async function prepareData(config: ResourceConfig, raw: Record<string, unknown>, create: boolean): Promise<Record<string, unknown>> {
  const output: Record<string, unknown> = {};
  for (const field of config.fields) {
    const value = normalize(field, getPath(raw, field.path));
    if (field.kind === "password") {
      if (typeof value === "string" && value) output.passwordHash = await hashPassword(value);
      continue;
    }
    if (value !== undefined) setPath(output, field.path, value);
  }
  if (config.key === "settings") output.singletonKey = "site";
  if (config.key === "users" && create && !output.passwordHash) throw new AdminApiError(400, "VALIDATION");
  return output;
}
function safeChanges(data: Record<string, unknown>): Record<string, unknown> {
  const clone = structuredClone(data);
  Reflect.deleteProperty(clone, "password");
  Reflect.deleteProperty(clone, "passwordHash");
  return clone;
}
function serialize(value: unknown): unknown { return JSON.parse(JSON.stringify(value)) as unknown; }
async function writeAudit(actorId: Types.ObjectId, config: ResourceConfig, id: Types.ObjectId, action: "create" | "update" | "delete" | "toggle", changes: Record<string, unknown>, session: ClientSession) {
  await AuditLog.create([{ user: actorId, action, collectionName: config.modelName, documentId: id, changes: safeChanges(changes) }], { session });
}
// Content tags consumed by the cross-request caches in src/lib/seo/site.ts and
// src/lib/public/data.ts.
const CONTENT_TAGS: Partial<Record<ResourceKey, string[]>> = {
  settings: ["site-settings"],
  navigation: ["navigation"],
  categories: ["categories"],
};
function invalidate(config: ResourceConfig, slug?: unknown) {
  for (const path of config.revalidatePaths) revalidatePath(path);
  if (config.publicBase && typeof slug === "string") revalidatePath(config.publicBase + "/" + slug);
  revalidateTag("resource:" + config.key);
  for (const tag of CONTENT_TAGS[config.key] ?? []) revalidateTag(tag);
}
export async function listRecords(key: ResourceKey, input: z.infer<typeof listInputSchema>) {
  await connectDB();
  const config = getResourceConfig(key);
  const Model = ModelFor(config);
  const filter: FilterQuery<LooseRecord> = {};
  if (input.state === "active") Object.assign(filter, { isActive: true, isDeleted: false });
  if (input.state === "inactive") Object.assign(filter, { isActive: false, isDeleted: false });
  if (input.state === "deleted") filter.isDeleted = true;
  if (input.state === "all") filter.isDeleted = false;
  if (input.status && key === "inquiries") filter.status = input.status;
  if (input.search) {
    const regex = new RegExp(input.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = config.searchFields.map((field) => ({ [field]: regex }));
  }
  const allowedSort = new Set(["sortOrder", "createdAt", "updatedAt", "isActive", config.titleField, ...config.fields.map((field) => field.path)]);
  const sort = allowedSort.has(input.sort) ? input.sort : "sortOrder";
  const pageSize = 20;
  const query = Model.find(filter).sort({ [sort]: input.direction === "asc" ? 1 : -1, _id: 1 })
    .skip((input.page - 1) * pageSize).limit(pageSize);
  if (key === "inquiries") query.select("+adminNotes +ipAddress +userAgent");
  const [records, total] = await Promise.all([query.lean(), Model.countDocuments(filter)]);
  return { records: serialize(records), total, page: input.page, pageSize };
}
export async function getRecord(key: ResourceKey, id: string) {
  await connectDB();
  const config = getResourceConfig(key);
  const query = ModelFor(config).findById(id);
  if (key === "inquiries") query.select("+adminNotes +ipAddress +userAgent");
  const record = await query.lean();
  if (!record) throw new AdminApiError(404, "NOT_FOUND");
  return serialize(record);
}
export async function checkSlug(key: ResourceKey, slug: string, exclude?: string) {
  await connectDB();
  const config = getResourceConfig(key);
  if (!config.slugField) throw new AdminApiError(400, "VALIDATION");
  const normalized = slugify(slug);
  const filter: FilterQuery<LooseRecord> = { [config.slugField]: normalized };
  if (exclude) filter._id = { $ne: new Types.ObjectId(exclude) };
  return { slug: normalized, available: !await ModelFor(config).exists(filter) };
}
export async function createRecord(key: ResourceKey, actorId: Types.ObjectId, payload: z.infer<typeof mutationSchema>) {
  const config = getResourceConfig(key);
  const data = await prepareData(config, payload.data, true);
  if (payload.intent === "draft") data.isActive = false;
  data.createdBy = actorId; data.updatedBy = actorId;
  const db = await connectDB();
  const record = await db.connection.transaction(async (session) => {
    const Model = ModelFor(config);
    if (config.singleton && await Model.exists({ singletonKey: "site" }).session(session)) throw new AdminApiError(409, "CONFLICT");
    const [doc] = await Model.create([data], { session });
    await writeAudit(actorId, config, doc._id, "create", { after: data }, session);
    return doc.toObject();
  });
  invalidate(config, getPath(data, config.slugField ?? ""));
  return serialize(record);
}
export async function updateRecord(key: ResourceKey, id: string, actorId: Types.ObjectId, payload: z.infer<typeof mutationSchema>) {
  const config = getResourceConfig(key);
  const data = await prepareData(config, payload.data, false);
  if (payload.intent === "draft") data.isActive = false;
  const db = await connectDB();
  const record = await db.connection.transaction(async (session) => {
    const Model = ModelFor(config);
    const query = Model.findById(id).session(session);
    if (key === "users") query.select("+passwordHash");
    const doc = await query;
    if (!doc) throw new AdminApiError(404, "NOT_FOUND");
    if (payload.version !== undefined && doc.__v !== payload.version) throw new AdminApiError(409, "CONFLICT");
    const oldSlug = config.slugField ? getPath(doc.toObject(), config.slugField) : undefined;
    doc.set({ ...data, updatedBy: actorId });
    await doc.save({ session });
    await writeAudit(actorId, config, doc._id, "update", { fields: Object.keys(data), oldSlug }, session);
    return doc.toObject();
  });
  invalidate(config, getPath(data, config.slugField ?? ""));
  return serialize(record);
}
export async function toggleRecord(key: ResourceKey, id: string, actorId: Types.ObjectId, active: boolean) {
  const config = getResourceConfig(key);
  const db = await connectDB();
  const record = await db.connection.transaction(async (session) => {
    const doc = await ModelFor(config).findOne({ _id: id, isDeleted: false }).session(session);
    if (!doc) throw new AdminApiError(404, "NOT_FOUND");
    const before = doc.isActive;
    doc.set({ isActive: active, updatedBy: actorId });
    await doc.save({ session });
    await writeAudit(actorId, config, doc._id, "toggle", { before, after: active }, session);
    return doc.toObject();
  });
  invalidate(config, getPath(record, config.slugField ?? ""));
  return serialize(record);
}
const dependencies: Partial<Record<ResourceKey, Array<{ model: string; paths: string[] }>>> = {
  categories: [{ model: "Product", paths: ["category"] }, { model: "Category", paths: ["parentCategory"] }],
  products: [{ model: "Project", paths: ["materialsUsed"] }, { model: "Inquiry", paths: ["productInterest"] }],
  projects: [{ model: "Testimonial", paths: ["projectRef"] }],
  users: [{ model: "BlogPost", paths: ["author"] }, { model: "Inquiry", paths: ["assignedTo"] }],
  navigation: [{ model: "NavigationItem", paths: ["parentItem"] }],
};
async function assertUnused(key: ResourceKey, id: Types.ObjectId, session: ClientSession) {
  for (const dependency of dependencies[key] ?? []) {
    const count = await mongoose.model(dependency.model).collection.countDocuments({
      $or: dependency.paths.map((path) => ({ [path]: id })),
    }, { session });
    if (count) throw new AdminApiError(409, "IN_USE");
  }
}
export async function deleteRecord(key: ResourceKey, id: string, actorId: Types.ObjectId, hard: boolean) {
  const config = getResourceConfig(key);
  const db = await connectDB();
  const slug = await db.connection.transaction(async (session) => {
    const doc = await ModelFor(config).findById(id).session(session);
    if (!doc) throw new AdminApiError(404, "NOT_FOUND");
    await assertUnused(key, doc._id, session);
    const value = getPath(doc.toObject(), config.slugField ?? "");
    await writeAudit(actorId, config, doc._id, "delete", { hard }, session);
    if (hard) await doc.deleteOne({ session });
    else { doc.set({ isDeleted: true, isActive: false, updatedBy: actorId }); await doc.save({ session }); }
    return value;
  });
  invalidate(config, slug);
}
export async function bulkMutate(key: ResourceKey, actorId: Types.ObjectId, payload: z.infer<typeof bulkSchema>) {
  const config = getResourceConfig(key);
  const db = await connectDB();
  await db.connection.transaction(async (session) => {
    for (const id of payload.ids) {
      const doc = await ModelFor(config).findById(id).session(session);
      if (!doc) continue;
      if (payload.action === "delete") {
        await assertUnused(key, doc._id, session);
        doc.set({ isDeleted: true, isActive: false, updatedBy: actorId });
        await writeAudit(actorId, config, doc._id, "delete", { bulk: true }, session);
      } else {
        const active = payload.action === "enable";
        doc.set({ isActive: active, updatedBy: actorId });
        await writeAudit(actorId, config, doc._id, "toggle", { bulk: true, after: active }, session);
      }
      await doc.save({ session });
    }
  });
  invalidate(config);
}
export async function reorderRecords(key: ResourceKey, actorId: Types.ObjectId, orderedIds: string[]) {
  const config = getResourceConfig(key);
  const db = await connectDB();
  await db.connection.transaction(async (session) => {
    for (const [sortOrder, id] of orderedIds.entries()) {
      const doc = await ModelFor(config).findOne({ _id: id, isDeleted: false }).session(session);
      if (!doc) throw new AdminApiError(404, "NOT_FOUND");
      doc.set({ sortOrder, updatedBy: actorId });
      await doc.save({ session });
      await writeAudit(actorId, config, doc._id, "update", { sortOrder, reordered: true }, session);
    }
  });
  invalidate(config);
}
export async function duplicateRecord(key: ResourceKey, id: string, actorId: Types.ObjectId) {
  const config = getResourceConfig(key);
  if (["users", "settings", "inquiries"].includes(key)) throw new AdminApiError(400, "VALIDATION");
  const current = await getRecord(key, id) as Record<string, unknown>;
  const data = await prepareData(config, current, true);
  if (config.slugField) setPath(data, config.slugField, slugify(String(getPath(data, config.slugField))) + "-copy-" + crypto.randomUUID().slice(0, 6));
  data.isActive = false;
  return createRecord(key, actorId, { data, intent: "draft" });
}
