"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [devResetLink, setDevResetLink] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");
    setDevResetLink("");

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to send reset instructions.");
        return;
      }
      setMessage(data.message);
      if (data.devResetLink) {
        setDevResetLink(data.devResetLink);
      }
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
          <strong>Account Recovery</strong>
          <span>Secure credentials reset for authorized users.</span>
        </div>
      </section>

      <section className="login-panel">
        <Link href="/" className="login-brand">
          <span>⚖</span>
          <b>Nyaya</b>
          <em>Setu</em>
        </Link>

        <div className="login-copy">
          <p className="eyebrow">Password Recovery</p>
          <h1>Reset Password</h1>
          <p>Enter your registered email address and we will dispatch recovery instructions.</p>
        </div>

        {message ? (
          <div className="panel" style={{ padding: "20px", marginTop: "24px" }}>
            <div className="inline-notice" style={{ margin: 0 }}>
              {message}
            </div>
            {devResetLink && (
              <div style={{ marginTop: "16px", padding: "12px", background: "var(--sage-50)", borderRadius: "4px" }}>
                <span className="muted-label">Testing Quick Link:</span>
                <Link href={devResetLink} className="text-link" style={{ fontSize: "12.5px" }}>
                  Proceed to Reset Password Page &rarr;
                </Link>
              </div>
            )}
            <div style={{ marginTop: "18px" }}>
              <Link href="/login" className="button secondary">
                &larr; Return to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form className="login-form" onSubmit={handleSubmit}>
            <label className="form-label" htmlFor="forgot-email">
              Registered Email Address
              <input
                id="forgot-email"
                type="email"
                required
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </label>

            {error && <div className="inline-notice error" role="alert">{error}</div>}

            <button className="button primary login-submit" type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link →"}
            </button>

            <div style={{ textAlign: "center", marginTop: "14px" }}>
              <Link href="/login" className="text-link" style={{ fontSize: "12.5px" }}>
                Remember your password? Sign in
              </Link>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}

