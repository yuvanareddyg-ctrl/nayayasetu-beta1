"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { formatDate, requestJson } from "@/lib/client-api";
import { AppShell, EmptyPanel, ErrorPanel, LoadingPanel, PageHeader, ReviewBanner } from "@/components/shell";
import type { CauseListRecommendation } from "@/lib/types";

export function CauseList() {
  const [items, setItems] = useState<CauseListRecommendation[]>([]);
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const data = await requestJson<{ label: string; recommendations: CauseListRecommendation[] }>("/api/cause-list"); setItems(data.recommendations); setLabel(data.label); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to prepare the cause list."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  return <AppShell>
    <PageHeader eyebrow="Registry planning" title="Cause-list desk" description="A transparent readiness view to support—never replace—listing decisions." action={<button className="button secondary" onClick={() => void load()} disabled={loading}>Refresh recommendations</button>} />
    <ReviewBanner>{label || "The Court retains complete authority over listing order, duration, and adjournment decisions."}</ReviewBanner>
    {loading ? <LoadingPanel label="Preparing scheduling recommendations…" /> : error ? <ErrorPanel message={error} retry={() => void load()} /> : !items.length ? <EmptyPanel title="No matters to schedule" description="The cause list will populate when the case register contains hearing records." /> : <section className="panel cause-list"><div className="cause-caption"><span>Proposed order</span><span>Readiness is based on deterministic file checks and recorded estimates.</span></div>{items.map((item) => <article key={item.case._id} className="cause-row"><div className="cause-order">{String(item.order).padStart(2, "0")}</div><div className="cause-matter"><p>{item.case.caseNumber}</p><h2>{item.case.title}</h2><span>{item.case.assignedJudge} · {formatDate(item.case.hearingDate)}</span></div><div className="cause-readiness"><span className={`status-pill ${item.readiness.toLowerCase().replaceAll(" ", "-")}`}>{item.readiness}</span><p>{item.recommendation}</p></div><div className="cause-time"><strong>{item.estimatedDuration} min</strong><span>{item.hearing?.time ?? "Time to be set"}</span></div><Link href={`/cases/${item.case._id}`} className="round-link" aria-label={`Review ${item.case.caseNumber}`}>→</Link></article>)}</section>}
  </AppShell>;
}
