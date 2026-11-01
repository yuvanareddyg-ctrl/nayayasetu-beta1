import { NextResponse } from "next/server";
import { getLegalRequestById, updateLegalRequest, createNotification } from "@/lib/repository";
import { getCurrentUser } from "@/lib/auth-user";

type Context = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

export async function GET(_: Request, { params }: Context) {
  try {
    const { id } = await params;
    const item = await getLegalRequestById(id);
    if (!item) {
      return NextResponse.json({ error: "Legal request not found." }, { status: 404 });
    }
    return NextResponse.json({ request: item });
  } catch (error) {
    return NextResponse.json(
      { error: "Could not retrieve request.", detail: error instanceof Error ? error.message : undefined },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Update payload required." }, { status: 400 });
    }

    const existing = await getLegalRequestById(id);
    if (!existing) {
      return NextResponse.json({ error: "Legal request not found." }, { status: 404 });
    }

    const currentUser = await getCurrentUser();
    const updaterName = currentUser?.name || "Registry Official";

    const updateData: Record<string, unknown> = {};
    const newTimeline = [...existing.timeline];

    if (body.status && body.status !== existing.status) {
      updateData.status = body.status;
      newTimeline.push({
        status: body.status,
        note: body.note || `Status updated to ${body.status} by ${updaterName}.`,
        timestamp: new Date().toISOString(),
        author: updaterName,
      });

      // Notify the applicant
      await createNotification({
        userId: existing.userId,
        title: `Request Status Updated: ${body.status}`,
        message: `Your request ${existing.requestNumber} status has changed to "${body.status}".`,
        type: body.status === "Completed" ? "success" : "info",
        link: `/dashboard`,
        isRead: false,
      });
    }

    if (body.assignedLawyer) {
      updateData.assignedLawyer = body.assignedLawyer;
      newTimeline.push({
        status: "Assigned",
        note: `Assigned to ${body.assignedLawyer.name} (${body.assignedLawyer.chamber || "Panel Advocate"}).`,
        timestamp: new Date().toISOString(),
        author: updaterName,
      });

      await createNotification({
        userId: existing.userId,
        title: `Advocate Assigned`,
        message: `${body.assignedLawyer.name} has been assigned to represent you in ${existing.requestNumber}.`,
        type: "success",
        link: `/dashboard`,
        isRead: false,
      });
    }

    updateData.timeline = newTimeline;
    const updated = await updateLegalRequest(id, updateData);

    return NextResponse.json({ ok: true, request: updated });
  } catch (error) {
    console.error("[/api/services/requests/[id] PATCH] Error:", error);
    return NextResponse.json({ error: "Could not update request." }, { status: 500 });
  }
}

