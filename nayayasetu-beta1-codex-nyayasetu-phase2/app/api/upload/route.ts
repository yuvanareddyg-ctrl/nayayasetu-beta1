import { NextResponse } from "next/server";

export const runtime = "nodejs";

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".txt", ".png", ".jpg", ".jpeg"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 10MB limit. Please upload a smaller document." },
        { status: 400 }
      );
    }

    const originalName = file.name || "document.pdf";
    const extension = originalName.substring(originalName.lastIndexOf(".")).toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json(
        {
          error: `File type "${extension}" not permitted. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Sanitize filename
    const sanitizedName = originalName
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/_{2,}/g, "_");

    const fileId = `doc-${Date.now()}`;
    // Construct local mock URL / reference
    const url = `/uploads/${fileId}-${sanitizedName}`;

    return NextResponse.json({
      ok: true,
      file: {
        id: fileId,
        filename: sanitizedName,
        url,
        size: file.size,
        type: file.type || "application/pdf",
        uploadedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[/api/upload] Error:", error);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}

