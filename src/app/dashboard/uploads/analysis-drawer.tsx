"use client";

import { useEffect, useState } from "react";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import {
    CheckCircle2,
    AlertTriangle,
    XCircle,
    ChevronDown,
    ChevronUp,
    Shield,
} from "lucide-react";
import { analyzeResumePdf } from "../actions";
import type { AiResumeAnalysis } from "@/lib/ai-schemas";

interface AnalysisDrawerProps {
    fileId: string | null;
    fileName: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function scoreColor(score: number): string {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
}

function scoreBadgeVariant(
    score: number,
): "default" | "secondary" | "destructive" {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
}

export function AnalysisDrawer({
    fileId,
    fileName,
    open,
    onOpenChange,
}: AnalysisDrawerProps) {
    const [analysis, setAnalysis] = useState<AiResumeAnalysis | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedSections, setExpandedSections] = useState<Set<number>>(
        new Set(),
    );

    useEffect(() => {
        if (!open || !fileId) return;

        setLoading(true);
        setError(null);
        setAnalysis(null);
        setExpandedSections(new Set());

        analyzeResumePdf(fileId).then((result) => {
            if (result.success && result.analysis) {
                setAnalysis(result.analysis);
            } else {
                setError(result.error || "Analysis failed");
            }
            setLoading(false);
        });
    }, [open, fileId]);

    function toggleSection(idx: number) {
        setExpandedSections((prev) => {
            const next = new Set(prev);
            if (next.has(idx)) next.delete(idx);
            else next.add(idx);
            return next;
        });
    }

    function handleRetry() {
        if (!fileId) return;
        setLoading(true);
        setError(null);
        setAnalysis(null);

        analyzeResumePdf(fileId).then((result) => {
            if (result.success && result.analysis) {
                setAnalysis(result.analysis);
            } else {
                setError(result.error || "Analysis failed");
            }
            setLoading(false);
        });
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="max-h-[85vh]">
                <DrawerHeader className="border-b px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <DrawerTitle>Resume Analysis</DrawerTitle>
                            <DrawerDescription>
                                {fileName || "Resume"} — AI-powered review
                            </DrawerDescription>
                        </div>
                        {analysis && (
                            <div className="text-center">
                                <div
                                    className={`text-3xl font-bold ${scoreColor(analysis.overallScore)}`}
                                >
                                    {analysis.overallScore}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Overall Score
                                </div>
                            </div>
                        )}
                    </div>
                </DrawerHeader>

                <ScrollArea className="flex-1 overflow-y-auto px-6 py-4">
                    {/* Loading state */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Spinner className="h-8 w-8" />
                            <p className="mt-4 text-sm text-muted-foreground">
                                Analyzing your resume...
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                This may take 10-15 seconds
                            </p>
                        </div>
                    )}

