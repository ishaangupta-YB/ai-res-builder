/**
 * R2 Presigned URL Generation
 *
 * Uses aws4fetch to generate presigned PUT URLs for direct client-side
 * uploads to Cloudflare R2 via the S3-compatible API.
 *
 * Credentials are read from Cloudflare Worker secrets:
 *   - R2_ACCESS_KEY_ID
 *   - R2_SECRET_ACCESS_KEY
 *   - R2_ACCOUNT_ID
 */

import { AwsClient } from "aws4fetch";
import { getCloudflareContext } from "@opennextjs/cloudflare";

interface R2Credentials {
    accessKeyId: string;
    secretAccessKey: string;
    accountId: string;
}

const R2_BUCKET_NAME = "ai-resume-uploads";

/**
 * Reads R2 API credentials from Cloudflare env secrets.
 * These must be set via `wrangler secret put`.
 */
async function getR2Credentials(): Promise<R2Credentials> {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as {
        R2_ACCESS_KEY_ID: string;
        R2_SECRET_ACCESS_KEY: string;
        R2_ACCOUNT_ID: string;
    };

    if (!env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY || !env.R2_ACCOUNT_ID) {
        throw new Error("R2 API credentials not configured. Set R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_ACCOUNT_ID as secrets.");
    }

    return {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
        accountId: env.R2_ACCOUNT_ID,
    };
}

/**
 * Generates a presigned PUT URL for direct client upload to R2.
 *
 * @param key         - The R2 object key (e.g. "{userId}/{fileId}.pdf")
 * @param contentType - The MIME type to lock into the signature
 * @param contentLength - The file size in bytes to lock into the signature
 * @param expiresIn   - URL validity in seconds (default 300 = 5 minutes)
 * @returns The signed URL string
 */
export async function generatePresignedUploadUrl(
    key: string,
    contentType: string,
    contentLength: number,
    expiresIn: number = 300,
): Promise<string> {
    const creds = await getR2Credentials();

    const client = new AwsClient({
        accessKeyId: creds.accessKeyId,
        secretAccessKey: creds.secretAccessKey,
    });

    const url = new URL(
        `https://${R2_BUCKET_NAME}.${creds.accountId}.r2.cloudflarestorage.com/${key}`,
    );

    // Set the expiration as a query parameter for AWS Sig V4
    url.searchParams.set("X-Amz-Expires", String(expiresIn));

    // Sign a PUT request with the specified content type and length
    const signed = await client.sign(
        new Request(url, {
            method: "PUT",
            headers: {
                "Content-Type": contentType,
                "Content-Length": String(contentLength),
            },
        }),
        {
            aws: { signQuery: true },
        },
    );

    return signed.url;
}

export { R2_BUCKET_NAME };
