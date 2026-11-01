import type {
  CaseRecord,
  ConsultationRecord,
  DocumentRecord,
  HearingRecord,
  LegalRequestRecord,
  NotificationRecord,
  PrecedentRecord,
  UserRecord,
} from "@/lib/types";

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
  {
    _id: "doc-101a",
    caseId: "seed-case-101",
    filename: "Writ Petition and Annexures.pdf",
    type: "Pleading",
    uploadedDate: "2026-10-22T07:00:00.000Z",
    completionStatus: "Complete",
    isDuplicate: false,
    isMissing: false,
  },
  {
    _id: "doc-101b",
    caseId: "seed-case-101",
    filename: "State Counter Affidavit.pdf",
    type: "Response",
    uploadedDate: "2026-10-26T07:00:00.000Z",
    completionStatus: "Complete",
    isDuplicate: false,
    isMissing: false,
  },
  {
    _id: "doc-101c",
    caseId: "seed-case-101",
    filename: "Impugned Order.pdf",
    type: "Annexure",
    uploadedDate: "2026-10-21T07:00:00.000Z",
    completionStatus: "Incomplete",
    isDuplicate: false,
    isMissing: true,
  },
  {
    _id: "doc-102a",
    caseId: "seed-case-102",
    filename: "Memorandum of Appeal.pdf",
    type: "Pleading",
    uploadedDate: "2026-10-25T07:00:00.000Z",
    completionStatus: "Complete",
    isDuplicate: false,
    isMissing: false,
  },
  {
    _id: "doc-102b",
    caseId: "seed-case-102",
    filename: "Tender Record Volume I.pdf",
    type: "Evidence",
    uploadedDate: "2026-10-25T07:00:00.000Z",
    completionStatus: "Complete",
    isDuplicate: true,
    isMissing: false,
  },
  {
    _id: "doc-102c",
    caseId: "seed-case-102",
    filename: "Tender Record Volume I (copy).pdf",
    type: "Evidence",
    uploadedDate: "2026-10-25T07:01:00.000Z",
    completionStatus: "Complete",
    isDuplicate: true,
    isMissing: false,
  },
  {
    _id: "doc-103a",
    caseId: "seed-case-103",
    filename: "Revision Petition.pdf",
    type: "Pleading",
    uploadedDate: "2026-10-18T07:00:00.000Z",
    completionStatus: "Complete",
    isDuplicate: false,
    isMissing: false,
  },
  {
    _id: "doc-104a",
    caseId: "seed-case-104",
    filename: "Original Application.pdf",
    type: "Pleading",
    uploadedDate: "2026-10-27T07:00:00.000Z",
    completionStatus: "Pending",
    isDuplicate: false,
    isMissing: false,
  },
];

export const samplePrecedents: PrecedentRecord[] = [
  {
    _id: "prec-001",
    title: "K. S. Puttaswamy v. Union of India",
    court: "Supreme Court of India",
    year: 2017,
    legalTopic: "Constitutional rights",
    relevanceScore: 91,
    summary:
      "Sets out the proportionality framework for review of state action affecting fundamental rights.",
  },
  {
    _id: "prec-002",
    title: "Maneka Gandhi v. Union of India",
    court: "Supreme Court of India",
    year: 1978,
    legalTopic: "Due process",
    relevanceScore: 88,
    summary:
      "Interprets fairness and non-arbitrariness in procedure affecting personal liberty.",
  },
  {
    _id: "prec-003",
    title: "Tata Cellular v. Union of India",
    court: "Supreme Court of India",
    year: 1994,
    legalTopic: "Judicial review",
    relevanceScore: 84,
    summary:
      "Explains the limited scope of judicial review in administrative and contractual decisions.",
  },
  {
    _id: "prec-004",
    title: "Mohinder Singh Gill v. Chief Election Commissioner",
    court: "Supreme Court of India",
    year: 1978,
    legalTopic: "Administrative law",
    relevanceScore: 82,
    summary:
      "Addresses the requirement that an administrative order stand on its stated reasons.",
  },
];

export const sampleHearings: HearingRecord[] = [
  {
    _id: "hearing-101",
    caseId: "seed-case-101",
    date: "2026-11-04T00:00:00.000Z",
    time: "10:00",
    estimatedDuration: 35,
    readinessStatus: "Needs review",
  },
  {
    _id: "hearing-102",
    caseId: "seed-case-102",
    date: "2026-11-04T00:00:00.000Z",
    time: "11:05",
    estimatedDuration: 50,
    readinessStatus: "Needs review",
  },
  {
    _id: "hearing-103",
    caseId: "seed-case-103",
    date: "2026-11-05T00:00:00.000Z",
    time: "10:00",
    estimatedDuration: 20,
    readinessStatus: "Ready",
  },
  {
    _id: "hearing-104",
    caseId: "seed-case-104",
    date: "2026-11-06T00:00:00.000Z",
    time: "10:30",
    estimatedDuration: 25,
    readinessStatus: "Awaiting documents",
  },
];

