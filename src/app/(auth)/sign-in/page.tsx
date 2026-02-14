"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { FileText, Loader2, ArrowRight, Sparkles, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function SignIn() {
    const [loading, setLoading] = useState(false);

    return (
        <div className="flex min-h-screen w-full bg-background font-sans overflow-hidden">
            {/* Background grid pattern */}
            <div className="fixed inset-0 z-0 pointer-events-none bg-grid-pattern opacity-[0.03]" />

            {/* Left Panel — Branding (hidden on mobile) */}
            <div className="relative hidden w-1/2 overflow-hidden border-r-2 border-foreground bg-foreground text-background md:flex md:flex-col md:items-center md:justify-center">
                {/* Animated diagonal stripes background */}
                <div className="absolute inset-0 opacity-[0.06]">
                    <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,var(--color-primary)_20px,var(--color-primary)_40px)] animate-[spin_60s_linear_infinite]" />
                </div>

                {/* Floating decorative shapes */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[15%] left-[10%] h-20 w-20 border-4 border-primary/40"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[20%] right-[15%] h-16 w-16 rounded-full border-4 border-primary/30"
                />
                <motion.div
                    animate={{ y: [-10, 10, -10] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[60%] left-[20%] h-12 w-12 bg-primary/20 rotate-45"
                />

                <div className="relative z-10 max-w-md px-8 text-center">
                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-10 flex flex-col items-center"
                    >
                        <div className="mb-6 h-20 w-20 border-4 border-background bg-primary shadow-[6px_6px_0px_0px_var(--color-background)] flex items-center justify-center">
                            <FileText className="h-10 w-10 text-primary-foreground" />
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter italic text-background">
                            AI RESUME
                        </h1>
                        <p className="mt-3 text-lg font-bold text-background/70">
                            Build your future, today.
                        </p>
                    </motion.div>

                    {/* Feature pills */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex flex-col gap-4"
                    >
                        {[
                            { icon: Sparkles, text: "AI-powered content suggestions" },
                            { icon: Shield, text: "ATS-friendly templates" },
                            { icon: Zap, text: "Export to PDF in seconds" },
                        ].map(({ icon: Icon, text }, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 rounded-none border-2 border-background/20 bg-background/5 px-5 py-3 text-left backdrop-blur-sm"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-primary bg-primary/20">
                                    <Icon className="h-5 w-5 text-primary" />
                                </div>
                                <span className="text-sm font-bold text-background/90">
                                    {text}
                                </span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Right Panel — Sign In Form */}
            <div className="relative flex w-full flex-col items-center justify-center px-6 py-12 md:w-1/2 md:px-12">
                {/* Mobile logo (hidden on desktop) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 flex flex-col items-center md:hidden"
                >
                    <div className="mb-4 h-16 w-16 border-2 border-foreground bg-primary shadow-[4px_4px_0px_0px_var(--color-foreground)] flex items-center justify-center">
                        <FileText className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter italic">
                        AI RESUME
                    </h1>
                </motion.div>

                {/* Sign in card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="w-full max-w-sm"
                >
                    <div className="border-2 border-foreground bg-card p-8 shadow-[8px_8px_0px_0px_var(--color-foreground)]">
                        <div className="mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tight">
                                Welcome Back
                            </h2>
                            <p className="mt-2 text-sm font-medium text-muted-foreground">
                                Sign in to start building killer resumes
                            </p>
                        </div>

                        <Button
                            variant="outline"
                            className={cn(
                                "w-full gap-3 border-2 border-foreground py-6 text-base font-bold",
                                "shadow-[4px_4px_0px_0px_var(--color-foreground)]",
                                "transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--color-foreground)]",
                                "active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
                                "cursor-pointer"
                            )}
                            disabled={loading}
                            onClick={async () => {
                                await signIn.social({
                                    provider: "google",
                                    callbackURL: "/dashboard",
                                    fetchOptions: {
                                        onRequest: () => {
                                            setLoading(true);
                                        },
                                        onResponse: () => {
                                            setLoading(false);
                                        },
                                    },
                                });
                            }}
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 256 262"
                                >
                                    <path
                                        fill="#4285F4"
                                        d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
                                    />
                                    <path
                                        fill="#EB4335"
                                        d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                                    />
                                </svg>
                            )}
                            {loading ? "Signing in…" : "Continue with Google"}
                        </Button>

                        <div className="mt-6 text-center">
                            <p className="text-xs text-muted-foreground">
                                By signing in, you agree to our{" "}
                                <span className="font-bold underline decoration-wavy underline-offset-2 cursor-pointer hover:text-primary">
                                    Terms of Service
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Back to home link */}
                    <div className="mt-6 text-center">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-primary"
                        >
                            <ArrowRight className="h-4 w-4 rotate-180" />
                            Back to home
                        </Link>
                    </div>
                </motion.div>

                {/* Mobile feature badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-10 flex flex-wrap justify-center gap-3 md:hidden"
                >
                    {["AI Powered", "ATS Proof", "Instant PDF"].map((text) => (
                        <span
                            key={text}
                            className="border-2 border-foreground bg-primary/10 px-3 py-1.5 text-xs font-black uppercase"
                        >
                            {text}
                        </span>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
