"use client";

import { useId, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { publicInquirySchema } from "@/lib/public/forms";
import type { ProductCardDTO } from "@/types/public-pages";
import type { z } from "zod";

type FormSource = "Contact Form" | "Quote Form" | "Product Page";
type InquiryType = "Quote" | "Export" | "General" | "Sample Request" | "Careers";
type InquiryValues = z.input<typeof publicInquirySchema>;

export function PublicInquiryForm({ source, inquiryType = "General", product, products = [], extraFields = false }: {
  source: FormSource; inquiryType?: InquiryType; product?: ProductCardDTO; products?: ProductCardDTO[]; extraFields?: boolean;
}) {
  const [status, setStatus] = useState("");
  const [ok, setOk] = useState(false);
  const [pending, startTransition] = useTransition();
  const uid = useId();
  const { register, handleSubmit, formState: { errors } } = useForm<InquiryValues>({
    resolver: zodResolver(publicInquirySchema),
    defaultValues: {
      name: "", email: "", phone: "", country: "", company: "", inquiryType,
      productInterest: product ? [product.id] : [], quantity: "", unit: "",
      message: product ? `I would like a quote for ${product.name}.` : "",
      source, pageUrl: "",
    },
  });

  const errId = (name: string) => `${uid}-${name}-error`;
  const a11y = (name: keyof InquiryValues) => ({
    id: `${uid}-${name}`,
    "aria-invalid": errors[name] ? (true as const) : undefined,
    "aria-describedby": errors[name] ? errId(name) : undefined,
  });
  const inputClass = "min-h-11 border border-ivory/25 bg-transparent px-4 py-3 text-base placeholder:text-ivory/40";
  const errorClass = "text-sm text-red-400";

  const submit = handleSubmit((values) => {
    setStatus("");
    setOk(false);
    startTransition(async () => {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...values, productInterest: [...new Set(values.productInterest)], pageUrl: window.location.href }),
      });
      setOk(response.ok);
      setStatus(response.ok ? "Your enquiry has been sent." : "We could not send the enquiry. Please try again.");
    });
  });

  return (
    <form onSubmit={submit} className="grid gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm">
          <span>Name</span>
          <input {...register("name")} {...a11y("name")} autoComplete="name" className={inputClass} />
          {errors.name && <span id={errId("name")} className={errorClass}>Enter your name.</span>}
        </label>
        <label className="grid gap-1.5 text-sm">
          <span>Email</span>
          <input {...register("email")} {...a11y("email")} type="email" autoComplete="email" className={inputClass} />
          {errors.email && <span id={errId("email")} className={errorClass}>Enter a valid email address.</span>}
        </label>
        <label className="grid gap-1.5 text-sm">
          <span>Phone / WhatsApp</span>
          <input {...register("phone")} {...a11y("phone")} autoComplete="tel" className={inputClass} />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span>Country / city</span>
          <input {...register("country")} {...a11y("country")} className={inputClass} />
        </label>
      </div>
      {extraFields ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm"><span>Company</span><input {...register("company")} className={inputClass} /></label>
          <label className="grid gap-1.5 text-sm"><span>Quantity</span><input {...register("quantity")} className={inputClass} /></label>
          <label className="grid gap-1.5 text-sm"><span>Unit</span><input {...register("unit")} className={inputClass} /></label>
          {products.length ? (
            <label className="grid gap-1.5 text-sm">
              <span>Products of interest</span>
              <select {...register("productInterest")} multiple className="min-h-32 border border-ivory/25 bg-charcoal px-4 py-3 text-base">
                {products.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
          ) : null}
        </div>
      ) : null}
      <label className="grid gap-1.5 text-sm">
        <span>Tell us about your project</span>
        <textarea {...register("message")} {...a11y("message")} rows={5} className="border border-ivory/25 bg-transparent px-4 py-3 text-base placeholder:text-ivory/40" />
        {errors.message && <span id={errId("message")} className={errorClass}>Add a short project description (at least 10 characters).</span>}
      </label>
      <p aria-live="polite" role="status" className={`text-sm ${ok ? "text-green-400" : "text-red-400"}`}>{status}</p>
      <button disabled={pending} className="min-h-11 w-fit bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-charcoal disabled:opacity-60">
        {pending ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}
