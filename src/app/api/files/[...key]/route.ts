import { NextResponse } from "next/server";
import { getR2Bucket } from "@/lib/r2";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ key: string[] }> },
) {
    try {
        const { key } = await params;
        const r2Key = key.map(decodeURIComponent).join("/");

        const bucket = await getR2Bucket();
        const object = await bucket.get(r2Key);

        if (!object) {
            return new NextResponse("Not found", { status: 404 });
        }

        const headers = new Headers();
        headers.set(
            "Content-Type",
            object.httpMetadata?.contentType || "application/octet-stream",
        );
        headers.set(
            "Cache-Control",
            "public, max-age=31536000, immutable",
        );
        headers.set("ETag", object.httpEtag);

        return new NextResponse(object.body as ReadableStream, { headers });
    } catch (err) {
        console.error("[files/serve] error:", err);
        return new NextResponse("Internal server error", { status: 500 });
    }
}
