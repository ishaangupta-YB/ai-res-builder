"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  Briefcase,
  Check,
  ChevronDown,
  FileText,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
// Loader2 imported above
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

// Neobrutalist Button Component
type NeoButtonProps = Omit<React.ComponentProps<typeof Button>, "variant"> & {
  variant?: "primary" | "secondary" | "outline";
};

const NeoButton = ({
  className,
  variant = "primary",
  children,
  ...props
}: NeoButtonProps) => {
  const shadcnVariant = variant === "primary" ? "default" : variant;

  return (
    <Button
      variant={shadcnVariant}
      className={cn(
        "relative border-2 border-foreground font-bold transition-all hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        variant === "primary" &&
        "bg-primary text-primary-foreground shadow-[4px_4px_0px_0px_var(--color-foreground)] hover:shadow-[2px_2px_0px_0px_var(--color-foreground)]",
        variant === "secondary" &&
        "bg-secondary text-secondary-foreground shadow-[4px_4px_0px_0px_var(--color-foreground)] hover:shadow-[2px_2px_0px_0px_var(--color-foreground)]",
        variant === "outline" &&
        "bg-background text-foreground shadow-[4px_4px_0px_0px_var(--color-foreground)] hover:bg-accent hover:shadow-[2px_2px_0px_0px_var(--color-foreground)]",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
};

// Neobrutalist Card Component
const NeoCard = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border-2 border-foreground bg-card text-card-foreground shadow-[6px_6px_0px_0px_var(--color-foreground)] transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_var(--color-foreground)]",
        className
      )}
    >
      {children}
    </div>
  );
};

