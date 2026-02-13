import { getDb } from "@/db";
import { resumes, userSubscriptions } from "@/db/schema";
import { requireSession } from "@/lib/auth-server";
import { eq } from "drizzle-orm";
import { CreditCard, Check, Sparkles, FileText, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

const FREE_RESUME_LIMIT = 3;

export default async function BillingPage() {
    const session = await requireSession();
    const db = await getDb();

    const subscription = await db.query.userSubscriptions.findFirst({
        where: eq(userSubscriptions.userId, session.user.id),
    });

    const userResumes = await db.query.resumes.findMany({
        where: eq(resumes.userId, session.user.id),
        columns: { id: true },
    });
    const resumeCount = userResumes.length;

    const isPremium =
        !!subscription &&
        subscription.stripeCurrentPeriodEnd > new Date() &&
        !subscription.stripeCancelAtPeriodEnd;

    const usagePercent = isPremium
        ? 0
        : Math.min((resumeCount / FREE_RESUME_LIMIT) * 100, 100);

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Billing</h1>
                <p className="mt-1 text-muted-foreground">
                    Manage your subscription and billing details
                </p>
            </div>

            {/* Current Plan Card */}
            <Card className="mb-8">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Current Plan
                            </CardTitle>
                            <CardDescription>
                                Your current subscription plan and usage
                            </CardDescription>
                        </div>
                        <Badge variant={isPremium ? "default" : "secondary"}>
                            {isPremium ? "Premium" : "Free"}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-lg border bg-card p-4">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                    Resumes
                                </span>
                            </div>
                            <p className="mt-2 text-2xl font-bold">
                                {resumeCount}
                                <span className="text-sm font-normal text-muted-foreground">
                                    {isPremium
                                        ? " / Unlimited"
                                        : ` / ${FREE_RESUME_LIMIT}`}
                                </span>
                            </p>
                        </div>
                        <div className="rounded-lg border bg-card p-4">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                    AI Generations
                                </span>
                            </div>
                            <p className="mt-2 text-2xl font-bold">
                                {isPremium ? "Unlimited" : "Limited"}
                            </p>
                        </div>
                        <div className="rounded-lg border bg-card p-4">
                            <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                    Status
                                </span>
                            </div>
                            <p className="mt-2 text-2xl font-bold">
                                {isPremium ? "Active" : "Free Tier"}
                            </p>
                        </div>
                    </div>

                    {/* Usage bar (free plan only) */}
                    {!isPremium && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Resume usage
                                </span>
                                <span className="font-medium">
                                    {resumeCount} / {FREE_RESUME_LIMIT}
                                </span>
                            </div>
                            <Progress value={usagePercent} className="h-2" />
                            {resumeCount >= FREE_RESUME_LIMIT && (
                                <p className="text-xs text-destructive">
                                    You&apos;ve reached your free limit.
                                    Upgrade to create more resumes.
                                </p>
                            )}
                        </div>
                    )}
                </CardContent>
                {isPremium && subscription && (
                    <CardFooter className="border-t pt-4">
                        <p className="text-sm text-muted-foreground">
                            Your subscription renews on{" "}
                            <span className="font-medium text-foreground">
                                {subscription.stripeCurrentPeriodEnd.toLocaleDateString(
                                    "en-US",
                                    {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    },
                                )}
                            </span>
                        </p>
                    </CardFooter>
                )}
            </Card>

            <Separator className="my-8" />

            {/* Plans comparison */}
            <h2 className="mb-6 text-2xl font-bold">Plans</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Free Plan */}
                <Card
                    className={
                        !isPremium ? "border-primary ring-1 ring-primary" : ""
                    }
                >
                    <CardHeader>
                        <CardTitle>Free</CardTitle>
                        <CardDescription>
                            Get started with basic resume building
                        </CardDescription>
                        <p className="text-3xl font-bold">
                            $0
                            <span className="text-sm font-normal text-muted-foreground">
                                /month
                            </span>
                        </p>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {freeFeatures.map((feature) => (
                                <li
                                    key={feature}
                                    className="flex items-start gap-2 text-sm"
                                >
                                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button
                            variant="outline"
                            className="w-full"
                            disabled={!isPremium}
                        >
                            {!isPremium ? "Current Plan" : "Downgrade"}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Premium Plan */}
                <Card
                    className={
                        isPremium ? "border-primary ring-1 ring-primary" : ""
                    }
                >
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Premium</CardTitle>
                            <Badge>Popular</Badge>
                        </div>
                        <CardDescription>
                            Everything you need for professional resumes
                        </CardDescription>
                        <p className="text-3xl font-bold">
                            $9.99
                            <span className="text-sm font-normal text-muted-foreground">
                                /month
                            </span>
                        </p>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {premiumFeatures.map((feature) => (
                                <li
                                    key={feature}
                                    className="flex items-start gap-2 text-sm"
                                >
                                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" disabled={!!isPremium}>
                            {isPremium ? "Current Plan" : "Upgrade to Premium"}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}

const freeFeatures = [
    "Up to 3 resumes",
    "Basic templates",
    "PDF export",
    "Standard AI suggestions",
];

const premiumFeatures = [
    "Unlimited resumes",
    "All premium templates",
    "PDF & DOCX export",
    "Advanced AI writing assistance",
    "Custom color themes",
    "Priority support",
    "Cover letter generation",
];
