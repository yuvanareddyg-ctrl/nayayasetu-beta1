import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken, ADMIN_COOKIE } from "@/lib/auth";
import { connectToDatabase, hasMongoUri } from "@/lib/db";
import { LoginRecordModel } from "@/models/LoginRecord";
import { loginRecordQuerySchema } from "@/lib/auth-validation";
import { sampleLoginRecords } from "@/lib/sample-data";

export const runtime = "nodejs";

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
    if (hasMongoUri()) {
      try {
        await connectToDatabase();
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
            totalPages: Math.max(1, Math.ceil(total / limit)),
          },
        });
      } catch (dbErr) {
        console.warn("[/api/admin/login-records] Fallback to in-memory audit:", dbErr);
      }
    }

    // In-memory fallback
    let filtered = sampleLoginRecords;
    if (search && search.length > 0) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (r) => r.username.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
      );
    }

    const total = filtered.length;
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      records: paginated.map((r) => ({
        id: r._id,
        username: r.username,
        email: r.email,
        loginAt: r.loginAt,
        ipAddress: r.ipAddress ?? null,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
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
