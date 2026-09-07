"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Route } from "next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { AdminCopy } from "@/lib/admin/copy-schema";

const schema = z.object({ email: z.email(), password: z.string().min(1).max(256) });
type Values = z.infer<typeof schema>;
export function LoginForm({ copy, callbackUrl }: { copy: AdminCopy; callbackUrl: string }) {
  const router = useRouter();
  const [error, setError] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });
  return <form noValidate className="grid gap-5" onSubmit={handleSubmit(async (values) => {
    setError(false);
    const result = await signIn("credentials", { ...values, redirect: false });
    if (result?.error) { setError(true); return; }
    router.push(callbackUrl as Route);
    router.refresh();
  })}>
    <Input id="login-email" type="email" autoComplete="username" label={copy.labels.email} {...register("email")}
      error={errors.email ? copy.errors.VALIDATION : undefined} />
    <Input id="login-password" type="password" autoComplete="current-password" label={copy.labels.password} {...register("password")}
      error={errors.password ? copy.errors.VALIDATION : undefined} />
    {error && <p role="alert" className="text-sm text-red-800">{copy.labels.loginError}</p>}
    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? copy.labels.signingIn : copy.labels.signIn}</Button>
  </form>;
}
