import type { CaseRecord, CaseSummary, DocumentHealth, DocumentRecord, PrecedentRecord } from "@/lib/types";

export function assessDocumentHealth(caseId: string, documents: DocumentRecord[]): DocumentHealth {
  const findings: DocumentHealth["findings"] = [];
  const missing = documents.filter((document) => document.isMissing || document.completionStatus === "Incomplete");
  const duplicates = documents.filter((document) => document.isDuplicate);
  const pending = documents.filter((document) => document.completionStatus === "Pending");

  if (documents.length === 0) {
    findings.push({ level: "action", title: "No documents indexed", detail: "The case file has no indexed documents. Confirm the registry record before listing." });
  }
  if (missing.length) {
    findings.push({ level: "action", title: `${missing.length} incomplete or missing item${missing.length > 1 ? "s" : ""}`, detail: missing.map((item) => item.filename).join(", ") });
  }
  if (duplicates.length) {
    findings.push({ level: "review", title: `${duplicates.length} possible duplicate${duplicates.length > 1 ? "s" : ""}`, detail: duplicates.map((item) => item.filename).join(", ") });
  }
  if (pending.length) {
    findings.push({ level: "review", title: `${pending.length} item${pending.length > 1 ? "s" : ""} pending completion`, detail: pending.map((item) => item.filename).join(", ") });
  }
  if (!findings.length) {
    findings.push({ level: "clear", title: "Document inventory looks complete", detail: "No missing, incomplete, or duplicate flags were found by the deterministic check." });
  }

  const score = Math.max(0, 100 - missing.length * 25 - duplicates.length * 9 - pending.length * 12 - (documents.length === 0 ? 35 : 0));
  return {
    caseId,
    score,
    status: score >= 90 ? "Clear" : score >= 65 ? "Review needed" : "Action required",
    checkedAt: new Date().toISOString(),
    findings,
  };
}

function scoreFor(caseTitle: string, precedent: PrecedentRecord) {
  const text = `${caseTitle} ${precedent.legalTopic}`.toLowerCase();
  const tokenBoost = ["constitutional", "administrative", "review", "state", "municipal", "writ"].reduce(
    (total, token) => total + (text.includes(token) ? 2 : 0),
    0,
  );
  const stableVariation = Array.from(`${caseTitle}${precedent._id}`).reduce((total, char) => total + char.charCodeAt(0), 0) % 6;
  return Math.min(98, precedent.relevanceScore + tokenBoost + stableVariation);
}

export function recommendPrecedents(caseRecord: CaseRecord, precedents: PrecedentRecord[]) {
  return precedents
    .map((precedent) => ({ ...precedent, relevanceScore: scoreFor(caseRecord.title, precedent) }))
    .sort((first, second) => second.relevanceScore - first.relevanceScore)
    .slice(0, 3);
}

export function generateCaseSummary(caseRecord: CaseRecord, documentHealth: DocumentHealth): CaseSummary {
  const parties = caseRecord.parties.join(" and ");
  const concern = documentHealth.status === "Clear"
    ? "The document inventory has no flagged issues in this preliminary check."
    : `The document inventory should be reviewed: ${documentHealth.findings[0]?.title.toLowerCase()}.`;

  return {
    caseId: caseRecord._id,
    label: "AI-assisted orientation — judicial review required",
    overview: `${caseRecord.caseNumber} concerns ${caseRecord.title}. The matter is recorded between ${parties} in ${caseRecord.jurisdiction}. It is currently marked ${caseRecord.status.toLowerCase()} and listed for ${new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(caseRecord.hearingDate))}. ${concern}`,
    keyQuestions: [
      "What relief is specifically sought, and what is the precise statutory or constitutional basis advanced?",
      "Which material facts and documents require confirmation from the record before the hearing?",
      "What submissions, if any, require a reasoned response in the eventual order?",
    ],
    reviewNote: "This is a structured orientation from available metadata and deterministic checks. It is not a finding, legal advice, or a proposed judicial outcome.",
  };
}

export function draftStarter(caseRecord: CaseRecord, type: "Order" | "Notice" | "Case note" | "Judgment outline") {
  const heading = type === "Order" ? "DRAFT ORDER" : type.toUpperCase();
  return `${heading}\n\nIn ${caseRecord.caseNumber}\n${caseRecord.title}\n\n1. The matter is listed before this Court on ${new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(new Date(caseRecord.hearingDate))}.\n\n2. The record and submissions are to be considered by the Court. This working draft is for judicial review and amendment; it records no automated conclusion.\n\n3. [Insert directions, reasons, or questions for counsel after judicial consideration.]\n\n— End of working draft —`;
}
