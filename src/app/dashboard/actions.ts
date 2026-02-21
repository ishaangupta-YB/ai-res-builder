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
import { generatePresignedDownloadUrl } from "@/lib/r2-presign";
import { requireSession } from "@/lib/auth-server";
import { resumeSchema, type ResumeValues } from "@/lib/validation";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { getAiModel, MODEL_ID } from "@/lib/ai";
import { logAiUsage, checkAiUsageLimit } from "@/lib/ai-usage";
import { canCreateResume } from "@/lib/subscription";
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

    // Enforce free-plan resume limit
    const check = await canCreateResume(session.user.id);
    if (!check.allowed) {
        redirect("/dashboard?limit=true");
    }

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

    // Enforce free-plan resume limit
    const check = await canCreateResume(session.user.id);
    if (!check.allowed) {
        redirect("/dashboard?limit=true");
    }

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

/**
 * Gets a temporary presigned download URL for a user's PDF file.
 * Uses the S3-compatible API (not the R2 binding) so it works in
 * both local dev and production.
 */
async function getPdfUrlFromR2(
    userId: string,
    fileId: string,
): Promise<{ url: string; fileName: string }> {
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

    // Generate a presigned GET URL (5-minute expiry)
    // Gemini will fetch the PDF directly from this URL
    const url = await generatePresignedDownloadUrl(file.r2Key);
    return { url, fileName: file.fileName };
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
            // 2. Check AI usage limit
            const usageCheck = await checkAiUsageLimit(userId);
            if (!usageCheck.allowed) {
                return {
                    success: false,
                    error: `AI usage limit reached (${usageCheck.used.toLocaleString()} / ${usageCheck.limit.toLocaleString()} tokens this month). Upgrade to premium for unlimited access.`,
                };
            }

            // 3. Get a temporary presigned URL for the PDF
            const { url: pdfUrl, fileName } = await getPdfUrlFromR2(userId, fileId);

            // 4. Call Gemini via AI Gateway for structured extraction
            const model = await getAiModel();
            const { output, usage } = await generateText({
                model,
                output: Output.object({
                    schema: aiResumeExtractionSchema,
                }),
                system: `You are a world-class resume data extraction engine built for precision and completeness. You have deep expertise in parsing resumes across every industry, career level, and format — from a fresh graduate's single-page resume to a senior executive's multi-page CV.

Your mission: extract EVERY piece of structured data from the PDF with surgical accuracy. Treat the resume as a source of truth — extract what exists, never infer what doesn't.

## Core Extraction Rules

1. **Completeness over brevity.** Extract ALL sections, ALL entries, ALL bullet points. If a resume has 15 bullet points under a role, extract all 15 — do not summarize or truncate.

2. **Fidelity to source.** Extract text exactly as written. Do not rephrase, paraphrase, improve, or "clean up" the candidate's language. Their exact wording matters for recreating a faithful resume.

3. **Null over fabrication.** If a field is not present in the resume, omit it (return null/undefined). NEVER guess, infer, or fabricate data. Common examples:
   - No phone number listed → phone: null (don't guess from area codes or other context)
   - No end date on a role → endDate: null (this means "present/current")
   - No location listed → location: null (don't infer from company name)
   - No GPA listed → gpa: null (don't estimate)

## Date Handling

Dates on resumes come in wildly inconsistent formats. Normalize ALL dates to YYYY-MM-DD:
- "June 2023" or "Jun 2023" → "2023-06-01"
- "2023" (year only) → "2023-01-01"
- "Summer 2022" → "2022-06-01"
- "Q3 2021" → "2021-07-01"
- "Present", "Current", "Now", or "Ongoing" → leave endDate empty/null
- "Expected May 2025" or "Expected 2025" → use the expected date
- If a date range says "2021 - 2023" with no months → startDate: "2021-01-01", endDate: "2023-01-01"

## Layout & Format Handling

Resumes come in many layouts. Handle each correctly:
- **Multi-column layouts:** Read ALL columns. Side columns often contain contact info, skills, languages, or certifications.
- **Two-column designs:** Left column might have skills/contact, right column has experience. Extract from both.
- **Tables/grids:** These might contain skills matrices or structured education data. Extract the cell content.
- **Headers/footers:** May contain contact info, page numbers, or links. Don't miss them.
- **Icons/symbols:** Resume may use icons (📧, 📱, 🔗) before contact info. Extract the data after the icon.

## Work Experience Nuances

- **Multiple roles at same company:** Some candidates list multiple promotions/roles under one company. Extract each as a separate workExperience entry with the company name repeated.
- **Titles with slashes:** "Software Engineer / Tech Lead" → position: "Software Engineer / Tech Lead" (keep as-is, don't split)
- **Freelance/contract work:** Extract like any other role. Company might be "Self-employed", "Freelance", or client names.
- **Bullet points vs. paragraphs:** If descriptions use bullet points (•, -, *, ▪), join them with "\n". If it's a paragraph, keep as a single string.
- **Subheadings:** Some resumes have a secondary line under the job title (e.g., department name, team name, or a brief tagline). Capture this in the subheading field.

## Skills Extraction

- **Flatten grouped skills.** If the resume says "Programming: Python, Java, C++" → extract as ["Python", "Java", "C++"]
- **Separate categories.** "Frontend: React, Vue" and "Backend: Node.js, Django" → ["React", "Vue", "Node.js", "Django"]
- **Preserve proficiency if mentioned inline.** Don't extract "Advanced" or "Beginner" as skills — they are proficiency levels for language entries.
- **Tools and platforms are skills too.** Git, Docker, AWS, Figma, Jira — these are individual skills.
- **Soft skills only if explicitly listed.** Leadership, Communication, etc. — only extract if the resume explicitly lists them in a skills section.

## Education Nuances

- **Honors/Cum Laude:** Include in the description field, not the degree field.
- **Minor/Concentration:** Include in fieldOfStudy (e.g., "Computer Science, Minor in Mathematics")
- **Coursework listings:** If relevant coursework is listed, include in description.
- **Study abroad:** If listed as a separate education entry, extract it as one.

## Contact & Personal Info

- **Name parsing:** First word(s) = firstName, last word = lastName. For names like "Jean-Pierre Dupont", firstName: "Jean-Pierre", lastName: "Dupont". For "Mary Jane Watson", firstName: "Mary Jane", lastName: "Watson" (middle names go with first name).
- **LinkedIn URL normalization:** Extract the full URL as written (don't try to normalize linkedin.com/in/xxx formats).
- **Multiple websites:** If both a portfolio and GitHub are listed, pick the primary portfolio for website. GitHub can be noted in projects.
- **Location:** Extract city and country separately. "New York, NY" → city: "New York", country: "NY". "London, UK" → city: "London", country: "UK".

## Ordering

- Preserve the resume's original ordering within each section (typically most recent first for experience/education).`,
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "file",
                                data: new URL(pdfUrl),
                                mediaType: "application/pdf",
                            },
                            {
                                type: "text",
                                text: `Extract all structured data from this resume PDF ("${fileName}").

Here is an example of the expected output format for a work experience entry:
{
  "position": "Senior Software Engineer",
  "company": "Acme Corp",
  "location": "San Francisco, CA",
  "startDate": "2021-03-01",
  "endDate": "2023-11-01",
  "description": "Led migration of monolith to microservices architecture, reducing deployment time by 60%\nDesigned and implemented real-time event processing pipeline handling 50K events/sec\nReduced API p95 latency from 800ms to 120ms through Redis caching and query optimization\nMentored 3 junior engineers through weekly 1:1s and code reviews",
  "subheading": "Platform Engineering Team"
}

And for an education entry:
{
  "degree": "Bachelor of Science",
  "school": "Stanford University",
  "fieldOfStudy": "Computer Science",
  "gpa": "3.8/4.0",
  "location": "Stanford, CA",
  "startDate": "2017-09-01",
  "endDate": "2021-06-01",
  "description": "Dean's List (6 semesters)\nRelevant Coursework: Distributed Systems, Machine Learning, Database Systems"
}

Extract EVERY section you can find: personal info, summary/objective, work experience, education, projects, skills, awards, publications, certificates, languages, courses, references, and interests. Do not skip any content — even small sections like hobbies or volunteer work should be captured in the appropriate field.`,
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

            // 5. Log token usage
            await logAiUsage(userId, usage, "recreate");

            // 6. Cache the extraction result
            await saveCachedAiResult(
                userId,
                fileId,
                "extraction",
                extraction,
                MODEL_ID,
            );
        }

        // 5. Transform AI extraction to ResumeValues shape
        //    Null-coalesce every field — never let undefined slip into the DB
        const nameParts = [extraction.firstName, extraction.lastName].filter(
            Boolean,
        );
        const resumeValues: ResumeValues = {
            title:
                nameParts.length > 0
                    ? `${nameParts.join(" ")}'s Resume`
                    : "Imported Resume",
            firstName: extraction.firstName ?? undefined,
            lastName: extraction.lastName ?? undefined,
            jobTitle: extraction.jobTitle ?? undefined,
            email: extraction.email ?? undefined,
            phone: extraction.phone ?? undefined,
            city: extraction.city ?? undefined,
            country: extraction.country ?? undefined,
            linkedin: extraction.linkedin ?? undefined,
            website: extraction.website ?? undefined,
            summary: extraction.summary ?? undefined,
            skills: extraction.skills ?? [],

            // Defaults for visual settings
            colorHex: "#000000",
            borderStyle: "squircle",
            layout: "single-column",
            fontSize: 10,
            fontFamily: "serif",

            // Compute from extracted data
            sectionOrder: buildSectionOrder(extraction),
            sectionVisibility: buildSectionVisibility(extraction),

            workExperiences: (extraction.workExperiences ?? []).map((exp, idx) => ({
                ...exp,
                visible: true,
                displayOrder: idx,
            })),
            educations: (extraction.educations ?? []).map((edu, idx) => ({
                ...edu,
                visible: true,
                displayOrder: idx,
            })),
            projects: (extraction.projects ?? []).map((p, idx) => ({
                ...p,
                visible: true,
                displayOrder: idx,
            })),
            awards: (extraction.awards ?? []).map((a, idx) => ({
                ...a,
                visible: true,
                displayOrder: idx,
            })),
            publications: (extraction.publications ?? []).map((p, idx) => ({
                ...p,
                visible: true,
                displayOrder: idx,
            })),
            certificates: (extraction.certificates ?? []).map((c, idx) => ({
                ...c,
                visible: true,
                displayOrder: idx,
            })),
            languages: (extraction.languages ?? []).map((l, idx) => ({
                ...l,
                visible: true,
                displayOrder: idx,
            })),
            courses: (extraction.courses ?? []).map((c, idx) => ({
                ...c,
                visible: true,
                displayOrder: idx,
            })),
            references: (extraction.references ?? []).map((r, idx) => ({
                ...r,
                visible: true,
                displayOrder: idx,
            })),
            interests: (extraction.interests ?? []).map((i, idx) => ({
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

        // 2. Check AI usage limit
        const usageCheck = await checkAiUsageLimit(userId);
        if (!usageCheck.allowed) {
            return {
                success: false,
                error: `AI usage limit reached (${usageCheck.used.toLocaleString()} / ${usageCheck.limit.toLocaleString()} tokens this month). Upgrade to premium for unlimited access.`,
            };
        }

        // 3. Get a temporary presigned URL for the PDF
        const { url: pdfUrl, fileName } = await getPdfUrlFromR2(userId, fileId);

        // 4. Call Gemini for analysis via generateText + Output.object
        const model = await getAiModel();
        const { output, usage } = await generateText({
            model,
            output: Output.object({
                schema: aiResumeAnalysisSchema,
            }),
            system: `You are a world-class resume reviewer who combines the perspectives of three distinct experts:

1. **The Recruiter (6-Second Scan):** You evaluate first impressions. Can you identify the candidate's target role, experience level, and key qualifications within 6 seconds? Is the visual hierarchy effective? Does the resume pass the "squint test" — when you squint, can you still see clear section breaks and a logical flow?

2. **The Hiring Manager (Deep Read):** You evaluate substance. Are achievements specific, quantified, and relevant? Does the candidate demonstrate impact, not just activity? Can you understand what this person actually DID, not just what they were responsible for? Are there red flags like unexplained gaps, job-hopping without progression, or vague buzzwords without substance?

3. **The ATS Parser (Machine Read):** You evaluate technical compatibility. Will automated screening systems correctly parse every section? Are there formatting elements (tables, columns, text boxes, headers/footers, images) that would cause parsing failures? Are standard section headers used? Would keyword matching work effectively against common job descriptions in this field?

## Scoring Philosophy

Your scores must be honest, calibrated, and defensible:

- **0-20:** Fundamentally broken — Missing critical sections, incoherent structure, or appears to be a non-resume document. Almost never given.
- **21-40:** Significantly below standard — Major gaps (no work experience section, no contact info), severely poor formatting, or content that would immediately disqualify in most applications.
- **41-55:** Below average — Functional but with substantial issues. Common for first-draft resumes: duty-based descriptions without achievements, inconsistent formatting, missing quantification.
- **56-70:** Average — Meets basic standards but lacks polish. Has some quantified achievements but inconsistent. Formatting is decent but not optimized. This is where most resumes land.
- **71-82:** Good — Well-structured, mostly quantified achievements, clean formatting, clear career narrative. Minor improvements possible but wouldn't embarrass the candidate.
- **83-92:** Excellent — Strong achievements with clear metrics, polished formatting, compelling narrative, optimized for ATS. Ready for top-tier applications with perhaps 1-2 small tweaks.
- **93-100:** Near-perfect — Reserve this for resumes that are genuinely exceptional. This means every bullet point has quantified impact, the career story is compelling and cohesive, formatting is immaculate, and you'd struggle to find meaningful improvements. Extremely rare.

**Calibration anchor:** A typical software engineer resume with 3 years of experience, decent formatting, a mix of quantified and non-quantified bullets, and standard section headers should score around 55-65. Adjust from there.

## Feedback Quality Standards

Your feedback must be:

- **Specific, not generic.** BAD: "Add more metrics." GOOD: "Your second bullet at TechCo says 'improved system performance' — quantify this: by what percentage? measured how? what was the baseline?"
- **Actionable, not observational.** BAD: "The skills section could be better." GOOD: "Group your 18 skills into 3-4 categories (Languages, Frameworks, Tools, Cloud) to improve scannability. Consider removing 'Microsoft Office' — it's assumed for professional roles and uses valuable space."
- **Prioritized.** Distinguish between critical issues that would hurt the candidate's chances vs. nice-to-have polish improvements.
- **Context-aware.** A fresh graduate's resume should be evaluated differently than a staff engineer's. Don't penalize a student for lacking 10 years of experience. Don't penalize a senior executive for having a 2-page resume.

## What to Look For (Deep Analysis Lenses)

### Content Quality
- Are bullet points achievement-oriented ("Increased revenue by 30%") vs. duty-oriented ("Responsible for managing revenue")?
- Does the candidate use the PAR/STAR format (Problem → Action → Result)?
- Are there specific metrics, numbers, dollar amounts, percentages, team sizes?
- Is there evidence of career progression (growing responsibilities, promotions)?
- Do descriptions use strong action verbs ("Architected", "Spearheaded", "Optimized") vs. weak ones ("Helped", "Assisted", "Worked on")?

### Professional Narrative
- Does the summary/objective clearly state what the candidate does and what value they bring?
- Is there a coherent career story — can you see the thread connecting their experiences?
- Are there career gaps? If so, are they explained?
- Does the resume show job-hopping (multiple roles under 1 year)? Is there a pattern of growth despite job changes?

### Formatting & Design
- Is there a clear visual hierarchy (name → role → sections)?
- Is whitespace used effectively or is the resume either too cramped or too sparse?
- Is typography consistent (same font sizes for same-level headings, consistent date formats)?
- Are margins reasonable (0.5-1 inch)?
- Is the resume an appropriate length for the candidate's experience level? (1 page for <5 years, 2 pages acceptable for >5 years)
- Are there orphan lines or awkward page breaks?

### ATS Compatibility
- Is the file a text-based PDF (not a scanned image)?
- Are section headers standard ("Work Experience" not "Where I've Made My Mark")?
- Is contact info in the document body (not in the header/footer, which many ATS systems skip)?
- Are there fancy design elements (tables, multi-column layouts, icons, charts) that could confuse parsers?
- Does it avoid text boxes, which are often ignored by ATS?

### Red Flags to Call Out
- Unexplained gaps > 6 months
- Inconsistencies (dates overlapping, title inflation)
- Overuse of buzzwords without substance ("synergy", "leverage", "paradigm shift")
- Wall-of-text descriptions vs. crisp bullets
- Missing contact information
- Unprofessional email addresses
- Including irrelevant personal information (age, photo, marital status — depends on region)`,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "file",
                            data: new URL(pdfUrl),
                            mediaType: "application/pdf",
                        },
                        {
                            type: "text",
                            text: `Perform a comprehensive, no-holds-barred analysis of this resume ("${fileName}").

For each section that exists in the resume, provide:
1. A score from 0-100 (calibrated to the scoring guidelines)
2. What's working well (specific strengths with examples from the resume)
3. What needs improvement (specific, actionable suggestions — not vague platitudes)

Required evaluation sections:
- **Summary / Objective** — Value proposition clarity, tailoring, and hook strength
- **Work Experience** — Achievement quantification, action verb strength, impact demonstration, PAR/STAR format usage
- **Education** — Completeness, relevance, proper formatting
- **Skills** — Relevance, organization, technical vs. soft skill balance, keyword optimization
- **Projects** — Impact clarity, technology stack, outcomes
- **Formatting & Layout** — Visual hierarchy, consistency, whitespace, typography, page length appropriateness
- **Overall Impact** — Career narrative coherence, differentiation, and "Would I interview this person?" gut check

Then evaluate ATS compatibility separately:
- Identify specific elements that would cause parsing failures
- Check for standard vs. creative section headers
- Evaluate keyword density for the candidate's apparent target role

Finally provide:
- **Top strengths:** 3-5 specific things this resume does well (cite actual content)
- **Critical improvements:** 3-5 highest-impact changes ranked by importance (most impactful first)
- **Overall summary:** 2-3 sentences capturing your honest assessment — imagine you're giving this feedback face-to-face to the candidate`,
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

        // 5. Log token usage
        await logAiUsage(userId, usage, "analyze");

        // 6. Cache the result (delete old cache first on forceRefresh)
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
