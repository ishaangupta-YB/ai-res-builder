"use client";

import { useState, useCallback } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    enhanceResumeField,
    type EnhanceFieldType,
} from "@/lib/ai-enhance";

interface AiEnhanceButtonProps {
    fieldType: EnhanceFieldType;
    currentText: string;
    context: Record<string, string>;
    maxLength?: number;
    onEnhanced: (newText: string) => void;
}

export default function AiEnhanceButton({
    fieldType,
    currentText,
    context,
    maxLength,
    onEnhanced,
}: AiEnhanceButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = useCallback(async () => {
        setIsLoading(true);
        const previousText = currentText;

        try {
            const result = await enhanceResumeField({
                fieldType,
                currentText,
                context,
                maxLength,
            });

            if (!result.success || !result.enhancedText) {
                toast.error(result.error ?? "Enhancement failed. Please try again.");
                return;
            }

            onEnhanced(result.enhancedText);

            toast.success("Text enhanced by AI", {
                action: {
                    label: "Undo",
                    onClick: () => onEnhanced(previousText),
                },
                duration: 8000,
            });
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [fieldType, currentText, context, maxLength, onEnhanced]);

    const isEmpty = !currentText?.trim();

    return (
        <TooltipProvider delayDuration={200}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={handleClick}
                        className="ai-enhance-btn group inline-flex shrink-0 items-center gap-1 rounded-full border border-violet-300/60 bg-gradient-to-r from-violet-50 to-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-violet-600 transition-all hover:border-violet-400 hover:from-violet-100 hover:to-amber-100 hover:shadow-[0_0_8px_rgba(139,92,246,0.25)] disabled:pointer-events-none disabled:opacity-50 dark:border-violet-500/30 dark:from-violet-950/50 dark:to-amber-950/30 dark:text-violet-400 dark:hover:border-violet-400/50 dark:hover:from-violet-900/50 dark:hover:to-amber-900/30 dark:hover:shadow-[0_0_8px_rgba(139,92,246,0.2)]"
                    >
                        {isLoading ? (
                            <Spinner className="size-3" />
                        ) : (
                            <Sparkles className="size-3" />
                        )}
                        <span>AI</span>
                    </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-52 text-center">
                    <p className="text-xs font-medium">
                        {isEmpty
                            ? "Auto-generate with AI based on your details"
                            : "Rewrite & enhance this text with AI"}
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
