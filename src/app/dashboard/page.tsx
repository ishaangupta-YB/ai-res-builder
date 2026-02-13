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
                    <h1 className="text-3xl font-bold">My Resumes</h1>
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

            {/* Templates Section */}
            <div className="mt-12">
                <h2 className="mb-4 text-2xl font-bold">Templates</h2>
                <p className="mb-6 text-muted-foreground">
                    Choose a template to get started quickly
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {templates.map((template) => (
                        <Card
                            key={template.name}
                            className="group overflow-hidden p-0 transition-all hover:shadow-md"
                        >
                            <div
                                className="aspect-[210/297] w-full p-4"
                                style={{
                                    background: template.gradient,
                                }}
                            >
                                <div className="flex h-full flex-col items-center justify-center gap-2 text-white">
                                    <FileText className="h-8 w-8" />
                                    <span className="text-sm font-medium">
                                        {template.name}
                                    </span>
                                </div>
                            </div>
                            <div className="p-3">
                                <h3 className="text-sm font-medium">
                                    {template.name}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    {template.description}
                                </p>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

const templates = [
    {
        name: "Professional",
        description: "Clean and modern for corporate roles",
        gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
    },
    {
        name: "Creative",
        description: "Bold design for creative professionals",
        gradient: "linear-gradient(135deg, #c94b4b 0%, #4b134f 100%)",
    },
    {
        name: "Minimal",
        description: "Simple and elegant layout",
        gradient: "linear-gradient(135deg, #2c3e50 0%, #3498db 100%)",
    },
    {
        name: "Modern",
        description: "Contemporary style with accent colors",
        gradient: "linear-gradient(135deg, #0f3443 0%, #34e89e 100%)",
    },
];