export default function LandingPage() {
  const { data: session, isPending } = useSession();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <div ref={containerRef} className="min-h-screen bg-background font-sans selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-grid-pattern opacity-[0.03]" />

      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b-2 border-foreground bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative h-10 w-10 overflow-hidden border-2 border-foreground bg-primary shadow-[3px_3px_0px_0px_var(--color-foreground)] transition-transform group-hover:rotate-6">
              <FileText className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-primary-foreground" />
            </div>
            <span className="text-2xl font-black tracking-tighter italic">AI RESUME</span>
          </Link>

          <nav className="flex items-center gap-4">
            <ModeToggle />
            {isPending ? (
              <NeoButton disabled className="min-w-[120px]">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                LOADING
              </NeoButton>
            ) : session ? (
              <Link href="/dashboard">
                <NeoButton>DASHBOARD</NeoButton>
              </Link>
            ) : (
              <Link href="/sign-in">
                <NeoButton>SIGN IN</NeoButton>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 md:pt-32 md:pb-48 overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">

              <motion.h1
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9]"
              >
                BUILD YOUR <br />
                <span className="text-primary relative inline-block">
                  FUTURE
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-foreground" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
                  </svg>
                </span>{" "}
                TODAY
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl border-l-4 border-primary pl-6 text-left md:text-center md:border-l-0 md:pl-0"
              >
                Stop wrestling with Word docs. Our AI-powered builder crafts ATS-friendly resumes that scream "HIRE ME" in seconds.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-6 pt-4"
              >
                <Link href={session ? "/dashboard" : "/sign-in"} className="w-full sm:w-auto">
                  <NeoButton size="lg" className="w-full sm:w-auto text-lg h-14 px-8" disabled={isPending}>
                    {isPending ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> LOADING...</>
                    ) : (
                      <>START BUILDING <ArrowRight className="ml-2 h-5 w-5" /></>
                    )}
                  </NeoButton>
                </Link>
                <div className="flex items-center gap-2 text-sm font-bold">
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-10 w-10 rounded-full border-2 border-foreground bg-muted flex items-center justify-center overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="User" />
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col items-start leading-tight">
                    <span className="flex text-primary">
                      <Star className="h-3 w-3 fill-current" />
                      <Star className="h-3 w-3 fill-current" />
                      <Star className="h-3 w-3 fill-current" />
                      <Star className="h-3 w-3 fill-current" />
                      <Star className="h-3 w-3 fill-current" />
                    </span>
                    <span>LOVED BY 10k+ USERS</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Decorative Elements */}
          <motion.div style={{ y }} className="absolute -z-10 top-1/2 right-[5%] w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
          <motion.div style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]) }} className="absolute -z-10 bottom-0 left-[5%] w-72 h-72 bg-secondary/30 rounded-full blur-3xl" />
        </section>

        {/* Marquee Section */}
        <section className="border-y-2 border-foreground bg-primary py-4 overflow-hidden">
          <div className="flex whitespace-nowrap animate-[marquee_20s_linear_infinite]">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center mx-8 text-primary-foreground font-black text-2xl uppercase italic">
                <Zap className="mr-2 h-6 w-6 fill-current" />
                AI POWERED
                <span className="mx-8 text-4xl">•</span>
                ATS FRIENDLY
                <span className="mx-8 text-4xl">•</span>
                INSTANT PDF
                <span className="mx-8 text-4xl">•</span>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-6 uppercase">
                Why We <span className="text-primary underline decoration-wavy underline-offset-4">Rule</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Features designed to make you look good. Really good.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureItem
                icon={<Briefcase className="h-8 w-8" />}
                title="Smart Targeting"
                description="Our AI analyzes job descriptions to tailor your resume keywords perfectly."
                delay={0.1}
              />
              <FeatureItem
                icon={<Sparkles className="h-8 w-8" />}
                title="AI Writer"
                description="Generate professional summaries and bullet points with a single click."
                delay={0.2}
              />
              <FeatureItem
                icon={<FileText className="h-8 w-8" />}
                title="ATS Proof"
                description="Templates tested against major Applicant Tracking Systems to ensure you get seen."
                delay={0.3}
              />
            </div>
          </div>
        </section>

        {/* How it Works - Accordion Style */}
        <section className="py-24 bg-muted/30 border-t-2 border-foreground">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <div className="sticky top-24">
                <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                  3 STEPS TO <br />
                  <span className="bg-foreground text-background px-2">SUCCESS</span>
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  We've simplified the process so you can focus on preparing for the interview.
                </p>
                <Link href={session ? "/dashboard" : "/sign-in"}>
                  <NeoButton variant="secondary" className="w-full sm:w-auto">
                    BUILD NOW
                  </NeoButton>
                </Link>
              </div>

              <div className="space-y-6">
                <StepCard
                  number="01"
                  title="Import or Start Fresh"
                  description="Upload your old resume or LinkedIn PDF, or start from scratch with our guided wizard."
                />
                <StepCard
                  number="02"
                  title="AI Enhancement"
                  description="Let our AI polish your grammar, suggest stronger action verbs, and optimize for keywords."
                />
                <StepCard
                  number="03"
                  title="Download & Apply"
                  description="Export as a perfectly formatted PDF and start applying to your dream jobs instantly."
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 container mx-auto px-4">
          <div className="relative rounded-3xl border-4 border-foreground bg-foreground text-background p-12 md:p-24 text-center overflow-hidden shadow-[12px_12px_0px_0px_var(--color-primary)]">
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black mb-8 text-background">
                READY TO LEVEL UP?
              </h2>
              <p className="text-xl md:text-2xl text-background/80 mb-12 max-w-2xl mx-auto">
                Join thousands of professionals who have accelerated their careers with AI Resume.
              </p>
              <Link href={session ? "/dashboard" : "/sign-in"}>
                <NeoButton size="lg" className="bg-background text-foreground hover:bg-primary hover:text-primary-foreground border-background text-xl py-8 px-12 h-auto shadow-none hover:shadow-[6px_6px_0px_0px_var(--color-background)]">
                  GET STARTED FREE
                </NeoButton>
              </Link>
            </div>

            {/* Abstract Background Shapes */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
              <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,var(--color-primary)_20px,var(--color-primary)_40px)] animate-[spin_60s_linear_infinite]" />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-foreground bg-background py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link href="/" className="flex items-center gap-2 font-black text-xl">
              <div className="h-8 w-8 bg-primary border-2 border-foreground flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              AI RESUME
            </Link>
            <p className="text-sm font-bold text-muted-foreground">
              © {new Date().getFullYear()} AI Resume Builder.
            </p>
          </div>

          <div className="flex gap-6 font-bold">
            <Link href="#" className="hover:text-primary hover:underline decoration-wavy underline-offset-4">Twitter</Link>
            <Link href="#" className="hover:text-primary hover:underline decoration-wavy underline-offset-4">GitHub</Link>
            <Link href="#" className="hover:text-primary hover:underline decoration-wavy underline-offset-4">Discord</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureItem({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <NeoCard className="h-full p-8 flex flex-col gap-4">
        <div className="h-14 w-14 rounded-full border-2 border-foreground bg-secondary flex items-center justify-center shadow-[3px_3px_0px_0px_var(--color-foreground)] mb-2">
          {icon}
        </div>
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-muted-foreground font-medium leading-relaxed">
          {description}
        </p>
      </NeoCard>
    </motion.div>
  );
}

function StepCard({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="flex gap-6 p-6 rounded-xl border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_var(--color-foreground)]">
      <div className="text-4xl font-black text-primary/50 stroke-foreground">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground font-medium">
          {description}
        </p>
      </div>
    </div>
  )
}
