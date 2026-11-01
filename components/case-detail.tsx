"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { formatDate, requestJson, uploadDocument } from "@/lib/client-api";
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

  // Upload Document modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docFilename, setDocFilename] = useState("");
  const [docType, setDocType] = useState("Pleading");
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docNotice, setDocNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [record, files] = await Promise.all([
        requestJson<{ case: CaseRecord }>(`/api/cases/${id}`),
        requestJson<{ documents: DocumentRecord[] }>(`/api/cases/${id}/documents`),
      ]);
      setCaseRecord(record.case);
      setDocuments(files.documents);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to retrieve this case.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) void load();
  }, [id, load]);

  async function openTool(tool: "health" | "summary" | "precedents") {
    setWorking(tool);
    setError("");
    try {
      if (tool === "health")
        setHealth(
          (
            await requestJson<{ health: DocumentHealth }>(`/api/cases/${id}/document-health`, {
              method: "POST",
            })
          ).health
        );
      if (tool === "summary")
        setSummary((await requestJson<{ summary: CaseSummary }>(`/api/cases/${id}/summary`)).summary);
      if (tool === "precedents")
        setPrecedents(
          (await requestJson<{ precedents: PrecedentRecord[] }>(`/api/cases/${id}/precedents`))
            .precedents
        );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The review tool was unavailable.");
    } finally {
      setWorking("");
    }
  }

  async function handleAddDocument(e: React.FormEvent) {
    e.preventDefault();
    if (!docFilename.trim()) return;

    setUploadingDoc(true);
    try {
      const res = await requestJson<{ ok: boolean; document: DocumentRecord }>(
        `/api/cases/${id}/documents`,
        {
          method: "POST",
          body: JSON.stringify({
            filename: docFilename.trim(),
            type: docType,
            completionStatus: "Complete",
            isDuplicate: false,
            isMissing: false,
          }),
        }
      );
      if (res.document) {
        setDocuments((prev) => [res.document, ...prev]);
        setShowUploadModal(false);
        setDocFilename("");
        setDocNotice(`Document "${res.document.filename}" added to case file.`);
        setTimeout(() => setDocNotice(""), 3500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add document.");
    } finally {
      setUploadingDoc(false);
    }
  }

  async function handleFileUploadTrigger(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingDoc(true);
      const uploaded = await uploadDocument(file);
      setDocFilename(uploaded.filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploadingDoc(false);
    }
  }

  return (
    <AppShell>
      {loading ? (
        <LoadingPanel label="Opening the case record…" />
      ) : error && !caseRecord ? (
        <ErrorPanel message={error} retry={() => void load()} />
      ) : !caseRecord ? (
        <EmptyPanel
          title="Case not found"
          description="Return to the case board and choose a matter from the register."
        />
      ) : (
        <>
          <Link className="back-link" href="/case-board">
            &larr; Return to Case Register
          </Link>
          <PageHeader
            eyebrow={caseRecord.caseNumber}
            title={caseRecord.title}
            description={`${caseRecord.jurisdiction} · ${caseRecord.parties.join(" v. ")}`}
            action={
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <button className="button primary" onClick={() => setShowUploadModal(true)}>
                  + Upload Document
                </button>
                <span className={`status-pill ${caseRecord.status.toLowerCase().replaceAll(" ", "-")}`}>
                  {caseRecord.status}
                </span>
              </div>
            }
          />
          <ReviewBanner>
            Review tools below provide a transparent orientation to the file. They are advisory only
            and require independent validation against the official court record.
          </ReviewBanner>

          {docNotice && <div className="inline-notice">✓ {docNotice}</div>}
          {error && (
            <div className="inline-error" role="alert">
              {error}
            </div>
          )}

          <section className="case-metadata">
            <div>
              <span className="muted-label">Next hearing</span>
              <strong>{formatDate(caseRecord.hearingDate)}</strong>
            </div>
            <div>
              <span className="muted-label">Assigned judge</span>
              <strong>{caseRecord.assignedJudge}</strong>
            </div>
            <div>
              <span className="muted-label">Priority</span>
              <strong>{caseRecord.priority}</strong>
            </div>
            <div>
              <span className="muted-label">Indexed documents</span>
              <strong>{documents.length}</strong>
            </div>
          </section>

          <section className="tool-grid" aria-label="Case review tools">
            <button className="tool-card" onClick={() => void openTool("health")} disabled={Boolean(working)}>
              <span aria-hidden="true">⌁</span>
              <div>
                <h2>Document health</h2>
                <p>Check file completeness, duplicate flags, and missing items.</p>
              </div>
              <b>{working === "health" ? "Checking…" : "Run check →"}</b>
            </button>
            <button className="tool-card" onClick={() => void openTool("precedents")} disabled={Boolean(working)}>
              <span aria-hidden="true">⌘</span>
              <div>
                <h2>Precedent retrieval</h2>
                <p>View deterministic mock relevance suggestions for review.</p>
              </div>
              <b>{working === "precedents" ? "Retrieving…" : "Retrieve →"}</b>
            </button>
            <button className="tool-card" onClick={() => void openTool("summary")} disabled={Boolean(working)}>
              <span aria-hidden="true">✦</span>
              <div>
                <h2>Case orientation</h2>
                <p>Prepare a bounded, non-dispositive reading brief.</p>
              </div>
              <b>{working === "summary" ? "Preparing…" : "Prepare →"}</b>
            </button>
            <Link href={`/drafting?case=${id}`} className="tool-card link-tool">
              <span aria-hidden="true">▤</span>
              <div>
                <h2>Drafting studio</h2>
                <p>Create a working draft for judicial editing and approval.</p>
              </div>
              <b>Open →</b>
            </Link>
          </section>

          <section className="two-column">
            <div className="panel results-panel">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Case file</p>
                  <h2>Document register ({documents.length})</h2>
                </div>
                <button
                  type="button"
                  className="button secondary"
                  style={{ fontSize: "11px", padding: "4px 8px" }}
                  onClick={() => setShowUploadModal(true)}
                >
                  + Add File
                </button>
              </div>
              {documents.length ? (
                <ul className="document-list">
                  {documents.map((document) => (
                    <li key={document._id}>
                      <span
                        className={`document-dot ${
                          document.isMissing ? "alert" : document.isDuplicate ? "review" : ""
                        }`}
                      />
                      <div>
                        <strong>{document.filename}</strong>
                        <p>
                          {document.type} · uploaded {formatDate(document.uploadedDate)}
                        </p>
                      </div>
                      <span className="file-status">
                        {document.isMissing
                          ? "Missing / incomplete"
                          : document.isDuplicate
                          ? "Duplicate flag"
                          : document.completionStatus}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyPanel
                  title="No indexed documents"
                  description="Upload a pleading or use the document health check to identify registry follow-up."
                />
              )}
            </div>

            <div className="results-stack">
              {health && (
                <article className="panel insight-card">
                  <p className="eyebrow">Document-health result</p>
                  <div className="score-line">
                    <strong>
                      {health.score}
                      <small>/100</small>
                    </strong>
                    <span className={`status-pill ${health.status.toLowerCase().replaceAll(" ", "-")}`}>
                      {health.status}
                    </span>
                  </div>
                  <ul>
                    {health.findings.map((finding) => (
                      <li key={finding.title}>
                        <strong>{finding.title}</strong>
                        <span>{finding.detail}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              )}
              {summary && (
                <article className="panel insight-card">
                  <p className="eyebrow">{summary.label}</p>
                  <p>{summary.overview}</p>
                  <h3>Questions for review</h3>
                  <ul>
                    {summary.keyQuestions.map((question) => (
                      <li key={question}>{question}</li>
                    ))}
                  </ul>
                  <small>{summary.reviewNote}</small>
                </article>
              )}
              {precedents.length > 0 && (
                <article className="panel insight-card">
                  <p className="eyebrow">Mock relevance recommendations</p>
                  {precedents.map((precedent) => (
                    <div className="precedent" key={precedent._id}>
                      <span>{precedent.relevanceScore}%</span>
                      <div>
                        <strong>{precedent.title}</strong>
                        <p>
                          {precedent.court} · {precedent.year}
                        </p>
                        <small>{precedent.summary}</small>
                      </div>
                    </div>
                  ))}
                </article>
              )}
              {!health && !summary && !precedents.length && (
                <div className="panel quiet-panel">
                  <span aria-hidden="true">⚖</span>
                  <p>Run a review tool to surface a transparent, bounded orientation for this file.</p>
                </div>
              )}
            </div>
          </section>

          {/* Upload Document Modal */}
          {showUploadModal && (
            <div
              className="search-modal-backdrop"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowUploadModal(false);
              }}
              role="dialog"
              aria-modal="true"
            >
              <div className="search-modal" style={{ maxWidth: "540px", padding: "26px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div>
                    <span className="eyebrow">Pleadings &amp; Annexures</span>
                    <h2 style={{ fontFamily: "Libre Baskerville, serif", fontSize: "20px", margin: "4px 0" }}>
                      Upload Case Document
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    style={{ background: "none", border: "none", fontSize: "16px" }}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddDocument} style={{ display: "grid", gap: "14px" }}>
                  <div style={{ background: "var(--sage-50)", padding: "14px", borderRadius: "var(--radius-sm)" }}>
                    <input
                      type="file"
                      id="case-doc-file"
                      style={{ display: "none" }}
                      onChange={handleFileUploadTrigger}
                      accept=".pdf,.doc,.docx"
                    />
                    <label htmlFor="case-doc-file" className="button secondary" style={{ cursor: "pointer" }}>
                      📁 Select PDF or Document
                    </label>
                  </div>

                  <label className="form-label">
                    Document Filename *
                    <input
                      required
                      className="form-input"
                      value={docFilename}
                      onChange={(e) => setDocFilename(e.target.value)}
                      placeholder="e.g. Additional Rejoinder Affidavit.pdf"
                    />
                  </label>

                  <label className="form-label">
                    Document Type
                    <select
                      className="form-select"
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                    >
                      <option value="Pleading">Pleading (Writ Petition, Appeal, Revision)</option>
                      <option value="Response">Response (Counter Affidavit, Reply)</option>
                      <option value="Evidence">Evidence / Paper Book Volume</option>
                      <option value="Annexure">Annexure / Impugned Order</option>
                      <option value="Written Submission">Written Submission / Notes of Arguments</option>
                    </select>
                  </label>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                    <button
                      type="button"
                      className="button secondary"
                      onClick={() => setShowUploadModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="button primary" disabled={uploadingDoc}>
                      {uploadingDoc ? "Saving…" : "Save to Case Record →"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
