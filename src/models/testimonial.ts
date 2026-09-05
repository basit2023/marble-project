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

