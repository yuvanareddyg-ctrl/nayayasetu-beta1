import { NextResponse } from "next/server";
import { getCase, updateCase } from "@/lib/repository";
import { caseUpdateSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

export async function GET(_: Request, { params }: Context) {
  try {
    const record = await getCase((await params).id);
    if (!record) return NextResponse.json({ error: "Case not found." }, { status: 404 });
    return NextResponse.json({ case: record });
  } catch (error) {
    return NextResponse.json({ error: "Could not load case.", detail: error instanceof Error ? error.message : undefined }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const parsed = caseUpdateSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid case update.", issues: parsed.error.flatten() }, { status: 400 });
    const record = await updateCase((await params).id, parsed.data);
    if (!record) return NextResponse.json({ error: "Case not found." }, { status: 404 });
    return NextResponse.json({ case: record });
  } catch (error) {
    return NextResponse.json({ error: "Could not update case.", detail: error instanceof Error ? error.message : undefined }, { status: 500 });
  }
}
