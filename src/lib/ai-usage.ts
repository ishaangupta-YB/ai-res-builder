import { getDb } from "@/db";
import { aiUsageLogs } from "@/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { MODEL_ID } from "@/lib/ai";

// ---------------------------------------------------------------------------
// Free-tier limit (tokens per calendar month)
// ---------------------------------------------------------------------------

const FREE_TIER_TOKEN_LIMIT = 50_000;

// ---------------------------------------------------------------------------
// Log a single AI call's token usage
// ---------------------------------------------------------------------------

export async function logAiUsage(
    userId: string,
    usage: { inputTokens?: number; outputTokens?: number; totalTokens?: number },
    featureType: "enhance" | "recreate" | "analyze" | "portfolio",
) {
    const db = await getDb();
    await db.insert(aiUsageLogs).values({
        userId,
        featureType,
        inputTokens: usage.inputTokens ?? 0,
        outputTokens: usage.outputTokens ?? 0,
        totalTokens: usage.totalTokens ?? 0,
        modelId: MODEL_ID,
    });
}

// ---------------------------------------------------------------------------
// Query aggregated usage for a user in the current billing period
// ---------------------------------------------------------------------------

async function getUserTokenUsage(userId: string) {
    const db = await getDb();

    // Default to start of current calendar month
    const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const [row] = await db
        .select({
            totalInputTokens: sql<number>`coalesce(sum(${aiUsageLogs.inputTokens}), 0)`,
            totalOutputTokens: sql<number>`coalesce(sum(${aiUsageLogs.outputTokens}), 0)`,
            totalTokens: sql<number>`coalesce(sum(${aiUsageLogs.totalTokens}), 0)`,
            callCount: sql<number>`count(*)`,
        })
        .from(aiUsageLogs)
        .where(
            and(
                eq(aiUsageLogs.userId, userId),
                gte(aiUsageLogs.createdAt, start),
            ),
        );

    return {
        totalInputTokens: Number(row.totalInputTokens),
        totalOutputTokens: Number(row.totalOutputTokens),
        totalTokens: Number(row.totalTokens),
        callCount: Number(row.callCount),
    };
}

// ---------------------------------------------------------------------------
// Check if user can make an AI call (under free-tier limit or has premium)
// ---------------------------------------------------------------------------

export async function checkAiUsageLimit(
    userId: string,
): Promise<{ allowed: boolean; used: number; limit: number }> {
    // TODO: Check if user has premium subscription here
    // const subscription = await getUserSubscription(userId);
    // if (subscription?.active) return { allowed: true, used: 0, limit: Infinity };

    const usage = await getUserTokenUsage(userId);
    return {
        allowed: usage.totalTokens < FREE_TIER_TOKEN_LIMIT,
        used: usage.totalTokens,
        limit: FREE_TIER_TOKEN_LIMIT,
    };
}

// ---------------------------------------------------------------------------
// Get full AI usage info for display (profile page, etc.)
// ---------------------------------------------------------------------------

export async function getAiUsageInfo(userId: string) {
    const usage = await getUserTokenUsage(userId);
    const limit = FREE_TIER_TOKEN_LIMIT;
    const usagePercent = Math.min(Math.round((usage.totalTokens / limit) * 100), 100);

    return {
        totalInputTokens: usage.totalInputTokens,
        totalOutputTokens: usage.totalOutputTokens,
        totalTokens: usage.totalTokens,
        callCount: usage.callCount,
        limit,
        usagePercent,
    };
}
