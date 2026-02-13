"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { steps } from "./steps";

interface FooterProps {
    currentStep: string;
    setCurrentStep: (step: string) => void;
    showSmResumePreview: boolean;
    setShowSmResumePreview: (show: boolean) => void;
    isSaving: boolean;
}

export default function Footer({
    currentStep,
    setCurrentStep,
    showSmResumePreview,
    setShowSmResumePreview,
    isSaving,
}: FooterProps) {
    const currentIndex = steps.findIndex((step) => step.key === currentStep);
    const previousStep = steps[currentIndex - 1];
    const nextStep = steps[currentIndex + 1];

    return (
        <footer className="w-full border-t px-3 py-4">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={
                            previousStep
                                ? () => setCurrentStep(previousStep.key)
                                : undefined
                        }
                        disabled={!previousStep}
                    >
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Previous
                    </Button>
                    <Button
                        onClick={
                            nextStep
                                ? () => setCurrentStep(nextStep.key)
                                : undefined
                        }
                        disabled={!nextStep}
                    >
                        Next
                        <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowSmResumePreview(!showSmResumePreview)}
                    className="md:hidden"
                    title="Toggle resume preview"
                >
                    <FileText className="h-4 w-4" />
                </Button>

                <p
                    className={cn(
                        "text-sm text-muted-foreground",
                        isSaving && "animate-pulse",
                    )}
                >
                    {isSaving ? "Saving..." : "Saved"}
                </p>
            </div>
        </footer>
    );
}
