import { getDb } from "@/db";
import { resumes } from "@/db/schema";
import { requireSession } from "@/lib/auth-server";
import { eq, desc } from "drizzle-orm";
import { Plus, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ResumeCard } from "./resume-card";
import { createResume } from "./actions";
import TemplatesSection from "./templates-section";

export default async function DashboardPage() {
    const session = await requireSession();
    const db = await getDb();

    const userResumes = await db.query.resumes.findMany({
        where: eq(resumes.userId, session.user.id),
        orderBy: [desc(resumes.updatedAt)],
        with: {
            workExperiences: true,
            educations: true,
            projects: true,
            awards: true,
            publications: true,
            certificates: true,
            languages: true,
            courses: true,
            resumeReferences: true,
            interests: true,
        },
    });

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <p className="mt-1 text-muted-foreground">
                        {userResumes.length === 0
                            ? "Create your first resume to get started"
                            : `You have ${userResumes.length} resume${userResumes.length === 1 ? "" : "s"}`}
                    </p>
                </div>
                {userResumes.length > 0 && (
                    <form action={createResume}>
                        <Button type="submit">
                            <Plus className="mr-1.5 h-4 w-4" />
                            New Resume
                        </Button>
                    </form>
                )}
            </div>

            {/* Resumes Grid */}
            {userResumes.length > 0 ? (
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                    {/* Create New Card */}
                    <div className="group overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/25 bg-card transition-all hover:border-primary/50 hover:shadow-md">
                        <form action={createResume} className="h-full">
                            <button
                                type="submit"
                                className="flex w-full flex-col items-center justify-center gap-3 text-muted-foreground transition-colors group-hover:text-primary"
                                style={{ aspectRatio: "210 / 297" }}
                            >
                                <div className="rounded-full border-2 border-dashed border-muted-foreground/30 p-4 transition-colors group-hover:border-primary/50">
                                    <Plus className="h-8 w-8" />
                                </div>
                                <span className="text-sm font-medium">
                                    Create New Resume
                                </span>
                            </button>
                        </form>
                    </div>

                    {userResumes.map((resume) => (
                        <ResumeCard key={resume.id} resume={resume} />
                    ))}
                </div>
            ) : (
                <Card className="mx-auto max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-2 rounded-full bg-primary/10 p-4">
                            <FileText className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-xl">
                            No resumes yet
                        </CardTitle>
                        <CardDescription>
                            Get started by creating your first AI-powered
                            resume. It only takes a few minutes.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center pb-8">
                        <form action={createResume}>
                            <Button type="submit" size="lg">
                                <Sparkles className="mr-1.5 h-4 w-4" />
                                Create Your First Resume
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Templates Section — Client Component for modal state */}
            <TemplatesSection />
        </div>
    );
}

