"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { AdminCopy } from "@/lib/admin/copy-schema";

const password = z.string().min(12).max(128).regex(/[a-z]/).regex(/[A-Z]/).regex(/\d/).regex(/[^A-Za-z0-9]/);
const schema = z.object({ currentPassword: z.string().min(1).max(256), newPassword: password, confirmPassword: z.string() })
  .refine((value) => value.newPassword === value.confirmPassword, { path: ["confirmPassword"] });
type Values = z.infer<typeof schema>;
export function PasswordForm({ copy }: { copy: AdminCopy }) {
  const [apiError, setApiError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });
  return <form noValidate className="grid gap-5" onSubmit={handleSubmit(async (values) => {
    setApiError(null);
    const response = await fetch("/api/admin/account/password", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: values.currentPassword, newPassword: values.newPassword }),
    });
    if (!response.ok) { setApiError(copy.labels.loginError); return; }
    await signOut({ callbackUrl: "/admin/login?changed=true" });
  })}>
    <Input id="current-password" type="password" autoComplete="current-password" label={copy.labels.currentPassword}
      {...register("currentPassword")} error={errors.currentPassword ? copy.errors.VALIDATION : undefined} />
    <Input id="new-password" type="password" autoComplete="new-password" label={copy.labels.newPassword}
      {...register("newPassword")} error={errors.newPassword ? copy.labels.passwordRules : undefined} />
    <Input id="confirm-password" type="password" autoComplete="new-password" label={copy.labels.confirmPassword}
      {...register("confirmPassword")} error={errors.confirmPassword ? copy.errors.VALIDATION : undefined} />
    <p className="text-sm text-muted">{copy.labels.passwordRules}</p>
    {apiError && <p role="alert" className="text-sm text-red-800">{apiError}</p>}
    <Button type="submit" disabled={isSubmitting}>{copy.labels.save}</Button>
  </form>;
}
