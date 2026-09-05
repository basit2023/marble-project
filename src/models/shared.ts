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
