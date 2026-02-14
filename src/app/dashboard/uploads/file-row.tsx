"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { FileText, Download, Trash2, Wand2, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { deleteFile, recreateResumeFromPdf } from "../actions";

interface FileRowProps {
    file: {
        id: string;
        fileName: string;
        fileSize: number;
        mimeType: string;
        url: string;
        createdAt: Date | null;
    };
    onAnalyze: (fileId: string, fileName: string) => void;
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: Date | null): string {
    if (!date) return "";
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(date);
}

export function FileRow({ file, onAnalyze }: FileRowProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isRecreating, setIsRecreating] = useState(false);

    async function handleDelete() {
        setIsDeleting(true);
        try {
            const result = await deleteFile(file.id);
            if (!result.success) {
                throw new Error(result.error || "Delete failed");
            }
            toast.success("File deleted");
            router.refresh();
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Failed to delete",
            );
            setIsDeleting(false);
        }
    }

    async function handleRecreate() {
        setIsRecreating(true);
        try {
            await recreateResumeFromPdf(file.id);
            // Server action calls redirect() on success — this line won't run
        } catch (err) {
            // Next.js redirect throws a special error; only show toast for real errors
            const message =
                err instanceof Error ? err.message : "Failed to recreate";
            if (!message.includes("NEXT_REDIRECT")) {
                toast.error(message);
            }
            setIsRecreating(false);
        }
    }

    const isBusy = isDeleting || isRecreating;

    return (
        <div className="flex items-center gap-4 px-4 py-3">
            <FileText className="h-8 w-8 shrink-0 text-red-500" />
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.fileName}</p>
                <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.fileSize)}
                    {file.createdAt && ` · ${formatDate(file.createdAt)}`}
                </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
                {/* Recreate as editable resume */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRecreate}
                    disabled={isBusy}
                    title="Recreate as editable resume"
                >
                    {isRecreating ? (
                        <Spinner className="h-4 w-4" />
                    ) : (
                        <Wand2 className="h-4 w-4" />
                    )}
                </Button>

                {/* AI Analysis */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAnalyze(file.id, file.fileName)}
                    disabled={isBusy}
                    title="AI resume analysis"
                >
                    <BarChart3 className="h-4 w-4" />
                </Button>

                {/* Download */}
                <Button variant="ghost" size="sm" asChild disabled={isBusy}>
                    <a href={file.url} download={file.fileName}>
                        <Download className="h-4 w-4" />
                    </a>
                </Button>

                {/* Delete */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isBusy}
                    className="text-destructive hover:text-destructive"
                >
                    {isDeleting ? (
                        <Spinner className="h-4 w-4" />
                    ) : (
                        <Trash2 className="h-4 w-4" />
                    )}
                </Button>
            </div>
        </div>
    );
}
