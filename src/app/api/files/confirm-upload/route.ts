/**
 * Confirm Upload API Route
 *
 * After the client uploads directly to R2 via presigned URL, this
 * endpoint verifies the file exists in R2 and creates the DB record.
 *
 * Security:
 *  - Session-authenticated
 *  - R2 key ownership check (must start with {userId}/)
 *  - R2 HEAD to verify file exists
 */

import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth-server";
import { headR2Object } from "@/lib/r2-presign";
import { getDb } from "@/db";
import { userFiles } from "@/db/schema";

interface ConfirmUploadRequestBody {
    fileId: string;
    r2Key: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
}

export async function POST(request: Request) {
    try {
        const session = await requireSession();
        const userId = session.user.id;

        const body = (await request.json()) as ConfirmUploadRequestBody;
        const { fileId, r2Key, fileName, fileSize, mimeType } = body;

        // Validate required fields
        if (!fileId || !r2Key || !fileName || !fileSize || !mimeType) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 },
            );
        }

        // Ownership check: R2 key must start with {userId}/
        if (!r2Key.startsWith(`${userId}/`)) {
            return NextResponse.json(
                { success: false, error: "Forbidden: key does not belong to this user" },
                { status: 403 },
            );
        }

        // Verify file exists in R2 via S3-compatible HEAD request
        // (uses the same endpoint as presigned uploads, works in dev + prod)
        const head = await headR2Object(r2Key);

        if (!head) {
            return NextResponse.json(
                { success: false, error: "File not found in storage. Upload may have failed." },
                { status: 404 },
            );
        }

        // Insert DB record using R2-reported size
        const db = await getDb();
        await db.insert(userFiles).values({
            id: fileId,
            userId,
            resumeId: null,
            fileType: "resume_pdf",
            r2Key,
            fileName,
            fileSize: head.size,
            mimeType: "application/pdf",
        });

        return NextResponse.json({ success: true, fileId });
    } catch (err) {
        console.error("[confirm-upload] error:", err);
        return NextResponse.json(
            { success: false, error: "Failed to confirm upload" },
            { status: 500 },
        );
    }
}
