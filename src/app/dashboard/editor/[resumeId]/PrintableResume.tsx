"use client";

import { forwardRef } from "react";
import type { ResumeValues } from "@/lib/validation";
import {
    CONTENT_HEIGHT,
    PAGE_HEIGHT,
    PAGE_PADDING_X,
    PAGE_PADDING_Y,
    PAGE_WIDTH,
    getPreviewFontFamilyCss,
} from "./previewConfig";
import { ResumePageFlow, useResumePagination } from "./resumePagination";

interface PrintableResumeProps {
    resumeData: ResumeValues;
}

const PrintableResume = forwardRef<HTMLDivElement, PrintableResumeProps>(
    function PrintableResume({ resumeData }, ref) {
        const fontScale = (resumeData.fontSize ?? 10) / 10;
        const fontFamilyCss = getPreviewFontFamilyCss(resumeData.fontFamily);

        const {
            numPages,
            measureFlowRef,
            effectiveContentWidth,
            effectiveContentHeight,
        } = useResumePagination({
            resumeData,
            fontFamilyCss,
            fontScale,
        });

        return (
            <div
                aria-hidden
                style={{
                    overflow: "hidden",
                    height: 0,
                    position: "absolute",
                    left: 0,
                    top: 0,
                }}
            >
                <div
                    aria-hidden
                    style={{
                        position: "absolute",
                        left: -10000,
                        top: 0,
                        opacity: 0,
                        pointerEvents: "none",
                    }}
                >
                    <ResumePageFlow
                        resumeData={resumeData}
                        fontFamilyCss={fontFamilyCss}
                        fontScale={fontScale}
                        effectiveContentWidth={effectiveContentWidth}
                        effectiveContentHeight={effectiveContentHeight}
                        flowRef={measureFlowRef}
                    />
                </div>

                <div
                    ref={ref}
                    id="resumePrintContent"
                    style={{
                        width: PAGE_WIDTH,
                        margin: "0 auto",
                        background: "white",
                        color: "black",
                    }}
                >
                    {Array.from({ length: numPages }).map((_, pageIndex) => (
                        <div
                            key={pageIndex}
                            className="resume-print-page"
                            style={{
                                width: PAGE_WIDTH,
                                height: PAGE_HEIGHT,
                                position: "relative",
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    position: "absolute",
                                    top: PAGE_PADDING_Y,
                                    left: PAGE_PADDING_X,
                                    right: PAGE_PADDING_X,
                                    height: CONTENT_HEIGHT,
                                    overflow: "hidden",
                                }}
                            >
                                <ResumePageFlow
                                    resumeData={resumeData}
                                    fontFamilyCss={fontFamilyCss}
                                    fontScale={fontScale}
                                    effectiveContentWidth={effectiveContentWidth}
                                    effectiveContentHeight={effectiveContentHeight}
                                    pageIndex={pageIndex}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    },
);

export default PrintableResume;
