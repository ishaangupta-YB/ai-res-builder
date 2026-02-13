"use server";

import { getDb } from "@/db";
import { resumes } from "@/db/schema";
import { requireSession } from "@/lib/auth-server";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createResume() {
    const session = await requireSession();
    const db = await getDb();

    const [resume] = await db
        .insert(resumes)
        .values({
            userId: session.user.id,
            title: "Untitled Resume",
        })
        .returning();

    redirect(`/dashboard/editor/${resume.id}`);
}

export async function deleteResume(resumeId: string) {
    const session = await requireSession();
    const db = await getDb();

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
