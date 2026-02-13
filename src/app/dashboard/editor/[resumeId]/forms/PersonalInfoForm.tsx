"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EditorFormProps } from "@/lib/types";

export default function PersonalInfoForm({
    resumeData,
    setResumeData,
}: EditorFormProps) {
    function handleChange(field: string, value: string) {
        setResumeData((prev) => ({ ...prev, [field]: value }));
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
