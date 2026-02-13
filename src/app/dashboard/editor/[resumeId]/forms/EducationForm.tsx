"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EditorFormProps } from "@/lib/types";
import { Plus, Trash2, GripVertical } from "lucide-react";

export default function EducationForm({
    resumeData,
    setResumeData,
}: EditorFormProps) {
    const educations = resumeData.educations || [];

    function addEducation() {
        setResumeData((prev) => ({
            ...prev,
            educations: [
                ...(prev.educations || []),
                {
                    degree: "",
                    school: "",
                    startDate: "",
                    endDate: "",
                },
            ],
        }));
    }

    function removeEducation(index: number) {
        setResumeData((prev) => ({
            ...prev,
            educations: prev.educations?.filter((_, i) => i !== index),
        }));
    }

    function updateEducation(index: number, field: string, value: string) {
        setResumeData((prev) => ({
            ...prev,
            educations: prev.educations?.map((edu, i) =>
                i === index ? { ...edu, [field]: value } : edu,
            ),
        }));
    }

    return (
        <div className="mx-auto max-w-xl space-y-6">
            <div className="space-y-1">
                <h2 className="text-lg font-semibold">Education</h2>
                <p className="text-sm text-muted-foreground">
                    Add your educational background. Include degrees,
                    certifications, and relevant coursework.
                </p>
            </div>

            {educations.length === 0 && (
                <div className="rounded-lg border border-dashed p-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        No education added yet.
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={addEducation}
                    >
                        <Plus className="mr-1.5 h-4 w-4" />
                        Add Education
                    </Button>
                </div>
            )}

            {educations.map((edu, index) => (
                <div
                    key={edu.id || index}
                    className="space-y-4 rounded-lg border bg-card p-4"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <GripVertical className="h-4 w-4" />
                            Education {index + 1}
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => removeEducation(index)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Degree</Label>
                            <Input
                                value={edu.degree || ""}
                                onChange={(e) =>
                                    updateEducation(
                                        index,
                                        "degree",
                                        e.target.value,
                                    )
                                }
                                placeholder="Bachelor of Science"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>School</Label>
                            <Input
                                value={edu.school || ""}
                                onChange={(e) =>
                                    updateEducation(
                                        index,
                                        "school",
                                        e.target.value,
                                    )
                                }
                                placeholder="MIT"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input
                                type="date"
                                value={edu.startDate || ""}
                                onChange={(e) =>
                                    updateEducation(
                                        index,
                                        "startDate",
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>End Date</Label>
                            <Input
                                type="date"
                                value={edu.endDate || ""}
                                onChange={(e) =>
                                    updateEducation(
                                        index,
                                        "endDate",
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                    </div>
                </div>
            ))}

            {educations.length > 0 && (
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={addEducation}
                >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add Another Education
                </Button>
            )}
        </div>
    );
}
