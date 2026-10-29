import { NextResponse } from "next/server";
import { assessDocumentHealth, generateCaseSummary } from "@/lib/insights";
import { getCase, listDocuments } from "@/lib/repository";

type Context = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

export async function GET(_: Request, { params }: Context) {
  try {
    const record = await getCase((await params).id);
    if (!record) return NextResponse.json({ error: "Case not found." }, { status: 404 });
    const documents = await listDocuments(record._id);
    return NextResponse.json({ summary: generateCaseSummary(record, assessDocumentHealth(record._id, documents)) });
  } catch (error) {
    return NextResponse.json({ error: "Could not prepare orientation.", detail: error instanceof Error ? error.message : undefined }, { status: 500 });
  }
}
