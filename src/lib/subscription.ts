import { getDb } from "@/db";
import { resumes, userSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const FREE_RESUME_LIMIT = 3;

// ---------------------------------------------------------------------------
// Check if user has an active premium subscription
// ---------------------------------------------------------------------------

export async function isPremiumUser(userId: string): Promise<boolean> {
    const db = await getDb();

    const subscription = await db.query.userSubscriptions.findFirst({
        where: eq(userSubscriptions.userId, userId),
    });

    if (!subscription) return false;

    return (
        subscription.stripeCurrentPeriodEnd > new Date() &&
        !subscription.stripeCancelAtPeriodEnd
    );
}

// ---------------------------------------------------------------------------
// Check if user can create a new resume
// ---------------------------------------------------------------------------

export async function canCreateResume(
    userId: string,
): Promise<{ allowed: boolean; current: number; limit: number }> {
    const premium = await isPremiumUser(userId);

    if (premium) {
        return { allowed: true, current: 0, limit: Infinity };
    }

    const db = await getDb();
    const userResumes = await db.query.resumes.findMany({
        where: eq(resumes.userId, userId),
        columns: { id: true },
    });

    const current = userResumes.length;

    return {
        allowed: current < FREE_RESUME_LIMIT,
        current,
        limit: FREE_RESUME_LIMIT,
    };
}
