"use server";

import { getDb } from "@/db";
import {
    resumes,
    workExperiences,
    educations,
    userFiles,
} from "@/db/schema";
import { getR2Bucket } from "@/lib/r2";
import { requireSession } from "@/lib/auth-server";
import { resumeSchema, type ResumeValues } from "@/lib/validation";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ---------------------------------------------------------------------------
// Create a new resume and redirect to the editor
// ---------------------------------------------------------------------------
export async function createResume() {
    const session = await requireSession();
    const db = await getDb();

    const [resume] = await db
        .insert(resumes)
        .values({ userId: session.user.id, title: "Untitled Resume" })
        .returning();

    redirect(`/dashboard/editor/${resume.id}`);
}

// ---------------------------------------------------------------------------
// Delete a resume (cascades to work_experiences / educations via FK)
// ---------------------------------------------------------------------------
export async function deleteResume(resumeId: string) {
    const session = await requireSession();
    const db = await getDb();

    // Clean up R2 files associated with this resume
    const files = await db.query.userFiles.findMany({
        where: and(
            eq(userFiles.resumeId, resumeId),
            eq(userFiles.userId, session.user.id),
        ),
        columns: { id: true, r2Key: true },
    });

    if (files.length > 0) {
        const bucket = await getR2Bucket();
        await Promise.all(files.map((f) => bucket.delete(f.r2Key)));
        await db
            .delete(userFiles)
            .where(
                and(
                    eq(userFiles.resumeId, resumeId),
                    eq(userFiles.userId, session.user.id),
                ),
            );
    }

    // ownership check built into the WHERE clause
    await db
        .delete(resumes)
        .where(
            and(
                eq(resumes.id, resumeId),
                eq(resumes.userId, session.user.id),
            ),
        );

    revalidatePath("/dashboard");
}

// ---------------------------------------------------------------------------
// Save / auto-save resume (used by the editor auto-save hook)
//
// Architecture decisions:
//   - Server-side Zod validation on every save (never trust the client)
//   - Auth + ownership check before any write
//   - "delete-all-then-insert" for relations (simple, safe at resume scale)
//   - Returns {success, error} – never throws so the client can recover
// ---------------------------------------------------------------------------
export async function saveResume(
    values: ResumeValues,
): Promise<{ success: boolean; error?: string }> {
    try {
        // 1. Auth
        const session = await requireSession();

        // 2. Server-side validation
        const parsed = resumeSchema.safeParse(values);
        if (!parsed.success) {
            return {
                success: false,
                error: "Validation failed: " + parsed.error.issues[0]?.message,
            };
        }
        const data = parsed.data;

        if (!data.id) {
            return { success: false, error: "Resume ID is required" };
        }

        const db = await getDb();

        // 3. Ownership check – fetch once, fail fast
        const existing = await db.query.resumes.findFirst({
            where: and(
                eq(resumes.id, data.id),
                eq(resumes.userId, session.user.id),
            ),
            columns: { id: true },
        });

        if (!existing) {
            return { success: false, error: "Resume not found" };
        }

        // 4. Destructure relations from the flat resume fields
        const {
            id: resumeId,
            workExperiences: workExps,
            educations: edus,
            ...resumeFields
        } = data;

        // 5. Update the resume row
        await db
            .update(resumes)
            .set({
                ...resumeFields,
                skills: resumeFields.skills ?? [],
                updatedAt: new Date(),
            })
            .where(eq(resumes.id, resumeId));

        // 6. Replace work experiences (delete + insert is atomic-enough for D1
        //    and avoids complex diffing. Resume data is small.)
        await db
            .delete(workExperiences)
            .where(eq(workExperiences.resumeId, resumeId));

        if (workExps && workExps.length > 0) {
            await db.insert(workExperiences).values(
                workExps.map((exp) => ({
                    position: exp.position || null,
                    company: exp.company || null,
                    startDate: exp.startDate
                        ? new Date(exp.startDate)
                        : null,
                    endDate: exp.endDate ? new Date(exp.endDate) : null,
                    description: exp.description || null,
                    resumeId,
                })),
            );
        }

        // 7. Replace educations
        await db
            .delete(educations)
            .where(eq(educations.resumeId, resumeId));

        if (edus && edus.length > 0) {
            await db.insert(educations).values(
                edus.map((edu) => ({
                    degree: edu.degree || null,
                    school: edu.school || null,
                    startDate: edu.startDate
                        ? new Date(edu.startDate)
                        : null,
                    endDate: edu.endDate ? new Date(edu.endDate) : null,
                    resumeId,
                })),
            );
        }

        return { success: true };
    } catch (err) {
        console.error("[saveResume] Unexpected error:", err);
        return {
            success: false,
            error: "An unexpected error occurred while saving",
        };
    }
}

// ---------------------------------------------------------------------------
// Delete a file from R2 and its DB record
// ---------------------------------------------------------------------------
export async function deleteFile(
    fileId: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await requireSession();
        const db = await getDb();

        const file = await db.query.userFiles.findFirst({
            where: and(
                eq(userFiles.id, fileId),
                eq(userFiles.userId, session.user.id),
            ),
        });

        if (!file) {
            return { success: false, error: "File not found" };
        }

        const bucket = await getR2Bucket();
        await bucket.delete(file.r2Key);
        await db.delete(userFiles).where(eq(userFiles.id, fileId));

        return { success: true };
    } catch (err) {
        console.error("[deleteFile] error:", err);
        return { success: false, error: "Failed to delete file" };
    }
}
