"use client";

import { forwardRef } from "react";
import type { ResumeValues } from "@/lib/validation";
import ResumeTemplate from "./ResumeTemplate";
import { FONT_FAMILIES, type PreviewFontFamily } from "./ResumePreviewSection";

const PRINT_PAGE_WIDTH = 794; // A4 at 96dpi (210mm)
const PRINT_PADDING_X = 48;
const PRINT_PADDING_Y = 40;

interface PrintableResumeProps {
    resumeData: ResumeValues;
}

const PrintableResume = forwardRef<HTMLDivElement, PrintableResumeProps>(
    function PrintableResume({ resumeData }, ref) {
        const fontFamilyKey =
            (resumeData.fontFamily as PreviewFontFamily) ?? "serif";
        const fontFamilyCss =
            FONT_FAMILIES.find((f) => f.value === fontFamilyKey)?.css ??
            FONT_FAMILIES[0].css;
        const fontScale = (resumeData.fontSize ?? 10) / 10;

        return (
            // Outer wrapper hides content on screen; ref is on the inner div
            // so react-to-print only copies the clean print-ready content
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
                    ref={ref}
                    style={{
                        width: PRINT_PAGE_WIDTH,
                        padding: `${PRINT_PADDING_Y}px ${PRINT_PADDING_X}px`,
                        background: "white",
                        color: "black",
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
        );
    },
);

export default PrintableResume;
