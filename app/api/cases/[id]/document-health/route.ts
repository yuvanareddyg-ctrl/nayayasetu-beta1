import { NextResponse } from "next/server";
import { assessDocumentHealth } from "@/lib/insights";
import { getCase, listDocuments } from "@/lib/repository";

type Context = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

export async function POST(_: Request, { params }: Context) {
  try {
    const { id } = await params;
    if (!await getCase(id)) return NextResponse.json({ error: "Case not found." }, { status: 404 });
    return NextResponse.json({ health: assessDocumentHealth(id, await listDocuments(id)) });
  } catch (error) {
    return NextResponse.json({ error: "Could not run document-health check.", detail: error instanceof Error ? error.message : undefined }, { status: 500 });
  }
}
