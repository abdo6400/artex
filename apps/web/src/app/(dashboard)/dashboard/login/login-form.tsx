"use client";

import { useActionState, useState } from "react";
import { Icon } from "@/features/dashboard/shell/icons";
import { login } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, { error: "" });
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action} className="login-card">
      <div className="login-heading">
        <span className="eyebrow">WELCOME BACK</span>
        <h1>Sign in to your dashboard</h1>
        <p>Use your administrator credentials to continue.</p>
      </div>

      <div className="login-field">
        <label htmlFor="email">Email address</label>
        <div className="login-input-wrap">
          <Icon name="mail" size={18} />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            placeholder="name@artexproduction.com"
            required
            autoFocus
          />
        </div>
      </div>

      <div className="login-field">
        <label htmlFor="password">Password</label>
        <div className="login-input-wrap">
          <Icon name="lock" size={18} />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            minLength={12}
            required
          />
          <button
            type="button"
            className="login-password-toggle"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <Icon name={showPassword ? "eyeOff" : "eye"} size={18} />
          </button>
        </div>
      </div>

      {state.error && (
        <p className="login-error" role="alert">
          <Icon name="alert" size={16} />
          {state.error}
        </p>
      )}

      <div className="login-field">
        <div className="login-label-row">
          <label htmlFor="code">Authenticator code</label>
          <span>OPTIONAL</span>
        </div>
        <div className="login-input-wrap">
          <Icon name="shield" size={18} />
          <input
            id="code"
            name="code"
            inputMode="numeric"
            pattern="[0-9]{6}"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="6-digit code"
          />
        </div>
      </div>

      <button className="login-submit" disabled={pending}>
        <span>{pending ? "Signing in…" : "Sign in securely"}</span>
        {!pending && <Icon name="arrowRight" size={17} />}
      </button>

      <p className="login-help">
        Access is limited to authorized Artex team members.
      </p>
    </form>
  );
}
