import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth-server";
import { getDb } from "@/db";
import { resumes, userFiles } from "@/db/schema";
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

        if (isPhoto && !resumeId) {
            return NextResponse.json(
                { error: "resumeId is required for photo uploads" },
                { status: 400 },
            );
        }

        // Validate resume ownership for resume-linked photo uploads.
        if (isPhoto && resumeId) {
            const ownedResume = await db.query.resumes.findFirst({
                where: and(
                    eq(resumes.id, resumeId),
                    eq(resumes.userId, userId),
                ),
                columns: { id: true },
            });

            if (!ownedResume) {
                return NextResponse.json(
                    { error: "Resume not found for this user" },
                    { status: 404 },
                );
            }
        }

        // Auto-replace: remove all existing photo files for this resume before upload.
        if (isPhoto && resumeId) {
            const existingPhotos = await db.query.userFiles.findMany({
                where: and(
                    eq(userFiles.resumeId, resumeId),
                    eq(userFiles.userId, userId),
                    eq(userFiles.fileType, "photo"),
                ),
                columns: { id: true, r2Key: true },
            });

            for (const existing of existingPhotos) {
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
        let resumePhotoSynced: boolean | null = null;

        if (isPhoto && resumeId) {
            await db
                .update(resumes)
                .set({
                    photoUrl: url,
                    updatedAt: new Date(),
                })
                .where(
                    and(
                        eq(resumes.id, resumeId),
                        eq(resumes.userId, userId),
                    ),
                );

            const syncedResume = await db.query.resumes.findFirst({
                where: and(
                    eq(resumes.id, resumeId),
                    eq(resumes.userId, userId),
                ),
                columns: { photoUrl: true },
            });
            resumePhotoSynced = syncedResume?.photoUrl === url;

            if (!resumePhotoSynced) {
                return NextResponse.json(
                    { error: "Photo uploaded but failed to sync resume photo URL" },
                    { status: 500 },
                );
            }
        }

        return NextResponse.json({
            success: true,
            url,
            fileId,
            resumePhotoSynced,
        });
    } catch (err) {
        console.error("[upload] error:", err);
        return NextResponse.json(
            { error: "Upload failed" },
            { status: 500 },
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await requireSession();
        const userId = session.user.id;

        const { searchParams } = new URL(request.url);
        const fileType = searchParams.get("fileType");
        const resumeId = searchParams.get("resumeId");

        if (fileType !== "photo") {
            return NextResponse.json(
                { error: "DELETE currently supports only fileType=photo" },
                { status: 400 },
            );
        }

        if (!resumeId) {
            return NextResponse.json(
                { error: "resumeId is required to delete a photo" },
                { status: 400 },
            );
        }

        const db = await getDb();
        const bucket = await getR2Bucket();

        const ownedResume = await db.query.resumes.findFirst({
            where: and(
                eq(resumes.id, resumeId),
                eq(resumes.userId, userId),
            ),
            columns: { id: true },
        });

        if (!ownedResume) {
            return NextResponse.json(
                { error: "Resume not found for this user" },
                { status: 404 },
            );
        }

        const existingPhotos = await db.query.userFiles.findMany({
            where: and(
                eq(userFiles.resumeId, resumeId),
                eq(userFiles.userId, userId),
                eq(userFiles.fileType, "photo"),
            ),
            columns: { id: true, r2Key: true },
        });

        for (const photo of existingPhotos) {
            await bucket.delete(photo.r2Key);
        }

        if (existingPhotos.length > 0) {
            await db
                .delete(userFiles)
                .where(
                    and(
                        eq(userFiles.resumeId, resumeId),
                        eq(userFiles.userId, userId),
                        eq(userFiles.fileType, "photo"),
                    ),
                );
        }

        await db
            .update(resumes)
            .set({
                photoUrl: null,
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(resumes.id, resumeId),
                    eq(resumes.userId, userId),
                ),
            );

        const syncedResume = await db.query.resumes.findFirst({
            where: and(
                eq(resumes.id, resumeId),
                eq(resumes.userId, userId),
            ),
            columns: { photoUrl: true },
        });

        const resumePhotoCleared = syncedResume?.photoUrl == null;
        if (!resumePhotoCleared) {
            return NextResponse.json(
                { error: "Photo removed from storage, but resume photo URL was not cleared" },
                { status: 500 },
            );
        }

        return NextResponse.json({
            success: true,
            resumePhotoCleared: true,
            deletedFileCount: existingPhotos.length,
        });
    } catch (err) {
        console.error("[upload delete] error:", err);
        return NextResponse.json(
            { error: "Failed to delete photo" },
            { status: 500 },
        );
    }
}
