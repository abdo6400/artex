"use client";

import { useState, type FormEvent } from "react";
import { mfaSetupResponseSchema } from "@artex/contracts";

export function MfaEnrollment() {
  const [secret, setSecret] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  async function begin() {
    setPending(true);
    try {
      const response = await fetch("/api/mfa", { method: "POST" });
      const result = mfaSetupResponseSchema.safeParse(await response.json());
      if (!response.ok || !result.success)
        throw new Error("Could not start enrollment.");
      setSecret(result.data.data.secret);
    } catch {
      setNotice("Could not start enrollment. Please try again.");
    } finally {
      setPending(false);
    }
  }
  async function confirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = String(new FormData(event.currentTarget).get("code") ?? "");
    setPending(true);
    try {
      const response = await fetch("/api/mfa", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (response.ok) window.location.replace("/");
      else
        setNotice(
          "Invalid or expired code. Try the next code from your authenticator.",
        );
    } catch {
      setNotice("Could not confirm enrollment.");
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <p>
        Protect your account with a time-based authenticator. Owner accounts
        must complete this step before accessing production administration.
      </p>
      {!secret ? (
        <button disabled={pending} onClick={begin}>
          Set up authenticator
        </button>
      ) : (
        <>
          <p>
            Add an account named Artex in your authenticator, choose a
            time-based code, and enter this setup key:
          </p>
          <code style={{ overflowWrap: "anywhere" }}>{secret}</code>
          <p>Keep this key private. Enter a current code to confirm setup.</p>
          <form onSubmit={confirm}>
            <label htmlFor="mfa-code">Authenticator code</label>
            <input
              id="mfa-code"
              name="code"
              inputMode="numeric"
              pattern="[0-9]{6}"
              autoComplete="one-time-code"
              required
              maxLength={6}
            />
            <button disabled={pending}>Verify and enable</button>
          </form>
        </>
      )}
      {notice && <p role="alert">{notice}</p>}
    </>
  );
}
