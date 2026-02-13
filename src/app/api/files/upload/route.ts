import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth-server";
import { getDb } from "@/db";
import { userFiles } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
    getR2Bucket,
    buildR2Key,
    r2KeyToUrl,
    PHOTO_MIME_TYPES,
    PDF_MIME_TYPES,
    MAX_PHOTO_SIZE,
    MAX_PDF_SIZE,
} from "@/lib/r2";

export async function POST(request: Request) {
    try {
        const session = await requireSession();
        const userId = session.user.id;

        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const fileType = formData.get("fileType") as string | null;
        const resumeId = (formData.get("resumeId") as string) || null;

        if (!file || !fileType) {
            return NextResponse.json(
                { error: "Missing file or fileType" },
                { status: 400 },
            );
        }

        if (fileType !== "photo" && fileType !== "resume_pdf") {
            return NextResponse.json(
                { error: "fileType must be 'photo' or 'resume_pdf'" },
                { status: 400 },
            );
        }

        // Validate MIME type and size
        const isPhoto = fileType === "photo";
        const allowedMimes = isPhoto ? PHOTO_MIME_TYPES : PDF_MIME_TYPES;
        const maxSize = isPhoto ? MAX_PHOTO_SIZE : MAX_PDF_SIZE;

        if (!allowedMimes.has(file.type)) {
            return NextResponse.json(
                { error: `Invalid file type: ${file.type}` },
                { status: 400 },
            );
        }

        if (file.size > maxSize) {
            return NextResponse.json(
                {
                    error: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`,
                },
                { status: 400 },
            );
        }

        const bucket = await getR2Bucket();
        const db = await getDb();

        // Auto-replace: delete existing photo for this resume if uploading a new one
        if (isPhoto && resumeId) {
            const existing = await db.query.userFiles.findFirst({
                where: and(
                    eq(userFiles.resumeId, resumeId),
                    eq(userFiles.userId, userId),
                    eq(userFiles.fileType, "photo"),
                ),
            });

            if (existing) {
                await bucket.delete(existing.r2Key);
                await db
                    .delete(userFiles)
                    .where(eq(userFiles.id, existing.id));
            }
        }

        // Build R2 key and upload
        const fileId = crypto.randomUUID();
        const ext = file.name.split(".").pop()?.toLowerCase() || (isPhoto ? "jpg" : "pdf");
        const r2Key = buildR2Key(userId, fileType, fileId, ext);

        await bucket.put(r2Key, await file.arrayBuffer(), {
            httpMetadata: { contentType: file.type },
        });

        // Insert DB record
        await db.insert(userFiles).values({
            id: fileId,
            userId,
            resumeId,
            fileType,
            r2Key,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
        });

        const url = r2KeyToUrl(r2Key);
        return NextResponse.json({ success: true, url, fileId });
    } catch (err) {
        console.error("[upload] error:", err);
        return NextResponse.json(
            { error: "Upload failed" },
            { status: 500 },
        );
    }
}
