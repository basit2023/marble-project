import { z } from "zod";

export const publicInquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email(),
  phone: z.string().trim().max(60).optional(),
  country: z.string().trim().max(120).optional(),
  company: z.string().trim().max(160).optional(),
  inquiryType: z.enum(["Quote", "Export", "General", "Sample Request", "Careers"]),
  productInterest: z.array(z.string().regex(/^[a-f\d]{24}$/i)).max(50).default([]),
  quantity: z.string().trim().max(120).optional(),
  unit: z.string().trim().max(60).optional(),
  message: z.string().trim().min(10).max(4000),
  source: z.enum(["Contact Form", "Quote Form", "Product Page"]),
  pageUrl: z.url().optional(),
});

export const publicUploadSignSchema = z.object({
  fileName: z.string().trim().regex(/\.(jpe?g|png|webp|avif|pdf)$/i),
});
