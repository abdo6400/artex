import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { sessionResponseSchema } from "@artex/contracts";
import { SESSION_COOKIE } from "@/features/dashboard/lib/auth";
import { MfaEnrollment } from "./mfa-enrollment";

export default async function SecurityPage() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) redirect("/dashboard/login");
  const response = await fetch(
    `${process.env.API_INTERNAL_URL ?? "http://localhost:3000"}/api/v1/auth/session`,
    { headers: { authorization: `Bearer ${token}` }, cache: "no-store" },
  );
  if (!response.ok) redirect("/dashboard/login");
  const session = sessionResponseSchema.parse(await response.json());
  return (
    <main className="login-page">
      <section className="login-card">
        <h1>Account security</h1>
        {session.data.mfaEnabled ? (
          <>
            <p>Authenticator verification is enabled for this account.</p>
            <Link href="/dashboard">Return to dashboard</Link>
          </>
        ) : (
          <MfaEnrollment />
        )}
      </section>
    </main>
  );
}
