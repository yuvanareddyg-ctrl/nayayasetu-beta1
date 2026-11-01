"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDate, requestJson } from "@/lib/client-api";
import { AppShell, EmptyPanel, ErrorPanel, LoadingPanel, PageHeader, ReviewBanner } from "@/components/shell";
import type { CauseListRecommendation, ReadinessStatus } from "@/lib/types";

export function CauseList() {
  const [items, setItems] = useState<CauseListRecommendation[]>([]);
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"All" | ReadinessStatus>("All");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await requestJson<{
        label: string;
        recommendations: CauseListRecommendation[];
      }>("/api/cause-list");
      setItems(data.recommendations);
      setLabel(data.label);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to prepare the cause list.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredItems = useMemo(() => {
    if (filter === "All") return items;
    return items.filter((i) => i.readiness === filter);
  }, [items, filter]);

  const totalMinutes = useMemo(
    () => items.reduce((acc, curr) => acc + (curr.estimatedDuration || 0), 0),
    [items]
  );

  return (
    <AppShell>
      <PageHeader
        eyebrow="Registry Planning"
        title="Daily Cause-List Desk"
        description="A transparent, deterministic readiness view to support—never replace—judicial listing decisions."
        action={
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              className="button secondary"
              onClick={() => window.print()}
              title="Print official cause list"
            >
              🖨 Print Cause List
            </button>
            <button
              className="button secondary"
              onClick={() => void load()}
              disabled={loading}
            >
              Refresh
            </button>
          </div>
        }
      />

      <ReviewBanner>
        {label ||
          "The Court retains exclusive authority over listing sequence, estimated duration, and adjournment determinations."}
      </ReviewBanner>

      {/* Summary KPI Strip */}
      <section className="metric-grid" style={{ marginBottom: "20px" }}>
        <div className="metric-card">
          <span>Matters Listed</span>
          <strong>{items.length}</strong>
          <small>scheduled in cause list</small>
        </div>
        <div className="metric-card sage">
          <span>Bench Time</span>
          <strong>{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</strong>
          <small>total hearing estimates</small>
        </div>
        <div className="metric-card gold">
          <span>Ready for Hearing</span>
          <strong>
            {items.filter((i) => i.readiness === "Ready").length} / {items.length}
          </strong>
          <small>complete document health</small>
        </div>
      </section>

      {/* Readiness Filters */}
      <div style={{ display: "flex", gap: "6px", margin: "16px 0 20px", overflowX: "auto" }}>
        {(["All", "Ready", "Needs review", "Awaiting documents"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setFilter(r)}
            className={`status-pill ${filter === r ? "listed" : ""}`}
            style={{
              cursor: "pointer",
              padding: "6px 12px",
              background: filter === r ? "var(--burgundy)" : "var(--paper)",
              color: filter === r ? "#fff" : "var(--ink)",
              border: "1px solid var(--line)",
            }}
          >
            {r}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingPanel label="Preparing scheduling recommendations…" />
      ) : error ? (
        <ErrorPanel message={error} retry={() => void load()} />
      ) : !filteredItems.length ? (
        <EmptyPanel
          title="No matters match this readiness filter"
          description="Try switching filters or refresh the cause list."
        />
      ) : (
        <section className="panel cause-list">
          <div className="cause-caption">
            <span>Proposed Sequence &bull; High Court of Aranya</span>
            <span>
              Readiness is derived from deterministic file checks and recorded party estimates.
            </span>
          </div>

          {filteredItems.map((item) => (
            <article key={item.case._id} className="cause-row">
              <div className="cause-order">{String(item.order).padStart(2, "0")}</div>
              <div className="cause-matter">
                <p>{item.case.caseNumber}</p>
                <h2>{item.case.title}</h2>
                <span>
                  {item.case.assignedJudge} &bull; {formatDate(item.case.hearingDate)}
                </span>
              </div>
              <div className="cause-readiness">
                <span className={`status-pill ${item.readiness.toLowerCase().replaceAll(" ", "-")}`}>
                  {item.readiness}
                </span>
                <p>{item.recommendation}</p>
              </div>
              <div className="cause-time">
                <strong>{item.estimatedDuration} min</strong>
                <span>{item.hearing?.time ?? "Time to be set"}</span>
              </div>
              <Link
                href={`/cases/${item.case._id}`}
                className="round-link"
                aria-label={`Review ${item.case.caseNumber}`}
              >
                &rarr;
              </Link>
            </article>
          ))}
        </section>
      )}
    </AppShell>
  );
}
