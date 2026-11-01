import { NextResponse } from "next/server";
import { createDraft, getCase, listDrafts } from "@/lib/repository";
import { draftInputSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

export async function GET(_: Request, { params }: Context) {
  try {
    const { id } = await params;
    if (!await getCase(id)) return NextResponse.json({ error: "Case not found." }, { status: 404 });
    return NextResponse.json({ drafts: await listDrafts(id) });
  } catch (error) {
    return NextResponse.json({ error: "Could not load drafts.", detail: error instanceof Error ? error.message : undefined }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    if (!await getCase(id)) return NextResponse.json({ error: "Case not found." }, { status: 404 });
    const parsed = draftInputSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid draft.", issues: parsed.error.flatten() }, { status: 400 });
    return NextResponse.json({ draft: await createDraft(id, parsed.data) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Could not save draft.", detail: error instanceof Error ? error.message : undefined }, { status: 500 });
  }
}
