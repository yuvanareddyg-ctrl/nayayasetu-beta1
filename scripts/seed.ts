import "dotenv/config";
import { connectToDatabase } from "../lib/db";
import { sampleCases, sampleDocuments, sampleHearings, samplePrecedents } from "../lib/sample-data";
import { CaseModel } from "../models/Case";
import { DocumentModel } from "../models/Document";
import { HearingModel } from "../models/Hearing";
import { PrecedentModel } from "../models/Precedent";

async function seed() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required to seed MongoDB. Add it to .env.local first.");
  await connectToDatabase();

  const caseIdMap = new Map<string, string>();
  for (const item of sampleCases) {
    const data = Object.fromEntries(Object.entries(item).filter(([key]) => key !== "_id"));
    const record = await CaseModel.findOneAndUpdate({ caseNumber: item.caseNumber }, data, { upsert: true, new: true, setDefaultsOnInsert: true });
    caseIdMap.set(item._id, record._id.toString());
  }
  for (const item of sampleDocuments) {
    const data = Object.fromEntries(Object.entries(item).filter(([key]) => key !== "_id" && key !== "caseId"));
    await DocumentModel.findOneAndUpdate({ caseId: caseIdMap.get(item.caseId), filename: item.filename }, { ...data, caseId: caseIdMap.get(item.caseId) }, { upsert: true, new: true });
  }
  for (const item of sampleHearings) {
    const data = Object.fromEntries(Object.entries(item).filter(([key]) => key !== "_id" && key !== "caseId"));
    await HearingModel.findOneAndUpdate({ caseId: caseIdMap.get(item.caseId) }, { ...data, caseId: caseIdMap.get(item.caseId) }, { upsert: true, new: true });
  }
  for (const item of samplePrecedents) {
    const data = Object.fromEntries(Object.entries(item).filter(([key]) => key !== "_id"));
    await PrecedentModel.findOneAndUpdate({ title: item.title }, data, { upsert: true, new: true });
  }
  console.log(`NyayaSetu seeded: ${sampleCases.length} cases, ${sampleDocuments.length} documents, ${samplePrecedents.length} precedents.`);
  process.exit(0);
}

seed().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});