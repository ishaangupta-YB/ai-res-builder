import { createAiGateway } from "ai-gateway-provider";
import { createUnified } from "ai-gateway-provider/providers/unified";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const MODEL_ID = "google-ai-studio/gemini-3-flash-preview";

let cachedModel: ReturnType<ReturnType<typeof createAiGateway>> | null = null;

export async function getAiModel() {
    if (!cachedModel) {
        const ctx = await getCloudflareContext({ async: true });
        const env = ctx.env as unknown as {
            CF_ACCOUNT_ID: string;
            CF_AIG_GATEWAY: string;
            CF_AIG_TOKEN: string;
        };

        const aigateway = createAiGateway({
            accountId: env.CF_ACCOUNT_ID,
            gateway: env.CF_AIG_GATEWAY,
            apiKey: env.CF_AIG_TOKEN,
        });

        const unified = createUnified();
        cachedModel = aigateway(unified(MODEL_ID));
    }
    return cachedModel;
}

export { MODEL_ID };