export const sampleUsers: UserRecord[] = [
  {
    _id: "user-cit-001",
    name: "Aarav Mehta",
    email: "aarav.mehta@example.com",
    passwordHash: "$2b$10$0AF14zIN6SAlb5d9ocQQ.e12/KO9flJptcRdFqRZfdCOVSViu.nrG", // Password123!
    role: "citizen",
    phone: "+91 98765 41290",
    status: "active",
    createdAt: "2026-10-10T08:00:00.000Z",
  },
  {
    _id: "user-adv-001",
    name: "Adv. Priya Menon",
    email: "priya.menon@bar.example",
    passwordHash: "$2b$10$0AF14zIN6SAlb5d9ocQQ.e12/KO9flJptcRdFqRZfdCOVSViu.nrG", // Password123!
    role: "advocate",
    phone: "+91 98765 21034",
    organization: "Menon Legal Chambers",
    barCouncilNumber: "D/1429/2012",
    status: "active",
    createdAt: "2026-09-15T09:30:00.000Z",
  },
  {
    _id: "user-jud-001",
    name: "Hon'ble Justice R. Sen",
    email: "justice.sen@court.gov.in",
    passwordHash: "$2b$10$0AF14zIN6SAlb5d9ocQQ.e12/KO9flJptcRdFqRZfdCOVSViu.nrG", // Password123!
    role: "judge",
    phone: "+91 11 2338 0001",
    organization: "High Court of Aranya",
    status: "active",
    createdAt: "2026-08-01T04:00:00.000Z",
  },
  {
    _id: "user-adm-001",
    name: "Registry Administrator",
    email: "admin@nyayasetu.gov.in",
    passwordHash: "$2b$10$kgJxLgDWyZ4g8UzWZTDbIOD0To.vuz1Qp2zN6dS3eBMYAGGELK/se", // AdminPass123!
    role: "admin",
    phone: "+91 11 2338 9999",
    organization: "e-Courts Digital Mission Registry",
    status: "active",
    createdAt: "2026-07-01T00:00:00.000Z",
  },
];

export const sampleRequests: LegalRequestRecord[] = [
  {
    _id: "req-001",
    requestNumber: "NS-REQ-2026-1082",
    userId: "user-cit-001",
    applicantName: "Aarav Mehta",
    applicantEmail: "aarav.mehta@example.com",
    applicantPhone: "+91 98765 41290",
    serviceType: "Legal Aid Representation",
    category: "Constitutional & Rights",
    subject: "Writ Representation concerning State Gazette Notification",
    description:
      "Seeking legal assistance under Article 39A / NALSA scheme regarding the arbitrary cancellation of rural telecom service licenses affecting remote communities.",
    priority: "Urgent",
    status: "Assigned",
    assignedLawyer: {
      id: "user-adv-001",
      name: "Adv. Priya Menon",
      email: "priya.menon@bar.example",
      chamber: "Menon Legal Chambers",
    },
    documents: [
      {
        filename: "Representation_Affidavit.pdf",
        url: "#",
        size: 1048576,
        uploadedAt: "2026-10-24T10:15:00.000Z",
      },
    ],
    timeline: [
      {
        status: "Submitted",
        note: "Citizen assistance request received through NayayaSetu Portal.",
        timestamp: "2026-10-24T09:30:00.000Z",
        author: "Aarav Mehta",
      },
      {
        status: "Under Review",
        note: "Preliminary scrutiny completed by Legal Aid Helpdesk.",
        timestamp: "2026-10-25T11:00:00.000Z",
        author: "Registry Desk",
      },
      {
        status: "Assigned",
        note: "Assigned to panel advocate Adv. Priya Menon for representation.",
        timestamp: "2026-10-26T14:20:00.000Z",
        author: "DLSA Coordinator",
      },
    ],
    createdAt: "2026-10-24T09:30:00.000Z",
  },
  {
    _id: "req-002",
    requestNumber: "NS-REQ-2026-1094",
    userId: "user-cit-001",
    applicantName: "Aarav Mehta",
    applicantEmail: "aarav.mehta@example.com",
    applicantPhone: "+91 98765 41290",
    serviceType: "Document Scrutiny",
    category: "Civil & Property",
    subject: "Review of Ancestral Land Revenue Record Discrepancy",
    description:
      "Requesting scrutiny of mutation entry and revenue patta documentation prior to filing an appeal before the Sub-Divisional Magistrate.",
    priority: "Standard",
    status: "Under Review",
    documents: [
      {
        filename: "Patta_Extract_2025.pdf",
        url: "#",
        size: 524288,
        uploadedAt: "2026-10-28T08:00:00.000Z",
      },
    ],
    timeline: [
      {
        status: "Submitted",
        note: "Document scrutiny request registered.",
        timestamp: "2026-10-28T08:00:00.000Z",
        author: "Aarav Mehta",
      },
    ],
    createdAt: "2026-10-28T08:00:00.000Z",
  },
  {
    _id: "req-003",
    requestNumber: "NS-REQ-2026-1050",
    userId: "user-cit-002",
    applicantName: "Sunita Devi",
    applicantEmail: "sunita.devi@example.org",
    applicantPhone: "+91 98765 33411",
    serviceType: "Legal Advisory",
    category: "Family & Matrimonial",
    subject: "Guidance on Maintenance Petition under Section 125 CrPC",
    description:
      "Seeking legal advice and institutional legal aid for securing child maintenance following separation.",
    priority: "Standard",
    status: "Completed",
    assignedLawyer: {
      id: "law-3",
      name: "Adv. Leela Nair",
      email: "leela.nair@bar.example",
      chamber: "Nair Counsel",
    },
    documents: [],
    timeline: [
      {
        status: "Submitted",
        note: "Application submitted.",
        timestamp: "2026-10-15T09:00:00.000Z",
        author: "Sunita Devi",
      },
      {
        status: "Completed",
        note: "Advisory session completed. Petition drafted for family court.",
        timestamp: "2026-10-20T16:00:00.000Z",
        author: "Adv. Leela Nair",
      },
    ],
    createdAt: "2026-10-15T09:00:00.000Z",
  },
];

