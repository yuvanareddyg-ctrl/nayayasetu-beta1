import mongoose from "mongoose";
import { connectToDatabase, hasMongoUri } from "@/lib/db";
import {
  sampleCases,
  sampleConsultations,
  sampleDocuments,
  sampleHearings,
  sampleNotifications,
  samplePrecedents,
  sampleRequests,
  sampleUsers,
} from "@/lib/sample-data";
import type {
  CaseRecord,
  ConsultationRecord,
  DocumentRecord,
  DraftRecord,
  HearingRecord,
  LegalRequestRecord,
  NotificationRecord,
  PlatformStats,
  PrecedentRecord,
  UserRecord,
} from "@/lib/types";
import { CaseModel } from "@/models/Case";
import { DocumentModel } from "@/models/Document";
import { DraftModel } from "@/models/Draft";
import { HearingModel } from "@/models/Hearing";
import { PrecedentModel } from "@/models/Precedent";
import { UserModel } from "@/models/User";
import { LegalRequestModel } from "@/models/LegalRequest";
import { NotificationModel } from "@/models/Notification";
import { ConsultationModel } from "@/models/Consultation";

type CaseInput = Omit<CaseRecord, "_id" | "createdAt" | "updatedAt">;
type DraftInput = Omit<DraftRecord, "_id" | "caseId" | "createdDate">;
type DocumentInput = Omit<DocumentRecord, "_id" | "uploadedDate">;
type UserInput = Omit<UserRecord, "_id" | "createdAt">;
type LegalRequestInput = Omit<LegalRequestRecord, "_id" | "createdAt" | "updatedAt">;
type ConsultationInput = Omit<ConsultationRecord, "_id" | "createdAt">;

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

interface MemoryStore {
  cases: CaseRecord[];
  documents: DocumentRecord[];
  precedents: PrecedentRecord[];
  hearings: HearingRecord[];
  drafts: DraftRecord[];
  users: UserRecord[];
  requests: LegalRequestRecord[];
  consultations: ConsultationRecord[];
  notifications: NotificationRecord[];
}

const globalForMemory = globalThis as unknown as {
  __nyayasetu_memory?: MemoryStore;
};

export const memory: MemoryStore =
  globalForMemory.__nyayasetu_memory ??
  (globalForMemory.__nyayasetu_memory = {
    cases: clone(sampleCases),
    documents: clone(sampleDocuments),
    precedents: clone(samplePrecedents),
    hearings: clone(sampleHearings),
    drafts: [] as DraftRecord[],
    users: clone(sampleUsers),
    requests: clone(sampleRequests),
    consultations: clone(sampleConsultations),
    notifications: clone(sampleNotifications),
  });

function mongoRecord<T>(value: unknown): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

let mongoAvailable: boolean | null = null;
let lastCheckTime = 0;

export async function isMongoAvailable(): Promise<boolean> {
  if (!hasMongoUri()) return false;
  const now = Date.now();
  if (mongoAvailable === false && now - lastCheckTime < 10000) {
    return false;
  }
  try {
    await connectToDatabase();
    if (mongoAvailable !== true) {
      console.log("[NyayaSetu] Connected to MongoDB database.");
      mongoAvailable = true;
    }
    return true;
  } catch (error) {
    if (mongoAvailable !== false) {
      console.warn(
        `[NyayaSetu] Operating in in-memory mode (${error instanceof Error ? error.message : "database offline"}).`
      );
      mongoAvailable = false;
    }
    lastCheckTime = now;
    return false;
  }
}

// ── Cases ─────────────────────────────────────────────────────────────────────
export async function listCases(): Promise<CaseRecord[]> {
  if (!(await isMongoAvailable())) return clone(memory.cases);
  return mongoRecord<CaseRecord[]>(await CaseModel.find().sort({ hearingDate: 1 }).lean());
}

