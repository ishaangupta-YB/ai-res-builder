"use client";

import { cn } from "@/lib/utils";
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

    return (
        <div
            className={cn(
                "group relative hidden w-full md:flex md:w-1/2",
                className,
            )}
        >
            <div className="flex w-full justify-center overflow-y-auto bg-secondary p-4">
                <div
                    className="aspect-[210/297] h-fit w-full max-w-[420px] bg-white shadow-md"
                    style={{
                        color: resumeData.colorHex || "#000000",
                    }}
                >
                    {/* Resume Preview */}
                    <div className="space-y-4 p-8 text-sm">
                        {/* Header */}
                        <div className="border-b pb-4 text-center">
                            {fullName && (
                                <h2 className="text-2xl font-bold">
                                    {fullName}
                                </h2>
                            )}
                            {resumeData.jobTitle && (
                                <p className="mt-1 text-base text-gray-600">
                                    {resumeData.jobTitle}
                                </p>
                            )}
                            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-gray-500">
                                {resumeData.email && (
                                    <span>{resumeData.email}</span>
                                )}
                                {resumeData.phone && (
                                    <span>{resumeData.phone}</span>
                                )}
                                {(resumeData.city || resumeData.country) && (
                                    <span>
                                        {[resumeData.city, resumeData.country]
                                            .filter(Boolean)
                                            .join(", ")}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Summary */}
                        {resumeData.summary && (
                            <div>
                                <h3 className="mb-1 text-xs font-bold uppercase tracking-wider">
                                    Summary
                                </h3>
                                <p className="text-xs leading-relaxed text-gray-700">
                                    {resumeData.summary}
                                </p>
                            </div>
                        )}

                        {/* Work Experience */}
                        {resumeData.workExperiences &&
                            resumeData.workExperiences.length > 0 && (
                                <div>
                                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wider">
                                        Experience
                                    </h3>
                                    <div className="space-y-2">
                                        {resumeData.workExperiences.map(
                                            (exp, i) => (
                                                <div key={exp.id || i}>
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <p className="text-xs font-semibold">
                                                                {exp.position}
                                                            </p>
                                                            <p className="text-xs text-gray-600">
                                                                {exp.company}
                                                            </p>
                                                        </div>
                                                        <p className="text-xs text-gray-500">
                                                            {exp.startDate} –{" "}
                                                            {exp.endDate ||
                                                                "Present"}
                                                        </p>
                                                    </div>
                                                    {exp.description && (
                                                        <p className="mt-1 text-xs text-gray-700">
                                                            {exp.description}
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
                                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wider">
                                        Education
                                    </h3>
                                    <div className="space-y-2">
                                        {resumeData.educations.map(
                                            (edu, i) => (
                                                <div key={edu.id || i}>
                                                    <div className="flex items-start justify-between">
                                                        <p className="text-xs font-semibold">
                                                            {edu.degree}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {edu.startDate} –{" "}
                                                            {edu.endDate ||
                                                                "Present"}
                                                        </p>
                                                    </div>
                                                    <p className="text-xs text-gray-600">
                                                        {edu.school}
                                                    </p>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}

                        {/* Skills */}
                        {resumeData.skills && resumeData.skills.length > 0 && (
                            <div>
                                <h3 className="mb-1 text-xs font-bold uppercase tracking-wider">
                                    Skills
                                </h3>
                                <div className="flex flex-wrap gap-1">
                                    {resumeData.skills.map((skill, i) => (
                                        <span
                                            key={i}
                                            className="rounded bg-gray-100 px-1.5 py-0.5 text-xs"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Empty State */}
                        {!fullName &&
                            !resumeData.summary &&
                            (!resumeData.workExperiences ||
                                resumeData.workExperiences.length === 0) && (
                                <div className="flex h-full flex-col items-center justify-center py-12 text-center text-gray-400">
                                    <p className="text-sm">
                                        Your resume preview will appear here
                                    </p>
                                    <p className="mt-1 text-xs">
                                        Start filling in the form on the left
                                    </p>
                                </div>
                            )}
                    </div>
                </div>
            </div>
        </div>
    );
}
