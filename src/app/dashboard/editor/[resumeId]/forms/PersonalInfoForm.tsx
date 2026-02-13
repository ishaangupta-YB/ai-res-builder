"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Camera, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { EditorFormProps } from "@/lib/types";
import type { ResumeValues } from "@/lib/validation";

export default function PersonalInfoForm({
    resumeData,
    setResumeData,
}: EditorFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    function handleChange(field: string, value: string) {
        setResumeData((prev: ResumeValues) => ({ ...prev, [field]: value }));
    }

    async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("fileType", "photo");
            if (resumeData.id) formData.append("resumeId", resumeData.id);

            const res = await fetch("/api/files/upload", {
                method: "POST",
                body: formData,
            });

            const data = (await res.json()) as {
                success: boolean;
                url?: string;
                error?: string;
            };
            if (!res.ok) throw new Error(data.error || "Upload failed");

            setResumeData((prev: ResumeValues) => ({
                ...prev,
                photoUrl: data.url,
            }));
            toast.success("Photo uploaded");
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Failed to upload photo",
            );
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }

    function handlePhotoRemove() {
        setResumeData((prev: ResumeValues) => ({ ...prev, photoUrl: "" }));
    }

    return (
        <div className="mx-auto max-w-xl space-y-6">
            <div className="space-y-1">
                <h2 className="text-lg font-semibold">Personal Information</h2>
                <p className="text-sm text-muted-foreground">
                    Tell us about yourself. This information will appear at the
                    top of your resume.
                </p>
            </div>

            {/* Photo Upload */}
            <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0">
                    {resumeData.photoUrl ? (
                        <img
                            src={resumeData.photoUrl}
                            alt="Profile photo"
                            className="h-20 w-20 rounded-full border object-cover"
                        />
                    ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 bg-muted">
                            <Camera className="h-6 w-6 text-muted-foreground/50" />
                        </div>
                    )}
                    {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                            <Spinner className="h-6 w-6 text-white" />
                        </div>
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        {resumeData.photoUrl ? "Change Photo" : "Upload Photo"}
                    </Button>
                    {resumeData.photoUrl && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handlePhotoRemove}
                            className="text-destructive hover:text-destructive"
                        >
                            <Trash2 className="mr-1 h-3 w-3" />
                            Remove
                        </Button>
                    )}
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handlePhotoUpload}
                />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                        id="firstName"
                        value={resumeData.firstName || ""}
                        onChange={(e) =>
                            handleChange("firstName", e.target.value)
                        }
                        placeholder="John"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                        id="lastName"
                        value={resumeData.lastName || ""}
                        onChange={(e) =>
                            handleChange("lastName", e.target.value)
                        }
                        placeholder="Doe"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                    id="jobTitle"
                    value={resumeData.jobTitle || ""}
                    onChange={(e) => handleChange("jobTitle", e.target.value)}
                    placeholder="Full Stack Developer"
                />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                        id="city"
                        value={resumeData.city || ""}
                        onChange={(e) => handleChange("city", e.target.value)}
                        placeholder="San Francisco"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                        id="country"
                        value={resumeData.country || ""}
                        onChange={(e) =>
                            handleChange("country", e.target.value)
                        }
                        placeholder="United States"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                    id="phone"
                    type="tel"
                    value={resumeData.phone || ""}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={resumeData.email || ""}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="john@example.com"
                />
            </div>
        </div>
    );
}
