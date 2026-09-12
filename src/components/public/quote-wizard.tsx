"use client";

import { useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { publicInquirySchema } from "@/lib/public/forms";
import type { ProductCardDTO } from "@/types/public-pages";

const quoteSchema = publicInquirySchema.extend({
  projectType: z.string().trim().min(1),
  timeline: z.string().trim().min(1),
  drawingUrl: z.url().optional(),
});
type QuoteValues = z.input<typeof quoteSchema>;
const steps = ["Project", "Materials", "Contact", "Review"] as const;

export function QuoteWizard({ products }: { products: ProductCardDTO[] }) {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const grouped = useMemo(() => products.reduce<Record<string, ProductCardDTO[]>>((acc, product) => {
    acc[product.categoryName] = [...(acc[product.categoryName] ?? []), product];
    return acc;
  }, {}), [products]);
  const form = useForm<QuoteValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      name: "", email: "", phone: "", country: "", company: "", inquiryType: "Quote", source: "Quote Form",
      productInterest: [], quantity: "", unit: "", message: "", pageUrl: "", projectType: "", timeline: "",
    },
  });
  const next = async () => {
    const fields = step === 0 ? ["projectType", "quantity", "unit", "timeline"] : step === 1 ? ["productInterest"] : step === 2 ? ["name", "email", "phone", "country", "message"] : [];
    const ok = await form.trigger(fields as Array<keyof QuoteValues>);
    if (ok) setStep((value) => Math.min(value + 1, steps.length - 1));
  };
  const uploadDrawing = async (file: File) => {
    setUploading(true);
    const signed = await fetch("/api/public/uploads/sign", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ fileName: file.name }) });
    if (!signed.ok) { setUploading(false); setStatus("The drawing could not be prepared for upload."); return; }
    const payload = await signed.json() as { uploadUrl: string; apiKey: string; params: Record<string, string> };
    const body = new FormData();
    body.set("file", file);
    body.set("api_key", payload.apiKey);
    Object.entries(payload.params).forEach(([key, value]) => body.set(key, value));
    const response = await fetch(payload.uploadUrl, { method: "POST", body });
    const upload = await response.json().catch(() => null) as { secure_url?: string } | null;
    if (response.ok && upload?.secure_url) form.setValue("drawingUrl", upload.secure_url);
    else setStatus("The drawing upload failed.");
    setUploading(false);
  };
  const submit = form.handleSubmit((values) => {
    setStatus("");
    startTransition(async () => {
      const drawing = values.drawingUrl ? `\nDrawing: ${values.drawingUrl}` : "";
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...values,
          pageUrl: window.location.href,
          message: `${values.message}\nProject type: ${values.projectType}\nTimeline: ${values.timeline}${drawing}`,
        }),
      });
      setStatus(response.ok ? "Your quote request has been sent." : "We could not send the quote request.");
    });
  });
  const selectedIds = form.watch("productInterest") ?? [];
  const selectedNames = products.filter((product) => selectedIds.includes(product.id)).map((product) => product.name);
  return (
    <form onSubmit={submit} className="page-shell py-section">
      <ol className="mb-10 grid grid-cols-4 gap-2 text-xs uppercase tracking-[0.12em] text-muted">
        {steps.map((label, index) => <li key={label} className={`border-t pt-3 ${index <= step ? "border-accent text-ivory" : "border-ivory/20"}`}>{label}</li>)}
      </ol>
      {step === 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <select {...form.register("projectType")} className="border border-charcoal/20 bg-ivory px-4 py-3 text-charcoal"><option value="">Project type</option><option>Residential</option><option>Commercial</option><option>Export container</option><option>Hospitality</option></select>
          <select {...form.register("timeline")} className="border border-charcoal/20 bg-ivory px-4 py-3 text-charcoal"><option value="">Timeline</option><option>Urgent</option><option>1-3 months</option><option>3-6 months</option><option>Planning stage</option></select>
          <input {...form.register("quantity")} placeholder="Quantity" className="border border-ivory/25 bg-transparent px-4 py-3 placeholder:text-ivory/40" />
          <input {...form.register("unit")} placeholder="Unit, e.g. sqft, sqm, container" className="border border-ivory/25 bg-transparent px-4 py-3 placeholder:text-ivory/40" />
        </div>
      ) : null}
      {step === 1 ? (
        <div className="grid gap-8">
          {Object.entries(grouped).map(([category, items]) => (
            <fieldset key={category} className="border-t border-ivory/10 pt-5">
              <legend className="font-heading text-3xl">{category}</legend>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((product) => <label key={product.id} className="flex gap-3 border border-ivory/15 p-3"><input type="checkbox" value={product.id} {...form.register("productInterest")} />{product.name}</label>)}
              </div>
            </fieldset>
          ))}
        </div>
      ) : null}
      {step === 2 ? (
        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <input {...form.register("name")} placeholder="Name" className="border border-ivory/25 bg-transparent px-4 py-3 placeholder:text-ivory/40" />
            <input {...form.register("email")} type="email" placeholder="Email" className="border border-ivory/25 bg-transparent px-4 py-3 placeholder:text-ivory/40" />
            <input {...form.register("phone")} placeholder="Phone / WhatsApp" className="border border-ivory/25 bg-transparent px-4 py-3 placeholder:text-ivory/40" />
            <input {...form.register("country")} placeholder="Project location / country" className="border border-ivory/25 bg-transparent px-4 py-3 placeholder:text-ivory/40" />
          </div>
          <textarea {...form.register("message")} rows={5} placeholder="Project notes" className="border border-ivory/25 bg-transparent px-4 py-3 placeholder:text-ivory/40" />
          <label className="grid gap-2 text-sm uppercase tracking-[0.14em] text-muted">
            Drawings or reference image
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif,application/pdf" onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void uploadDrawing(file);
            }} />
          </label>
          {uploading ? <p className="text-sm text-muted">Uploading drawing...</p> : null}
        </div>
      ) : null}
      {step === 3 ? (
        <div className="grid gap-4 border border-ivory/15 p-6">
          <h2 className="font-heading text-title">Review request</h2>
          <p><strong>Project:</strong> {form.watch("projectType")} / {form.watch("timeline")}</p>
          <p><strong>Materials:</strong> {selectedNames.join(", ") || "No specific material selected"}</p>
          <p><strong>Quantity:</strong> {form.watch("quantity")} {form.watch("unit")}</p>
          <p><strong>Contact:</strong> {form.watch("name")} / {form.watch("email")} / {form.watch("country")}</p>
        </div>
      ) : null}
      {Object.keys(form.formState.errors).length ? <p className="mt-6 text-sm text-red-400">Please complete the required fields for this step.</p> : null}
      {status ? <p className="mt-6 text-sm text-green-400">{status}</p> : null}
      <div className="mt-8 flex gap-3">
        {step > 0 ? <button type="button" onClick={() => setStep((value) => value - 1)} className="border border-ivory px-6 py-3 text-sm uppercase tracking-[0.18em]">Back</button> : null}
        {step < steps.length - 1 ? <button type="button" onClick={next} className="bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-charcoal">Next</button> : <button disabled={pending} className="bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-charcoal disabled:opacity-60">Submit quote</button>}
      </div>
    </form>
  );
}
