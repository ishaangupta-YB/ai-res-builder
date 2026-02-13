"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";
import type { ResumeValues } from "@/lib/validation";
import type { Dispatch, SetStateAction } from "react";

interface ResumePreviewSectionProps {
    resumeData: ResumeValues;
    setResumeData: Dispatch<SetStateAction<ResumeValues>>;
    className?: string;
}

export default function ResumePreviewSection({
    resumeData,
    className,
}: ResumePreviewSectionProps) {
    const fullName = [resumeData.firstName, resumeData.lastName]
        .filter(Boolean)
        .join(" ");

    const hasContent =
        fullName ||
        resumeData.photoUrl ||
        resumeData.summary ||
        (resumeData.workExperiences && resumeData.workExperiences.length > 0) ||
        (resumeData.educations && resumeData.educations.length > 0) ||
        (resumeData.skills && resumeData.skills.length > 0);

    return (
        <div
            className={cn(
                "group relative hidden w-full md:flex md:w-1/2",
                className,
            )}
        >
            <ScrollArea className="flex w-full justify-center bg-muted/50 p-4">
                <div className="mx-auto w-full max-w-[420px]">
                    <div
                        className="aspect-[210/297] w-full rounded-sm bg-white shadow-md dark:shadow-lg"
                        style={{
                            color: resumeData.colorHex || "#000000",
                        }}
                    >
                        {/* Resume Preview */}
                        <div className="space-y-4 p-8 text-sm">
                            {/* Header */}
                            <div className="border-b border-neutral-200 pb-4 text-center">
                                {resumeData.photoUrl && (
                                    <img
                                        src={resumeData.photoUrl}
                                        alt=""
                                        className="mx-auto mb-3 h-16 w-16 rounded-full object-cover"
                                    />
                                )}
                                {fullName ? (
                                    <h2 className="text-2xl font-bold">
                                        {fullName}
                                    </h2>
                                ) : (
                                    <h2 className="text-2xl font-bold text-neutral-300">
                                        Your Name
                                    </h2>
                                )}
                                {resumeData.jobTitle && (
                                    <p className="mt-1 text-base text-neutral-500">
                                        {resumeData.jobTitle}
                                    </p>
                                )}
                                <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-neutral-400">
                                    {resumeData.email && (
                                        <span>{resumeData.email}</span>
                                    )}
                                    {resumeData.phone && (
                                        <span>{resumeData.phone}</span>
                                    )}
                                    {(resumeData.city ||
                                        resumeData.country) && (
                                        <span>
                                            {[
                                                resumeData.city,
                                                resumeData.country,
                                            ]
                                                .filter(Boolean)
                                                .join(", ")}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Summary */}
                            {resumeData.summary && (
                                <div>
                                    <h3 className="mb-1 text-xs font-bold uppercase tracking-wider text-neutral-700">
                                        Summary
                                    </h3>
                                    <p className="text-xs leading-relaxed text-neutral-600">
                                        {resumeData.summary}
                                    </p>
                                </div>
                            )}

                            {/* Work Experience */}
                            {resumeData.workExperiences &&
                                resumeData.workExperiences.length > 0 && (
                                    <div>
                                        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-700">
                                            Experience
                                        </h3>
                                        <div className="space-y-2">
                                            {resumeData.workExperiences.map(
                                                (exp, i) => (
                                                    <div key={exp.id || i}>
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <p className="text-xs font-semibold">
                                                                    {exp.position ||
                                                                        "Position"}
                                                                </p>
                                                                <p className="text-xs text-neutral-500">
                                                                    {exp.company ||
                                                                        "Company"}
                                                                </p>
                                                            </div>
                                                            {(exp.startDate ||
                                                                exp.endDate) && (
                                                                <p className="shrink-0 text-xs text-neutral-400">
                                                                    {exp.startDate ||
                                                                        "?"}{" "}
                                                                    –{" "}
                                                                    {exp.endDate ||
                                                                        "Present"}
                                                                </p>
                                                            )}
                                                        </div>
                                                        {exp.description && (
                                                            <p className="mt-1 text-xs text-neutral-600">
                                                                {
                                                                    exp.description
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* Education */}
                            {resumeData.educations &&
                                resumeData.educations.length > 0 && (
                                    <div>
                                        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-700">
                                            Education
                                        </h3>
                                        <div className="space-y-2">
                                            {resumeData.educations.map(
                                                (edu, i) => (
                                                    <div key={edu.id || i}>
                                                        <div className="flex items-start justify-between">
                                                            <p className="text-xs font-semibold">
                                                                {edu.degree ||
                                                                    "Degree"}
                                                            </p>
                                                            {(edu.startDate ||
                                                                edu.endDate) && (
                                                                <p className="shrink-0 text-xs text-neutral-400">
                                                                    {edu.startDate ||
                                                                        "?"}{" "}
                                                                    –{" "}
                                                                    {edu.endDate ||
                                                                        "Present"}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-neutral-500">
                                                            {edu.school ||
                                                                "School"}
                                                        </p>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* Skills */}
                            {resumeData.skills &&
                                resumeData.skills.length > 0 && (
                                    <div>
                                        <h3 className="mb-1 text-xs font-bold uppercase tracking-wider text-neutral-700">
                                            Skills
                                        </h3>
                                        <div className="flex flex-wrap gap-1">
                                            {resumeData.skills.map(
                                                (skill, i) => (
                                                    <Badge
                                                        key={i}
                                                        variant="secondary"
                                                        className="rounded-sm px-1.5 py-0 text-[10px] font-normal"
                                                    >
                                                        {skill}
                                                    </Badge>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* Empty State */}
                            {!hasContent && (
                                <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                                    <FileText className="mb-3 h-10 w-10 text-neutral-200" />
                                    <p className="text-sm text-neutral-400">
                                        Your resume preview will appear here
                                    </p>
                                    <p className="mt-1 text-xs text-neutral-300">
                                        Start filling in the form on the left
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
