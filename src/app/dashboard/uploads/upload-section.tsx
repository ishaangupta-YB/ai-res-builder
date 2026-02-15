"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Upload } from "lucide-react";
import { toast } from "sonner";

const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10 MB
 
export function UploadSection() {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStep, setUploadStep] = useState("");
    const [dragOver, setDragOver] = useState(false);

    async function uploadFile(file: File) {
        // Client-side validation: type
        if (file.type !== "application/pdf") {
            toast.error("Please upload a PDF file");
            return;
        }
        // Client-side validation: size
        if (file.size > MAX_PDF_SIZE) {
            toast.error("File too large. Maximum size is 10MB");
            return;
        }

        setIsUploading(true);
        const toastId = "upload-" + Date.now();

        try {
            // Step 1: Get presigned URL from server
            setUploadStep("Preparing upload...");
            toast.loading("Preparing upload...", { id: toastId });

            const urlRes = await fetch("/api/files/upload-url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fileName: file.name,
                    contentType: file.type,
                    fileType: "resume_pdf",
                    fileSize: file.size,
                }),
            });

            const urlData = (await urlRes.json()) as {
                success: boolean;
                uploadUrl?: string;
                fileId?: string;
                r2Key?: string;
                error?: string;
            };

            if (!urlRes.ok || !urlData.success) {
                throw new Error(urlData.error || "Failed to prepare upload");
            }

            // Step 2: Upload directly to R2 via presigned URL
            setUploadStep("Uploading to storage...");
            toast.loading("Uploading to storage...", { id: toastId });

            const uploadRes = await fetch(urlData.uploadUrl!, {
                method: "PUT",
                body: file,
                headers: {
                    "Content-Type": file.type,
                    "Content-Length": String(file.size),
                },
            });

            if (!uploadRes.ok) {
                throw new Error("Failed to upload file to storage");
            }

            // Step 3: Confirm upload and create DB record
            setUploadStep("Verifying upload...");
            toast.loading("Verifying upload...", { id: toastId });

            const confirmRes = await fetch("/api/files/confirm-upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fileId: urlData.fileId,
                    r2Key: urlData.r2Key,
                    fileName: file.name,
                    fileSize: file.size,
                    mimeType: file.type,
                }),
            });

            const confirmData = (await confirmRes.json()) as {
                success: boolean;
                error?: string;
            };

            if (!confirmRes.ok || !confirmData.success) {
                throw new Error(confirmData.error || "Failed to confirm upload");
            }

            toast.success("Resume uploaded successfully", { id: toastId });
            router.refresh();
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Failed to upload",
                { id: toastId },
            );
        } finally {
            setIsUploading(false);
            setUploadStep("");
            if (inputRef.current) inputRef.current.value = "";
        }
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            uploadFile(file);
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
            className={`flex flex-col items-center gap-4 rounded-lg border-2 border-dashed p-8 transition-colors ${dragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25"
                }`}
        >
            {isUploading ? (
                <div className="flex items-center gap-3">
                    <Spinner className="h-5 w-5" />
                    <span className="text-sm text-muted-foreground">
                        {uploadStep || "Uploading..."}
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
