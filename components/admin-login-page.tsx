"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromPath = searchParams.get("from") ?? "/admin";
  const configError = searchParams.get("error") === "config";

  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(
    configError
      ? "Admin authentication environment variables are not configured. Contact the system administrator."
      : "",
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!password) {
      setError("Password is required.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const body = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(body.error ?? "Invalid credentials. Please try again.");
        return;
      }

      router.push(fromPath);
      router.refresh();
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
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="login-principle">
          <p>NyayaSetu</p>
          <strong>Registry administration</strong>
          <span>Secure access to judicial system records, legal requests, and audit data.</span>
        </div>
      </section>

      <section className="login-panel">
        <Link href="/" className="login-brand" aria-label="Return to NyayaSetu">
          <span>⚖</span>
          <b>Nyaya</b>
          <em>Setu</em>
        </Link>

        <div className="login-copy">
          <p className="eyebrow">Protected Administration Area</p>
          <h1>Admin Sign In</h1>
          <p>Enter the registry administration password to access the control center.</p>
        </div>

        {/* Quick fill hint for testing */}
        <div
          style={{
            margin: "18px 0 10px",
            padding: "10px 14px",
            background: "var(--sage-50)",
            border: "1px solid var(--line)",
            borderRadius: "4px",
            fontSize: "11.5px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>
            Default admin password: <code>AdminPass123!</code>
          </span>
          <button
            type="button"
            className="button secondary"
            style={{ fontSize: "10px", padding: "3px 8px" }}
            onClick={() => setPassword("AdminPass123!")}
          >
            Fill Password
          </button>
        </div>

        <form
          className="login-form"
          onSubmit={handleSubmit}
          noValidate
          aria-label="Admin login form"
        >
          <label htmlFor="admin-password">
            Administrator Password
            <div className="password-field-wrap">
              <input
                id="admin-password"
                name="admin-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter admin password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                aria-invalid={error ? "true" : undefined}
                className="form-input"
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

          {error && (
            <div className="inline-notice error" role="alert">
              {error}
            </div>
          )}

          <button
            className="button primary login-submit"
            type="submit"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className="spinner-sm" aria-hidden="true" />
                Verifying…
              </>
            ) : (
              <>
                Access Admin Panel <span aria-hidden="true">&rarr;</span>
              </>
            )}
          </button>
        </form>

        <p className="login-help">
          Admin access is restricted to authorised registry administrators only.
        </p>
        <p className="login-footer">
          NyayaSetu &bull; Respectful technology for human judgment
        </p>
      </section>
    </main>
  );
}
