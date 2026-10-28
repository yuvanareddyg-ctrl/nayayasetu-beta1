export type CaseStatus = "Listed" | "Under Review" | "Reserved" | "Disposed";
export type CasePriority = "Standard" | "Priority" | "Urgent";
export type ReadinessStatus = "Ready" | "Needs review" | "Awaiting documents";

export interface CaseRecord {
  _id: string;
  caseNumber: string;
  title: string;
  jurisdiction: string;
  parties: string[];
  hearingDate: string;
  status: CaseStatus;
  priority: CasePriority;
  assignedJudge: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentRecord {
  _id: string;
  caseId: string;
  filename: string;
  type: string;
  uploadedDate: string;
  completionStatus: "Complete" | "Pending" | "Incomplete";
  isDuplicate: boolean;
  isMissing: boolean;
}

export interface PrecedentRecord {
  _id: string;
  title: string;
  court: string;
  year: number;
  legalTopic: string;
  relevanceScore: number;
  summary: string;
}

export interface HearingRecord {
  _id: string;
  caseId: string;
  date: string;
  time: string;
  estimatedDuration: number;
  readinessStatus: ReadinessStatus;
}

export interface DraftRecord {
  _id: string;
  caseId: string;
  draftType: "Order" | "Notice" | "Case note" | "Judgment outline";
  content: string;
  status: "Draft" | "Ready for review";
  createdDate: string;
}

export interface DocumentHealth {
  caseId: string;
  score: number;
  status: "Clear" | "Review needed" | "Action required";
  checkedAt: string;
  findings: Array<{ level: "clear" | "review" | "action"; title: string; detail: string }>;
}

export interface CaseSummary {
  caseId: string;
  label: string;
  overview: string;
  keyQuestions: string[];
  reviewNote: string;
}

export interface CauseListRecommendation {
  case: CaseRecord;
  hearing: HearingRecord | null;
  readiness: ReadinessStatus;
  recommendation: string;
  estimatedDuration: number;
  order: number;
}
