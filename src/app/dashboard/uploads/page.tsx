import { getDb } from "@/db";
import { userFiles } from "@/db/schema";
import { requireSession } from "@/lib/auth-server";
import { eq, and, desc } from "drizzle-orm";
import { r2KeyToUrl } from "@/lib/r2";
import { FileUp } from "lucide-react";
import { UploadSection } from "./upload-section";
import { UploadsClient } from "./uploads-client";

export default async function UploadsPage() {
    const session = await requireSession();
    const db = await getDb();

    const files = await db.query.userFiles.findMany({
        where: and(
            eq(userFiles.userId, session.user.id),
            eq(userFiles.fileType, "resume_pdf"),
        ),
        orderBy: [desc(userFiles.createdAt)],
    });

    const filesWithUrls = files.map((f) => ({
        ...f,
        url: r2KeyToUrl(f.r2Key),
    }));

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Uploaded Resumes</h1>
                <p className="mt-1 text-muted-foreground">
                    Upload your existing resumes to recreate or analyze them
                    with AI
                </p>
            </div>

            <UploadSection />

            {filesWithUrls.length > 0 ? (
                <div className="mt-8 space-y-3">
                    <h2 className="text-lg font-semibold">Your Files</h2>
                    <UploadsClient files={filesWithUrls} />
                </div>
            ) : (
                <div className="mt-12 flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-16">
                    <div className="rounded-full bg-muted p-4">
                        <FileUp className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h2 className="mt-4 text-xl font-semibold">
                        No uploads yet
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Upload a PDF resume to get started
                    </p>
                </div>
            )}
        </div>
    );
}
