"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Reset token is missing. Please request a new password reset link.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Reset failed.");
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch {
      setError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-illustration" aria-hidden="true">
        <div className="login-architecture">
          <span /><span /><span /><span /><span />
        </div>
        <div className="login-principle">
          <p>NyayaSetu</p>
          <strong>Set New Password</strong>
          <span>Choose a robust password to secure your account.</span>
        </div>
      </section>

      <section className="login-panel">
        <Link href="/" className="login-brand">
          <span>⚖</span>
          <b>Nyaya</b>
          <em>Setu</em>
        </Link>

        <div className="login-copy">
          <p className="eyebrow">Security Update</p>
          <h1>Create New Password</h1>
          <p>Enter your new password below to update your login credentials.</p>
        </div>

        {success ? (
          <div className="signin-success" role="status">
            <span className="signin-success-icon" aria-hidden="true">✓</span>
            <strong>Password reset complete!</strong>
            <p>Redirecting you to the sign-in page…</p>
          </div>
        ) : (
          <form className="login-form" onSubmit={handleSubmit}>
            <label className="form-label">
              New Password (min 8 chars)
              <div className="password-field-wrap">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  minLength={8}
                  className="form-input"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <label className="form-label">
              Confirm New Password
              <input
                required
                type="password"
                className="form-input"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </label>

            {error && <div className="inline-notice error" role="alert">{error}</div>}

            <button className="button primary login-submit" type="submit" disabled={loading}>
              {loading ? "Updating password…" : "Reset & Save Password →"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="login-page" style={{ padding: "40px", textAlign: "center" }}>Loading…</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
