"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Eye, EyeOff, ChevronDown, GripVertical, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface SectionWrapperProps {
    title: string;
    icon: LucideIcon;
    isVisible: boolean;
    onToggleVisibility: () => void;
    /** Optional count badge (e.g. number of entries) */
    count?: number;
    /** Whether this section can be removed (optional sections) */
    removable?: boolean;
    onRemove?: () => void;
    children: ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Pointer-down handler for the drag handle -- provided by DraggableSectionItem */
    onDragStart?: (e: React.PointerEvent) => void;
    /** Disable drag handle for fixed sections */
    draggable?: boolean;
}

export default function SectionWrapper({
    title,
    icon: Icon,
    isVisible,
    onToggleVisibility,
    count,
    removable,
    onRemove,
    children,
    open,
    onOpenChange,
    onDragStart,
    draggable = true,
}: SectionWrapperProps) {
    return (
        <Collapsible
            open={open}
            onOpenChange={onOpenChange}
            className="w-full min-w-0"
        >
            <div
                className={cn(
                    "w-full min-w-0 overflow-hidden rounded-lg border bg-card transition-colors",
                    !isVisible && "opacity-60",
                )}
            >
                {/* Section Header */}
                <div className="flex min-w-0 items-center gap-1 px-3 py-2.5">
                    {/* Drag handle -- fires drag via useDragControls in parent */}
                    {draggable && (
                        <div
                            className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
                            onPointerDown={onDragStart}
                        >
                            <GripVertical className="h-4 w-4" />
                        </div>
                    )}

                    {/* Expand / collapse trigger */}
                    <CollapsibleTrigger asChild>
                        <button
                            type="button"
                            className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1 text-left text-sm font-medium transition-colors hover:bg-accent"
                        >
                            <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="truncate">{title}</span>
                            {count !== undefined && count > 0 && (
                                <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                                    {count}
                                </span>
                            )}
                            <ChevronDown
                                className={cn(
                                    "ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                                    open && "rotate-180",
                                )}
                            />
                        </button>
                    </CollapsibleTrigger>

                    {/* Visibility toggle */}
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="shrink-0 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleVisibility();
                        }}
                        title={isVisible ? "Hide section" : "Show section"}
                    >
                        {isVisible ? (
                            <Eye className="h-3.5 w-3.5" />
                        ) : (
                            <EyeOff className="h-3.5 w-3.5" />
                        )}
                    </Button>

                    {/* Remove button for optional sections */}
                    {removable && onRemove && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            className="shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove();
                            }}
                            title="Remove section"
                        >
                            <X className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>

                {/* Section Content */}
                <CollapsibleContent className="min-w-0">
                    <div className="w-full min-w-0 max-w-full overflow-x-hidden border-t px-3 py-3">
                        {children}
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    );
}
