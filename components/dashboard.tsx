"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { formatDate, requestJson } from "@/lib/client-api";
import { AppShell, EmptyPanel, ErrorPanel, LoadingPanel, PageHeader, ReviewBanner } from "@/components/shell";
import type { CaseRecord, CaseStatus } from "@/lib/types";

export function Dashboard() {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | CaseStatus>("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [savingCase, setSavingCase] = useState(false);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setCases((await requestJson<{ cases: CaseRecord[] }>("/api/cases")).cases);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load the case board.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const summary = useMemo(
    () => ({
      total: cases.length,
      listed: cases.filter((item) => item.status === "Listed").length,
      priority: cases.filter((item) => item.priority !== "Standard").length,
    }),
    [cases]
  );

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchesStatus = statusFilter === "All" || c.status === statusFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        c.caseNumber.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.parties.some((p) => p.toLowerCase().includes(q)) ||
        c.assignedJudge.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [cases, statusFilter, search]);

  async function handleAddCase(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSavingCase(true);
    setNotice("");
    const form = e.currentTarget;
    const data = new FormData(form);

    const partiesInput = String(data.get("parties") || "").split(",").map((s) => s.trim()).filter(Boolean);
    const payload = {
      caseNumber: String(data.get("caseNumber") || "").trim(),
      title: String(data.get("title") || "").trim(),
      jurisdiction: String(data.get("jurisdiction") || "").trim(),
      parties: partiesInput.length >= 2 ? partiesInput : [partiesInput[0] || "Petitioner", "Respondent"],
      hearingDate: new Date(String(data.get("hearingDate"))).toISOString(),
      status: String(data.get("status") || "Listed"),
      priority: String(data.get("priority") || "Standard"),
      assignedJudge: String(data.get("assignedJudge") || "").trim(),
    };

    try {
      const res = await requestJson<{ case: CaseRecord }>("/api/cases", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setCases((prev) => [res.case, ...prev]);
      setShowAddModal(false);
      setNotice(`Matter ${res.case.caseNumber} registered successfully.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create case.");
    } finally {
      setSavingCase(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Judicial Case Management"
        title="The Case Register Board"
        description="A calm, authoritative register of matters requiring considered judicial attention."
        action={
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button className="button primary" onClick={() => setShowAddModal(true)}>
              + New Case Filing
            </button>
            <span className="today-label">Registry view &bull; {formatDate(new Date().toISOString())}</span>
          </div>
        }
      />

      <ReviewBanner>
        Digital assistance can organise the record, surface document checks, and prepare drafts. It
        cannot decide a matter or replace judicial reasoning.
      </ReviewBanner>

      {notice && (
        <div className="inline-notice" style={{ marginBottom: "18px" }}>
          {notice}
        </div>
      )}

      {loading ? (
        <LoadingPanel label="Opening the case board…" />
      ) : error && cases.length === 0 ? (
        <ErrorPanel message={error} retry={() => void load()} />
      ) : (
        <>
          <section className="metric-grid" aria-label="Case board overview">
            <div className="metric-card">
              <span>Matters in view</span>
              <strong>{summary.total}</strong>
              <small>active case records</small>
            </div>
            <div className="metric-card sage">
              <span>Listed</span>
              <strong>{summary.listed}</strong>
              <small>awaiting next hearing</small>
            </div>
            <div className="metric-card burgundy">
              <span>Priority watch</span>
              <strong>{summary.priority}</strong>
              <small>priority or urgent matters</small>
            </div>
          </section>

          {/* Filtering and Search Controls */}
          <section
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "14px",
              margin: "20px 0 16px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", gap: "6px", overflowX: "auto" }}>
              {(["All", "Listed", "Under Review", "Reserved", "Disposed"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`status-pill ${statusFilter === s ? "listed" : ""}`}
                  style={{
                    cursor: "pointer",
                    padding: "6px 12px",
                    background: statusFilter === s ? "var(--burgundy)" : "var(--paper)",
                    color: statusFilter === s ? "#fff" : "var(--ink)",
                    border: "1px solid var(--line)",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>

            <div style={{ minWidth: "260px" }}>
              <input
                className="form-input"
                placeholder="Search case #, title, judge, parties…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ padding: "8px 12px", fontSize: "13px" }}
              />
            </div>
          </section>

          <section className="panel case-board">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Case register</p>
                <h2>Matters before the Court</h2>
              </div>
              <div style={{ display: "flex", gap: "16px" }}>
                <Link className="text-link" href="/cause-list">
                  View cause list <span aria-hidden="true">&rarr;</span>
                </Link>
                <Link className="text-link" href="/ai-workspace">
                  Review desk <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>

            {filteredCases.length === 0 ? (
              <EmptyPanel
                title="No matching matters in view"
                description={
                  search || statusFilter !== "All"
                    ? "Try clearing your filters or search term."
                    : "No matters currently registered. Click '+ New Case Filing' to add one."
                }
              />
            ) : (
              <div className="case-list">
                {filteredCases.map((item) => (
                  <article className="case-row" key={item._id}>
                    <div
                      className={`priority-mark ${item.priority.toLowerCase()}`}
                      aria-label={`${item.priority} priority`}
                    />
                    <div className="case-title">
                      <p>{item.caseNumber}</p>
                      <h3>{item.title}</h3>
                      <span>{item.jurisdiction}</span>
                    </div>
                    <div className="case-parties">
                      <span className="muted-label">Parties</span>
                      <p>{item.parties.join(" v. ")}</p>
                    </div>
                    <div className="case-hearing">
                      <span className="muted-label">Next hearing</span>
                      <p>{formatDate(item.hearingDate)}</p>
                      <small>{item.assignedJudge}</small>
                    </div>
                    <div className="case-status">
                      <span className={`status-pill ${item.status.toLowerCase().replaceAll(" ", "-")}`}>
                        {item.status}
                      </span>
                      <Link
                        href={`/cases/${item._id}`}
                        className="round-link"
                        aria-label={`Open ${item.caseNumber}`}
                      >
                        &rarr;
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* ── New Case Filing Modal ─────────────────────────────────────────── */}
      {showAddModal && (
        <div
          className="search-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="search-modal" style={{ maxWidth: "600px", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h2 style={{ fontFamily: "Libre Baskerville, serif", fontSize: "20px", margin: 0 }}>
                Register New Court Matter
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: "none", border: "none", fontSize: "16px" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCase} style={{ display: "grid", gap: "14px" }}>
              <label className="form-label">
                Case Number
                <input required name="caseNumber" className="form-input" placeholder="e.g. W.P. (C) 2050/2026" />
              </label>

              <label className="form-label">
                Matter Title / Cause Title
                <input required name="title" className="form-input" placeholder="e.g. Ramesh Chandra v. Union of India" />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <label className="form-label">
                  Jurisdiction
                  <input required name="jurisdiction" className="form-input" placeholder="e.g. High Court &bull; Civil" />
                </label>
                <label className="form-label">
                  Assigned Judge
                  <input required name="assignedJudge" className="form-input" placeholder="e.g. Hon'ble Justice S. Patel" />
                </label>
              </div>

              <label className="form-label">
                Parties (comma-separated, at least 2)
                <input required name="parties" className="form-input" placeholder="e.g. Ramesh Chandra, Union of India" />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <label className="form-label">
                  Next Hearing Date
                  <input
                    required
                    type="date"
                    name="hearingDate"
                    className="form-input"
                    defaultValue={new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0]}
                  />
                </label>
                <label className="form-label">
                  Status
                  <select name="status" className="form-select" defaultValue="Listed">
                    <option value="Listed">Listed</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Reserved">Reserved</option>
                  </select>
                </label>
                <label className="form-label">
                  Priority
                  <select name="priority" className="form-select" defaultValue="Standard">
                    <option value="Standard">Standard</option>
                    <option value="Priority">Priority</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button type="button" className="button secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="button primary" disabled={savingCase}>
                  {savingCase ? "Registering…" : "Register Matter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
