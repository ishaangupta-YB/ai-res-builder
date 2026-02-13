"use client";

import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FileText, Maximize2, Minus, Plus } from "lucide-react";
import type { ResumeValues } from "@/lib/validation";
import type { Dispatch, SetStateAction } from "react";
import ResumeTemplate from "./ResumeTemplate";

// ---------------------------------------------------------------------------
// A4 page constants (px at screen resolution)
// ---------------------------------------------------------------------------
export const PAGE_WIDTH = 680;
const A4_RATIO = 297 / 210;
export const PAGE_HEIGHT = Math.round(PAGE_WIDTH * A4_RATIO); // ~962
export const PAGE_PADDING_X = 40;
export const PAGE_PADDING_Y = 32;
export const CONTENT_HEIGHT = PAGE_HEIGHT - PAGE_PADDING_Y * 2; // ~898
export const CONTENT_WIDTH = PAGE_WIDTH - PAGE_PADDING_X * 2; // 600

export const FONT_FAMILIES = [
    {
        label: "Serif",
        value: "serif",
        css: 'Georgia, "Times New Roman", "Noto Serif", serif',
    },
    {
        label: "Sans Serif",
        value: "sans-serif",
        css: '"Helvetica Neue", Arial, "Segoe UI", sans-serif',
    },
    {
        label: "Monospace",
        value: "monospace",
        css: '"Courier New", Courier, monospace',
    },
] as const;

export const FONT_SIZE_MIN = 8;
export const FONT_SIZE_MAX = 14;
export const FONT_SIZE_DEFAULT = 10;

export type PreviewFontFamily = (typeof FONT_FAMILIES)[number]["value"];

export interface PreviewSettings {
    fontSize: number;
    fontFamily: PreviewFontFamily;
}

