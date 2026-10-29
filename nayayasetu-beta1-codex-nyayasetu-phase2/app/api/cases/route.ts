import { NextResponse } from "next/server";
import { createCase, listCases } from "@/lib/repository";
import { caseInputSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json({ cases: await listCases() });
  } catch (error) {
    return NextResponse.json({ error: "Could not load cases.", detail: error instanceof Error ? error.message : undefined }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const parsed = caseInputSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid case data.", issues: parsed.error.flatten() }, { status: 400 });
    const record = await createCase(parsed.data);
    return NextResponse.json({ case: record }, { status: 201 });
  } catch (error) {
    const duplicate = error instanceof Error && /duplicate|E11000/i.test(error.message);
    return NextResponse.json({ error: duplicate ? "A case with that number already exists." : "Could not create case." }, { status: duplicate ? 409 : 500 });
  }
}
