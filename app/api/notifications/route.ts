import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-user";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  createNotification,
} from "@/lib/repository";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const userId = user?.id || "user-cit-001"; // Fallback to demo citizen if unauthenticated
    const notifications = await listNotifications(userId);
    return NextResponse.json({ notifications });
  } catch {
    return NextResponse.json(
      { error: "Could not retrieve notifications." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const user = await getCurrentUser();
    const userId = user?.id || "user-cit-001";

    if (body?.all) {
      await markAllNotificationsRead(userId);
      return NextResponse.json({ ok: true, message: "All notifications marked as read." });
    }

    if (body?.id) {
      const success = await markNotificationRead(body.id);
      return NextResponse.json({ ok: success });
    }

    return NextResponse.json({ error: "Missing notification id or all flag." }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: "Could not update notification status." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body?.title || !body?.message) {
      return NextResponse.json({ error: "Title and message are required." }, { status: 400 });
    }

    const notif = await createNotification({
      userId: body.userId || "all",
      title: body.title,
      message: body.message,
      type: body.type || "info",
      link: body.link,
      isRead: false,
    });

    return NextResponse.json({ ok: true, notification: notif }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create notification." }, { status: 500 });
  }
}
