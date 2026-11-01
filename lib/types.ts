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

// ── User and Role Types ────────────────────────────────────────────────────────
export type UserRole = "citizen" | "advocate" | "judge" | "admin";

export interface UserRecord {
  _id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  phone?: string;
  organization?: string;
  barCouncilNumber?: string;
  avatar?: string;
  resetToken?: string;
  resetTokenExpiry?: string | Date;
  status: "active" | "suspended";
  createdAt?: string;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  organization?: string;
  barCouncilNumber?: string;
}

// ── Legal Services & Assistance Types ──────────────────────────────────────────
export type ServiceType =
  | "Legal Aid Representation"
  | "Legal Advisory"
  | "Document Scrutiny"
  | "Bail & Custody Assistance"
  | "Mediation";

export type LegalCategory =
  | "Constitutional & Rights"
  | "Civil & Property"
  | "Family & Matrimonial"
  | "Criminal Defense"
  | "Labor & Employment"
  | "Consumer & Commercial";

export type RequestStatus =
  | "Submitted"
  | "Under Review"
  | "Assigned"
  | "Hearing Scheduled"
  | "Completed"
  | "Rejected";

export interface RequestTimelineEvent {
  status: string;
  note: string;
  timestamp: string;
  author: string;
}

export interface RequestDocument {
  filename: string;
  url: string;
  size?: number;
  uploadedAt: string;
}

export interface LegalRequestRecord {
  _id: string;
  requestNumber: string;
  userId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  serviceType: ServiceType;
  category: LegalCategory;
  subject: string;
  description: string;
  priority: "Standard" | "Urgent" | "Emergency";
  status: RequestStatus;
  assignedLawyer?: {
    id: string;
    name: string;
    email: string;
    chamber: string;
  };
  documents: RequestDocument[];
  timeline: RequestTimelineEvent[];
  createdAt: string;
  updatedAt?: string;
}

// ── In-App Notifications ──────────────────────────────────────────────────────
export interface NotificationRecord {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "action";
  link?: string;
  isRead: boolean;
  createdAt: string;
}

// ── Consultations ─────────────────────────────────────────────────────────────
export interface ConsultationRecord {
  _id: string;
  consultationNumber: string;
  userId: string;
  lawyerId: string;
  lawyerName: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  date: string;
  timeSlot: string;
  matterSummary: string;
  mode: "Video Conference" | "In-Person" | "Phone Consultation";
  status: "Confirmed" | "Rescheduled" | "Completed" | "Cancelled";
  meetingLink?: string;
  createdAt: string;
}

// ── Platform Analytics ────────────────────────────────────────────────────────
export interface PlatformStats {
  totalCases: number;
  activeMatters: number;
  priorityMatters: number;
  totalUsers: number;
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  verifiedAdvocates: number;
  todayHearings: number;
}
