"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/shell";
import type { PlatformStats } from "@/lib/types";

export function Homepage() {
  const [stats, setStats] = useState<PlatformStats>({
    totalCases: 4,
    activeMatters: 4,
    priorityMatters: 3,
    totalUsers: 4,
    totalRequests: 3,
    pendingRequests: 2,
    completedRequests: 1,
    verifiedAdvocates: 6,
    todayHearings: 4,
  });

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const data = await res.json();
          if (data.stats) setStats(data.stats);
        }
      } catch {
        // Fallback to initial stats
      }
    })();
  }, []);

  return (
    <AppShell>
      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="hero-section" aria-label="Introduction">
        <div className="hero-badge">
          <span>⚖</span> Official Legal Aid &amp; Judicial Workspace
        </div>
        <h1 className="hero-title">
          Connecting Citizens to Justice.
          <br />
          <em>AI Assists — Human Judge Decides.</em>
        </h1>
        <p className="hero-lead">
          NayayaSetu bridges citizens, advocates, and the judiciary with a calm, transparent,
          and secure digital workspace. From free legal aid representation to judicial
          cause-list planning and file health orientation.
        </p>

        <div className="hero-actions">
          <Link href="/services/request" className="button primary button-lg">
            Apply for Free Legal Aid →
          </Link>
          <Link href="/services/track" className="button secondary button-lg">
            Track Case / Request
          </Link>
          <Link href="/case-board" className="button secondary button-lg">
            Open Judicial Case Register
          </Link>
        </div>

        {/* Live Application Data Statistics */}
        <div className="hero-stats-banner" aria-label="Live platform statistics">
          <div className="hero-stat-item">
            <strong>{stats.totalCases}</strong>
            <span>Active Matters on Board</span>
          </div>
          <div className="hero-stat-item">
            <strong>{stats.verifiedAdvocates}</strong>
            <span>Verified Panel Advocates</span>
          </div>
          <div className="hero-stat-item">
            <strong>{stats.totalRequests}</strong>
            <span>Legal Aid Requests Lodged</span>
          </div>
          <div className="hero-stat-item">
            <strong>{stats.todayHearings}</strong>
            <span>Scheduled Cause Matters</span>
          </div>
        </div>
      </section>

      {/* ── Constitutional & Institutional Principle ─────────────────────── */}
      <section style={{ margin: "40px 0" }}>
        <div className="review-banner" style={{ padding: "18px 22px" }}>
          <span style={{ fontSize: "22px" }} aria-hidden="true">
            🏛
          </span>
          <div>
            <strong style={{ fontSize: "13px" }}>
              Constitutional Mandate &bull; Article 39A of the Constitution of India
            </strong>
            <p style={{ fontSize: "13.5px", marginTop: "4px" }}>
              The State shall secure that the operation of the legal system promotes justice on a
              basis of equal opportunity, and shall, in particular, provide free legal aid to ensure
              that opportunities for securing justice are not denied to any citizen by reason of
              economic or other disabilities.
            </p>
          </div>
        </div>
      </section>

      {/* ── Main Services & Features ─────────────────────────────────────── */}
      <section className="home-section" id="services">
        <div className="home-section-header">
          <span className="eyebrow">Comprehensive Capabilities</span>
          <h2>Empowering Citizens, Advocates, &amp; Courts</h2>
          <p>
            Whether you are a citizen needing statutory legal representation or a registry
            preparing files for court, NayayaSetu delivers reliable, deterministic assistance.
          </p>
        </div>

        <div className="services-grid">
          <article className="service-card">
            <div className="service-icon">⚖</div>
            <h3>Free Legal Aid &amp; Advisory</h3>
            <p>
              Submit legal assistance requests under NALSA guidelines. Eligible citizens, women,
              scheduled communities, and workers receive dedicated panel advocate assignment.
            </p>
            <Link href="/services/request" className="text-link">
              Submit Assistance Request <span>&rarr;</span>
            </Link>
          </article>

          <article className="service-card">
            <div className="service-icon">🔍</div>
            <h3>Case &amp; Request Tracking</h3>
            <p>
              Check the live status of your application or court proceeding using your case number
              or tracking ID. Real-time timeline transparency from submission to resolution.
            </p>
            <Link href="/services/track" className="text-link">
              Track Your Matter <span>&rarr;</span>
            </Link>
          </article>

          <article className="service-card">
            <div className="service-icon">👥</div>
            <h3>Advocate &amp; Expert Directory</h3>
            <p>
              Access verified Bar Council advocates across High Courts and District Courts.
              Schedule consultations and review practice areas and contact registry records.
            </p>
            <Link href="/people" className="text-link">
              Browse Advocate Directory <span>&rarr;</span>
            </Link>
          </article>

          <article className="service-card">
            <div className="service-icon">✦</div>
            <h3>AI File Integrity &amp; Health</h3>
            <p>
              Automated deterministic file health checks detect missing annexures, duplicate filings,
              and document discrepancies before matters reach the courtroom bench.
            </p>
            <Link href="/ai-workspace" className="text-link">
              Launch Review Desk <span>&rarr;</span>
            </Link>
          </article>

          <article className="service-card">
            <div className="service-icon">≡</div>
            <h3>Cause List &amp; Readiness</h3>
            <p>
              Plan daily court proceedings with estimated hearing durations, document readiness
              scores, and courtroom sequencing designed for judicial tranquility.
            </p>
            <Link href="/cause-list" className="text-link">
              View Court Cause List <span>&rarr;</span>
            </Link>
          </article>

          <article className="service-card">
            <div className="service-icon">▤</div>
            <h3>Judicial Drafting Studio</h3>
            <p>
              Prepare safe, editable working orders, notices, and case notes. All drafts remain
              strictly unapproved until evaluated, amended, and signed by the presiding judge.
            </p>
            <Link href="/drafting" className="text-link">
              Open Drafting Studio <span>&rarr;</span>
            </Link>
          </article>
        </div>
      </section>

      {/* ── Step-by-Step User Journey ─────────────────────────────────────── */}
      <section className="home-section" id="how-it-works">
        <div className="home-section-header">
          <span className="eyebrow">User Journey</span>
          <h2>How NayayaSetu Works</h2>
          <p>
            A four-step pathway ensuring transparent progress for every legal inquiry and court matter.
          </p>
        </div>

        <div className="journey-grid">
          <div className="step-card">
            <div className="step-num-badge">1</div>
            <h3>Lodge Request or File</h3>
            <p>
              Citizens submit legal aid applications or counsel file petitions with supporting
              annexures through the verified digital portal.
            </p>
          </div>

          <div className="step-card">
            <div className="step-num-badge">2</div>
            <h3>Scrutiny &amp; Assignment</h3>
            <p>
              The registry performs deterministic document health checks and assigns the matter to an
              approved panel advocate or jurisdictional court bench.
            </p>
          </div>

          <div className="step-card">
            <div className="step-num-badge">3</div>
            <h3>Orientation &amp; Precedents</h3>
            <p>
              Advisory orientation summaries and relevant legal authorities are organized to assist,
              never replace, judicial reasoning.
            </p>
          </div>

          <div className="step-card">
            <div className="step-num-badge">4</div>
            <h3>Hearing &amp; Outcome</h3>
            <p>
              Matters proceed to hearing in order of readiness. Judges consider oral submissions and
              record reasoned, human judicial orders.
            </p>
          </div>
        </div>
      </section>

      {/* ── Government Legal Schemes & Institutional Info ─────────────────── */}
      <section className="home-section">
        <div className="panel" style={{ padding: "32px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr .8fr", gap: "30px", alignItems: "center" }}>
            <div>
              <span className="eyebrow">Institutional Integration</span>
              <h2 style={{ fontFamily: "Libre Baskerville, serif", fontSize: "24px", margin: "6px 0 12px" }}>
                Aligned with National Legal Services Framework
              </h2>
              <p style={{ color: "var(--muted)", fontSize: "14px", lineHeight: "1.6", margin: "0 0 18px" }}>
                NayayaSetu functions in synergy with statutory bodies established under the Legal Services
                Authorities Act, 1987. Free legal services are provided through National Legal Services
                Authority (NALSA), State Legal Services Authorities (SLSA), and District Legal Services
                Authorities (DLSA).
              </p>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <span className="status-pill ready">NALSA 24/7 Helpline: 15100</span>
                <span className="status-pill listed">Tele-Law Advice: 14416</span>
                <span className="status-pill under-review">Nyaya Bandhu (Pro Bono)</span>
              </div>
            </div>

            <div style={{ background: "var(--sage-50)", padding: "20px", borderRadius: "var(--radius)", border: "1px solid var(--line)" }}>
              <strong style={{ fontSize: "13px", display: "block", marginBottom: "8px" }}>
                Who Qualifies for Free Legal Aid?
              </strong>
              <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", color: "var(--muted)", lineHeight: "1.6" }}>
                <li>Women and children</li>
                <li>Members of SC / ST communities</li>
                <li>Industrial workmen and laborers</li>
                <li>Victims of mass disasters, ethnic violence, or flood</li>
                <li>Persons in custody or protective custody</li>
                <li>Citizens with annual income below statutory limits</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Frequently Asked Questions ───────────────────────────────────── */}
      <section className="home-section" id="faq">
        <div className="home-section-header">
          <span className="eyebrow">Common Inquiries</span>
          <h2>Frequently Asked Questions</h2>
          <p>Clear, plain-language answers regarding court processes and platform tools.</p>
        </div>

        <div className="faq-grid">
          <details className="faq-card" open>
            <summary>Does NayayaSetu replace human judges or court officials?</summary>
            <p>
              No. Our foundational principle is strictly &ldquo;AI Assists — Human Judge Decides.&rdquo;
              Digital tools only assist with document health checks, finding precedents, and formatting
              provisional drafts. Every decision, finding, and order is made by a human judicial officer.
            </p>
          </details>

          <details className="faq-card">
            <summary>How can I get free legal aid representation for my case?</summary>
            <p>
              Click on &ldquo;Apply for Free Legal Aid&rdquo;, select your matter category, describe your dispute,
              and upload any relevant documents. If you meet the criteria under Section 12 of the Legal
              Services Authorities Act, a verified panel advocate will be assigned to represent you free of charge.
            </p>
          </details>

          <details className="faq-card">
            <summary>How do I track the progress of my filed application?</summary>
            <p>
              Use the &ldquo;Track Case / Request&rdquo; feature in the menu or on your dashboard. Enter your tracking
              ID (e.g. NS-REQ-2026-1082) or court case number to see the complete audit history, assigned
              counsel, and next hearing date.
            </p>
          </details>

          <details className="faq-card">
            <summary>How is my document privacy and confidential file data protected?</summary>
            <p>
              All submissions are encrypted and processed through role-based access control. Only authorized
              registry officials, assigned panel counsel, and presiding judges have access to your indexed documents.
            </p>
          </details>
        </div>
      </section>

      {/* ── Contact & Support Section ────────────────────────────────────── */}
      <section className="home-section" id="support">
        <div className="home-section-header">
          <span className="eyebrow">Registry Support</span>
          <h2>Contact Registry Helpdesk</h2>
          <p>Direct contact points for citizen inquiries, advocate assistance, and technical registry support.</p>
        </div>

        <div className="contact-grid">
          <div className="helpline-box">
            <div className="helpline-item">
              <span className="helpline-icon">📞</span>
              <div className="helpline-info">
                <strong>National Tele-Law Toll-Free</strong>
                <span>14416 &bull; Available 24 Hours &bull; Multiple Indian Languages</span>
              </div>
            </div>

            <div className="helpline-item">
              <span className="helpline-icon">⚖</span>
              <div className="helpline-info">
                <strong>NALSA Legal Aid Helpline</strong>
                <span>15100 &bull; For Indigent Litigants &amp; Urgent Advice</span>
              </div>
            </div>

            <div className="helpline-item">
              <span className="helpline-icon">✉</span>
              <div className="helpline-info">
                <strong>Registry Official Email</strong>
                <span>registry@nyayasetu.gov.in &bull; Replies within 24 working hours</span>
              </div>
            </div>
          </div>

          <div className="panel" style={{ padding: "26px" }}>
            <h3 style={{ fontFamily: "Libre Baskerville, serif", fontSize: "18px", margin: "0 0 14px" }}>
              Quick Assistance Inquiry
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Thank you. Your inquiry has been dispatched to the registry helpdesk.");
                (e.target as HTMLFormElement).reset();
              }}
              style={{ display: "grid", gap: "12px" }}
            >
              <label className="form-label">
                Your Full Name
                <input required className="form-input" placeholder="e.g. Rajat Verma" />
              </label>
              <label className="form-label">
                Email or Phone Number
                <input required className="form-input" placeholder="name@example.com or +91 98..." />
              </label>
              <label className="form-label">
                Nature of Inquiry
                <textarea required className="form-textarea" rows={3} placeholder="Describe your question or case inquiry..." />
              </label>
              <button type="submit" className="button primary">
                Send Helpdesk Message &rarr;
              </button>
            </form>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

