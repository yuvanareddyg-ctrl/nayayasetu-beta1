"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromPath = searchParams.get("from") ?? "/admin";
  const configError = searchParams.get("error") === "config";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    configError
      ? "Admin authentication environment variables are not configured. Contact the system administrator."
      : "",
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const form = event.currentTarget;
    const password = String(
      new FormData(form).get("admin-password") ?? "",
    );

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
          <span>Secure access to judicial system records and audit data.</span>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-brand" aria-label="NyayaSetu Admin">
          <span>⚖</span>
          <b>Nyaya</b>
          <em>Setu</em>
        </div>

        <div className="login-copy">
          <p className="eyebrow">Protected administration area</p>
          <h1>Admin sign in</h1>
          <p>Enter the registry administration password to continue.</p>
        </div>

        <form
          className="login-form"
          onSubmit={handleSubmit}
          noValidate
          aria-label="Admin login form"
        >
          <label htmlFor="admin-password">
            Administrator password
            <input
              id="admin-password"
              name="admin-password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter admin password"
              required
              disabled={loading || configError}
              aria-invalid={error ? "true" : undefined}
            />
          </label>

          {error && (
            <div className="inline-notice error" role="alert">
              {error}
            </div>
          )}

          <button
            className="button primary login-submit"
            type="submit"
            disabled={loading || configError}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className="spinner-sm" aria-hidden="true" />
                Verifying…
              </>
            ) : (
              <>
                Access admin panel <span aria-hidden="true">→</span>
              </>
            )}
          </button>
        </form>

        <p className="login-help">
          Admin access is restricted to authorised registry administrators only.
        </p>
        <p className="login-footer">
          NyayaSetu · Respectful technology for human judgment
        </p>
      </section>
    </main>
  );
}
