"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
    FileText,
    FileUp,
    LogOut,
    Plus,
    User,
    CreditCard,
    LayoutDashboard,
} from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth-client";
import { createResume } from "@/app/dashboard/actions";
import { cn } from "@/lib/utils";

interface DashboardNavbarProps {
    user: {
        id: string;
        name: string;
        email: string;
        image?: string | null;
    };
}

export function DashboardNavbar({ user }: DashboardNavbarProps) {
    const router = useRouter();
    const pathname = usePathname();

    const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const navLinks = [
        {
            href: "/dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
            active: pathname === "/dashboard",
        },
        {
            href: "/dashboard/uploads",
            label: "Uploads",
            icon: FileUp,
            active: pathname === "/dashboard/uploads",
        },
        {
            href: "/dashboard/billing",
            label: "Billing",
            icon: CreditCard,
            active: pathname === "/dashboard/billing",
        },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center px-2 relative">
                <div className="flex items-center gap-2">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 font-bold text-lg"
                    >
                        <FileText className="h-5 w-5" />
                        <span>AI Resume</span>
                    </Link>
                </div>

                <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden items-center gap-1 md:flex">
                    {navLinks.map((link) => {
                         const Icon = link.icon;
                         return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                    link.active
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>


                <div className="ml-auto flex items-center gap-3">
                    <ModeToggle />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="relative h-9 w-9 rounded-full"
                            >
                                <Avatar className="h-9 w-9">
                                    <AvatarImage
                                        src={user.image || undefined}
                                        alt={user.name}
                                    />
                                    <AvatarFallback>{initials}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <div className="flex items-center gap-2 p-2">
                                <div className="flex flex-col space-y-0.5">
                                    <p className="text-sm font-medium">
                                        {user.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard">
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    Dashboard
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard/profile">
                                    <User className="mr-2 h-4 w-4" />
                                    Profile
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard/uploads">
                                    <FileUp className="mr-2 h-4 w-4" />
                                    Uploads
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard/billing">
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Billing
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="cursor-pointer text-destructive focus:text-destructive"
                                onClick={async () => {
                                    await signOut({
                                        fetchOptions: {
                                            onSuccess: () => {
                                                router.push("/sign-in");
                                            },
                                        },
                                    });
                                }}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
