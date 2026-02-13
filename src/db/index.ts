import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { schema } from "./schema";

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export async function getDb() {
    if (!dbInstance) {
        const ctx = await getCloudflareContext({ async: true });
        const env = ctx.env as unknown as { DB: D1Database };
        dbInstance = drizzle(env.DB, { schema });
    }
    return dbInstance;
}
