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

export async function listCases(): Promise<CaseRecord[]> {
  if (!hasMongoUri()) return clone(memory.cases);
  await connectToDatabase();
  return mongoRecord<CaseRecord[]>(await CaseModel.find().sort({ hearingDate: 1 }).lean());
}

export async function createCase(input: CaseInput): Promise<CaseRecord> {
  if (!hasMongoUri()) {
    const record: CaseRecord = { _id: `local-case-${Date.now()}`, ...input };
    memory.cases.push(record);
    return clone(record);
  }
  await connectToDatabase();
  return mongoRecord<CaseRecord>(await CaseModel.create(input));
}

export async function getCase(id: string): Promise<CaseRecord | null> {
  if (!hasMongoUri()) return clone(memory.cases.find((item) => item._id === id || item.caseNumber === id) ?? null);
  await connectToDatabase();
  const record = mongoose.isObjectIdOrHexString(id)
    ? await CaseModel.findById(id).lean()
    : await CaseModel.findOne({ caseNumber: id }).lean();
  return record ? mongoRecord<CaseRecord>(record) : null;
}

export async function updateCase(id: string, update: Partial<CaseInput>): Promise<CaseRecord | null> {
  if (!hasMongoUri()) {
    const index = memory.cases.findIndex((item) => item._id === id || item.caseNumber === id);
    if (index < 0) return null;
    memory.cases[index] = { ...memory.cases[index], ...update };
    return clone(memory.cases[index]);
  }
  await connectToDatabase();
  const query = mongoose.isObjectIdOrHexString(id) ? { _id: id } : { caseNumber: id };
  const record = await CaseModel.findOneAndUpdate(query, update, { new: true, runValidators: true }).lean();
  return record ? mongoRecord<CaseRecord>(record) : null;
}

export async function listDocuments(caseId: string): Promise<DocumentRecord[]> {
  if (!hasMongoUri()) return clone(memory.documents.filter((item) => item.caseId === caseId));
  await connectToDatabase();
  return mongoRecord<DocumentRecord[]>(await DocumentModel.find({ caseId }).sort({ uploadedDate: -1 }).lean());
}

export async function listPrecedents(): Promise<PrecedentRecord[]> {
  if (!hasMongoUri()) return clone(memory.precedents);
  await connectToDatabase();
  return mongoRecord<PrecedentRecord[]>(await PrecedentModel.find().lean());
}

export async function getHearing(caseId: string): Promise<HearingRecord | null> {
  if (!hasMongoUri()) return clone(memory.hearings.find((item) => item.caseId === caseId) ?? null);
  await connectToDatabase();
  const record = await HearingModel.findOne({ caseId }).lean();
  return record ? mongoRecord<HearingRecord>(record) : null;
}

export async function listHearings(): Promise<HearingRecord[]> {
  if (!hasMongoUri()) return clone(memory.hearings);
  await connectToDatabase();
  return mongoRecord<HearingRecord[]>(await HearingModel.find().sort({ date: 1, time: 1 }).lean());
}

export async function listDrafts(caseId: string): Promise<DraftRecord[]> {
  if (!hasMongoUri()) return clone(memory.drafts.filter((item) => item.caseId === caseId));
  await connectToDatabase();
  return mongoRecord<DraftRecord[]>(await DraftModel.find({ caseId }).sort({ createdDate: -1 }).lean());
}

export async function createDraft(caseId: string, input: DraftInput): Promise<DraftRecord> {
  const createdDate = new Date().toISOString();
  if (!hasMongoUri()) {
    const record: DraftRecord = { _id: `local-draft-${Date.now()}`, caseId, createdDate, ...input };
    memory.drafts.unshift(record);
    return clone(record);
  }
  await connectToDatabase();
  return mongoRecord<DraftRecord>(await DraftModel.create({ caseId, createdDate, ...input }));
}
