"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { steps } from "./steps";

interface BreadcrumbsProps {
    currentStep: string;
    setCurrentStep: (step: string) => void;
}

export default function Breadcrumbs({
    currentStep,
    setCurrentStep,
}: BreadcrumbsProps) {
    const currentIndex = steps.findIndex((s) => s.key === currentStep);

    return (
        <div className="flex justify-center">
            <nav aria-label="Resume editor steps">
                <ol className="flex flex-wrap items-center gap-1">
                    {steps.map((step, index) => {
                        const isActive = step.key === currentStep;
                        const isCompleted = index < currentIndex;

                        return (
                            <li key={step.key} className="flex items-center">
                                {index > 0 && (
                                    <Separator
                                        className={cn(
                                            "mx-1.5 w-4",
                                            isCompleted && "bg-primary",
                                        )}
                                    />
                                )}
                                <Button
                                    type="button"
                                    variant={isActive ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setCurrentStep(step.key)}
                                    className={cn(
                                        "gap-1.5 rounded-full",
                                        !isActive &&
                                            isCompleted &&
                                            "text-primary hover:text-primary",
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "flex h-5 w-5 items-center justify-center rounded-full text-xs",
                                            isActive
                                                ? "bg-primary-foreground text-primary"
                                                : isCompleted
                                                  ? "bg-primary/10 text-primary"
                                                  : "bg-muted text-muted-foreground",
                                        )}
                                    >
                                        {isCompleted ? (
                                            <Check className="h-3 w-3" />
                                        ) : (
                                            index + 1
                                        )}
                                    </span>
                                    <span className="hidden sm:inline">
                                        {step.title}
                                    </span>
                                </Button>
                            </li>
                        );
                    })}
                </ol>
            </nav>
        </div>
    );
}
