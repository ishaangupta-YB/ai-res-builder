"use server";

import { getDb } from "@/db";
import {
    resumes,
    workExperiences,
    educations,
    projects,
    awards,
    publications,
    certificates,
    languages,
    courses,
    resumeReferences,
    interests,
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
// Delete a resume (cascades to all related tables via FK)
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
            projects: projs,
            awards: awds,
            publications: pubs,
            certificates: certs,
            languages: langs,
            courses: crses,
            references: refs,
            interests: ints,
            ...resumeFields
        } = data;

        // 5. Update the resume row
        await db
            .update(resumes)
            .set({
                ...resumeFields,
                skills: resumeFields.skills ?? [],
                sectionOrder: resumeFields.sectionOrder ?? [],
                sectionVisibility: resumeFields.sectionVisibility ?? {},
                fieldVisibility: resumeFields.fieldVisibility ?? {},
                updatedAt: new Date(),
            })
            .where(eq(resumes.id, resumeId));

        // 6. Helper: replace all rows for a relation table
        async function replaceRelation<T extends Record<string, unknown>>(
            table: Parameters<typeof db.delete>[0],
            resumeIdCol: { resumeId: string },
            rows: T[] | undefined,
            mapFn: (row: T, idx: number) => Record<string, unknown>,
        ) {
            await db.delete(table).where(
                eq(
                    (table as any).resumeId,
                    resumeId,
                ),
            );
            if (rows && rows.length > 0) {
                await db.insert(table as any).values(
                    rows.map((row, idx) => ({
                        ...mapFn(row, idx),
                        resumeId,
                    })),
                );
            }
        }

        // 7. Replace work experiences
        await replaceRelation(
            workExperiences,
            { resumeId },
            workExps,
            (exp, idx) => ({
                position: exp.position || null,
                company: exp.company || null,
                startDate: exp.startDate ? new Date(exp.startDate) : null,
                endDate: exp.endDate ? new Date(exp.endDate) : null,
                description: exp.description || null,
                location: exp.location || null,
                subheading: exp.subheading || null,
                visible: exp.visible ?? true,
                displayOrder: idx,
            }),
        );

        // 8. Replace educations
        await replaceRelation(
            educations,
            { resumeId },
            edus,
            (edu, idx) => ({
                degree: edu.degree || null,
                school: edu.school || null,
                fieldOfStudy: edu.fieldOfStudy || null,
                gpa: edu.gpa || null,
                description: edu.description || null,
                location: edu.location || null,
                startDate: edu.startDate ? new Date(edu.startDate) : null,
                endDate: edu.endDate ? new Date(edu.endDate) : null,
                visible: edu.visible ?? true,
                displayOrder: idx,
            }),
        );

        // 9. Replace projects
        await replaceRelation(
            projects,
            { resumeId },
            projs,
            (p, idx) => ({
                title: p.title || null,
                subtitle: p.subtitle || null,
                description: p.description || null,
                link: p.link || null,
                startDate: p.startDate ? new Date(p.startDate) : null,
                endDate: p.endDate ? new Date(p.endDate) : null,
                visible: p.visible ?? true,
                displayOrder: idx,
            }),
        );

        // 10. Replace awards
        await replaceRelation(
            awards,
            { resumeId },
            awds,
            (a, idx) => ({
                title: a.title || null,
                issuer: a.issuer || null,
                description: a.description || null,
                date: a.date ? new Date(a.date) : null,
                visible: a.visible ?? true,
                displayOrder: idx,
            }),
        );

        // 11. Replace publications
        await replaceRelation(
            publications,
            { resumeId },
            pubs,
            (p, idx) => ({
                title: p.title || null,
                publisher: p.publisher || null,
                authors: p.authors || null,
                description: p.description || null,
                date: p.date ? new Date(p.date) : null,
                link: p.link || null,
                visible: p.visible ?? true,
                displayOrder: idx,
            }),
        );

        // 12. Replace certificates
        await replaceRelation(
            certificates,
            { resumeId },
            certs,
            (c, idx) => ({
                title: c.title || null,
                issuer: c.issuer || null,
                description: c.description || null,
                date: c.date ? new Date(c.date) : null,
                link: c.link || null,
                credentialId: c.credentialId || null,
                visible: c.visible ?? true,
                displayOrder: idx,
            }),
        );

        // 13. Replace languages
        await replaceRelation(
            languages,
            { resumeId },
            langs,
            (l, idx) => ({
                language: l.language || null,
                proficiency: l.proficiency || null,
                visible: l.visible ?? true,
                displayOrder: idx,
            }),
        );

        // 14. Replace courses
        await replaceRelation(
            courses,
            { resumeId },
            crses,
            (c, idx) => ({
                name: c.name || null,
                institution: c.institution || null,
                description: c.description || null,
                date: c.date ? new Date(c.date) : null,
                visible: c.visible ?? true,
                displayOrder: idx,
            }),
        );

        // 15. Replace references
        await replaceRelation(
            resumeReferences,
            { resumeId },
            refs,
            (r, idx) => ({
                name: r.name || null,
                position: r.position || null,
                company: r.company || null,
                email: r.email || null,
                phone: r.phone || null,
                visible: r.visible ?? true,
                displayOrder: idx,
            }),
        );

        // 16. Replace interests
        await replaceRelation(
            interests,
            { resumeId },
            ints,
            (i, idx) => ({
                name: i.name || null,
                visible: i.visible ?? true,
                displayOrder: idx,
            }),
        );

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
