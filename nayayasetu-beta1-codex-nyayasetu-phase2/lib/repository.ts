import mongoose from "mongoose";
import { connectToDatabase, hasMongoUri } from "@/lib/db";
import { sampleCases, sampleDocuments, sampleHearings, samplePrecedents } from "@/lib/sample-data";
import type { CaseRecord, DocumentRecord, DraftRecord, HearingRecord, PrecedentRecord } from "@/lib/types";
import { CaseModel } from "@/models/Case";
import { DocumentModel } from "@/models/Document";
import { DraftModel } from "@/models/Draft";
import { HearingModel } from "@/models/Hearing";
import { PrecedentModel } from "@/models/Precedent";

type CaseInput = Omit<CaseRecord, "_id" | "createdAt" | "updatedAt">;
type DraftInput = Omit<DraftRecord, "_id" | "caseId" | "createdDate">;

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const memory = {
  cases: clone(sampleCases),
  documents: clone(sampleDocuments),
  precedents: clone(samplePrecedents),
  hearings: clone(sampleHearings),
  drafts: [] as DraftRecord[],
};

function mongoRecord<T>(value: unknown): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

let mongoAvailable: boolean | null = null;
let lastCheckTime = 0;

async function isMongoAvailable(): Promise<boolean> {
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
        `[NyayaSetu] Could not reach MongoDB (${error instanceof Error ? error.message : "connection failed"}). Operating seamlessly in in-memory demonstration mode.`
      );
      mongoAvailable = false;
    }
    lastCheckTime = now;
    return false;
  }
}

export async function listCases(): Promise<CaseRecord[]> {
  if (!(await isMongoAvailable())) return clone(memory.cases);
  return mongoRecord<CaseRecord[]>(await CaseModel.find().sort({ hearingDate: 1 }).lean());
}

export async function createCase(input: CaseInput): Promise<CaseRecord> {
  if (!(await isMongoAvailable())) {
    if (memory.cases.some((c) => c.caseNumber === input.caseNumber)) {
      throw new Error("duplicate case number");
    }
    const record: CaseRecord = { _id: `local-case-${Date.now()}`, ...input };
    memory.cases.push(record);
    return clone(record);
  }
  return mongoRecord<CaseRecord>(await CaseModel.create(input));
}

export async function getCase(id: string): Promise<CaseRecord | null> {
  if (!(await isMongoAvailable())) {
    return clone(memory.cases.find((item) => item._id === id || item.caseNumber === id) ?? null);
  }
  const record = mongoose.isObjectIdOrHexString(id)
    ? await CaseModel.findById(id).lean()
    : await CaseModel.findOne({ caseNumber: id }).lean();
  return record ? mongoRecord<CaseRecord>(record) : null;
}

export async function updateCase(id: string, update: Partial<CaseInput>): Promise<CaseRecord | null> {
  if (!(await isMongoAvailable())) {
    const index = memory.cases.findIndex((item) => item._id === id || item.caseNumber === id);
    if (index < 0) return null;
    memory.cases[index] = { ...memory.cases[index], ...update };
    return clone(memory.cases[index]);
  }
  const query = mongoose.isObjectIdOrHexString(id) ? { _id: id } : { caseNumber: id };
  const record = await CaseModel.findOneAndUpdate(query, update, { new: true, runValidators: true }).lean();
  return record ? mongoRecord<CaseRecord>(record) : null;
}

export async function listDocuments(caseId: string): Promise<DocumentRecord[]> {
  if (!(await isMongoAvailable())) {
    return clone(memory.documents.filter((item) => item.caseId === caseId));
  }
  return mongoRecord<DocumentRecord[]>(await DocumentModel.find({ caseId }).sort({ uploadedDate: -1 }).lean());
}

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
  return mongoRecord<HearingRecord[]>(await HearingModel.find().sort({ date: 1, time: 1 }).lean());
}

export async function listDrafts(caseId: string): Promise<DraftRecord[]> {
  if (!(await isMongoAvailable())) {
    return clone(memory.drafts.filter((item) => item.caseId === caseId));
  }
  return mongoRecord<DraftRecord[]>(await DraftModel.find({ caseId }).sort({ createdDate: -1 }).lean());
}

export async function createDraft(caseId: string, input: DraftInput): Promise<DraftRecord> {
  const createdDate = new Date().toISOString();
  if (!(await isMongoAvailable())) {
    const record: DraftRecord = { _id: `local-draft-${Date.now()}`, caseId, createdDate, ...input };
    memory.drafts.unshift(record);
    return clone(record);
  }
  return mongoRecord<DraftRecord>(await DraftModel.create({ caseId, createdDate, ...input }));
}
