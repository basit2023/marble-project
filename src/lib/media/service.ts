import "server-only";
import { Types, type FilterQuery, type ClientSession } from "mongoose";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Media, AuditLog } from "@/models";
import type { IMedia } from "@/types/media";
import { createMediaSchema, patchMediaSchema, listMediaSchema, type MediaDTO } from "./contracts";
import { verifyUploadedAsset, generateBlurDataUrl, destroyCloudinaryAsset } from "./cloud";
import { findMediaUsages } from "./references";
import { deleteMediaWorkflow } from "./delete-workflow";
import { MediaApiError } from "./errors";

export function toMediaDTO(media: IMedia): MediaDTO {
  return {
    id: media._id.toString(), cloudinaryPublicId: media.cloudinaryPublicId, secureUrl: media.secureUrl,
    format: media.format, width: media.width, height: media.height, bytes: media.bytes, version: media.version,
    altText: media.altText, caption: media.caption ?? "", tags: media.tags, folder: media.folder ?? "",
    usageContext: media.usageContext, blurDataUrl: media.blurDataUrl,
    isActive: media.isActive, isDeleted: media.isDeleted, sortOrder: media.sortOrder,
    deletionStatus: media.deletionStatus ?? "none",
  };
}
async function audit(actor: Types.ObjectId, id: Types.ObjectId, action: "upload" | "update" | "toggle" | "delete", changes: Record<string, unknown>, session: ClientSession) {
  await AuditLog.create([{ user: actor, action, collectionName: "media", documentId: id, changes }], { session });
}
export async function registerMedia(actor: Types.ObjectId, input: z.infer<typeof createMediaSchema>) {
  const { ticket, resource } = await verifyUploadedAsset(actor.toString(), input.ticket, input.upload);
  const db = await connectDB();
  const existing = await Media.findOne({ cloudinaryPublicId: ticket.publicId });
  if (existing) {
    if (!existing.isDeleted && existing.uploadedBy.equals(actor)) return toMediaDTO(existing);
    throw new MediaApiError(409, "CONFLICT");
  }
  const blurDataUrl = await generateBlurDataUrl(resource.public_id, resource.version);
  try {
    return await db.connection.transaction(async (session) => {
      const [media] = await Media.create([{
        cloudinaryPublicId: resource.public_id, secureUrl: resource.secure_url,
        format: resource.format, width: resource.width, height: resource.height, bytes: resource.bytes,
        version: resource.version, blurDataUrl, altText: input.altText, caption: input.caption, tags: input.tags,
        folder: "marble-site/" + ticket.folder, usageContext: ticket.usageContext,
        uploadedBy: actor, createdBy: actor, updatedBy: actor,
      }], { session });
      await audit(actor, media._id, "upload", { publicId: media.cloudinaryPublicId }, session);
      return toMediaDTO(media);
    });
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === 11000) {
      const retry = await Media.findOne({ cloudinaryPublicId: ticket.publicId, uploadedBy: actor, isDeleted: false });
      if (retry) return toMediaDTO(retry);
      throw new MediaApiError(409, "CONFLICT");
    }
    throw error;
  }
}
export async function listMedia(input: z.infer<typeof listMediaSchema>) {
  await connectDB();
  const filter: FilterQuery<IMedia> = { isDeleted: input.state === "deleted" };
  if (input.state === "active") { filter.isActive = true; filter.deletionStatus = { $ne: "pending" }; }
  if (input.folder) filter.folder = "marble-site/" + input.folder;
  if (input.tag) filter.tags = input.tag;
  if (input.usageContext) filter.usageContext = input.usageContext;
  if (input.search) {
    const escaped = input.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");
    filter.$or = [{ altText: regex }, { caption: regex }, { title: regex }, { tags: regex }];
  }
  const pageSize = 24;
  const [items, total] = await Promise.all([
    Media.find(filter).sort({ sortOrder: 1, createdAt: -1, _id: 1 }).skip((input.page - 1) * pageSize).limit(pageSize).lean(),
    Media.countDocuments(filter),
  ]);
  return { items: items.map(toMediaDTO), total, page: input.page, pageSize };
}
export async function patchMedia(actor: Types.ObjectId, id: string, input: z.infer<typeof patchMediaSchema>) {
  const db = await connectDB();
  return db.connection.transaction(async (session) => {
    const media = await Media.findOne({ _id: id, isDeleted: false, deletionStatus: { $ne: "pending" } }).session(session);
    if (!media) throw new MediaApiError(404, "NOT_FOUND");
    const before = { altText: media.altText, caption: media.caption, tags: [...media.tags], isActive: media.isActive, sortOrder: media.sortOrder };
    media.set({ ...input, updatedBy: actor });
    await media.save({ session });
    await audit(actor, media._id, input.isActive !== undefined && input.isActive !== before.isActive ? "toggle" : "update", { before, after: input }, session);
    return toMediaDTO(media);
  });
}
export async function deleteMedia(actor: Types.ObjectId, id: string, hard: boolean) {
  const db = await connectDB();
  await deleteMediaWorkflow(hard, {
    reserve: () => db.connection.transaction(async (session) => {
      const media = await Media.findById(id).session(session);
      if (!media) throw new MediaApiError(404, "NOT_FOUND");
      const usages = await findMediaUsages(media._id, session);
      if (usages.length) throw new MediaApiError(409, "MEDIA_IN_USE", usages);
      if (hard ? media.deletionStatus !== "pending" : !media.isDeleted) {
        media.isDeleted = true;
        media.isActive = false;
        media.updatedBy = actor;
        if (hard) media.deletionStatus = "pending";
        await media.save({ session });
        await audit(actor, media._id, "delete", { hard, stage: hard ? "pending" : "completed", publicId: media.cloudinaryPublicId }, session);
      }
      return toMediaDTO(media);
    }),
    destroy: destroyCloudinaryAsset,
    finish: () => db.connection.transaction(async (session) => {
      const media = await Media.findById(id).session(session);
      if (!media) return; // Another retry already completed the operation.
      if (media.deletionStatus !== "pending") throw new MediaApiError(409, "CONFLICT");
      await audit(actor, media._id, "delete", { hard: true, stage: "completed", publicId: media.cloudinaryPublicId }, session);
      await media.deleteOne({ session });
    }),
  });
}
