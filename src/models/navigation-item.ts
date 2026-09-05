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

