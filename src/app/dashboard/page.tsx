"use client";

import { Button } from "@/components/ui/button";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function Dashboard() {
    const { data: session, isPending } = useSession();
    const router = useRouter();

    if (isPending) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    if (!session) {
        router.push("/sign-in");
        return null;
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p>Welcome, {session.user.name}</p>
            <Button
                variant="outline"
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
                Sign Out
            </Button>
        </div>
    );
}
