"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    FileText,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Check,
    AlertCircle,
    Circle,
} from "lucide-react";
import { steps } from "./steps";

interface FooterProps {
    currentStep: string;
    setCurrentStep: (step: string) => void;
    showSmResumePreview: boolean;
    setShowSmResumePreview: (show: boolean) => void;
    isSaving: boolean;
    hasUnsavedChanges: boolean;
    lastSaveError: string | null;
}

export default function Footer({
    currentStep,
    setCurrentStep,
    showSmResumePreview,
    setShowSmResumePreview,
    isSaving,
    hasUnsavedChanges,
    lastSaveError,
}: FooterProps) {
    const currentIndex = steps.findIndex((step) => step.key === currentStep);
    const previousStep = steps[currentIndex - 1];
    const nextStep = steps[currentIndex + 1];

    return (
        <footer className="w-full border-t px-3 py-3">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
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
                        size="sm"
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

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                    setShowSmResumePreview(
                                        !showSmResumePreview,
                                    )
                                }
                                className="md:hidden"
                            >
                                <FileText className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Toggle preview</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {/* Save status indicator */}
                <SaveStatus
                    isSaving={isSaving}
                    hasUnsavedChanges={hasUnsavedChanges}
                    lastSaveError={lastSaveError}
                />
            </div>
        </footer>
    );
}

function SaveStatus({
    isSaving,
    hasUnsavedChanges,
    lastSaveError,
}: {
    isSaving: boolean;
    hasUnsavedChanges: boolean;
    lastSaveError: string | null;
}) {
    if (lastSaveError) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Badge
                            variant="destructive"
                            className="gap-1.5 font-normal"
                        >
                            <AlertCircle className="h-3 w-3" />
                            Save failed
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        <p className="max-w-xs text-xs">{lastSaveError}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    if (isSaving) {
        return (
            <Badge variant="secondary" className="gap-1.5 font-normal">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving...
            </Badge>
        );
    }

    if (hasUnsavedChanges) {
        return (
            <Badge variant="outline" className="gap-1.5 font-normal">
                <Circle className="h-2 w-2 fill-amber-500 text-amber-500" />
                Unsaved changes
            </Badge>
        );
    }

    return (
        <Badge
            variant="outline"
            className="gap-1.5 font-normal text-muted-foreground"
        >
            <Check className="h-3 w-3" />
            Saved
        </Badge>
    );
}
