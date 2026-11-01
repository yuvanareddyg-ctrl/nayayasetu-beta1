import { NextResponse } from "next/server";
import { createConsultation, createNotification, listConsultations } from "@/lib/repository";
import { getCurrentUser } from "@/lib/auth-user";
import { consultationInputSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const consultations = await listConsultations(
      user?.role === "citizen" ? { userId: user.id } : user?.role === "advocate" ? { lawyerId: user.id } : undefined
    );
    return NextResponse.json({ consultations });
  } catch (error) {
    return NextResponse.json(
      { error: "Could not load consultations.", detail: error instanceof Error ? error.message : undefined },
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

    const parsed = consultationInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid booking details.", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const currentUser = await getCurrentUser();
    const userId = currentUser?.id || `guest-${Date.now()}`;
    const randNum = Math.floor(100 + Math.random() * 900);
    const consultationNumber = `NS-CONS-2026-${randNum}`;

    const newConsultation = await createConsultation({
      consultationNumber,
      userId,
      lawyerId: parsed.data.lawyerId,
      lawyerName: parsed.data.lawyerName,
      applicantName: parsed.data.applicantName,
      applicantEmail: parsed.data.applicantEmail,
      applicantPhone: parsed.data.applicantPhone,
      date: parsed.data.date,
      timeSlot: parsed.data.timeSlot,
      matterSummary: parsed.data.matterSummary,
      mode: parsed.data.mode,
      status: "Confirmed",
      meetingLink: `https://meet.jit.si/NayayaSetu-Consultation-${randNum}`,
    });

    await createNotification({
      userId,
      title: "Consultation Confirmed",
      message: `Your consultation with ${parsed.data.lawyerName} is confirmed for ${new Date(parsed.data.date).toLocaleDateString()} at ${parsed.data.timeSlot}.`,
      type: "success",
      link: "/dashboard",
      isRead: false,
    });

    return NextResponse.json({ ok: true, consultation: newConsultation }, { status: 201 });
  } catch (error) {
    console.error("[/api/services/consultations POST] Error:", error);
    return NextResponse.json(
      { error: "Unable to book consultation. Please try again." },
      { status: 500 }
    );
  }
}

