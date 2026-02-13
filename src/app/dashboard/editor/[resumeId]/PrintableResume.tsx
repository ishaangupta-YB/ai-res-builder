"use client";

import { forwardRef } from "react";
import type { ResumeValues } from "@/lib/validation";
import ResumeTemplate from "./ResumeTemplate";
import {
    CONTENT_WIDTH,
    FONT_FAMILIES,
    type PreviewFontFamily,
} from "./ResumePreviewSection";

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
                    id="resumePrintContent"
                    style={{
                        width: CONTENT_WIDTH,
                        margin: "0 auto",
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
