"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import type { ResumeValues } from "@/lib/validation";
import ResumeTemplate from "./ResumeTemplate";
import PrintableResume from "./PrintableResume";
import {
    FONT_FAMILIES,
    PAGE_WIDTH,
    PAGE_HEIGHT,
    PAGE_PADDING_X,
    PAGE_PADDING_Y,
    CONTENT_HEIGHT,
    CONTENT_WIDTH,
    type PreviewSettings,
} from "./ResumePreviewSection";

interface PreviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    resumeData: ResumeValues;
    previewSettings: PreviewSettings;
}

export default function PreviewModal({
    open,
    onOpenChange,
    resumeData,
    previewSettings,
}: PreviewModalProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const printRef = useRef<HTMLDivElement>(null);
    const [contentHeight, setContentHeight] = useState(0);
    const [containerWidth, setContainerWidth] = useState(PAGE_WIDTH + 48);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: resumeData.title || "Resume",
    });

    const fontScale = previewSettings.fontSize / 10;
    const fontFamilyCss =
        FONT_FAMILIES.find((f) => f.value === previewSettings.fontFamily)?.css ??
        FONT_FAMILIES[0].css;

    // Use callback ref for the measurement div so the observer is set up
    // as soon as the DOM node mounts (avoids Radix portal timing issues)
    const measureObserverRef = useRef<ResizeObserver | null>(null);
    const measureCallbackRef = useCallback((node: HTMLDivElement | null) => {
        // Clean up previous observer
        if (measureObserverRef.current) {
            measureObserverRef.current.disconnect();
            measureObserverRef.current = null;
        }
        if (!node) return;
        const observer = new ResizeObserver((entries) => {
            const h =
                entries[0]?.borderBoxSize?.[0]?.blockSize ??
                entries[0]?.contentRect.height ??
                0;
            setContentHeight(h);
        });
        observer.observe(node);
        measureObserverRef.current = observer;
    }, []);

    // Clean up observer on unmount
    useEffect(() => {
        return () => {
            measureObserverRef.current?.disconnect();
        };
    }, []);

    // Observe container width for responsive page scaling
    useEffect(() => {
        if (!open) return;
        const el = containerRef.current;
        if (!el) return;
        const observer = new ResizeObserver((entries) => {
            setContainerWidth(entries[0]?.contentRect.width ?? PAGE_WIDTH + 48);
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, [open]);

    const numPages = Math.max(1, Math.ceil(contentHeight / CONTENT_HEIGHT));
    const displayScale = Math.min(
        1,
        Math.max(0.35, (containerWidth - 48) / PAGE_WIDTH),
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex h-[90vh] w-[min(96vw,800px)] max-w-none flex-col gap-0 p-0 sm:max-w-none">
                <DialogHeader className="shrink-0 border-b px-6 py-4">
                    <div className="flex items-center justify-between">
                        <DialogTitle>
                            Resume Preview
                            <span className="ml-2 text-sm font-normal text-muted-foreground">
                                {numPages}{" "}
                                {numPages === 1 ? "page" : "pages"}
                            </span>
                        </DialogTitle>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrint()}
                        >
                            <Printer className="mr-1.5 h-4 w-4" />
                            Print / PDF
                        </Button>
                    </div>
                </DialogHeader>

                <div ref={containerRef} className="relative flex-1 overflow-hidden">
                    {/* Hidden measurement container */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute left-0 top-0 h-0 w-0 overflow-hidden"
                    >
                        <div style={{ width: CONTENT_WIDTH }}>
                            <div ref={measureCallbackRef}>
                                <div style={{ zoom: fontScale }}>
                                    <ResumeTemplate
                                        resumeData={resumeData}
                                        fontFamily={fontFamilyCss}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <ScrollArea className="h-full bg-muted/50">
                        <div className="flex flex-col items-center gap-6 p-6">
                            {Array.from({ length: numPages }).map(
                                (_, pageIndex) => (
                                    <div key={pageIndex}>
                                        {/* Responsive wrapper -- sizes to the scaled page */}
                                        <div
                                            style={{
                                                width: PAGE_WIDTH * displayScale,
                                                height: PAGE_HEIGHT * displayScale,
                                            }}
                                        >
                                            {/* Actual A4 page at fixed dimensions, scaled down to fit */}
                                            <div
                                                className="relative rounded-sm bg-white shadow-md"
                                                style={{
                                                    width: PAGE_WIDTH,
                                                    height: PAGE_HEIGHT,
                                                    transform: `scale(${displayScale})`,
                                                    transformOrigin: "top left",
                                                }}
                                            >
                                                {/* Content clip area */}
                                                <div
                                                    className="absolute overflow-hidden"
                                                    style={{
                                                        top: PAGE_PADDING_Y,
                                                        left: PAGE_PADDING_X,
                                                        right: PAGE_PADDING_X,
                                                        height: CONTENT_HEIGHT,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            marginTop:
                                                                -(
                                                                    pageIndex *
                                                                    CONTENT_HEIGHT
                                                                ),
                                                        }}
                                                    >
                                                        <div style={{ zoom: fontScale }}>
                                                            <ResumeTemplate
                                                                resumeData={resumeData}
                                                                fontFamily={fontFamilyCss}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Page number */}
                                                <div className="absolute bottom-2 right-4 text-[10px] text-neutral-300">
                                                    {pageIndex + 1} / {numPages}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Page break separator */}
                                        {pageIndex < numPages - 1 && (
                                            <div className="mx-auto mt-2 flex items-center gap-2 px-4">
                                                <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
                                                <span className="text-[10px] text-neutral-400">
                                                    Page break
                                                </span>
                                                <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
                                            </div>
                                        )}
                                    </div>
                                ),
                            )}
                        </div>
                    </ScrollArea>
                </div>

                <PrintableResume ref={printRef} resumeData={resumeData} />
            </DialogContent>
        </Dialog>
    );
}
