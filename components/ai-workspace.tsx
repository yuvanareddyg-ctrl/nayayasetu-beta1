"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDate, requestJson } from "@/lib/client-api";
import { AppShell, EmptyPanel, ErrorPanel, LoadingPanel, PageHeader, ReviewBanner } from "@/components/shell";
import type { CaseRecord, CaseSummary, DocumentHealth, PrecedentRecord } from "@/lib/types";

export function AiWorkspace() {
  const search = useSearchParams();
  const requestedCase = search.get("case");
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [selected, setSelected] = useState("");
  const [summary, setSummary] = useState<CaseSummary | null>(null);
  const [health, setHealth] = useState<DocumentHealth | null>(null);
  const [precedents, setPrecedents] = useState<PrecedentRecord[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState("");
  const selectedCase = useMemo(() => cases.find((item) => item._id === selected), [cases, selected]);
  const loadCases = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const items = (await requestJson<{ cases: CaseRecord[] }>("/api/cases")).cases;
      setCases(items);
      setSelected((current) => requestedCase && items.some((item) => item._id === requestedCase) ? requestedCase : current || items[0]?._id || "");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to open the review desk."); }
    finally { setLoading(false); }
  }, [requestedCase]);
  useEffect(() => { void loadCases(); }, [loadCases]);
  useEffect(() => { setSummary(null); setHealth(null); setPrecedents([]); }, [selected]);
  async function run(tool: "summary" | "health" | "precedents") {
    if (!selected) return;
    setWorking(tool); setError("");
    try {
      if (tool === "summary") setSummary((await requestJson<{ summary: CaseSummary }>(`/api/cases/${selected}/summary`)).summary);
      if (tool === "health") setHealth((await requestJson<{ health: DocumentHealth }>(`/api/cases/${selected}/document-health`, { method: "POST" })).health);
      if (tool === "precedents") setPrecedents((await requestJson<{ precedents: PrecedentRecord[] }>(`/api/cases/${selected}/precedents`)).precedents);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The requested orientation could not be prepared."); }
    finally { setWorking(""); }
  }
  return <AppShell>
    <PageHeader eyebrow="Bounded assistance" title="Review desk" description="Orient to the record with transparent, non-dispositive tools." />
    <ReviewBanner>These outputs are deliberately limited to record orientation and recommendations. The Court independently assesses the law, evidence, and outcome.</ReviewBanner>
    {loading ? <LoadingPanel label="Preparing the review desk…" /> : error && !cases.length ? <ErrorPanel message={error} retry={() => void loadCases()} /> : !cases.length ? <EmptyPanel title="No case is available" description="Add a case record before opening the review desk." /> : <>
      <section className="workspace-select panel"><label htmlFor="case-select"><span className="eyebrow">Matter in review</span><strong>Choose the case file</strong></label><select id="case-select" value={selected} onChange={(event) => setSelected(event.target.value)}>{cases.map((item) => <option key={item._id} value={item._id}>{item.caseNumber} — {item.title}</option>)}</select>{selectedCase && <div className="case-caption"><span>{selectedCase.jurisdiction}</span><span>Hearing {formatDate(selectedCase.hearingDate)}</span></div>}</section>
      {error && <div className="inline-error" role="alert">{error}</div>}
      <section className="workspace-grid">
        <article className="panel workspace-command"><span className="command-symbol">✦</span><p className="eyebrow">Record orientation</p><h2>Case reading brief</h2><p>Generate a cautious overview and questions to guide, not replace, judicial preparation.</p><button className="button primary" disabled={Boolean(working)} onClick={() => void run("summary")}>{working === "summary" ? "Preparing…" : "Prepare orientation"}</button></article>
        <article className="panel workspace-command"><span className="command-symbol">⌁</span><p className="eyebrow">File integrity</p><h2>Document health</h2><p>Apply deterministic checks for incomplete, pending, and potentially duplicate records.</p><button className="button secondary" disabled={Boolean(working)} onClick={() => void run("health")}>{working === "health" ? "Checking…" : "Run file check"}</button></article>
        <article className="panel workspace-command"><span className="command-symbol">⌘</span><p className="eyebrow">Research support</p><h2>Precedent retrieval</h2><p>Inspect a small, mock-ranked research set and verify every authority independently.</p><button className="button secondary" disabled={Boolean(working)} onClick={() => void run("precedents")}>{working === "precedents" ? "Retrieving…" : "Find recommendations"}</button></article>
      </section>
      {(summary || health || precedents.length > 0) && <section className="workspace-results">
        {summary && <article className="panel reading-brief"><p className="eyebrow">{summary.label}</p><h2>Reading brief</h2><p>{summary.overview}</p><h3>Questions for the Court&apos;s review</h3><ol>{summary.keyQuestions.map((question) => <li key={question}>{question}</li>)}</ol><small>{summary.reviewNote}</small></article>}
        {health && <article className="panel insight-card"><p className="eyebrow">File check</p><div className="score-line"><strong>{health.score}<small>/100</small></strong><span className={`status-pill ${health.status.toLowerCase().replaceAll(" ", "-")}`}>{health.status}</span></div><ul>{health.findings.map((finding) => <li key={finding.title}><strong>{finding.title}</strong><span>{finding.detail}</span></li>)}</ul></article>}
        {precedents.length > 0 && <article className="panel research-results"><p className="eyebrow">Mock relevance recommendations</p><h2>Research suggestions</h2>{precedents.map((precedent) => <div className="precedent" key={precedent._id}><span>{precedent.relevanceScore}%</span><div><strong>{precedent.title}</strong><p>{precedent.court} · {precedent.year} · {precedent.legalTopic}</p><small>{precedent.summary}</small></div></div>)}</article>}
      </section>}
    </>}
  </AppShell>;
}
