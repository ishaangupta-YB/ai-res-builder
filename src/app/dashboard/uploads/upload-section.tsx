"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Upload } from "lucide-react";
import { toast } from "sonner";

export function UploadSection() {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    async function uploadFile(file: File) {
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("fileType", "resume_pdf");

            const res = await fetch("/api/files/upload", {
                method: "POST",
                body: formData,
            });

            const data = (await res.json()) as {
                success: boolean;
                error?: string;
            };
            if (!res.ok) throw new Error(data.error || "Upload failed");

            toast.success("Resume uploaded successfully");
            router.refresh();
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Failed to upload",
            );
        } finally {
            setIsUploading(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type === "application/pdf") {
            uploadFile(file);
        } else {
            toast.error("Please upload a PDF file");
        }
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) uploadFile(file);
    }

    return (
        <div
            onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center gap-4 rounded-lg border-2 border-dashed p-8 transition-colors ${
                dragOver
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25"
            }`}
        >
            {isUploading ? (
                <div className="flex items-center gap-3">
                    <Spinner className="h-5 w-5" />
                    <span className="text-sm text-muted-foreground">
                        Uploading...
                    </span>
                </div>
            ) : (
                <>
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <div className="text-center">
                        <p className="text-sm font-medium">
                            Drag and drop a PDF here, or click to browse
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            PDF files up to 10MB
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => inputRef.current?.click()}
                    >
                        Browse Files
                    </Button>
                </>
            )}
            <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
            />
        </div>
    );
}
