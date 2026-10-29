import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken, ADMIN_COOKIE } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { LoginRecordModel } from "@/models/LoginRecord";
import { loginRecordQuerySchema } from "@/lib/auth-validation";

export const runtime = "nodejs";

/**
 * GET /api/admin/login-records
 *
 * Returns paginated, searchable login records. Protected by JWT cookie.
 * Query params:
 *   - page    (default 1)
 *   - limit   (default 20, max 100)
 *   - search  (optional – filters username or email, case-insensitive)
 */
export async function GET(request: Request) {
  // ── Auth guard ──────────────────────────────────────────────────────────────
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // ── Parse query params ──────────────────────────────────────────────────────
  const { searchParams } = new URL(request.url);
  const parsed = loginRecordQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { page, limit, search } = parsed.data;

  try {
    await connectToDatabase();

    // Build filter
    const filter =
      search && search.length > 0
        ? {
            $or: [
              { username: { $regex: search, $options: "i" } },
              { email: { $regex: search, $options: "i" } },
            ],
          }
        : {};

    const [records, total] = await Promise.all([
      LoginRecordModel.find(filter)
        .sort({ loginAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      LoginRecordModel.countDocuments(filter),
    ]);

    return NextResponse.json({
      records: records.map((r) => ({
        id: String(r._id),
        username: r.username,
        email: r.email,
        loginAt: r.loginAt,
        ipAddress: r.ipAddress ?? null,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[/api/admin/login-records] Error:", error);
    return NextResponse.json(
      { error: "Unable to fetch login records." },
      { status: 500 },
    );
  }
}
