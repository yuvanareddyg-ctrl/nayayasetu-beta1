"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { formatDate, requestJson } from "@/lib/client-api";
import { AppShell, EmptyPanel, ErrorPanel, LoadingPanel, PageHeader, ReviewBanner } from "@/components/shell";
import type { CaseRecord, CaseSummary, DocumentHealth, DocumentRecord, PrecedentRecord } from "@/lib/types";

export function CaseDetail() {
  const rawId = useParams<{ id: string }>().id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const [caseRecord, setCaseRecord] = useState<CaseRecord | null>(null);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [health, setHealth] = useState<DocumentHealth | null>(null);
  const [summary, setSummary] = useState<CaseSummary | null>(null);
  const [precedents, setPrecedents] = useState<PrecedentRecord[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [record, files] = await Promise.all([
        requestJson<{ case: CaseRecord }>(`/api/cases/${id}`),
        requestJson<{ documents: DocumentRecord[] }>(`/api/cases/${id}/documents`),
      ]);
      setCaseRecord(record.case); setDocuments(files.documents);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to retrieve this case."); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => { if (id) void load(); }, [id, load]);
  async function openTool(tool: "health" | "summary" | "precedents") {
    setWorking(tool); setError("");
    try {
      if (tool === "health") setHealth((await requestJson<{ health: DocumentHealth }>(`/api/cases/${id}/document-health`, { method: "POST" })).health);
      if (tool === "summary") setSummary((await requestJson<{ summary: CaseSummary }>(`/api/cases/${id}/summary`)).summary);
      if (tool === "precedents") setPrecedents((await requestJson<{ precedents: PrecedentRecord[] }>(`/api/cases/${id}/precedents`)).precedents);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The review tool was unavailable."); }
    finally { setWorking(""); }
  }

  return <AppShell>
    {loading ? <LoadingPanel label="Opening the case record…" /> : error && !caseRecord ? <ErrorPanel message={error} retry={() => void load()} /> : !caseRecord ? <EmptyPanel title="Case not found" description="Return to the case board and choose a matter from the register." /> : <>
      <Link className="back-link" href="/">← Case board</Link>
      <PageHeader eyebrow={caseRecord.caseNumber} title={caseRecord.title} description={`${caseRecord.jurisdiction} · ${caseRecord.parties.join(" v. ")}`} action={<span className={`status-pill ${caseRecord.status.toLowerCase().replaceAll(" ", "-")}`}>{caseRecord.status}</span>} />
      <ReviewBanner>Review tools below provide a transparent orientation to the file. They are advisory only and require validation against the official record.</ReviewBanner>
      {error && <div className="inline-error" role="alert">{error}</div>}
      <section className="case-metadata">
        <div><span className="muted-label">Next hearing</span><strong>{formatDate(caseRecord.hearingDate)}</strong></div>
        <div><span className="muted-label">Assigned judge</span><strong>{caseRecord.assignedJudge}</strong></div>
        <div><span className="muted-label">Priority</span><strong>{caseRecord.priority}</strong></div>
        <div><span className="muted-label">Indexed documents</span><strong>{documents.length}</strong></div>
      </section>
      <section className="tool-grid" aria-label="Case review tools">
        <button className="tool-card" onClick={() => void openTool("health")} disabled={Boolean(working)}><span aria-hidden="true">⌁</span><div><h2>Document health</h2><p>Check file completeness, duplicate flags, and missing items.</p></div><b>{working === "health" ? "Checking…" : "Run check →"}</b></button>
        <button className="tool-card" onClick={() => void openTool("precedents")} disabled={Boolean(working)}><span aria-hidden="true">⌘</span><div><h2>Precedent retrieval</h2><p>View deterministic mock relevance suggestions for review.</p></div><b>{working === "precedents" ? "Retrieving…" : "Retrieve →"}</b></button>
        <button className="tool-card" onClick={() => void openTool("summary")} disabled={Boolean(working)}><span aria-hidden="true">✦</span><div><h2>Case orientation</h2><p>Prepare a bounded, non-dispositive reading brief.</p></div><b>{working === "summary" ? "Preparing…" : "Prepare →"}</b></button>
        <Link href={`/drafting?case=${id}`} className="tool-card link-tool"><span aria-hidden="true">▤</span><div><h2>Drafting studio</h2><p>Create a working draft for judicial editing and approval.</p></div><b>Open →</b></Link>
      </section>
      <section className="two-column">
        <div className="panel results-panel">
          <div className="section-heading"><div><p className="eyebrow">Case file</p><h2>Document register</h2></div></div>
          {documents.length ? <ul className="document-list">{documents.map((document) => <li key={document._id}><span className={`document-dot ${document.isMissing ? "alert" : document.isDuplicate ? "review" : ""}`} /><div><strong>{document.filename}</strong><p>{document.type} · uploaded {formatDate(document.uploadedDate)}</p></div><span className="file-status">{document.isMissing ? "Missing / incomplete" : document.isDuplicate ? "Duplicate flag" : document.completionStatus}</span></li>)}</ul> : <EmptyPanel title="No indexed documents" description="Use the document health check to identify registry follow-up." />}
        </div>
        <div className="results-stack">
          {health && <article className="panel insight-card"><p className="eyebrow">Document-health result</p><div className="score-line"><strong>{health.score}<small>/100</small></strong><span className={`status-pill ${health.status.toLowerCase().replaceAll(" ", "-")}`}>{health.status}</span></div><ul>{health.findings.map((finding) => <li key={finding.title}><strong>{finding.title}</strong><span>{finding.detail}</span></li>)}</ul></article>}
          {summary && <article className="panel insight-card"><p className="eyebrow">{summary.label}</p><p>{summary.overview}</p><h3>Questions for review</h3><ul>{summary.keyQuestions.map((question) => <li key={question}>{question}</li>)}</ul><small>{summary.reviewNote}</small></article>}
          {precedents.length > 0 && <article className="panel insight-card"><p className="eyebrow">Mock relevance recommendations</p>{precedents.map((precedent) => <div className="precedent" key={precedent._id}><span>{precedent.relevanceScore}%</span><div><strong>{precedent.title}</strong><p>{precedent.court} · {precedent.year}</p><small>{precedent.summary}</small></div></div>)}</article>}
          {!health && !summary && !precedents.length && <div className="panel quiet-panel"><span aria-hidden="true">⚖</span><p>Run a review tool to surface a transparent, bounded output for this file.</p></div>}
        </div>
      </section>
    </>}
  </AppShell>;
}
