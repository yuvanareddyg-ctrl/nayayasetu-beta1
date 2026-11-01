"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDate, requestJson } from "@/lib/client-api";
import { AppShell, EmptyPanel, ErrorPanel, LoadingPanel, PageHeader, ReviewBanner } from "@/components/shell";
import type { CaseRecord, DraftRecord } from "@/lib/types";

type DraftType = DraftRecord["draftType"];

function starter(record: CaseRecord, type: DraftType) {
  return `${type.toUpperCase()} — WORKING DRAFT\n\nIn ${record.caseNumber}\n${record.title}\n\n1. The matter is listed before this Court on ${formatDate(record.hearingDate, { dateStyle: "long" })}.\n\n2. The record and the submissions made on behalf of the parties are to be considered by the Court. This is a working draft for judicial review, amendment, and approval; it records no automated conclusion.\n\n3. [Insert the Court's reasons, directions, or questions for counsel after independent consideration.]\n\n— End of working draft —`;
}

export function DraftingStudio() {
  const search = useSearchParams();
  const requestedCase = search.get("case");
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [selected, setSelected] = useState("");
  const [type, setType] = useState<DraftType>("Order");
  const [content, setContent] = useState("");
  const [drafts, setDrafts] = useState<DraftRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const selectedCase = useMemo(() => cases.find((item) => item._id === selected), [cases, selected]);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await requestJson<{ cases: CaseRecord[] }>("/api/cases");
      setCases(data.cases);
      setSelected((current) => requestedCase && data.cases.some((item) => item._id === requestedCase) ? requestedCase : current || data.cases[0]?._id || "");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to open drafting studio."); }
    finally { setLoading(false); }
  }, [requestedCase]);
  const loadDrafts = useCallback(async (caseId: string) => {
    if (!caseId) return;
    try { setDrafts((await requestJson<{ drafts: DraftRecord[] }>(`/api/cases/${caseId}/drafts`)).drafts); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load saved drafts."); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { if (selected) void loadDrafts(selected); }, [selected, loadDrafts]);
  useEffect(() => { if (selectedCase) setContent(starter(selectedCase, type)); }, [selectedCase, type]);
  async function save() {
    if (!selected) return;
    setSaving(true); setNotice(""); setError("");
    try {
      const result = await requestJson<{ draft: DraftRecord }>(`/api/cases/${selected}/drafts`, { method: "POST", body: JSON.stringify({ draftType: type, content, status: "Draft" }) });
      setDrafts((current) => [result.draft, ...current]); setNotice("Working draft saved. It remains unapproved and subject to judicial editing.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The draft could not be saved."); }
    finally { setSaving(false); }
  }
  return <AppShell>
    <PageHeader eyebrow="Human-led drafting" title="Drafting studio" description="Shape an editable working document; only the Court can approve its contents." />
    <ReviewBanner>Templates use safe boilerplate and do not make findings, assess evidence, or determine a judicial outcome.</ReviewBanner>
    {loading ? <LoadingPanel label="Opening drafting studio…" /> : error && !cases.length ? <ErrorPanel message={error} retry={() => void load()} /> : !cases.length ? <EmptyPanel title="No case is available" description="Add a case record before creating a working draft." /> : <section className="drafting-layout">
      <div className="draft-editor panel">
        <div className="draft-controls"><label><span className="muted-label">Matter</span><select value={selected} onChange={(event) => setSelected(event.target.value)}>{cases.map((item) => <option key={item._id} value={item._id}>{item.caseNumber} — {item.title}</option>)}</select></label><label><span className="muted-label">Draft type</span><select value={type} onChange={(event) => setType(event.target.value as DraftType)}><option>Order</option><option>Notice</option><option>Case note</option><option>Judgment outline</option></select></label></div>
        <div className="editor-heading"><div><p className="eyebrow">Editable working document</p><h2>{type}</h2></div><span>Not approved</span></div>
        <textarea aria-label="Draft content" value={content} onChange={(event) => setContent(event.target.value)} rows={19} />
        {error && <div className="inline-error" role="alert">{error}</div>}{notice && <div className="inline-notice" role="status">{notice}</div>}
        <div className="draft-actions"><button className="button secondary" onClick={() => selectedCase && setContent(starter(selectedCase, type))}>Restore safe template</button><button className="button primary" disabled={saving || content.trim().length < 20} onClick={() => void save()}>{saving ? "Saving…" : "Save working draft"}</button></div>
      </div>
      <aside className="draft-sidebar"><div className="panel"><p className="eyebrow">Safeguard</p><h2>Before approval</h2><ol><li>Check the official record and submissions.</li><li>Revise all placeholders and reasons.</li><li>Apply judicial consideration and signature process.</li></ol></div><div className="panel saved-drafts"><p className="eyebrow">Saved working drafts</p>{drafts.length ? drafts.map((draft) => <article key={draft._id}><strong>{draft.draftType}</strong><span>{formatDate(draft.createdDate)} · {draft.status}</span><p>{draft.content.slice(0, 100)}…</p></article>) : <p className="quiet-copy">No working draft has been saved for this matter.</p>}</div></aside>
    </section>}
  </AppShell>;
}
