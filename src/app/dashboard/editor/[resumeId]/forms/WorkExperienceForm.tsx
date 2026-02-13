"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { EditorFormProps } from "@/lib/types";
import { Plus, Trash2, GripVertical } from "lucide-react";

export default function WorkExperienceForm({
    resumeData,
    setResumeData,
}: EditorFormProps) {
    const experiences = resumeData.workExperiences || [];

    function addExperience() {
        setResumeData((prev) => ({
            ...prev,
            workExperiences: [
                ...(prev.workExperiences || []),
                {
                    position: "",
                    company: "",
                    startDate: "",
                    endDate: "",
                    description: "",
                },
            ],
        }));
    }

    function removeExperience(index: number) {
        setResumeData((prev) => ({
            ...prev,
            workExperiences: prev.workExperiences?.filter(
                (_, i) => i !== index,
            ),
        }));
    }

    function updateExperience(
        index: number,
        field: string,
        value: string,
    ) {
        setResumeData((prev) => ({
            ...prev,
            workExperiences: prev.workExperiences?.map((exp, i) =>
                i === index ? { ...exp, [field]: value } : exp,
            ),
        }));
    }

    return (
        <div className="mx-auto max-w-xl space-y-6">
            <div className="space-y-1">
                <h2 className="text-lg font-semibold">Work Experience</h2>
                <p className="text-sm text-muted-foreground">
                    Add your relevant work experience. Start with your most
                    recent position.
                </p>
            </div>

            {experiences.length === 0 && (
                <div className="rounded-lg border border-dashed p-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        No work experience added yet.
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={addExperience}
                    >
                        <Plus className="mr-1.5 h-4 w-4" />
                        Add Experience
                    </Button>
                </div>
            )}

            {experiences.map((exp, index) => (
                <div
                    key={exp.id || index}
                    className="space-y-4 rounded-lg border bg-card p-4"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <GripVertical className="h-4 w-4" />
                            Experience {index + 1}
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => removeExperience(index)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Job Title</Label>
                            <Input
                                value={exp.position || ""}
                                onChange={(e) =>
                                    updateExperience(
                                        index,
                                        "position",
                                        e.target.value,
                                    )
                                }
                                placeholder="Software Engineer"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Company</Label>
                            <Input
                                value={exp.company || ""}
                                onChange={(e) =>
                                    updateExperience(
                                        index,
                                        "company",
                                        e.target.value,
                                    )
                                }
                                placeholder="Acme Inc."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input
                                type="date"
                                value={exp.startDate || ""}
                                onChange={(e) =>
                                    updateExperience(
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
                                value={exp.endDate || ""}
                                onChange={(e) =>
                                    updateExperience(
                                        index,
                                        "endDate",
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            value={exp.description || ""}
                            onChange={(e) =>
                                updateExperience(
                                    index,
                                    "description",
                                    e.target.value,
                                )
                            }
                            placeholder="Describe your responsibilities and achievements..."
                            rows={4}
                        />
                    </div>
                </div>
            ))}

            {experiences.length > 0 && (
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={addExperience}
                >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add Another Experience
                </Button>
            )}
        </div>
    );
}
