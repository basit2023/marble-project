"use client";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { PublicCopy } from "@/lib/public/copy-schema";

const schema = z.object({ email: z.email() });

export function NewsletterForm({ copy }: { copy?: PublicCopy }) {
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const uid = useId();
  const errorId = `${uid}-error`;
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  const t = {
    intro: copy?.labels.newsletterIntro ?? "Receive occasional material, project and exhibition updates.",
    email: copy?.labels.email ?? "Email address",
    subscribe: copy?.labels.subscribe ?? "Subscribe",
    subscribing: copy?.labels.subscribing ?? "Subscribing…",
    subscribed: copy?.labels.subscribed ?? "Thank you for subscribing.",
    error: copy?.labels.newsletterError ?? "Please enter a valid email address.",
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit(async (values) => {
        setStatus("idle");
        const response = await fetch("/api/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (response.ok) { setStatus("ok"); reset(); } else { setStatus("error"); }
      })}
      className="grid gap-3"
    >
      <p className="text-sm text-ivory/70">{t.intro}</p>
      <label className="sr-only" htmlFor={`${uid}-email`}>{t.email}</label>
      <div className="flex">
        <input
          id={`${uid}-email`}
          type="email"
          autoComplete="email"
          placeholder={t.email}
          {...register("email")}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? errorId : undefined}
          className="min-h-11 min-w-0 flex-1 border border-white/15 bg-white/10 px-3 text-base text-ivory placeholder:text-ivory/50"
        />
        <button type="submit" disabled={isSubmitting} className="min-h-11 bg-accent px-4 text-sm font-semibold text-charcoal disabled:opacity-60">
          {isSubmitting ? t.subscribing : t.subscribe}
        </button>
      </div>
      <p aria-live="polite" className="text-sm text-ivory/70">
        {errors.email || status === "error" ? (
          <span id={errorId} role="alert" className="text-red-300">{t.error}</span>
        ) : status === "ok" ? (
          <span>{t.subscribed}</span>
        ) : null}
      </p>
    </form>
  );
}
