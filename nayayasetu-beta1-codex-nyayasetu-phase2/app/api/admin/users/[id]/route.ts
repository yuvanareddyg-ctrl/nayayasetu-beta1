import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken, ADMIN_COOKIE } from "@/lib/auth";
import { updateUser } from "@/lib/repository";

type Context = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: Context) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Payload required." }, { status: 400 });

    const updated = await updateUser(id, body);
    if (!updated) return NextResponse.json({ error: "User not found." }, { status: 404 });

    return NextResponse.json({ ok: true, user: updated });
  } catch (error) {
    return NextResponse.json(
      { error: "Could not update user.", detail: error instanceof Error ? error.message : undefined },
      { status: 500 }
    );
  }
}