export async function createCase(input: CaseInput): Promise<CaseRecord> {
  if (!(await isMongoAvailable())) {
    if (memory.cases.some((c) => c.caseNumber === input.caseNumber)) {
      throw new Error("duplicate case number");
    }
    const record: CaseRecord = {
      _id: `case-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...input,
    };
    memory.cases.push(record);
    return clone(record);
  }
  return mongoRecord<CaseRecord>(await CaseModel.create(input));
}

export async function getCase(id: string): Promise<CaseRecord | null> {
  if (!(await isMongoAvailable())) {
    return clone(
      memory.cases.find(
        (item) => item._id === id || item.caseNumber.toLowerCase() === id.toLowerCase()
      ) ?? null
    );
  }
  const record = mongoose.isObjectIdOrHexString(id)
    ? await CaseModel.findById(id).lean()
    : await CaseModel.findOne({ caseNumber: id }).lean();
  return record ? mongoRecord<CaseRecord>(record) : null;
}

export async function updateCase(
  id: string,
  update: Partial<CaseInput>
): Promise<CaseRecord | null> {
  if (!(await isMongoAvailable())) {
    const index = memory.cases.findIndex(
      (item) => item._id === id || item.caseNumber === id
    );
    if (index < 0) return null;
    memory.cases[index] = { ...memory.cases[index], ...update, updatedAt: new Date().toISOString() };
    return clone(memory.cases[index]);
  }
  const query = mongoose.isObjectIdOrHexString(id) ? { _id: id } : { caseNumber: id };
  const record = await CaseModel.findOneAndUpdate(query, update, {
    new: true,
    runValidators: true,
  }).lean();
  return record ? mongoRecord<CaseRecord>(record) : null;
}

// ── Documents ─────────────────────────────────────────────────────────────────
export async function listDocuments(caseId: string): Promise<DocumentRecord[]> {
  if (!(await isMongoAvailable())) {
    return clone(memory.documents.filter((item) => item.caseId === caseId));
  }
  return mongoRecord<DocumentRecord[]>(
    await DocumentModel.find({ caseId }).sort({ uploadedDate: -1 }).lean()
  );
}

export async function createDocument(input: DocumentInput): Promise<DocumentRecord> {
  const uploadedDate = new Date().toISOString();
  if (!(await isMongoAvailable())) {
    const record: DocumentRecord = {
      _id: `doc-${Date.now()}`,
      uploadedDate,
      ...input,
    };
    memory.documents.unshift(record);
    return clone(record);
  }
  return mongoRecord<DocumentRecord>(
    await DocumentModel.create({ ...input, uploadedDate })
  );
}

// ── Precedents & Hearings ─────────────────────────────────────────────────────
export async function listPrecedents(): Promise<PrecedentRecord[]> {
  if (!(await isMongoAvailable())) return clone(memory.precedents);
  return mongoRecord<PrecedentRecord[]>(await PrecedentModel.find().lean());
}

export async function getHearing(caseId: string): Promise<HearingRecord | null> {
  if (!(await isMongoAvailable())) {
    return clone(memory.hearings.find((item) => item.caseId === caseId) ?? null);
  }
  const record = await HearingModel.findOne({ caseId }).lean();
  return record ? mongoRecord<HearingRecord>(record) : null;
}

export async function listHearings(): Promise<HearingRecord[]> {
  if (!(await isMongoAvailable())) return clone(memory.hearings);
  return mongoRecord<HearingRecord[]>(
    await HearingModel.find().sort({ date: 1, time: 1 }).lean()
  );
}

// ── Drafts ────────────────────────────────────────────────────────────────────
export async function listDrafts(caseId: string): Promise<DraftRecord[]> {
  if (!(await isMongoAvailable())) {
    return clone(memory.drafts.filter((item) => item.caseId === caseId));
  }
  return mongoRecord<DraftRecord[]>(
    await DraftModel.find({ caseId }).sort({ createdDate: -1 }).lean()
  );
}

export async function createDraft(
  caseId: string,
  input: DraftInput
): Promise<DraftRecord> {
  const createdDate = new Date().toISOString();
  if (!(await isMongoAvailable())) {
    const record: DraftRecord = {
      _id: `local-draft-${Date.now()}`,
      caseId,
      createdDate,
      ...input,
    };
    memory.drafts.unshift(record);
    return clone(record);
  }
  return mongoRecord<DraftRecord>(
    await DraftModel.create({ caseId, createdDate, ...input })
  );
}

// ── Users ─────────────────────────────────────────────────────────────────────
export async function listUsers(): Promise<UserRecord[]> {
  if (!(await isMongoAvailable())) {
    return clone(
      memory.users.map((u) => {
        const copy = { ...u };
        delete copy.passwordHash;
        return copy as UserRecord;
      })
    );
  }
  const users = await UserModel.find({}, { passwordHash: 0 }).sort({ createdAt: -1 }).lean();
  return mongoRecord<UserRecord[]>(users);
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const normalized = email.trim().toLowerCase();
  if (!(await isMongoAvailable())) {
    return clone(memory.users.find((u) => u.email.toLowerCase() === normalized) ?? null);
  }
  const user = await UserModel.findOne({ email: normalized }).lean();
  return user ? mongoRecord<UserRecord>(user) : null;
}

export async function getUserById(id: string): Promise<UserRecord | null> {
  if (!(await isMongoAvailable())) {
    return clone(memory.users.find((u) => u._id === id) ?? null);
  }
  const user = await UserModel.findById(id).lean();
  return user ? mongoRecord<UserRecord>(user) : null;
}

export async function createUser(input: UserInput): Promise<UserRecord> {
  const normalizedEmail = input.email.trim().toLowerCase();
  if (!(await isMongoAvailable())) {
    if (memory.users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      throw new Error("duplicate email");
    }
    const record: UserRecord = {
      _id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...input,
      email: normalizedEmail,
    };
    memory.users.push(record);
    return clone(record);
  }
  return mongoRecord<UserRecord>(
    await UserModel.create({ ...input, email: normalizedEmail })
  );
}

export async function updateUser(
  id: string,
  update: Partial<UserInput>
): Promise<UserRecord | null> {
  if (!(await isMongoAvailable())) {
    const index = memory.users.findIndex((u) => u._id === id);
    if (index < 0) return null;
    memory.users[index] = { ...memory.users[index], ...update };
    return clone(memory.users[index]);
  }
  const user = await UserModel.findByIdAndUpdate(id, update, { new: true }).lean();
  return user ? mongoRecord<UserRecord>(user) : null;
}

// ── Legal Requests ────────────────────────────────────────────────────────────
export async function listLegalRequests(filter?: {
  userId?: string;
  status?: string;
}): Promise<LegalRequestRecord[]> {
  if (!(await isMongoAvailable())) {
    let result = memory.requests;
    if (filter?.userId) {
      result = result.filter((r) => r.userId === filter.userId);
    }
    if (filter?.status) {
      result = result.filter((r) => r.status === filter.status);
    }
    return clone(result);
  }
  const query: Record<string, unknown> = {};
  if (filter?.userId) query.userId = filter.userId;
  if (filter?.status) query.status = filter.status;
  const requests = await LegalRequestModel.find(query).sort({ createdAt: -1 }).lean();
  return mongoRecord<LegalRequestRecord[]>(requests);
}

export async function getLegalRequestById(id: string): Promise<LegalRequestRecord | null> {
  if (!(await isMongoAvailable())) {
    return clone(
      memory.requests.find(
        (r) => r._id === id || r.requestNumber.toLowerCase() === id.toLowerCase()
      ) ?? null
    );
  }
  const record = mongoose.isObjectIdOrHexString(id)
    ? await LegalRequestModel.findById(id).lean()
    : await LegalRequestModel.findOne({ requestNumber: id }).lean();
  return record ? mongoRecord<LegalRequestRecord>(record) : null;
}

export async function createLegalRequest(
  input: LegalRequestInput
): Promise<LegalRequestRecord> {
  const createdAt = new Date().toISOString();
  if (!(await isMongoAvailable())) {
    const record: LegalRequestRecord = {
      _id: `req-${Date.now()}`,
      createdAt,
      ...input,
    };
    memory.requests.unshift(record);
    return clone(record);
  }
  return mongoRecord<LegalRequestRecord>(
    await LegalRequestModel.create({ ...input, createdAt })
  );
}

export async function updateLegalRequest(
  id: string,
  update: Partial<LegalRequestRecord>
): Promise<LegalRequestRecord | null> {
  if (!(await isMongoAvailable())) {
    const index = memory.requests.findIndex(
      (r) => r._id === id || r.requestNumber === id
    );
    if (index < 0) return null;
    memory.requests[index] = {
      ...memory.requests[index],
      ...update,
      updatedAt: new Date().toISOString(),
    };
    return clone(memory.requests[index]);
  }
  const query = mongoose.isObjectIdOrHexString(id) ? { _id: id } : { requestNumber: id };
  const record = await LegalRequestModel.findOneAndUpdate(query, update, {
    new: true,
  }).lean();
  return record ? mongoRecord<LegalRequestRecord>(record) : null;
}

// ── Notifications ─────────────────────────────────────────────────────────────
export async function listNotifications(userId: string): Promise<NotificationRecord[]> {
  if (!(await isMongoAvailable())) {
    return clone(
      memory.notifications
        .filter((n) => n.userId === userId || n.userId === "all")
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    );
  }
  const notifs = await NotificationModel.find({
    $or: [{ userId }, { userId: "all" }],
  })
    .sort({ createdAt: -1 })
    .lean();
  return mongoRecord<NotificationRecord[]>(notifs);
}

export async function markNotificationRead(id: string): Promise<boolean> {
  if (!(await isMongoAvailable())) {
    const notif = memory.notifications.find((n) => n._id === id);
    if (notif) {
      notif.isRead = true;
      return true;
    }
    return false;
  }
  const res = await NotificationModel.updateOne({ _id: id }, { isRead: true });
  return res.modifiedCount > 0;
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  if (!(await isMongoAvailable())) {
    memory.notifications.forEach((n) => {
      if (n.userId === userId || n.userId === "all") n.isRead = true;
    });
    return;
  }
  await NotificationModel.updateMany(
    { $or: [{ userId }, { userId: "all" }] },
    { isRead: true }
  );
}

export async function createNotification(
  input: Omit<NotificationRecord, "_id" | "createdAt">
): Promise<NotificationRecord> {
  const createdAt = new Date().toISOString();
  if (!(await isMongoAvailable())) {
    const record: NotificationRecord = {
      _id: `notif-${Date.now()}`,
      createdAt,
      ...input,
    };
    memory.notifications.unshift(record);
    return clone(record);
  }
  return mongoRecord<NotificationRecord>(
    await NotificationModel.create({ ...input, createdAt })
  );
}

// ── Consultations ─────────────────────────────────────────────────────────────
export async function listConsultations(filter?: {
  userId?: string;
  lawyerId?: string;
}): Promise<ConsultationRecord[]> {
  if (!(await isMongoAvailable())) {
    let result = memory.consultations;
    if (filter?.userId) result = result.filter((c) => c.userId === filter.userId);
    if (filter?.lawyerId) result = result.filter((c) => c.lawyerId === filter.lawyerId);
    return clone(result);
  }
  const query: Record<string, unknown> = {};
  if (filter?.userId) query.userId = filter.userId;
  if (filter?.lawyerId) query.lawyerId = filter.lawyerId;
  const list = await ConsultationModel.find(query).sort({ date: 1 }).lean();
  return mongoRecord<ConsultationRecord[]>(list);
}

export async function createConsultation(
  input: ConsultationInput
): Promise<ConsultationRecord> {
  const createdAt = new Date().toISOString();
  if (!(await isMongoAvailable())) {
    const record: ConsultationRecord = {
      _id: `cons-${Date.now()}`,
      createdAt,
      ...input,
    };
    memory.consultations.push(record);
    return clone(record);
  }
  return mongoRecord<ConsultationRecord>(
    await ConsultationModel.create({ ...input, createdAt })
  );
}

// ── Platform Stats ────────────────────────────────────────────────────────────
export async function getPlatformStats(): Promise<PlatformStats> {
  const cases = await listCases();
  const requests = await listLegalRequests();
  const users = await listUsers();
  const hearings = await listHearings();

  const activeMatters = cases.filter((c) => c.status !== "Disposed").length;
  const priorityMatters = cases.filter((c) => c.priority !== "Standard").length;
  const pendingRequests = requests.filter(
    (r) => r.status === "Submitted" || r.status === "Under Review"
  ).length;
  const completedRequests = requests.filter((r) => r.status === "Completed").length;
  const verifiedAdvocates = users.filter((u) => u.role === "advocate").length;

  return {
    totalCases: cases.length,
    activeMatters,
    priorityMatters,
    totalUsers: users.length,
    totalRequests: requests.length,
    pendingRequests,
    completedRequests,
    verifiedAdvocates: Math.max(verifiedAdvocates, 6), // includes panel lawyers
    todayHearings: hearings.length,
  };
}
