/**
 * Upload URL API Route
 *
 * Generates a presigned PUT URL for direct client-side R2 upload.
 * The server controls the R2 key path — the client never chooses it.
 *
 * Security:
 *  - Session-authenticated
 *  - Content-Type locked in signature (MIME spoofing → signature error)
 *  - R2 key scoped to user's directory
 *  - URL expires in 5 minutes
 */

import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth-server";
import { buildR2Key, PDF_MIME_TYPES, MAX_PDF_SIZE } from "@/lib/r2";
import { generatePresignedUploadUrl } from "@/lib/r2-presign";

interface UploadUrlRequestBody {
    fileName: string;
    contentType: string;
    fileType: "resume_pdf";
    fileSize: number;
}

export async function POST(request: Request) {
    try {
        const session = await requireSession();
        const userId = session.user.id;

        const body = (await request.json()) as UploadUrlRequestBody;
        const { fileName, contentType, fileType, fileSize } = body;

        // Validate required fields
        if (!fileName || !contentType || !fileType || !fileSize) {
            return NextResponse.json(
                { success: false, error: "Missing fileName, contentType, fileType, or fileSize" },
                { status: 400 },
            );
        }

        // Only resume_pdf uploads are supported via presigned URL
        if (fileType !== "resume_pdf") {
            return NextResponse.json(
                { success: false, error: "Only resume_pdf uploads are supported" },
                { status: 400 },
            );
        }

        // Validate MIME type
        if (!PDF_MIME_TYPES.has(contentType)) {
            return NextResponse.json(
                { success: false, error: `Invalid content type: ${contentType}. Only PDF files are allowed.` },
                { status: 400 },
            );
        }

        // Validate file size
        if (typeof fileSize !== "number" || fileSize <= 0 || fileSize > MAX_PDF_SIZE) {
            return NextResponse.json(
                { success: false, error: `Invalid file size. Maximum allowed is ${MAX_PDF_SIZE / (1024 * 1024)}MB` },
                { status: 400 },
            );
        }

        // Generate a unique file ID and deterministic R2 key
        const fileId = crypto.randomUUID();
        const ext = fileName.split(".").pop()?.toLowerCase() || "pdf";
        const r2Key = buildR2Key(userId, fileType, fileId, ext);

        // Generate presigned PUT URL (5-minute expiry, Content-Length locked)
        const uploadUrl = await generatePresignedUploadUrl(r2Key, contentType, fileSize);

        return NextResponse.json({
            success: true,
            uploadUrl,
            fileId,
            r2Key,
        });
    } catch (err) {
        console.error("[upload-url] error:", err);
        return NextResponse.json(
            { success: false, error: "Failed to generate upload URL" },
            { status: 500 },
        );
    }
}
