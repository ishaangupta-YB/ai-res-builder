"use client";

import { useState, useEffect, useRef } from "react";
import type { ResumeValues } from "@/lib/validation";

export default function useAutoSaveResume(resumeData: ResumeValues) {
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const lastSavedData = useRef<string>(JSON.stringify(resumeData));

    useEffect(() => {
        const currentData = JSON.stringify(resumeData);
        const hasChanges = currentData !== lastSavedData.current;
        setHasUnsavedChanges(hasChanges);

        if (!hasChanges) return;

        const timeout = setTimeout(async () => {
            setIsSaving(true);
            try {
                // TODO: Implement save via server action
                // await saveResume(resumeData);
                await new Promise((resolve) => setTimeout(resolve, 500));
                lastSavedData.current = currentData;
                setHasUnsavedChanges(false);
            } catch (error) {
                console.error("Failed to save resume:", error);
            } finally {
                setIsSaving(false);
            }
        }, 1500);

        return () => clearTimeout(timeout);
    }, [resumeData]);

    return { isSaving, hasUnsavedChanges };
}
