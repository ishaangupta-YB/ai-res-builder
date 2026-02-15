import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function getR2Bucket(): Promise<R2Bucket> {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as unknown as { R2_BUCKET: R2Bucket };
    return env.R2_BUCKET;
}

export function buildR2Key(
    userId: string,
    _fileType: "photo" | "resume_pdf",
    fileId: string,
    extension: string,
): string {
    return `${userId}/${fileId}.${extension}`;
}

export function r2KeyToUrl(r2Key: string): string {
    return `/api/files/${r2Key}`;
}

export const PHOTO_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
]);

export const PDF_MIME_TYPES = new Set(["application/pdf"]);

export const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5 MB
export const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10 MB
