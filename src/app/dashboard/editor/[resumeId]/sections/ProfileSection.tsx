"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { EditorFormProps } from "@/lib/types";

const MAX_LENGTH = 1000;

export default function ProfileSection({
    resumeData,
    setResumeData,
}: EditorFormProps) {
    const summary = resumeData.summary ?? "";
    const charCount = summary.length;

    return (
        <div className="w-full min-w-0 max-w-full space-y-1.5">
            <div className="flex items-center justify-between">
                <Label htmlFor="summary" className="text-sm font-medium">
                    Professional Summary
                </Label>
                <span
                    className={`text-xs ${
                        charCount >= MAX_LENGTH
                            ? "text-destructive"
                            : "text-muted-foreground"
                    }`}
                >
                    {charCount}/{MAX_LENGTH}
                </span>
            </div>
            <Textarea
                id="summary"
                value={summary}
                onChange={(e) => {
                    const val = e.target.value;
                    if (val.length <= MAX_LENGTH) {
                        setResumeData((prev) => ({
                            ...prev,
                            summary: val || undefined,
                        }));
                    }
                }}
                placeholder="Write a concise professional summary highlighting your experience, skills, and career goals..."
                className="min-h-[140px] resize-none"
                maxLength={MAX_LENGTH}
            />
        </div>
    );
}
