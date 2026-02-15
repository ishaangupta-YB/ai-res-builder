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
    aiResults,
} from "@/db/schema";
import { getR2Bucket } from "@/lib/r2";
import { requireSession } from "@/lib/auth-server";
import { resumeSchema, type ResumeValues } from "@/lib/validation";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { getAiModel, MODEL_ID } from "@/lib/ai";
import {
    aiResumeExtractionSchema,
    aiResumeAnalysisSchema,
    type AiResumeExtraction,
    type AiResumeAnalysis,
} from "@/lib/ai-schemas";

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
// Create a new resume pre-filled with template data and redirect to editor
// ---------------------------------------------------------------------------
export async function createResumeFromTemplate(
    templateData: ResumeValues,
): Promise<void> {
    const session = await requireSession();
    const db = await getDb();

    // 1. Insert the resume row with template fields
    const [resume] = await db
        .insert(resumes)
        .values({
            userId: session.user.id,
            title: templateData.title || "From Template",
            firstName: templateData.firstName || null,
            lastName: templateData.lastName || null,
            jobTitle: templateData.jobTitle || null,
            email: templateData.email || null,
            phone: templateData.phone || null,
            city: templateData.city || null,
            country: templateData.country || null,
            linkedin: templateData.linkedin || null,
            website: templateData.website || null,
            summary: templateData.summary || null,
            colorHex: templateData.colorHex || "#000000",
            borderStyle: templateData.borderStyle || "squircle",
            layout: templateData.layout || "single-column",
            skills: templateData.skills ?? [],
            sectionOrder: templateData.sectionOrder ?? [],
            sectionVisibility: templateData.sectionVisibility ?? {},
            fieldVisibility: templateData.fieldVisibility ?? {},
            fontSize: templateData.fontSize ?? 10,
            fontFamily: templateData.fontFamily ?? "serif",
        })
        .returning();

    const resumeId = resume.id;

    // 2. Insert related rows
    if (templateData.workExperiences && templateData.workExperiences.length > 0) {
        await db.insert(workExperiences).values(
            templateData.workExperiences.map((exp, idx) => ({
                resumeId,
                position: exp.position || null,
                company: exp.company || null,
                startDate: exp.startDate ? new Date(exp.startDate) : null,
                endDate: exp.endDate ? new Date(exp.endDate) : null,
                description: exp.description || null,
                location: exp.location || null,
                subheading: exp.subheading || null,
                visible: exp.visible ?? true,
                displayOrder: idx,
            })),
        );
    }

    if (templateData.educations && templateData.educations.length > 0) {
        await db.insert(educations).values(
            templateData.educations.map((edu, idx) => ({
                resumeId,
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
            })),
        );
    }

    if (templateData.projects && templateData.projects.length > 0) {
        await db.insert(projects).values(
            templateData.projects.map((p, idx) => ({
                resumeId,
                title: p.title || null,
                subtitle: p.subtitle || null,
                description: p.description || null,
                link: p.link || null,
                startDate: p.startDate ? new Date(p.startDate) : null,
                endDate: p.endDate ? new Date(p.endDate) : null,
                visible: p.visible ?? true,
                displayOrder: idx,
            })),
        );
    }

    if (templateData.awards && templateData.awards.length > 0) {
        await db.insert(awards).values(
            templateData.awards.map((a, idx) => ({
                resumeId,
                title: a.title || null,
                issuer: a.issuer || null,
                description: a.description || null,
                date: a.date ? new Date(a.date) : null,
                visible: a.visible ?? true,
                displayOrder: idx,
            })),
        );
    }

    if (templateData.publications && templateData.publications.length > 0) {
        await db.insert(publications).values(
            templateData.publications.map((p, idx) => ({
                resumeId,
                title: p.title || null,
                publisher: p.publisher || null,
                authors: p.authors || null,
                description: p.description || null,
                date: p.date ? new Date(p.date) : null,
                link: p.link || null,
                visible: p.visible ?? true,
                displayOrder: idx,
            })),
        );
    }

    if (templateData.certificates && templateData.certificates.length > 0) {
        await db.insert(certificates).values(
            templateData.certificates.map((c, idx) => ({
                resumeId,
                title: c.title || null,
                issuer: c.issuer || null,
                description: c.description || null,
                date: c.date ? new Date(c.date) : null,
                link: c.link || null,
                credentialId: c.credentialId || null,
                visible: c.visible ?? true,
                displayOrder: idx,
            })),
        );
    }

    if (templateData.languages && templateData.languages.length > 0) {
        await db.insert(languages).values(
            templateData.languages.map((l, idx) => ({
                resumeId,
                language: l.language || null,
                proficiency: l.proficiency || null,
                visible: l.visible ?? true,
                displayOrder: idx,
            })),
        );
    }

    if (templateData.courses && templateData.courses.length > 0) {
        await db.insert(courses).values(
            templateData.courses.map((c, idx) => ({
                resumeId,
                name: c.name || null,
                institution: c.institution || null,
                description: c.description || null,
                date: c.date ? new Date(c.date) : null,
                visible: c.visible ?? true,
                displayOrder: idx,
            })),
        );
    }

    if (templateData.references && templateData.references.length > 0) {
        await db.insert(resumeReferences).values(
            templateData.references.map((r, idx) => ({
                resumeId,
                name: r.name || null,
                position: r.position || null,
                company: r.company || null,
                email: r.email || null,
                phone: r.phone || null,
                visible: r.visible ?? true,
                displayOrder: idx,
            })),
        );
    }

    if (templateData.interests && templateData.interests.length > 0) {
        await db.insert(interests).values(
            templateData.interests.map((i, idx) => ({
                resumeId,
                name: i.name || null,
                visible: i.visible ?? true,
                displayOrder: idx,
            })),
        );
    }

    redirect(`/dashboard/editor/${resumeId}`);
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

// ---------------------------------------------------------------------------
// AI Helpers (internal, not exported)
// ---------------------------------------------------------------------------

async function getPdfBytesFromR2(
    userId: string,
    fileId: string,
): Promise<{ bytes: Uint8Array; fileName: string }> {
    const db = await getDb();

    const file = await db.query.userFiles.findFirst({
        where: and(
            eq(userFiles.id, fileId),
            eq(userFiles.userId, userId),
            eq(userFiles.fileType, "resume_pdf"),
        ),
    });

    if (!file) {
        throw new Error("PDF file not found");
    }

    const bucket = await getR2Bucket();
    const r2Object = await bucket.get(file.r2Key);

    if (!r2Object) {
        throw new Error("PDF file not found in storage");
    }

    const arrayBuffer = await r2Object.arrayBuffer();
    return { bytes: new Uint8Array(arrayBuffer), fileName: file.fileName };
}

async function getCachedAiResult(
    userFileId: string,
    resultType: "extraction" | "analysis",
): Promise<unknown | null> {
    const db = await getDb();
    const cached = await db.query.aiResults.findFirst({
        where: and(
            eq(aiResults.userFileId, userFileId),
            eq(aiResults.resultType, resultType),
        ),
    });
    return cached?.resultData ?? null;
}

async function saveCachedAiResult(
    userId: string,
    userFileId: string,
    resultType: "extraction" | "analysis",
    resultData: unknown,
    modelId: string,
): Promise<void> {
    const db = await getDb();
    await db.insert(aiResults).values({
        userId,
        userFileId,
        resultType,
        resultData: resultData as Record<string, unknown>,
        modelId,
    });
}

function buildSectionOrder(extraction: AiResumeExtraction): string[] {
    const order: string[] = ["personal-info"];
    if (extraction.summary) order.push("profile");
    if (extraction.educations?.length) order.push("education");
    if (extraction.skills?.length) order.push("skills");
    if (extraction.workExperiences?.length) order.push("experience");
    if (extraction.projects?.length) order.push("projects");
    if (extraction.awards?.length) order.push("awards");
    if (extraction.publications?.length) order.push("publications");
    if (extraction.certificates?.length) order.push("certificates");
    if (extraction.languages?.length) order.push("languages");
    if (extraction.courses?.length) order.push("courses");
    if (extraction.references?.length) order.push("references");
    if (extraction.interests?.length) order.push("interests");
    return order;
}

function buildSectionVisibility(
    extraction: AiResumeExtraction,
): Record<string, boolean> {
    return {
        "personal-info": true,
        profile: !!extraction.summary,
        education: !!extraction.educations?.length,
        skills: !!extraction.skills?.length,
        experience: !!extraction.workExperiences?.length,
        projects: !!extraction.projects?.length,
        awards: !!extraction.awards?.length,
        publications: !!extraction.publications?.length,
        certificates: !!extraction.certificates?.length,
        languages: !!extraction.languages?.length,
        courses: !!extraction.courses?.length,
        references: !!extraction.references?.length,
        interests: !!extraction.interests?.length,
    };
}

// ---------------------------------------------------------------------------
// Recreate Resume from uploaded PDF via AI extraction
// ---------------------------------------------------------------------------
export async function recreateResumeFromPdf(
    fileId: string,
): Promise<{ success: boolean; resumeId?: string; error?: string }> {
    try {
        const session = await requireSession();
        const userId = session.user.id;

        // 1. Check cache for existing extraction
        const cached = await getCachedAiResult(fileId, "extraction");
        let extraction: AiResumeExtraction;

        if (cached) {
            extraction = cached as AiResumeExtraction;
        } else {
            // 2. Fetch PDF from R2
            const { bytes, fileName } = await getPdfBytesFromR2(userId, fileId);

            // 3. Call Gemini via AI Gateway for structured extraction
            const model = await getAiModel();
            const { output } = await generateText({
                model,
                output: Output.object({
                    schema: aiResumeExtractionSchema,
                }),
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "file",
                                data: bytes,
                                mediaType: "application/pdf",
                            },
                            {
                                type: "text",
                                text: `Extract all structured resume data from this PDF file named "${fileName}".
Extract every section you can find: personal information, summary/objective, work experience, education, projects, skills, awards, publications, certificates, languages, courses, references, and interests.
For dates, use YYYY-MM-DD format. If only a year is given, use YYYY-01-01. If month and year, use YYYY-MM-01.
For descriptions with bullet points, preserve them as newline-separated items.
Extract skills as individual items, not grouped categories.
Be thorough — do not skip any content from the resume.`,
                            },
                        ],
                    },
                ],
                maxRetries: 2,
            });

            if (!output) {
                return {
                    success: false,
                    error: "AI could not extract structured data from this PDF. Please ensure it is a valid resume.",
                };
            }

            extraction = output;

            // 4. Cache the extraction result
            await saveCachedAiResult(
                userId,
                fileId,
                "extraction",
                extraction,
                MODEL_ID,
            );
        }

        // 5. Transform AI extraction to ResumeValues shape
        const nameParts = [extraction.firstName, extraction.lastName].filter(
            Boolean,
        );
        const resumeValues: ResumeValues = {
            title:
                nameParts.length > 0
                    ? `${nameParts.join(" ")}'s Resume`
                    : "Imported Resume",
            firstName: extraction.firstName,
            lastName: extraction.lastName,
            jobTitle: extraction.jobTitle,
            email: extraction.email,
            phone: extraction.phone,
            city: extraction.city,
            country: extraction.country,
            linkedin: extraction.linkedin,
            website: extraction.website,
            summary: extraction.summary,
            skills: extraction.skills,

            // Defaults for visual settings
            colorHex: "#000000",
            borderStyle: "squircle",
            layout: "single-column",
            fontSize: 10,
            fontFamily: "serif",

            // Compute from extracted data
            sectionOrder: buildSectionOrder(extraction),
            sectionVisibility: buildSectionVisibility(extraction),

            workExperiences: extraction.workExperiences?.map((exp, idx) => ({
                ...exp,
                visible: true,
                displayOrder: idx,
            })),
            educations: extraction.educations?.map((edu, idx) => ({
                ...edu,
                visible: true,
                displayOrder: idx,
            })),
            projects: extraction.projects?.map((p, idx) => ({
                ...p,
                visible: true,
                displayOrder: idx,
            })),
            awards: extraction.awards?.map((a, idx) => ({
                ...a,
                visible: true,
                displayOrder: idx,
            })),
            publications: extraction.publications?.map((p, idx) => ({
                ...p,
                visible: true,
                displayOrder: idx,
            })),
            certificates: extraction.certificates?.map((c, idx) => ({
                ...c,
                visible: true,
                displayOrder: idx,
            })),
            languages: extraction.languages?.map((l, idx) => ({
                ...l,
                visible: true,
                displayOrder: idx,
            })),
            courses: extraction.courses?.map((c, idx) => ({
                ...c,
                visible: true,
                displayOrder: idx,
            })),
            references: extraction.references?.map((r, idx) => ({
                ...r,
                visible: true,
                displayOrder: idx,
            })),
            interests: extraction.interests?.map((i, idx) => ({
                ...i,
                visible: true,
                displayOrder: idx,
            })),
        };

        // 6. Create resume in DB (without the redirect)
        const db = await getDb();
        const [resume] = await db
            .insert(resumes)
            .values({
                userId,
                title: resumeValues.title || "Imported Resume",
                firstName: resumeValues.firstName || null,
                lastName: resumeValues.lastName || null,
                jobTitle: resumeValues.jobTitle || null,
                email: resumeValues.email || null,
                phone: resumeValues.phone || null,
                city: resumeValues.city || null,
                country: resumeValues.country || null,
                linkedin: resumeValues.linkedin || null,
                website: resumeValues.website || null,
                summary: resumeValues.summary || null,
                colorHex: resumeValues.colorHex || "#000000",
                borderStyle: resumeValues.borderStyle || "squircle",
                layout: resumeValues.layout || "single-column",
                skills: resumeValues.skills ?? [],
                sectionOrder: resumeValues.sectionOrder ?? [],
                sectionVisibility: resumeValues.sectionVisibility ?? {},
                fieldVisibility: resumeValues.fieldVisibility ?? {},
                fontSize: resumeValues.fontSize ?? 10,
                fontFamily: resumeValues.fontFamily ?? "serif",
            })
            .returning();

        const resumeId = resume.id;

        // 7. Insert related rows
        if (resumeValues.workExperiences?.length) {
            await db.insert(workExperiences).values(
                resumeValues.workExperiences.map((exp, idx) => ({
                    resumeId,
                    position: exp.position || null,
                    company: exp.company || null,
                    startDate: exp.startDate ? new Date(exp.startDate) : null,
                    endDate: exp.endDate ? new Date(exp.endDate) : null,
                    description: exp.description || null,
                    location: exp.location || null,
                    subheading: exp.subheading || null,
                    visible: exp.visible ?? true,
                    displayOrder: idx,
                })),
            );
        }

        if (resumeValues.educations?.length) {
            await db.insert(educations).values(
                resumeValues.educations.map((edu, idx) => ({
                    resumeId,
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
                })),
            );
        }

        if (resumeValues.projects?.length) {
            await db.insert(projects).values(
                resumeValues.projects.map((p, idx) => ({
                    resumeId,
                    title: p.title || null,
                    subtitle: p.subtitle || null,
                    description: p.description || null,
                    link: p.link || null,
                    startDate: p.startDate ? new Date(p.startDate) : null,
                    endDate: p.endDate ? new Date(p.endDate) : null,
                    visible: p.visible ?? true,
                    displayOrder: idx,
                })),
            );
        }

        if (resumeValues.awards?.length) {
            await db.insert(awards).values(
                resumeValues.awards.map((a, idx) => ({
                    resumeId,
                    title: a.title || null,
                    issuer: a.issuer || null,
                    description: a.description || null,
                    date: a.date ? new Date(a.date) : null,
                    visible: a.visible ?? true,
                    displayOrder: idx,
                })),
            );
        }

        if (resumeValues.publications?.length) {
            await db.insert(publications).values(
                resumeValues.publications.map((p, idx) => ({
                    resumeId,
                    title: p.title || null,
                    publisher: p.publisher || null,
                    authors: p.authors || null,
                    description: p.description || null,
                    date: p.date ? new Date(p.date) : null,
                    link: p.link || null,
                    visible: p.visible ?? true,
                    displayOrder: idx,
                })),
            );
        }

        if (resumeValues.certificates?.length) {
            await db.insert(certificates).values(
                resumeValues.certificates.map((c, idx) => ({
                    resumeId,
                    title: c.title || null,
                    issuer: c.issuer || null,
                    description: c.description || null,
                    date: c.date ? new Date(c.date) : null,
                    link: c.link || null,
                    credentialId: c.credentialId || null,
                    visible: c.visible ?? true,
                    displayOrder: idx,
                })),
            );
        }

        if (resumeValues.languages?.length) {
            await db.insert(languages).values(
                resumeValues.languages.map((l, idx) => ({
                    resumeId,
                    language: l.language || null,
                    proficiency: l.proficiency || null,
                    visible: l.visible ?? true,
                    displayOrder: idx,
                })),
            );
        }

        if (resumeValues.courses?.length) {
            await db.insert(courses).values(
                resumeValues.courses.map((c, idx) => ({
                    resumeId,
                    name: c.name || null,
                    institution: c.institution || null,
                    description: c.description || null,
                    date: c.date ? new Date(c.date) : null,
                    visible: c.visible ?? true,
                    displayOrder: idx,
                })),
            );
        }

        if (resumeValues.references?.length) {
            await db.insert(resumeReferences).values(
                resumeValues.references.map((r, idx) => ({
                    resumeId,
                    name: r.name || null,
                    position: r.position || null,
                    company: r.company || null,
                    email: r.email || null,
                    phone: r.phone || null,
                    visible: r.visible ?? true,
                    displayOrder: idx,
                })),
            );
        }

        if (resumeValues.interests?.length) {
            await db.insert(interests).values(
                resumeValues.interests.map((i, idx) => ({
                    resumeId,
                    name: i.name || null,
                    visible: i.visible ?? true,
                    displayOrder: idx,
                })),
            );
        }

        return { success: true, resumeId };
    } catch (err) {
        console.error("[recreateResumeFromPdf] error:", err);
        if (NoObjectGeneratedError.isInstance(err)) {
            return {
                success: false,
                error: "AI could not parse this resume. The PDF may be image-based or in an unsupported format.",
            };
        }
        return {
            success: false,
            error:
                err instanceof Error
                    ? err.message
                    : "Failed to recreate resume. Please try again.",
        };
    }
}

