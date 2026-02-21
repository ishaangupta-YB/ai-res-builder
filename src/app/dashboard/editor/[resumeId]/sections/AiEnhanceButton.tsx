"use client";

import { Sparkles } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type { EnhanceFieldType } from "@/lib/ai-enhance";

interface AiEnhanceButtonProps {
    fieldType: EnhanceFieldType;
    currentText: string;
    context: Record<string, string>;
    maxLength?: number;
    onEnhanced: (newText: string) => void;
}

export default function AiEnhanceButton(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _props: AiEnhanceButtonProps,
) {
    return (
        <TooltipProvider delayDuration={200}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span
                        aria-disabled="true"
                        className="inline-flex shrink-0 cursor-not-allowed items-center gap-1 rounded-full border border-violet-300/30 bg-gradient-to-r from-violet-50 to-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-violet-400/50 opacity-60 dark:border-violet-500/20 dark:from-violet-950/30 dark:to-amber-950/20 dark:text-violet-500/40"
                    >
                        <Sparkles className="size-3" />
                        <span>AI</span>
                    </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-52 text-center">
                    <p className="text-xs font-medium">
                        AI features coming soon
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
