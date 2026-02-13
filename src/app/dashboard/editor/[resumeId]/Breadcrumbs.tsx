"use client";

import { cn } from "@/lib/utils";
import { steps } from "./steps";

interface BreadcrumbsProps {
    currentStep: string;
    setCurrentStep: (step: string) => void;
}

export default function Breadcrumbs({
    currentStep,
    setCurrentStep,
}: BreadcrumbsProps) {
    return (
        <div className="flex justify-center">
            <nav aria-label="Resume editor steps">
                <ol className="flex flex-wrap items-center gap-2">
                    {steps.map((step, index) => {
                        const isActive = step.key === currentStep;
                        const currentIndex = steps.findIndex(
                            (s) => s.key === currentStep,
                        );
                        const isCompleted = index < currentIndex;

                        return (
                            <li key={step.key} className="flex items-center">
                                {index > 0 && (
                                    <div
                                        className={cn(
                                            "mx-2 h-px w-4",
                                            isCompleted
                                                ? "bg-primary"
                                                : "bg-muted",
                                        )}
                                    />
                                )}
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(step.key)}
                                    className={cn(
                                        "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : isCompleted
                                              ? "bg-primary/10 text-primary hover:bg-primary/20"
                                              : "bg-muted text-muted-foreground hover:bg-muted/80",
                                    )}
                                >
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full border text-xs">
                                        {index + 1}
                                    </span>
                                    <span className="hidden sm:inline">
                                        {step.title}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ol>
            </nav>
        </div>
    );
}
