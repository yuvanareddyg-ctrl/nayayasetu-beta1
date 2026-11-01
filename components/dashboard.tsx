"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDate, requestJson } from "@/lib/client-api";
import { AppShell, EmptyPanel, ErrorPanel, LoadingPanel, PageHeader, ReviewBanner } from "@/components/shell";
import type { CaseRecord } from "@/lib/types";

export function Dashboard() {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setCases((await requestJson<{ cases: CaseRecord[] }>("/api/cases")).cases); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load the case board."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const summary = useMemo(() => ({
    total: cases.length,
    listed: cases.filter((item) => item.status === "Listed").length,
    priority: cases.filter((item) => item.priority !== "Standard").length,
  }), [cases]);
  return <AppShell>
    <PageHeader eyebrow="Judicial case management" title="The case board" description="A calm view of the matters requiring considered attention." action={<span className="today-label">Registry view · {formatDate(new Date().toISOString())}</span>} />
    <ReviewBanner>Digital assistance can organise the record, surface checks, and prepare drafts. It cannot decide a matter or replace judicial reasoning.</ReviewBanner>
    {loading ? <LoadingPanel label="Opening the case board…" /> : error ? <ErrorPanel message={error} retry={() => void load()} /> : <>
      <section className="metric-grid" aria-label="Case board overview">
        <div className="metric-card"><span>Matters in view</span><strong>{summary.total}</strong><small>active case records</small></div>
        <div className="metric-card sage"><span>Listed</span><strong>{summary.listed}</strong><small>awaiting the next hearing</small></div>
        <div className="metric-card burgundy"><span>Priority watch</span><strong>{summary.priority}</strong><small>priority or urgent matters</small></div>
      </section>
      <section className="panel case-board">
        <div className="section-heading"><div><p className="eyebrow">Case register</p><h2>Matters before the Court</h2></div><Link className="text-link" href="/cause-list">View cause list <span aria-hidden="true">→</span></Link></div>
        {cases.length === 0 ? <EmptyPanel title="No matters in the register" description="Create a case through the API or run the sample database seed." /> : <div className="case-list">
          {cases.map((item) => <article className="case-row" key={item._id}>
            <div className={`priority-mark ${item.priority.toLowerCase()}`} aria-label={`${item.priority} priority`} />
            <div className="case-title"><p>{item.caseNumber}</p><h3>{item.title}</h3><span>{item.jurisdiction}</span></div>
            <div className="case-parties"><span className="muted-label">Parties</span><p>{item.parties.join(" v. ")}</p></div>
            <div className="case-hearing"><span className="muted-label">Next hearing</span><p>{formatDate(item.hearingDate)}</p><small>{item.assignedJudge}</small></div>
            <div className="case-status"><span className={`status-pill ${item.status.toLowerCase().replaceAll(" ", "-")}`}>{item.status}</span><Link href={`/cases/${item._id}`} className="round-link" aria-label={`Open ${item.caseNumber}`}>→</Link></div>
          </article>)}
        </div>}
      </section>
    </>}
  </AppShell>;
}
