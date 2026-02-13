import { getDb } from "@/db";
import { resumes } from "@/db/schema";
import { requireSession } from "@/lib/auth-server";
import { eq } from "drizzle-orm";
import { FileText, Mail, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function ProfilePage() {
    const session = await requireSession();
    const db = await getDb();

    const userResumes = await db.query.resumes.findMany({
        where: eq(resumes.userId, session.user.id),
    });

    const user = session.user;
    const initials = user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="container mx-auto max-w-3xl px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Profile</h1>
                <p className="mt-1 text-muted-foreground">
                    Your account information and settings
                </p>
            </div>

            {/* Profile Card */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                        <Avatar className="h-20 w-20">
                            <AvatarImage
                                src={user.image || undefined}
                                alt={user.name}
                            />
                            <AvatarFallback className="text-2xl">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-center sm:text-left">
                            <h2 className="text-2xl font-bold">{user.name}</h2>
                            <div className="mt-1 flex items-center justify-center gap-2 sm:justify-start">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                    {user.email}
                                </span>
                            </div>
                            <div className="mt-2 flex items-center justify-center gap-2 sm:justify-start">
                                <Badge variant="secondary">
                                    <Shield className="mr-1 h-3 w-3" />
                                    Account Active
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Activity</CardTitle>
                    <CardDescription>
                        Your resume building activity
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-lg bg-muted/50 p-4 text-center">
                            <FileText className="mx-auto h-6 w-6 text-primary" />
                            <p className="mt-2 text-2xl font-bold">
                                {userResumes.length}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Total Resumes
                            </p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-4 text-center">
                            <FileText className="mx-auto h-6 w-6 text-primary" />
                            <p className="mt-2 text-2xl font-bold">
                                {
                                    userResumes.filter(
                                        (r) =>
                                            r.updatedAt >
                                            new Date(
                                                Date.now() -
                                                    7 * 24 * 60 * 60 * 1000,
                                            ),
                                    ).length
                                }
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Updated This Week
                            </p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-4 text-center">
                            <FileText className="mx-auto h-6 w-6 text-primary" />
                            <p className="mt-2 text-2xl font-bold">
                                {
                                    userResumes.filter(
                                        (r) => r.firstName && r.lastName,
                                    ).length
                                }
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Completed
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Account Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Account Details</CardTitle>
                    <CardDescription>
                        Information about your account
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Name</p>
                            <p className="text-sm text-muted-foreground">
                                {user.name}
                            </p>
                        </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Email</p>
                            <p className="text-sm text-muted-foreground">
                                {user.email}
                            </p>
                        </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">User ID</p>
                            <p className="font-mono text-xs text-muted-foreground">
                                {user.id}
                            </p>
                        </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Auth Provider</p>
                            <p className="text-sm text-muted-foreground">
                                Google OAuth
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
