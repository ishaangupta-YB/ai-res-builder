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
        <div className="container mx-auto max-w-5xl px-4 py-12">

            <div className="rounded-xl border-4 border-black bg-white p-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-black dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
                <div className="rounded-lg border-2 border-dashed border-black/20 p-8 dark:border-white/20">
                    <UploadSection />
                </div>
            </div>

            {filesWithUrls.length > 0 ? (
                <div className="mt-12 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="h-4 w-4 bg-black dark:bg-white" />
                        <h2 className="text-2xl font-black uppercase tracking-tight">
                            Your Resumes
                        </h2>
                    </div>
                    <UploadsClient files={filesWithUrls} />
                </div>
            ) : (
                <div className="mt-12 flex flex-col items-center justify-center rounded-xl border-4 border-black bg-blue-100 py-16 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-blue-900 dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
                    <div className="mb-6 rounded-none border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-black dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                        <FileUp className="h-12 w-12 text-black dark:text-white" />
                    </div>
                    <h2 className="text-3xl font-black uppercase">
                        No uploads yet
                    </h2>
                    <p className="mt-2 text-lg font-medium text-muted-foreground">
                        Upload a PDF resume to get started
                    </p>
                </div>
            )}
        </div>
    );
}
