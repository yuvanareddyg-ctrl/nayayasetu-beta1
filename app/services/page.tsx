"use client";

import Link from "next/link";
import { AppShell, PageHeader } from "@/components/shell";

export default function ServicesPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Public Portal"
        title="Legal Services &amp; Assistance"
        description="Statutory legal aid, dispute advisory, document scrutiny, and judicial tracking under the Constitution of India."
      />

      <section className="metric-grid" style={{ marginBottom: "32px" }}>
        <div className="metric-card burgundy">
          <span>NALSA Article 39A</span>
          <strong>Free</strong>
          <small>for qualified citizens</small>
        </div>
        <div className="metric-card sage">
          <span>Tele-Law Helpline</span>
          <strong>14416</strong>
          <small>toll-free nationwide</small>
        </div>
        <div className="metric-card gold">
          <span>Average Assignment</span>
          <strong>48h</strong>
          <small>to panel advocate</small>
        </div>
      </section>

      <div className="services-grid" style={{ marginBottom: "40px" }}>
        <article className="service-card">
          <div className="service-icon">📝</div>
          <h3>Apply for Free Legal Aid</h3>
          <p>
            Submit an application under the Legal Services Authorities Act, 1987. Free representation
            by approved High Court and District Court panel advocates.
          </p>
          <Link href="/services/request" className="button primary">
            Start Application &rarr;
          </Link>
        </article>

        <article className="service-card">
          <div className="service-icon">🔍</div>
          <h3>Track Case / Request Status</h3>
          <p>
            Enter your tracking ID (e.g., NS-REQ-2026-1082) or Court Case Number to view real-time
            status updates, assigned counsel, and listings.
          </p>
          <Link href="/services/track" className="button secondary">
            Track Status &rarr;
          </Link>
        </article>

        <article className="service-card">
          <div className="service-icon">👥</div>
          <h3>Find Verified Advocates</h3>
          <p>
            Search certified advocates and legal experts by jurisdiction, practice area, and
            availability. Book consultation appointments directly.
          </p>
          <Link href="/people" className="button secondary">
            Open Directory &rarr;
          </Link>
        </article>

        <article className="service-card">
          <div className="service-icon">📄</div>
          <h3>Document Scrutiny &amp; Health</h3>
          <p>
            Pre-filing verification of writ petitions, counter affidavits, and annexures to prevent
            defects and registry objections before listing.
          </p>
          <Link href="/ai-workspace" className="button secondary">
            Review Desk &rarr;
          </Link>
        </article>

        <article className="service-card">
          <div className="service-icon">🏛</div>
          <h3>Daily Court Cause Lists</h3>
          <p>
            Inspect daily cause lists with transparent readiness indicators and estimated hearing
            durations for courtroom planning.
          </p>
          <Link href="/cause-list" className="button secondary">
            View Cause List &rarr;
          </Link>
        </article>

        <article className="service-card">
          <div className="service-icon">⚖</div>
          <h3>Mediation &amp; Lok Adalat</h3>
          <p>
            Explore pre-litigation settlement through National Lok Adalat and court-annexed mediation
            centers for swift, amicable dispute resolution.
          </p>
          <Link href="/services/request" className="button secondary">
            Request Mediation &rarr;
          </Link>
        </article>
      </div>

      <div className="panel" style={{ padding: "30px", marginTop: "24px" }}>
        <h3 style={{ fontFamily: "Libre Baskerville, serif", fontSize: "20px", margin: "0 0 10px" }}>
          Statutory Eligibility Guidelines
        </h3>
        <p style={{ color: "var(--muted)", fontSize: "14px", lineHeight: "1.6", margin: "0 0 18px" }}>
          Under Section 12 of the Legal Services Authorities Act, 1987, the following persons are entitled
          to free legal services across all Indian courts:
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "13px", color: "var(--ink)" }}>
          <div style={{ background: "var(--sage-50)", padding: "14px 18px", borderRadius: "var(--radius-sm)" }}>
            <strong>Section 12(a) - 12(c):</strong>
            <ul style={{ margin: "6px 0 0", paddingLeft: "18px", color: "var(--muted)", lineHeight: "1.5" }}>
              <li>Member of a Scheduled Caste or Scheduled Tribe</li>
              <li>Victim of trafficking in human beings or beggar</li>
              <li>A woman or a child</li>
            </ul>
          </div>
          <div style={{ background: "var(--sage-50)", padding: "14px 18px", borderRadius: "var(--radius-sm)" }}>
            <strong>Section 12(d) - 12(h):</strong>
            <ul style={{ margin: "6px 0 0", paddingLeft: "18px", color: "var(--muted)", lineHeight: "1.5" }}>
              <li>A person with disability as defined in the Rights of Persons with Disabilities Act</li>
              <li>Victim of mass disaster, ethnic violence, caste atrocity, flood, or drought</li>
              <li>An industrial workman</li>
              <li>A person in custody, including custody in a protective home</li>
            </ul>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