export const DEFAULT_PREVIEW_SETTINGS: PreviewSettings = {
    fontSize: FONT_SIZE_DEFAULT,
    fontFamily: "serif",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ResumePreviewSectionProps {
    resumeData: ResumeValues;
    previewSettings: PreviewSettings;
    onPreviewSettingsChange: Dispatch<SetStateAction<PreviewSettings>>;
    onPreviewOpen?: () => void;
    className?: string;
}

export default function ResumePreviewSection({
    resumeData,
    previewSettings,
    onPreviewSettingsChange,
    onPreviewOpen,
    className,
}: ResumePreviewSectionProps) {
    const fontSize = previewSettings.fontSize;
    const fontFamilyKey = previewSettings.fontFamily;

    const measureRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [contentHeight, setContentHeight] = useState(0);
    const [containerWidth, setContainerWidth] = useState(PAGE_WIDTH + 48);

    const fontScale = fontSize / 10;
    const fontFamilyCss =
        FONT_FAMILIES.find((f) => f.value === fontFamilyKey)?.css ??
        FONT_FAMILIES[0].css;

    // Observe content height for pagination
    useEffect(() => {
        const el = measureRef.current;
        if (!el) return;
        const observer = new ResizeObserver((entries) => {
            const h =
                entries[0]?.borderBoxSize?.[0]?.blockSize ??
                entries[0]?.contentRect.height ??
                0;
            setContentHeight(h);
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // Observe container width for responsive page scaling
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new ResizeObserver((entries) => {
            setContainerWidth(
                entries[0]?.contentRect.width ?? PAGE_WIDTH + 48,
            );
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const numPages = Math.max(1, Math.ceil(contentHeight / CONTENT_HEIGHT));
    // Scale pages to fit container width (with 48px total horizontal padding)
    const displayScale = Math.min(
        1,
        Math.max(0.35, (containerWidth - 48) / PAGE_WIDTH),
    );

    const hasAnyContent = Boolean(
        resumeData.firstName ||
            resumeData.lastName ||
            resumeData.summary ||
            resumeData.jobTitle ||
            resumeData.workExperiences?.length ||
            resumeData.educations?.length ||
            resumeData.skills?.length ||
            resumeData.projects?.length,
    );

    return (
        <div
            className={cn(
                "group relative hidden w-full flex-col md:flex md:w-[65%] md:max-w-[65%]",
                className,
            )}
        >
            {/* Toolbar: font size, font family, page count */}
            <div className="flex shrink-0 flex-wrap items-center gap-3 border-b bg-muted/30 px-4 py-2">
                {/* Font size */}
                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">Size</span>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                            onPreviewSettingsChange((prev) => ({
                                ...prev,
                                fontSize: Math.max(FONT_SIZE_MIN, prev.fontSize - 1),
                            }))
                        }
                        disabled={fontSize <= FONT_SIZE_MIN}
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-6 text-center text-sm font-medium tabular-nums">
                        {fontSize}
                    </span>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                            onPreviewSettingsChange((prev) => ({
                                ...prev,
                                fontSize: Math.min(FONT_SIZE_MAX, prev.fontSize + 1),
                            }))
                        }
                        disabled={fontSize >= FONT_SIZE_MAX}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                {/* Font family */}
                <Select
                    value={fontFamilyKey}
                    onValueChange={(value) =>
                        onPreviewSettingsChange((prev) => ({
                            ...prev,
                            fontFamily: value as PreviewFontFamily,
                        }))
                    }
                >
                    <SelectTrigger className="h-8 w-[130px] text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {FONT_FAMILIES.map((f) => (
                            <SelectItem key={f.value} value={f.value}>
                                {f.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Page indicator + actions */}
                <div className="ml-auto flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                        {numPages} {numPages === 1 ? "page" : "pages"}
                    </span>
                    {onPreviewOpen && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onPreviewOpen}
                        >
                            <Maximize2 className="mr-1.5 h-4 w-4" />
                            Preview
                        </Button>
                    )}
                </div>
            </div>

            {/* Hidden measurement container -- renders template off-screen to measure height */}
            <div
                aria-hidden
                className="pointer-events-none absolute left-0 top-0 h-0 w-0 overflow-hidden"
            >
                <div style={{ width: CONTENT_WIDTH }}>
                    <div ref={measureRef}>
                        <div style={{ zoom: fontScale }}>
                            <ResumeTemplate
                                resumeData={resumeData}
                                fontFamily={fontFamilyCss}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Scrollable preview area */}
            <div
                ref={containerRef}
                className="relative flex-1 overflow-hidden bg-muted/50"
            >
                <ScrollArea className="h-full">
                    <div className="flex flex-col items-center gap-6 p-6">
                        {hasAnyContent ? (
                            Array.from({ length: numPages }).map(
                                (_, pageIndex) => (
                                    <div key={pageIndex}>
                                        {/* Responsive wrapper -- sizes to the scaled page */}
                                        <div
                                            style={{
                                                width:
                                                    PAGE_WIDTH * displayScale,
                                                height:
                                                    PAGE_HEIGHT * displayScale,
                                            }}
                                        >
                                            {/* Actual A4 page at fixed dimensions, scaled down to fit */}
                                            <div
                                                className="relative rounded-sm bg-white shadow-md dark:shadow-lg"
                                                style={{
                                                    width: PAGE_WIDTH,
                                                    height: PAGE_HEIGHT,
                                                    transform: `scale(${displayScale})`,
                                                    transformOrigin:
                                                        "top left",
                                                }}
                                            >
                                                {/* Content clip area -- fixed height per page */}
                                                <div
                                                    className="absolute overflow-hidden"
                                                    style={{
                                                        top: PAGE_PADDING_Y,
                                                        left: PAGE_PADDING_X,
                                                        right: PAGE_PADDING_X,
                                                        height: CONTENT_HEIGHT,
                                                    }}
                                                >
                                                    {/* Offset wrapper -- shifts content for each page */}
                                                    <div
                                                        style={{
                                                            marginTop:
                                                                -(
                                                                    pageIndex *
                                                                    CONTENT_HEIGHT
                                                                ),
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                zoom: fontScale,
                                                            }}
                                                        >
                                                            <ResumeTemplate
                                                                resumeData={
                                                                    resumeData
                                                                }
                                                                fontFamily={
                                                                    fontFamilyCss
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Page number */}
                                                <div className="absolute bottom-2 right-4 text-[10px] text-neutral-300">
                                                    {pageIndex + 1} /{" "}
                                                    {numPages}
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
                            )
                        ) : (
                            /* Empty state: single blank A4 page */
                            <div
                                style={{
                                    width: PAGE_WIDTH * displayScale,
                                    height: PAGE_HEIGHT * displayScale,
                                }}
                            >
                                <div
                                    className="relative rounded-sm bg-white shadow-md dark:shadow-lg"
                                    style={{
                                        width: PAGE_WIDTH,
                                        height: PAGE_HEIGHT,
                                        transform: `scale(${displayScale})`,
                                        transformOrigin: "top left",
                                    }}
                                >
                                    <div className="flex h-full flex-col items-center justify-center text-center">
                                        <FileText className="mb-3 h-10 w-10 text-neutral-200" />
                                        <p className="text-sm text-neutral-400">
                                            Your resume preview will appear
                                            here
                                        </p>
                                        <p className="mt-1 text-xs text-neutral-300">
                                            Start filling in the sections on
                                            the left
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
