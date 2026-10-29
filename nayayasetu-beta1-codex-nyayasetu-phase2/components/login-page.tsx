"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type FieldError = { username?: string[]; email?: string[] };

export function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});
  const [globalError, setGlobalError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setGlobalError("");

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      username: String(data.get("username") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
    };

    // Client-side pre-check
    const clientErrors: FieldError = {};
    if (payload.username.length < 2)
      clientErrors.username = ["Username must be at least 2 characters."];
    if (!payload.email.includes("@"))
      clientErrors.email = ["Enter a valid email address."];
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = (await response.json()) as {
        error?: string;
        issues?: FieldError;
      };

      if (!response.ok) {
        if (body.issues) {
          setFieldErrors(body.issues);
        } else {
          setGlobalError(
            body.error ?? "Unable to sign in. Please try again.",
          );
        }
        return;
      }

      setSuccess(true);
      // Redirect to the case board after a short delay
      setTimeout(() => router.push("/"), 1500);
    } catch {
      setGlobalError("A network error occurred. Please try again.");
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
          <strong>AI assists.</strong>
          <strong>Human Judge decides.</strong>
          <span>
            Judicial case management, with the Court always in control.
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
          <p className="eyebrow">Secure judicial workspace</p>
          <h1>Welcome back</h1>
          <p>Sign in to open your case board and the Court&apos;s working record.</p>
        </div>

        {success ? (
          <div className="signin-success" role="status">
            <span className="signin-success-icon" aria-hidden="true">✓</span>
            <strong>Signed in successfully.</strong>
            <p>Opening your case board…</p>
          </div>
        ) : (
          <form
            className="login-form"
            onSubmit={handleSubmit}
            noValidate
            aria-label="Sign-in form"
          >
            {/* Username */}
            <label htmlFor="signin-username">
              Name
              <input
                id="signin-username"
                name="username"
                type="text"
                autoComplete="name"
                placeholder="Justice A. Kumar"
                required
                minLength={2}
                maxLength={80}
                aria-describedby={
                  fieldErrors.username ? "signin-username-error" : undefined
                }
                aria-invalid={fieldErrors.username ? "true" : undefined}
                disabled={loading}
              />
              {fieldErrors.username && (
                <span
                  id="signin-username-error"
                  className="field-error"
                  role="alert"
                >
                  {fieldErrors.username[0]}
                </span>
              )}
            </label>

            {/* Email */}
            <label htmlFor="signin-email">
              Official email address
              <input
                id="signin-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="name@court.gov.in"
                required
                maxLength={254}
                aria-describedby={
                  fieldErrors.email ? "signin-email-error" : undefined
                }
                aria-invalid={fieldErrors.email ? "true" : undefined}
                disabled={loading}
              />
              {fieldErrors.email && (
                <span
                  id="signin-email-error"
                  className="field-error"
                  role="alert"
                >
                  {fieldErrors.email[0]}
                </span>
              )}
            </label>

            {globalError && (
              <div className="inline-notice error" role="alert">
                {globalError}
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
                  Signing in…
                </>
              ) : (
                <>
                  Sign in securely <span aria-hidden="true">→</span>
                </>
              )}
            </button>
          </form>
        )}

        <p id="access-support" className="login-help">
          This is a protected workspace. For account access or assistance,
          contact the registry administrator.
        </p>
        <p className="login-footer">
          NyayaSetu · Respectful technology for human judgment
        </p>
      </section>
    </main>
  );
}
