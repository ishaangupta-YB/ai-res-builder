"use client";

import { useState, useRef, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import ResumeTemplate from "./editor/[resumeId]/ResumeTemplate";
import {
    CONTENT_WIDTH,
    PAGE_WIDTH,
    PAGE_PADDING_X,
    PAGE_PADDING_Y,
    getPreviewFontFamilyCss,
} from "./editor/[resumeId]/previewConfig";
import type { SampleTemplate } from "./sample-templates";
import { createResumeFromTemplate } from "./actions";

interface TemplatePreviewModalProps {
    template: SampleTemplate | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TemplatePreviewModal({
    template,
    open,
    onOpenChange,
}: TemplatePreviewModalProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [containerWidth, setContainerWidth] = useState(0);

    // Measure available width for scaling
    const wrapperRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = wrapperRef.current;
        if (!el) return;
        const observer = new ResizeObserver((entries) => {
            setContainerWidth(entries[0]?.contentRect.width ?? 0);
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, [open]); // re-run when open changes to ensure we measure

    if (!template) return null;

    const fontFamilyCss = getPreviewFontFamilyCss(template.data.fontFamily);
    const fontScale = (template.data.fontSize ?? 10) / 10;
    const effectiveContentWidth = CONTENT_WIDTH / fontScale;

    // Calculate scale to fit. PAGE_WIDTH is 680. 
    // We want some padding around it (e.g. 24px each side = 48px).
    // If container < 680+48, scale down.
    const paddingX = 48;
    const scale = containerWidth
        ? Math.min(1, (containerWidth - paddingX) / PAGE_WIDTH)
        : 1;

    async function handleCreateYours() {
        if (!template) return;
        setIsCreating(true);
        try {
            await createResumeFromTemplate(template.data);
            // The server action redirects — this won't run
        } catch {
            setIsCreating(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[95vh] w-[95vw] max-w-4xl flex-col gap-0 overflow-hidden border-2 border-foreground p-0 shadow-[8px_8px_0px_0px_var(--color-foreground)] sm:rounded-none">
                {/* Header */}
                <DialogHeader className="flex-none border-b-2 border-foreground px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl font-black uppercase tracking-tight">
                                {template.name} Template
                            </DialogTitle>
                            <DialogDescription className="text-sm font-medium text-muted-foreground">
                                {template.description}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Preview Area */}
                <div
                    className="flex-1 overflow-hidden bg-muted/30"
                    ref={wrapperRef}
                >
                    <ScrollArea className="h-full w-full">
                        <div className="flex min-h-full items-center justify-center p-6">
                            <div
                                className="bg-white shadow-[4px_4px_0px_0px_var(--color-foreground)] border-2 border-foreground transition-transform duration-200 ease-out origin-top"
                                style={{
                                    width: PAGE_WIDTH,
                                    transform: `scale(${scale})`,
                                    // Handle layout shift caused by scaling
                                    marginBottom: -(PAGE_WIDTH * (1 / 0.707) * (1 - scale)), // Approximate height correction or just rely on Flex centering
                                }}
                            >
                                <div
                                    style={{
                                        padding: `${PAGE_PADDING_Y}px ${PAGE_PADDING_X}px`,
                                    }}
                                >
                                    <div style={{ width: effectiveContentWidth }}>
                                        <div style={{ zoom: fontScale }}>
                                            <ResumeTemplate
                                                resumeData={template.data}
                                                fontFamily={fontFamilyCss}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </div>

                {/* Footer */}
                <div className="flex-none border-t-2 border-foreground bg-card px-6 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <p className="hidden text-sm font-medium text-muted-foreground sm:block">
                            Use this template as a starting point
                        </p>
                        <div className="flex w-full gap-3 sm:w-auto">
                            <Button
                                variant="outline"
                                className="flex-1 border-2 border-foreground font-bold shadow-[3px_3px_0px_0px_var(--color-foreground)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_var(--color-foreground)] sm:flex-none cursor-pointer"
                                onClick={() => onOpenChange(false)}
                            >
                                Close
                            </Button>
                            <Button
                                className="flex-1 border-2 border-foreground bg-primary font-bold text-primary-foreground shadow-[3px_3px_0px_0px_var(--color-foreground)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_var(--color-foreground)] sm:flex-none cursor-pointer"
                                disabled={isCreating}
                                onClick={handleCreateYours}
                            >
                                {isCreating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating…
                                    </>
                                ) : (
                                    <>
                                        Create Yours
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
