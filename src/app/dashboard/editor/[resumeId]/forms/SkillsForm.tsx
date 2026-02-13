"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { EditorFormProps } from "@/lib/types";
import { Plus, X } from "lucide-react";

export default function SkillsForm({
    resumeData,
    setResumeData,
}: EditorFormProps) {
    const [inputValue, setInputValue] = useState("");
    const skills = resumeData.skills || [];

    function addSkill() {
        const trimmed = inputValue.trim();
        if (!trimmed) return;
        if (skills.includes(trimmed)) return;

        setResumeData((prev) => ({
            ...prev,
            skills: [...(prev.skills || []), trimmed],
        }));
        setInputValue("");
    }

    function removeSkill(index: number) {
        setResumeData((prev) => ({
            ...prev,
            skills: prev.skills?.filter((_, i) => i !== index),
        }));
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            e.preventDefault();
            addSkill();
        }
    }

    return (
        <div className="mx-auto max-w-xl space-y-6">
            <div className="space-y-1">
                <h2 className="text-lg font-semibold">Skills</h2>
                <p className="text-sm text-muted-foreground">
                    Add your key skills. Type a skill and press Enter or click
                    Add.
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="skill-input">Add a skill</Label>
                <div className="flex gap-2">
                    <Input
                        id="skill-input"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="e.g. TypeScript, React, Node.js"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={addSkill}
                        disabled={!inputValue.trim()}
                    >
                        <Plus className="mr-1 h-4 w-4" />
                        Add
                    </Button>
                </div>
            </div>

            {skills.length > 0 ? (
                <div className="space-y-2">
                    <Label>
                        Your skills ({skills.length})
                    </Label>
                    <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                            <Badge
                                key={index}
                                variant="secondary"
                                className="gap-1 pr-1 text-sm"
                            >
                                {skill}
                                <button
                                    type="button"
                                    onClick={() => removeSkill(index)}
                                    className="ml-1 rounded-full p-0.5 hover:bg-muted"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="rounded-lg border border-dashed p-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        No skills added yet. Start typing above to add your
                        first skill.
                    </p>
                </div>
            )}
        </div>
    );
}
