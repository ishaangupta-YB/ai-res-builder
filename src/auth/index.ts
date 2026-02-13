import { KVNamespace } from "@cloudflare/workers-types";
import { betterAuth } from "better-auth";
import { withCloudflare } from "better-auth-cloudflare";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "../db";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const isDev = process.env.NEXTJS_ENV === "development";

// Define an asynchronous function to build your auth configuration
async function authBuilder() {
    const dbInstance = await getDb();
    const ctx = getCloudflareContext();
    const env = ctx.env as unknown as {
        GOOGLE_CLIENT_ID: string;
        GOOGLE_CLIENT_SECRET: string;
        BETTER_AUTH_URL: string;
        BETTER_AUTH_SECRET: string;
        KV: KVNamespace<string>;
    };

    return betterAuth(
        withCloudflare(
            {
                autoDetectIpAddress: true,
                geolocationTracking: true,
                cf: ctx.cf,
                d1: {
                    db: dbInstance as any,
                    options: {
                        usePlural: true,
                        debugLogs: isDev,
                    },
                },
                kv: env.KV,
            },
            {
                baseURL: env.BETTER_AUTH_URL,
                secret: env.BETTER_AUTH_SECRET,
                socialProviders: {
                    google: {
                        clientId: env.GOOGLE_CLIENT_ID,
                        clientSecret: env.GOOGLE_CLIENT_SECRET,
                    },
                },
                rateLimit: {
                    enabled: true,
                    window: 60,
                    max: 100,
                    customRules: {
                        "/sign-in/social": {
                            window: 60,
                            max: 100,
                        },
                    },
                },
            }
        )
    );
}

// Singleton pattern to ensure a single auth instance
let authInstance: Awaited<ReturnType<typeof authBuilder>> | null = null;

// Asynchronously initializes and retrieves the shared auth instance
export async function initAuth() {
    if (!authInstance) {
        authInstance = await authBuilder();
    }
    return authInstance;
}

// This simplified configuration is used by the Better Auth CLI for schema generation.
// It's necessary because the main `authBuilder` performs async operations like `getDb()`
// which use `getCloudflareContext` (not available in CLI context).
export const auth = betterAuth({
    ...withCloudflare(
        {
            autoDetectIpAddress: true,
            geolocationTracking: true,
            cf: {},
        },
        {
            baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
            secret: process.env.BETTER_AUTH_SECRET || "build-placeholder-secret-do-not-use",
            socialProviders: {
                google: {
                    clientId: process.env.GOOGLE_CLIENT_ID || "placeholder",
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder",
                },
            },
        }
    ),

    // Used by the Better Auth CLI for schema generation
    database: drizzleAdapter(process.env.DATABASE as any, {
        provider: "sqlite",
        usePlural: true,
    }),
});
