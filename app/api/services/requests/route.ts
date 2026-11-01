import { NextResponse } from "next/server";
import { createLegalRequest, createNotification, listLegalRequests } from "@/lib/repository";
import { getCurrentUser } from "@/lib/auth-user";
import { legalRequestInputSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userParam = searchParams.get("userId");
    const statusParam = searchParams.get("status");

    const currentUser = await getCurrentUser();
    let filterUserId = userParam ?? undefined;

    // If citizen is logged in without explicit filter, show their requests
    if (currentUser && currentUser.role === "citizen" && !userParam) {
      filterUserId = currentUser.id;
    }

    const requests = await listLegalRequests({
      userId: filterUserId,
      status: statusParam ?? undefined,
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("[/api/services/requests] Error:", error);
    return NextResponse.json(
      { error: "Could not retrieve legal requests." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Request body is required." }, { status: 400 });
    }

    const parsed = legalRequestInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload.", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const currentUser = await getCurrentUser();
    const userId = currentUser?.id || `guest-${Date.now()}`;
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const requestNumber = `NS-REQ-2026-${randNum}`;

    const newRequest = await createLegalRequest({
      requestNumber,
      userId,
      applicantName: parsed.data.applicantName,
      applicantEmail: parsed.data.applicantEmail,
      applicantPhone: parsed.data.applicantPhone,
      serviceType: parsed.data.serviceType,
      category: parsed.data.category,
      subject: parsed.data.subject,
      description: parsed.data.description,
      priority: parsed.data.priority,
      status: "Submitted",
      documents: (parsed.data.documents || []).map((doc) => ({
        filename: doc.filename,
        url: doc.url,
        size: doc.size,
        uploadedAt: doc.uploadedAt || new Date().toISOString(),
      })),
      timeline: [
        {
          status: "Submitted",
          note: "Assistance request registered in the NayayaSetu digital registry.",
          timestamp: new Date().toISOString(),
          author: parsed.data.applicantName,
        },
      ],
    });

    // Create user notification
    await createNotification({
      userId,
      title: "Assistance Request Lodged",
      message: `Your request ${requestNumber} for ${parsed.data.serviceType} has been successfully submitted.`,
      type: "info",
      link: `/dashboard`,
      isRead: false,
    });

    return NextResponse.json({ ok: true, request: newRequest }, { status: 201 });
  } catch (error) {
    console.error("[/api/services/requests POST] Error:", error);
    return NextResponse.json(
      { error: "Unable to submit legal request. Please try again." },
      { status: 500 }
    );
  }
}

