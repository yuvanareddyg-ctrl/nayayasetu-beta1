import { NextResponse } from "next/server";
import { createDocument, getCase, listDocuments } from "@/lib/repository";
import { documentCreateSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

export async function GET(_: Request, { params }: Context) {
  try {
    const { id } = await params;
    if (!(await getCase(id))) return NextResponse.json({ error: "Case not found." }, { status: 404 });
    return NextResponse.json({ documents: await listDocuments(id) });
  } catch (error) {
    return NextResponse.json(
      { error: "Could not load documents.", detail: error instanceof Error ? error.message : undefined },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const targetCase = await getCase(id);
    if (!targetCase) return NextResponse.json({ error: "Case not found." }, { status: 404 });

    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Document payload required." }, { status: 400 });

    const parsed = documentCreateSchema.safeParse({ ...body, caseId: targetCase._id });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid document details.", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const doc = await createDocument(parsed.data);
    return NextResponse.json({ ok: true, document: doc }, { status: 201 });
  } catch (error) {
    console.error("[/api/cases/[id]/documents POST] Error:", error);
    return NextResponse.json({ error: "Could not add document to case." }, { status: 500 });
  }
}