export const sampleConsultations: ConsultationRecord[] = [
  {
    _id: "cons-001",
    consultationNumber: "NS-CONS-2026-441",
    userId: "user-cit-001",
    lawyerId: "user-adv-001",
    lawyerName: "Adv. Priya Menon",
    applicantName: "Aarav Mehta",
    applicantEmail: "aarav.mehta@example.com",
    applicantPhone: "+91 98765 41290",
    date: "2026-11-02T05:30:00.000Z",
    timeSlot: "11:30 AM - 12:00 PM",
    matterSummary: "Pre-hearing strategy discussion for W.P. (C) 1842/2026",
    mode: "Video Conference",
    status: "Confirmed",
    meetingLink: "https://meet.jit.si/NayayaSetu-Consultation-441",
    createdAt: "2026-10-27T12:00:00.000Z",
  },
];

export const sampleNotifications: NotificationRecord[] = [
  {
    _id: "notif-001",
    userId: "user-cit-001",
    title: "Advocate Assigned to Your Request",
    message:
      "Adv. Priya Menon has been assigned to your Legal Aid application NS-REQ-2026-1082.",
    type: "success",
    link: "/dashboard",
    isRead: false,
    createdAt: "2026-10-26T14:20:00.000Z",
  },
  {
    _id: "notif-002",
    userId: "user-cit-001",
    title: "Hearing Date Listed",
    message: "W.P. (C) 1842/2026 is listed for hearing on 04-Nov-2026 in Court Hall 4.",
    type: "info",
    link: "/cases/seed-case-101",
    isRead: false,
    createdAt: "2026-10-28T10:00:00.000Z",
  },
  {
    _id: "notif-003",
    userId: "user-cit-001",
    title: "Document Incomplete Notice",
    message:
      "Impugned Order copy requires clear certification for case W.P. (C) 1842/2026.",
    type: "warning",
    link: "/cases/seed-case-101",
    isRead: true,
    createdAt: "2026-10-25T16:00:00.000Z",
  },
];

export const sampleLoginRecords: Array<{
  _id: string;
  username: string;
  email: string;
  loginAt: string;
  ipAddress?: string;
  userAgent?: string;
}> = [
  {
    _id: "audit-01",
    username: "Hon'ble Justice R. Sen",
    email: "justice.sen@court.gov.in",
    loginAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    ipAddress: "10.24.110.12",
  },
  {
    _id: "audit-02",
    username: "Adv. Priya Menon",
    email: "priya.menon@bar.example",
    loginAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    ipAddress: "192.168.1.45",
  },
  {
    _id: "audit-03",
    username: "Aarav Mehta",
    email: "aarav.mehta@example.com",
    loginAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    ipAddress: "103.21.244.1",
  },
];

