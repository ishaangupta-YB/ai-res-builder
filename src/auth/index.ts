import { KVNamespace } from "@cloudflare/workers-types";
import { betterAuth } from "better-auth";
import { withCloudflare } from "better-auth-cloudflare";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI } from "better-auth/plugins";
import { getDb } from "../db";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Define an asynchronous function to build your auth configuration
async function authBuilder() {
    const dbInstance = await getDb();
    return betterAuth(
        withCloudflare(
            {
                autoDetectIpAddress: true,
                geolocationTracking: true,
                cf: getCloudflareContext().cf,
                d1: {
                    db: dbInstance as any,
                    options: {
                        usePlural: true,
                        debugLogs: true,
                    },
                },
                kv: process.env.KV as unknown as KVNamespace<string>,
            },
            {
                socialProviders: {
                    google: {
                        clientId: process.env.GOOGLE_CLIENT_ID!,
                        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
                plugins: [openAPI()],
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
            socialProviders: {
                google: {
                    clientId: process.env.GOOGLE_CLIENT_ID || "placeholder",
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder",
                },
            },
            plugins: [openAPI()],
        }
    ),

    // Used by the Better Auth CLI for schema generation
    database: drizzleAdapter(process.env.DATABASE as any, {
        provider: "sqlite",
        usePlural: true,
        debugLogs: true,
    }),
});