// ---------------------------------------------------------------------------
// Analyze an uploaded PDF resume via AI
// ---------------------------------------------------------------------------
export async function analyzeResumePdf(
    fileId: string,
    forceRefresh: boolean = false,
): Promise<{ success: boolean; analysis?: AiResumeAnalysis; error?: string }> {
    try {
        const session = await requireSession();
        const userId = session.user.id;

        // 1. Check cache (skip if forceRefresh)
        if (!forceRefresh) {
            const cached = await getCachedAiResult(fileId, "analysis");
            if (cached) {
                return { success: true, analysis: cached as AiResumeAnalysis };
            }
        }

        // 2. Fetch PDF from R2
        const { bytes, fileName } = await getPdfBytesFromR2(userId, fileId);

        // 3. Call Gemini for analysis via generateText + Output.object
        const model = await getAiModel();
        const { output } = await generateText({
            model,
            output: Output.object({
                schema: aiResumeAnalysisSchema,
            }),
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "file",
                            data: bytes,
                            mediaType: "application/pdf",
                        },
                        {
                            type: "text",
                            text: `Analyze this resume PDF named "${fileName}" for quality, effectiveness, and ATS compatibility.

Evaluate these aspects:
1. **Summary/Objective** — Is it compelling and tailored?
2. **Work Experience** — Are achievements quantified? Are action verbs used? Is it results-oriented?
3. **Education** — Is it complete and relevant?
4. **Skills** — Are they relevant, well-organized, and include both technical and soft skills?
5. **Projects** — Are they well-described with impact?
6. **Formatting** — Is the layout clean, consistent, and professional?
7. **ATS Compatibility** — Will it parse correctly in applicant tracking systems?
8. **Overall Impact** — Does it tell a compelling career story?

Be specific and actionable in your feedback. Reference actual content from the resume where possible.
Score fairly — most resumes should fall in the 40-80 range. Only exceptional resumes score above 85.`,
                        },
                    ],
                },
            ],
            maxRetries: 2,
        });

        if (!output) {
            return {
                success: false,
                error: "AI could not generate an analysis for this resume. Please try again.",
            };
        }

        const analysis = output;

        // 4. Cache the result (delete old cache first on forceRefresh)
        if (forceRefresh) {
            const db = await getDb();
            await db
                .delete(aiResults)
                .where(
                    and(
                        eq(aiResults.userFileId, fileId),
                        eq(aiResults.resultType, "analysis"),
                    ),
                );
        }

        await saveCachedAiResult(
            userId,
            fileId,
            "analysis",
            analysis,
            MODEL_ID,
        );

        return { success: true, analysis };
    } catch (err) {
        console.error("[analyzeResumePdf] error:", err);
        if (NoObjectGeneratedError.isInstance(err)) {
            return {
                success: false,
                error: "AI could not parse this resume for analysis. The PDF may be image-based or in an unsupported format.",
            };
        }
        return {
            success: false,
            error:
                err instanceof Error
                    ? err.message
                    : "Failed to analyze resume. Please try again.",
        };
    }
}
