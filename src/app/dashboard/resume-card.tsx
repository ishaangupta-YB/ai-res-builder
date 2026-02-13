"use client";

import Link from "next/link";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Edit, MoreVertical, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteResume } from "./actions";
import type { Resume } from "@/lib/types";

interface ResumeCardProps {
    resume: Resume;
}

export function ResumeCard({ resume }: ResumeCardProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    async function handleDelete() {
        setIsDeleting(true);
        try {
            await deleteResume(resume.id);
        } catch {
            setIsDeleting(false);
        }
    }

    return (
        <>
            <Card className="group relative flex flex-col transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <CardTitle className="text-base font-semibold line-clamp-1">
                            {resume.title || "Untitled Resume"}
                        </CardTitle>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link
                                    href={`/dashboard/editor/${resume.id}`}
                                >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setShowDeleteDialog(true)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardHeader>
                <CardContent className="flex-1 pb-2">
                    <div className="text-sm text-muted-foreground">
                        {resume.firstName || resume.lastName ? (
                            <span>
                                {[resume.firstName, resume.lastName]
                                    .filter(Boolean)
                                    .join(" ")}
                            </span>
                        ) : (
                            <span className="italic">No name set</span>
                        )}
                    </div>
                    {resume.jobTitle && (
                        <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
                            {resume.jobTitle}
                        </p>
                    )}
                </CardContent>
                <CardFooter className="pt-2">
                    <div className="flex w-full items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(resume.updatedAt, {
                                addSuffix: true,
                            })}
                        </p>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/editor/${resume.id}`}>
                                Edit
                            </Link>
                        </Button>
                    </div>
                </CardFooter>
            </Card>

            <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete resume?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete &quot;
                            {resume.title || "Untitled Resume"}&quot;. This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
