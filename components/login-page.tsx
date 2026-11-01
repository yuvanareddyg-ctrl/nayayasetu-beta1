"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/dashboard";

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Quick preset fills for testability
  function fillPreset(pEmail: string, pPass: string) {
    setEmail(pEmail);
    setPassword(pPass);
    setError("");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Authentication failed.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        if (data.user?.role === "admin") {
          router.push("/admin");
        } else {
          router.push(from);
        }
        router.refresh();
      }, 800);
    } catch {
      setError("A network error occurred. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-illustration" aria-hidden="true">
        <div className="login-architecture">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="login-principle">
          <p>NyayaSetu</p>
          <strong>Institutional Integrity.</strong>
          <strong>Human Judicial Authority.</strong>
          <span>
            Secure digital access for citizens, verified advocates, and judicial registry officials.
          </span>
        </div>
      </section>

      <section className="login-panel">
        <Link href="/" className="login-brand" aria-label="Return to NyayaSetu">
          <span>⚖</span>
          <b>Nyaya</b>
          <em>Setu</em>
        </Link>

        <div className="login-copy">
          <p className="eyebrow">Portal Authentication</p>
          <h1>Welcome Back</h1>
          <p>Sign in with your registered email and secure password.</p>
        </div>

        {/* Quick Demo Credentials Assistant */}
        <div
          style={{
            margin: "20px 0 10px",
            padding: "12px 14px",
            background: "var(--sage-50)",
            border: "1px solid var(--line)",
            borderRadius: "4px",
            fontSize: "11.5px",
          }}
        >
          <strong style={{ display: "block", marginBottom: "6px", color: "var(--burgundy)" }}>
            ⚡ Quick Demo Logins:
          </strong>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="button secondary"
              style={{ fontSize: "10.5px", padding: "4px 7px" }}
              onClick={() => fillPreset("aarav.mehta@example.com", "Password123!")}
            >
              Citizen (Aarav)
            </button>
            <button
              type="button"
              className="button secondary"
              style={{ fontSize: "10.5px", padding: "4px 7px" }}
              onClick={() => fillPreset("priya.menon@bar.example", "Password123!")}
            >
              Advocate (Priya)
            </button>
            <button
              type="button"
              className="button secondary"
              style={{ fontSize: "10.5px", padding: "4px 7px" }}
              onClick={() => fillPreset("justice.sen@court.gov.in", "Password123!")}
            >
              Judge (Justice Sen)
            </button>
            <button
              type="button"
              className="button secondary"
              style={{ fontSize: "10.5px", padding: "4px 7px" }}
              onClick={() => fillPreset("admin@nyayasetu.gov.in", "AdminPass123!")}
            >
              Admin (Registry)
            </button>
          </div>
        </div>

        {success ? (
          <div className="signin-success" role="status">
            <span className="signin-success-icon" aria-hidden="true">
              ✓
            </span>
            <strong>Authenticated successfully.</strong>
            <p>Directing to your secure dashboard…</p>
          </div>
        ) : (
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <label className="form-label" htmlFor="login-email">
              Email Address
              <input
                id="login-email"
                type="email"
                required
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </label>

            <label className="form-label" htmlFor="login-password">
              Password
              <div className="password-field-wrap">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Link href="/forgot-password" className="text-link" style={{ fontSize: "12px" }}>
                Forgot your password?
              </Link>
            </div>

            {error && (
              <div className="inline-notice error" role="alert">
                {error}
              </div>
            )}

            <button className="button primary login-submit" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-sm" aria-hidden="true" /> Signing in…
                </>
              ) : (
                <>
                  Sign In Securely <span aria-hidden="true">&rarr;</span>
                </>
              )}
            </button>

            <div style={{ textAlign: "center", marginTop: "14px", fontSize: "12.5px", color: "var(--muted)" }}>
              Don&apos;t have an account yet?{" "}
              <Link href="/register" className="text-link">
                Register for Free
              </Link>
            </div>
          </form>
        )}

        <p className="login-footer">
          NyayaSetu &bull; Institutional technology for equal justice under law
        </p>
      </section>
    </main>
  );
}
