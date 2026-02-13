"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import type { EditorFormProps } from "@/lib/types";
import type { ReactNode } from "react";

const PERSONAL_FIELDS = [
    { key: "firstName", label: "First Name", type: "text" },
    { key: "lastName", label: "Last Name", type: "text" },
] as const;

const CONTACT_FIELDS = [
    { key: "jobTitle", label: "Designation", type: "text" },
    { key: "phone", label: "Phone Number", type: "text" },
    { key: "city", label: "City", type: "text" },
    { key: "country", label: "Country", type: "text" },
    { key: "email", label: "Email", type: "email" },
] as const;

const LINK_FIELDS = [
    { key: "linkedin", label: "LinkedIn", type: "url" },
    { key: "website", label: "Website", type: "url" },
] as const;

const LINK_PLACEHOLDER_LABELS = {
    linkedin: "LinkedIn",
    website: "Website",
} as const;

const LINK_LABEL_MODE_KEYS = {
    linkedin: "linkLabelMode.linkedin",
    website: "linkLabelMode.website",
} as const;

type LinkFieldKey = (typeof LINK_FIELDS)[number]["key"];

function FieldRow({
    fieldKey,
    label,
    type,
    value,
    isVisible,
    onValueChange,
    onVisibilityToggle,
    children,
}: {
    fieldKey: string;
    label: string;
    type: string;
    value: string | undefined;
    isVisible: boolean;
    onValueChange: (v: string) => void;
    onVisibilityToggle: () => void;
    children?: ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
                <Label htmlFor={fieldKey} className="text-sm font-medium">
                    {label}
                </Label>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="h-5 w-5 shrink-0 text-muted-foreground hover:text-foreground"
                    onClick={onVisibilityToggle}
                    title={isVisible ? "Hide in preview" : "Show in preview"}
                >
                    {isVisible ? (
                        <Eye className="h-3 w-3" />
                    ) : (
                        <EyeOff className="h-3 w-3" />
                    )}
                </Button>
            </div>
            <Input
                id={fieldKey}
                type={type}
                value={value ?? ""}
                onChange={(e) => onValueChange(e.target.value)}
                placeholder={label}
            />
            {children}
        </div>
    );
}

export default function PersonalInfoSection({
    resumeData,
    setResumeData,
}: EditorFormProps) {
    const fieldVisibility = resumeData.fieldVisibility ?? {};

    function updateField(key: keyof typeof resumeData, value: string) {
        setResumeData((prev) => ({
            ...prev,
            [key]: value || undefined,
        }));
    }

    function toggleVisibility(fieldName: string) {
        setResumeData((prev) => ({
            ...prev,
            fieldVisibility: {
                ...(prev.fieldVisibility ?? {}),
                [fieldName]: (prev.fieldVisibility?.[fieldName] ?? true)
                    ? false
                    : true,
            },
        }));
    }

    function isVisible(fieldName: string) {
        return fieldVisibility[fieldName] !== false;
    }

    function usesPlaceholderLabel(fieldName: LinkFieldKey) {
        return fieldVisibility[LINK_LABEL_MODE_KEYS[fieldName]] === true;
    }

    function setLinkDisplayMode(fieldName: LinkFieldKey, usePlaceholder: boolean) {
        setResumeData((prev) => ({
            ...prev,
            fieldVisibility: {
                ...(prev.fieldVisibility ?? {}),
                [LINK_LABEL_MODE_KEYS[fieldName]]: usePlaceholder,
            },
        }));
    }

    return (
        <div className="space-y-6">
            {/* Name fields */}
            <div className="grid gap-4">
                {PERSONAL_FIELDS.map(({ key, label, type }) => (
                    <FieldRow
                        key={key}
                        fieldKey={key}
                        label={label}
                        type={type}
                        value={resumeData[key] as string | undefined}
                        isVisible={isVisible(key)}
                        onValueChange={(v) => updateField(key, v)}
                        onVisibilityToggle={() => toggleVisibility(key)}
                    />
                ))}
            </div>

            {/* Contact fields */}
            <div className="grid gap-4">
                {CONTACT_FIELDS.map(({ key, label, type }) => (
                    <FieldRow
                        key={key}
                        fieldKey={key}
                        label={label}
                        type={type}
                        value={resumeData[key] as string | undefined}
                        isVisible={isVisible(key)}
                        onValueChange={(v) => updateField(key, v)}
                        onVisibilityToggle={() => toggleVisibility(key)}
                    />
                ))}
            </div>

            {/* Link fields */}
            <div className="grid gap-4">
                {LINK_FIELDS.map(({ key, label, type }) => (
                    <FieldRow
                        key={key}
                        fieldKey={key}
                        label={label}
                        type={type}
                        value={resumeData[key] as string | undefined}
                        isVisible={isVisible(key)}
                        onValueChange={(v) => updateField(key, v)}
                        onVisibilityToggle={() => toggleVisibility(key)}
                    >
                        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs text-muted-foreground">
                                Display in resume
                            </span>
                            <div className="inline-flex rounded-md border bg-muted/20 p-0.5">
                                <Button
                                    type="button"
                                    size="xs"
                                    variant={
                                        usesPlaceholderLabel(key)
                                            ? "ghost"
                                            : "secondary"
                                    }
                                    className="h-7"
                                    onClick={() =>
                                        setLinkDisplayMode(key, false)
                                    }
                                >
                                    Full URL
                                </Button>
                                <Button
                                    type="button"
                                    size="xs"
                                    variant={
                                        usesPlaceholderLabel(key)
                                            ? "secondary"
                                            : "ghost"
                                    }
                                    className="h-7"
                                    onClick={() =>
                                        setLinkDisplayMode(key, true)
                                    }
                                >
                                    Label
                                </Button>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {usesPlaceholderLabel(key)
                                ? `Shows icon + "${LINK_PLACEHOLDER_LABELS[key]}"`
                                : "Shows icon + full URL"}
                        </p>
                    </FieldRow>
                ))}
            </div>
        </div>
    );
}
