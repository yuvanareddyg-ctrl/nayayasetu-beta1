"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function RegisterPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"citizen" | "advocate" | "judge">("citizen");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const form = e.currentTarget;
    const data = new FormData(form);

    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "");
    const phone = String(data.get("phone") || "").trim();
    const organization = String(data.get("organization") || "").trim();
    const barCouncilNumber = String(data.get("barCouncilNumber") || "").trim();

    if (name.length < 2) {
      setError("Please provide your full legal name.");
      return;
    }
    if (!email || !email.includes("@")) {
      setError("Please provide a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (role === "advocate" && !barCouncilNumber) {
      setError("Advocates must provide their State Bar Council Enrollment Number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          phone,
          organization,
          barCouncilNumber: role === "advocate" ? barCouncilNumber : undefined,
        }),
      });

      const body = await res.json();
      if (!res.ok) {
        setError(body.error || "Registration could not be completed.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1000);
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
          <strong>Citizen Legal Access.</strong>
          <strong>Equal Justice under Law.</strong>
          <span>
            Create your account to access statutory legal aid, track matters, or manage advocate
            consultations.
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
          <p className="eyebrow">New Account Registration</p>
          <h1>Join NyayaSetu</h1>
          <p>Select your account type and fill in your details.</p>
        </div>

        {success ? (
          <div className="signin-success" role="status">
            <span className="signin-success-icon" aria-hidden="true">
              ✓
            </span>
            <strong>Registration complete!</strong>
            <p>Welcome to NyayaSetu. Directing to your dashboard…</p>
          </div>
        ) : (
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {/* Role Selector Tabs */}
            <div>
              <span className="muted-label">Select Account Type</span>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "6px",
                  marginTop: "6px",
                }}
              >
                {(
                  [
                    { id: "citizen", label: "Citizen" },
                    { id: "advocate", label: "Advocate" },
                    { id: "judge", label: "Judicial" },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRole(item.id)}
                    className="button"
                    style={{
                      background: role === item.id ? "var(--burgundy)" : "var(--sage-50)",
                      color: role === item.id ? "#fff" : "var(--ink)",
                      border: "1px solid var(--line)",
                      fontSize: "12px",
                      padding: "8px 6px",
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="form-label">
              Full Legal Name
              <input required name="name" className="form-input" placeholder="e.g. Aarav Mehta" />
            </label>

            <label className="form-label">
              Official Email Address
              <input
                required
                type="email"
                name="email"
                className="form-input"
                placeholder={role === "judge" ? "judge@court.gov.in" : "name@example.com"}
              />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <label className="form-label">
                Mobile Number
                <input name="phone" className="form-input" placeholder="+91 98765 00000" />
              </label>

              {role === "advocate" ? (
                <label className="form-label">
                  Bar Enrollment Number
                  <input
                    required
                    name="barCouncilNumber"
                    className="form-input"
                    placeholder="e.g. D/1429/2012"
                  />
                </label>
              ) : (
                <label className="form-label">
                  Organization / Chamber
                  <input
                    name="organization"
                    className="form-input"
                    placeholder={role === "judge" ? "High Court" : "Optional"}
                  />
                </label>
              )}
            </div>

            <label className="form-label">
              Create Password (min. 8 characters)
              <div className="password-field-wrap">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  name="password"
                  minLength={8}
                  className="form-input"
                  placeholder="Choose a strong password"
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

            {error && (
              <div className="inline-notice error" role="alert">
                {error}
              </div>
            )}

            <button className="button primary login-submit" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-sm" aria-hidden="true" /> Creating account…
                </>
              ) : (
                <>
                  Complete Registration <span aria-hidden="true">&rarr;</span>
                </>
              )}
            </button>

            <div
              style={{
                textAlign: "center",
                marginTop: "14px",
                fontSize: "12.5px",
                color: "var(--muted)",
              }}
            >
              Already registered?{" "}
              <Link href="/login" className="text-link">
                Sign In Here
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

