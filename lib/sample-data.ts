import type { CaseRecord, DocumentRecord, HearingRecord, PrecedentRecord } from "@/lib/types";

export const sampleCases: CaseRecord[] = [
  {
    _id: "seed-case-101",
    caseNumber: "W.P. (C) 1842/2026",
    title: "Aarav Mehta v. State of Aranya",
    jurisdiction: "High Court of Aranya · Constitutional Writ",
    parties: ["Aarav Mehta", "State of Aranya"],
    hearingDate: "2026-11-04T04:30:00.000Z",
    status: "Under Review",
    priority: "Priority",
    assignedJudge: "Hon'ble Justice R. Sen",
  },
  {
    _id: "seed-case-102",
    caseNumber: "C.A. 917/2026",
    title: "Nila Infrastructure Ltd. v. Municipal Council",
    jurisdiction: "High Court of Aranya · Civil Appellate",
    parties: ["Nila Infrastructure Ltd.", "Municipal Council"],
    hearingDate: "2026-11-04T05:35:00.000Z",
    status: "Listed",
    priority: "Urgent",
    assignedJudge: "Hon'ble Justice M. Iyer",
  },
  {
    _id: "seed-case-103",
    caseNumber: "Crl. Rev. 66/2026",
    title: "Re: Protection of Witness Identity",
    jurisdiction: "High Court of Aranya · Criminal Revision",
    parties: ["State of Aranya", "R. K. Sharma"],
    hearingDate: "2026-11-05T04:30:00.000Z",
    status: "Reserved",
    priority: "Priority",
    assignedJudge: "Hon'ble Justice R. Sen",
  },
  {
    _id: "seed-case-104",
    caseNumber: "O.A. 231/2026",
    title: "Kavya Rao v. District Land Authority",
    jurisdiction: "High Court of Aranya · Administrative",
    parties: ["Kavya Rao", "District Land Authority"],
    hearingDate: "2026-11-06T05:00:00.000Z",
    status: "Listed",
    priority: "Standard",
    assignedJudge: "Hon'ble Justice A. Thomas",
  },
];

export const sampleDocuments: DocumentRecord[] = [
  { _id: "doc-101a", caseId: "seed-case-101", filename: "Writ Petition and Annexures.pdf", type: "Pleading", uploadedDate: "2026-10-22T07:00:00.000Z", completionStatus: "Complete", isDuplicate: false, isMissing: false },
  { _id: "doc-101b", caseId: "seed-case-101", filename: "State Counter Affidavit.pdf", type: "Response", uploadedDate: "2026-10-26T07:00:00.000Z", completionStatus: "Complete", isDuplicate: false, isMissing: false },
  { _id: "doc-101c", caseId: "seed-case-101", filename: "Impugned Order.pdf", type: "Annexure", uploadedDate: "2026-10-21T07:00:00.000Z", completionStatus: "Incomplete", isDuplicate: false, isMissing: true },
  { _id: "doc-102a", caseId: "seed-case-102", filename: "Memorandum of Appeal.pdf", type: "Pleading", uploadedDate: "2026-10-25T07:00:00.000Z", completionStatus: "Complete", isDuplicate: false, isMissing: false },
  { _id: "doc-102b", caseId: "seed-case-102", filename: "Tender Record Volume I.pdf", type: "Evidence", uploadedDate: "2026-10-25T07:00:00.000Z", completionStatus: "Complete", isDuplicate: true, isMissing: false },
  { _id: "doc-102c", caseId: "seed-case-102", filename: "Tender Record Volume I (copy).pdf", type: "Evidence", uploadedDate: "2026-10-25T07:01:00.000Z", completionStatus: "Complete", isDuplicate: true, isMissing: false },
  { _id: "doc-103a", caseId: "seed-case-103", filename: "Revision Petition.pdf", type: "Pleading", uploadedDate: "2026-10-18T07:00:00.000Z", completionStatus: "Complete", isDuplicate: false, isMissing: false },
  { _id: "doc-104a", caseId: "seed-case-104", filename: "Original Application.pdf", type: "Pleading", uploadedDate: "2026-10-27T07:00:00.000Z", completionStatus: "Pending", isDuplicate: false, isMissing: false },
];

export const samplePrecedents: PrecedentRecord[] = [
  { _id: "prec-001", title: "K. S. Puttaswamy v. Union of India", court: "Supreme Court of India", year: 2017, legalTopic: "Constitutional rights", relevanceScore: 91, summary: "Sets out the proportionality framework for review of state action affecting fundamental rights." },
  { _id: "prec-002", title: "Maneka Gandhi v. Union of India", court: "Supreme Court of India", year: 1978, legalTopic: "Due process", relevanceScore: 88, summary: "Interprets fairness and non-arbitrariness in procedure affecting personal liberty." },
  { _id: "prec-003", title: "Tata Cellular v. Union of India", court: "Supreme Court of India", year: 1994, legalTopic: "Judicial review", relevanceScore: 84, summary: "Explains the limited scope of judicial review in administrative and contractual decisions." },
  { _id: "prec-004", title: "Mohinder Singh Gill v. Chief Election Commissioner", court: "Supreme Court of India", year: 1978, legalTopic: "Administrative law", relevanceScore: 82, summary: "Addresses the requirement that an administrative order stand on its stated reasons." },
];

export const sampleHearings: HearingRecord[] = [
  { _id: "hearing-101", caseId: "seed-case-101", date: "2026-11-04T00:00:00.000Z", time: "10:00", estimatedDuration: 35, readinessStatus: "Needs review" },
  { _id: "hearing-102", caseId: "seed-case-102", date: "2026-11-04T00:00:00.000Z", time: "11:05", estimatedDuration: 50, readinessStatus: "Needs review" },
  { _id: "hearing-103", caseId: "seed-case-103", date: "2026-11-05T00:00:00.000Z", time: "10:00", estimatedDuration: 20, readinessStatus: "Ready" },
  { _id: "hearing-104", caseId: "seed-case-104", date: "2026-11-06T00:00:00.000Z", time: "10:30", estimatedDuration: 25, readinessStatus: "Awaiting documents" },
];
