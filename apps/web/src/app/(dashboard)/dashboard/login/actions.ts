"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { loginResponseSchema } from "@artex/contracts";
import { SESSION_COOKIE } from "@/features/dashboard/lib/auth";

export async function login(_state: { error: string }, formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const code = String(formData.get("code") ?? "").trim();
  const base = process.env.API_INTERNAL_URL ?? "http://localhost:3000";
  const requestHeaders = await headers();
  const response = await fetch(`${base}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": requestHeaders.get("x-forwarded-for") ?? "unknown",
      "user-agent": requestHeaders.get("user-agent") ?? "",
    },
    signal: AbortSignal.timeout(15_000),
    body: JSON.stringify({ email, password, ...(code ? { code } : {}) }),
    cache: "no-store",
  }).catch(() => null);
  if (!response?.ok)
    return {
      error:
        response?.status === 429
          ? "Too many attempts. Try again later."
          : "Invalid email or password.",
    };
  const parsed = loginResponseSchema.safeParse(await response.json());
  if (!parsed.success)
    return { error: "Authentication service returned an invalid response." };
  const store = await cookies();
  store.set(SESSION_COOKIE, parsed.data.data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: new Date(parsed.data.data.expiresAt),
  });
  redirect(parsed.data.data.mfaRequired ? "/dashboard/security" : "/dashboard");
}

export async function logout() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    const base = process.env.API_INTERNAL_URL ?? "http://localhost:3000";
    await fetch(`${base}/api/v1/auth/logout`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
    }).catch(() => undefined);
  }
  store.delete(SESSION_COOKIE);
  redirect("/dashboard/login");
}
