import { getDb } from "@/db";
import { resumes } from "@/db/schema";
import { requireSession } from "@/lib/auth-server";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ResumeEditor from "./ResumeEditor";

interface EditorPageProps {
    params: Promise<{ resumeId: string }>;
}

export default async function EditorPage({ params }: EditorPageProps) {
    const { resumeId } = await params;
    const session = await requireSession();

    let resumeToEdit = null;

    if (resumeId !== "new") {
        const db = await getDb();
        const result = await db.query.resumes.findFirst({
            where: and(
                eq(resumes.id, resumeId),
                eq(resumes.userId, session.user.id),
            ),
            with: {
                workExperiences: true,
                educations: true,
            },
        });

        if (!result) {
            notFound();
        }

        resumeToEdit = result;
    }

    return (
        <Suspense
            fallback={
                <div className="flex grow items-center justify-center">
                    <div className="text-muted-foreground">
                        Loading editor...
                    </div>
                </div>
            }
        >
            <ResumeEditor resumeToEdit={resumeToEdit} />
        </Suspense>
    );
}
