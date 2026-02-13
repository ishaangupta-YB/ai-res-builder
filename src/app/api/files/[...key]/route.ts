import { NextResponse } from "next/server";
import { getR2Bucket } from "@/lib/r2";
import { requireSession } from "@/lib/auth-server";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ key: string[] }> },
) {
    try {
        // Auth check: only authenticated users can access files
        const session = await requireSession();

        const { key } = await params;
        const r2Key = key.map(decodeURIComponent).join("/");

        // Ownership check: R2 keys follow the pattern users/{userId}/...
        // Verify the requesting user owns this file
        const pathSegments = r2Key.split("/");
        if (pathSegments[0] === "users" && pathSegments[1]) {
            if (pathSegments[1] !== session.user.id) {
                return new NextResponse("Forbidden", { status: 403 });
            }
        }

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
            "private, max-age=3600",
        );
        headers.set("ETag", object.httpEtag);

        return new NextResponse(object.body as ReadableStream, { headers });
    } catch (err) {
        console.error("[files/serve] error:", err);
        return new NextResponse("Internal server error", { status: 500 });
    }
}