                    {/* Error state */}
                    {error && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <XCircle className="h-8 w-8 text-destructive" />
                            <p className="mt-4 text-sm font-medium text-destructive">
                                {error}
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-4"
                                onClick={handleRetry}
                            >
                                Try Again
                            </Button>
                        </div>
                    )}

                    {/* Analysis results */}
                    {analysis && (
                        <div className="space-y-6 pb-6">
                            {/* Summary feedback */}
                            <div className="rounded-lg bg-muted/50 p-4">
                                <p className="text-sm leading-relaxed">
                                    {analysis.summaryFeedback}
                                </p>
                            </div>

                            {/* Overall progress bar */}
                            <div>
                                <div className="mb-2 flex items-center justify-between text-sm">
                                    <span className="font-medium">
                                        Overall Score
                                    </span>
                                    <span
                                        className={scoreColor(
                                            analysis.overallScore,
                                        )}
                                    >
                                        {analysis.overallScore}/100
                                    </span>
                                </div>
                                <Progress value={analysis.overallScore} />
                            </div>

                            {/* ATS Compatibility */}
                            <div className="rounded-lg border p-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <h3 className="flex items-center gap-2 text-sm font-semibold">
                                        <Shield className="h-4 w-4" />
                                        ATS Compatibility
                                    </h3>
                                    <Badge
                                        variant={scoreBadgeVariant(
                                            analysis.atsCompatibility.score,
                                        )}
                                    >
                                        {analysis.atsCompatibility.score}/100
                                    </Badge>
                                </div>
                                {analysis.atsCompatibility.issues.length > 0 ? (
                                    <ul className="space-y-1">
                                        {analysis.atsCompatibility.issues.map(
                                            (issue, i) => (
                                                <li
                                                    key={i}
                                                    className="flex items-start gap-2 text-sm"
                                                >
                                                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
                                                    {issue}
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        No ATS issues detected
                                    </p>
                                )}
                            </div>

                            {/* Top strengths */}
                            <div>
                                <h3 className="mb-2 text-sm font-semibold">
                                    Top Strengths
                                </h3>
                                <ul className="space-y-1">
                                    {analysis.topStrengths.map((s, i) => (
                                        <li
                                            key={i}
                                            className="flex items-start gap-2 text-sm"
                                        >
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Critical improvements */}
                            <div>
                                <h3 className="mb-2 text-sm font-semibold">
                                    Key Improvements
                                </h3>
                                <ul className="space-y-1">
                                    {analysis.criticalImprovements.map(
                                        (imp, i) => (
                                            <li
                                                key={i}
                                                className="flex items-start gap-2 text-sm"
                                            >
                                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                                                {imp}
                                            </li>
                                        ),
                                    )}
                                </ul>
                            </div>

                            {/* Per-section details (collapsible) */}
                            <div>
                                <h3 className="mb-2 text-sm font-semibold">
                                    Section Details
                                </h3>
                                <div className="space-y-2">
                                    {analysis.sections.map((section, idx) => (
                                        <div
                                            key={idx}
                                            className="rounded-lg border"
                                        >
                                            <button
                                                className="flex w-full items-center justify-between p-3 text-left"
                                                onClick={() =>
                                                    toggleSection(idx)
                                                }
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium">
                                                        {section.name}
                                                    </span>
                                                    <Badge
                                                        variant={scoreBadgeVariant(
                                                            section.score,
                                                        )}
                                                        className="text-xs"
                                                    >
                                                        {section.score}
                                                    </Badge>
                                                </div>
                                                {expandedSections.has(idx) ? (
                                                    <ChevronUp className="h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" />
                                                )}
                                            </button>
                                            {expandedSections.has(idx) && (
                                                <div className="space-y-2 border-t px-3 pb-3 pt-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        {section.feedback}
                                                    </p>
                                                    {section.strengths.length >
                                                        0 && (
                                                        <div>
                                                            <p className="mb-1 text-xs font-medium text-green-600 dark:text-green-400">
                                                                Strengths:
                                                            </p>
                                                            <ul className="space-y-0.5">
                                                                {section.strengths.map(
                                                                    (s, i) => (
                                                                        <li
                                                                            key={
                                                                                i
                                                                            }
                                                                            className="text-xs text-muted-foreground"
                                                                        >
                                                                            +{" "}
                                                                            {s}
                                                                        </li>
                                                                    ),
                                                                )}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    {section.improvements
                                                        .length > 0 && (
                                                        <div>
                                                            <p className="mb-1 text-xs font-medium text-orange-600 dark:text-orange-400">
                                                                Improvements:
                                                            </p>
                                                            <ul className="space-y-0.5">
                                                                {section.improvements.map(
                                                                    (
                                                                        imp,
                                                                        i,
                                                                    ) => (
                                                                        <li
                                                                            key={
                                                                                i
                                                                            }
                                                                            className="text-xs text-muted-foreground"
                                                                        >
                                                                            -{" "}
                                                                            {
                                                                                imp
                                                                            }
                                                                        </li>
                                                                    ),
                                                                )}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </ScrollArea>
            </DrawerContent>
        </Drawer>
    );
}
