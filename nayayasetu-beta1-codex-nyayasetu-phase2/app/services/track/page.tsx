"use client";

import Link from "next/link";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell, LoadingPanel, PageHeader } from "@/components/shell";
import type { CaseRecord, LegalRequestRecord } from "@/lib/types";
import { formatDate, formatDateTime } from "@/lib/client-api";

function TrackContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "";

  const [query, setQuery] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [requestResult, setRequestResult] = useState<LegalRequestRecord | null>(null);
  const [caseResult, setCaseResult] = useState<CaseRecord | null>(null);
  const [error, setError] = useState("");

  async function performSearch(targetId: string) {
    if (!targetId.trim()) return;
    setLoading(true);
    setError("");
    setRequestResult(null);
    setCaseResult(null);

    try {
      // 1. Try legal requests
      const reqRes = await fetch(`/api/services/requests/${encodeURIComponent(targetId.trim())}`);
      if (reqRes.ok) {
        const data = await reqRes.json();
        if (data.request) {
          setRequestResult(data.request);
          setLoading(false);
          return;
        }
      }

      // 2. Try court cases
      const caseRes = await fetch(`/api/cases/${encodeURIComponent(targetId.trim())}`);
      if (caseRes.ok) {
        const caseData = await caseRes.json();
        if (caseData.case) {
          setCaseResult(caseData.case);
          setLoading(false);
          return;
        }
      }

      // 3. Fallback: search query endpoint
      const searchRes = await fetch(`/api/search?q=${encodeURIComponent(targetId.trim())}`);
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (searchData.requests?.length > 0) {
          setRequestResult(searchData.requests[0]);
          setLoading(false);
          return;
        }
        if (searchData.cases?.length > 0) {
          setCaseResult(searchData.cases[0]);
          setLoading(false);
          return;
        }
      }

      setError(`No active record found matching "${targetId}". Please verify the reference number.`);
    } catch {
      setError("Unable to retrieve tracking records. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialId) {
      void performSearch(initialId);
    }
  }, [initialId]);

  function handleSearchSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void performSearch(query);
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Registry Tracking"
        title="Track Case or Legal Request"
        description="Check real-time status, timeline milestones, and assigned counsel using your reference number."
      />

      {/* Search Input Box */}
      <section className="panel" style={{ padding: "26px", maxWidth: "780px", margin: "0 auto 30px" }}>
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
          <label className="form-label" style={{ flex: 1 }}>
            Reference Number (Tracking ID or Case Number)
            <input
              required
              className="form-input"
              placeholder="e.g. NS-REQ-2026-1082 or W.P. (C) 1842/2026"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <button type="submit" className="button primary" disabled={loading} style={{ height: "42px" }}>
            {loading ? "Tracking…" : "Track Matter →"}
          </button>
        </form>

        <div style={{ marginTop: "12px", fontSize: "11.5px", color: "var(--muted)" }}>
          Sample numbers:{" "}
          <button
            type="button"
            className="text-link"
            style={{ fontSize: "11.5px" }}
            onClick={() => {
              setQuery("NS-REQ-2026-1082");
              void performSearch("NS-REQ-2026-1082");
            }}
          >
            NS-REQ-2026-1082
          </button>{" "}
          &bull;{" "}
          <button
            type="button"
            className="text-link"
            style={{ fontSize: "11.5px" }}
            onClick={() => {
              setQuery("W.P. (C) 1842/2026");
              void performSearch("W.P. (C) 1842/2026");
            }}
          >
            W.P. (C) 1842/2026
          </button>
        </div>
      </section>

      {loading && <LoadingPanel label="Querying judicial registry..." />}

      {error && !loading && (
        <div className="panel state-panel error" style={{ maxWidth: "780px", margin: "0 auto" }}>
          <strong>Record Not Located</strong>
          <p>{error}</p>
        </div>
      )}

      {/* Legal Request Result */}
      {requestResult && !loading && (
        <article className="panel" style={{ padding: "30px", maxWidth: "860px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <span className="eyebrow">{requestResult.requestNumber}</span>
              <h2 style={{ fontFamily: "Libre Baskerville, serif", fontSize: "22px", margin: "4px 0 8px" }}>
                {requestResult.subject}
              </h2>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--muted)" }}>
                Applicant: <strong>{requestResult.applicantName}</strong> &bull; Category:{" "}
                <strong>{requestResult.category}</strong>
              </p>
            </div>
            <span className={`status-pill ${requestResult.status.toLowerCase().replaceAll(" ", "-")}`}>
              {requestResult.status}
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "14px",
              background: "var(--sage-50)",
              padding: "16px",
              borderRadius: "var(--radius-sm)",
              margin: "20px 0",
            }}
          >
            <div>
              <span className="muted-label">Service Type</span>
              <strong>{requestResult.serviceType}</strong>
            </div>
            <div>
              <span className="muted-label">Priority Level</span>
              <strong>{requestResult.priority}</strong>
            </div>
            <div>
              <span className="muted-label">Assigned Advocate</span>
              <strong>
                {requestResult.assignedLawyer?.name || "Pending Panel Selection"}
              </strong>
            </div>
          </div>

          <h3 style={{ fontFamily: "Libre Baskerville, serif", fontSize: "16px", margin: "20px 0 10px" }}>
            Matter Particulars
          </h3>
          <p style={{ fontSize: "13.5px", color: "#445048", lineHeight: "1.6" }}>
            {requestResult.description}
          </p>

          {/* Timeline Milestones */}
          <h3 style={{ fontFamily: "Libre Baskerville, serif", fontSize: "16px", margin: "24px 0 12px" }}>
            Status Progression Timeline
          </h3>
          <div style={{ borderLeft: "2px solid var(--burgundy)", paddingLeft: "18px", display: "grid", gap: "14px" }}>
            {requestResult.timeline?.map((step, idx) => (
              <div key={idx} style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: "-25px",
                    top: "3px",
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: "var(--burgundy)",
                  }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: "13px" }}>{step.status}</strong>
                  <time style={{ fontFamily: "DM Mono, monospace", fontSize: "10px", color: "var(--muted)" }}>
                    {formatDateTime(step.timestamp)}
                  </time>
                </div>
                <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "var(--muted)" }}>
                  {step.note} &bull; <span style={{ fontStyle: "italic" }}>{step.author}</span>
                </p>
              </div>
            ))}
          </div>
        </article>
      )}

      {/* Case Result */}
      {caseResult && !loading && (
        <article className="panel" style={{ padding: "30px", maxWidth: "860px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <span className="eyebrow">{caseResult.caseNumber}</span>
              <h2 style={{ fontFamily: "Libre Baskerville, serif", fontSize: "22px", margin: "4px 0 8px" }}>
                {caseResult.title}
              </h2>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--muted)" }}>
                {caseResult.jurisdiction}
              </p>
            </div>
            <span className={`status-pill ${caseResult.status.toLowerCase().replaceAll(" ", "-")}`}>
              {caseResult.status}
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "14px",
              background: "var(--sage-50)",
              padding: "16px",
              borderRadius: "var(--radius-sm)",
              margin: "20px 0",
            }}
          >
            <div>
              <span className="muted-label">Next Hearing Date</span>
              <strong>{formatDate(caseResult.hearingDate)}</strong>
            </div>
            <div>
              <span className="muted-label">Assigned Judge</span>
              <strong>{caseResult.assignedJudge}</strong>
            </div>
            <div>
              <span className="muted-label">Priority</span>
              <strong>{caseResult.priority}</strong>
            </div>
          </div>

          <div style={{ marginTop: "20px", display: "flex", gap: "12px" }}>
            <Link href={`/cases/${caseResult._id}`} className="button primary">
              Open Full Case File &rarr;
            </Link>
            <Link href={`/ai-workspace?case=${caseResult._id}`} className="button secondary">
              Run AI File Review &rarr;
            </Link>
          </div>
        </article>
      )}
    </AppShell>
  );
}

export default function TrackServicePage() {
  return (
    <Suspense fallback={<LoadingPanel label="Opening tracking desk…" />}>
      <TrackContent />
    </Suspense>
  );
}
