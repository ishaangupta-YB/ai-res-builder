"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { EditorFormProps } from "@/lib/types";

export default function SummaryForm({
    resumeData,
    setResumeData,
}: EditorFormProps) {
    return (
        <div className="mx-auto max-w-xl space-y-6">
            <div className="space-y-1">
                <h2 className="text-lg font-semibold">Professional Summary</h2>
                <p className="text-sm text-muted-foreground">
                    Write a brief summary of your professional background and
                    career goals. This appears at the top of your resume.
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="summary">Summary</Label>
                <Textarea
                    id="summary"
                    value={resumeData.summary || ""}
                    onChange={(e) =>
                        setResumeData((prev) => ({
                            ...prev,
                            summary: e.target.value,
                        }))
                    }
                    placeholder="Experienced software engineer with 5+ years of expertise in building scalable web applications. Passionate about creating clean, maintainable code and delivering exceptional user experiences..."
                    rows={8}
                    className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                    {(resumeData.summary || "").length} / 500 characters
                </p>
            </div>
        </div>
    );
}
