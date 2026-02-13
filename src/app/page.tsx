"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Sparkles,
  User,
  Wand2,
  Share2,
  Download,
  Terminal,
  Code2,
  Cpu,
} from "lucide-react";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";

// Neobrutalist Card Component
const NeoCard = ({ children, className = "", hoverEffect = true }: { children: React.ReactNode; className?: string; hoverEffect?: boolean }) => {
  return (
    <motion.div
      whileHover={hoverEffect ? { scale: 1.02, rotate: 1 } : {}}
      className={`border-4 border-black dark:border-white bg-card text-card-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-6 rounded-none ${className}`}
    >
      {children}
    </motion.div>
  );
};

// Neobrutalist Button Component
const NeoButton = ({ children, variant = "primary", className = "", ...props }: any) => {
  const baseStyles = "relative inline-flex items-center justify-center px-8 py-3 text-lg font-bold uppercase tracking-widest transition-transform active:translate-y-1 active:translate-x-1 active:shadow-none border-4 border-black dark:border-white rounded-none";
  
  const variants = {
    primary: "bg-primary text-primary-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]",
    secondary: "bg-secondary text-secondary-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]",
    outline: "bg-background text-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]",
  };

  return (
    <Button
      className={`${baseStyles} ${variants[variant as keyof typeof variants] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
};

// Marquee Component
const Marquee = ({ items }: { items: string[] }) => {
  return (
    <div className="relative flex overflow-hidden border-y-4 border-black dark:border-white bg-accent py-4">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: [0, -1000] }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
      >
        {[...items, ...items, ...items, ...items].map((item, index) => (
          <span key={index} className="mx-8 text-2xl font-black uppercase tracking-widest text-accent-foreground">
            {item} ★
          </span>
        ))}
      </motion.div>
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-accent to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-accent to-transparent z-10" />
    </div>
  );
};

export default function LandingPage() {
  const { data: session } = useSession();
  const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: scrollRef });
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <div className="min-h-screen bg-background text-foreground font-mono selection:bg-primary selection:text-primary-foreground overflow-x-hidden" ref={scrollRef}>
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-2 bg-primary origin-left z-[100] border-b-2 border-black dark:border-white"
        style={{ scaleX }}
      />

      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b-4 border-black dark:border-white bg-background">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-black text-2xl uppercase tracking-tighter group">
            <div className="bg-primary border-2 border-black dark:border-white p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-transform group-hover:rotate-12">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="decoration-primary decoration-2 underline-offset-4">AI Resume</span>
          </Link>

          <nav className="flex items-center gap-6">
            <ModeToggle />
            {session ? (
              <Link href="/dashboard">
                <NeoButton>Dashboard</NeoButton>
              </Link>
            ) : (
              <Link href="/sign-in">
                <NeoButton variant="secondary">Sign In</NeoButton>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden bg-grid-pattern">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 50, rotate: -5 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="inline-block mb-6"
              >
                <span className="bg-secondary text-secondary-foreground px-6 py-2 text-xl font-bold border-4 border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] transform -rotate-2 inline-flex items-center gap-2">
                  <Sparkles className="w-5 h-5 animate-spin-slow" />
                  NEXT GEN RESUME BUILDER
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
                className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-none"
              >
                CRAFT YOUR <br />
                <span className="text-primary decoration-wavy underline decoration-4 underline-offset-8">FUTURE</span> TODAY.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl md:text-2xl font-bold text-muted-foreground mb-12 max-w-2xl mx-auto bg-background/80 p-4 border-2 border-transparent backdrop-blur-sm"
              >
                Stop wasting hours on formatting. Let AI build you a professional, ATS-friendly resume in seconds. Brutally simple. Extremely effective.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-6"
              >
                <Link href={session ? "/dashboard" : "/sign-in"}>
                  <NeoButton className="text-xl px-10 py-6">
                    Start Building Now <ArrowRight className="ml-2 h-6 w-6" />
                  </NeoButton>
                </Link>
                <Link href="#features">
                  <NeoButton variant="outline" className="text-xl px-10 py-6">
                    See How It Works
                  </NeoButton>
                </Link>
              </motion.div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-1/4 left-10 w-24 h-24 bg-chart-1 border-4 border-black dark:border-white rounded-full opacity-50 animate-bounce-slow hidden md:block" />
          <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-chart-2 border-4 border-black dark:border-white rotate-12 opacity-50 animate-pulse hidden md:block" />
          <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-chart-3 border-4 border-black dark:border-white transform rotate-45 hidden md:block" />
        </section>

        {/* Marquee Section */}
        <Marquee items={["AI Powered", "ATS Friendly", "Instant Export", "Professional Templates", "Smart Analysis", "Get Hired Faster"]} />

        {/* Features Section */}
        <section id="features" className="py-32 bg-background relative border-b-4 border-black dark:border-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-24">
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 uppercase">
                Why Choose Us?
              </h2>
              <div className="w-24 h-4 bg-primary mx-auto border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              <FeatureCard
                icon={<Wand2 className="h-12 w-12" />}
                title="AI Magic"
                description="Our AI writes your bullets, summary, and skills section. It's like having a professional resume writer in your pocket."
                delay={0.1}
              />
              <FeatureCard
                icon={<CheckCircle2 className="h-12 w-12" />}
                title="ATS Optimized"
                description="Beat the bots. Our templates are designed to pass through Applicant Tracking Systems with 100% success rate."
                delay={0.2}
              />
              <FeatureCard
                icon={<Download className="h-12 w-12" />}
                title="Instant PDF"
                description="Export your masterpiece in seconds. No watermarks, no hidden fees, just pure professional PDF goodness."
                delay={0.3}
              />
              <FeatureCard
                icon={<User className="h-12 w-12" />}
                title="Smart Analysis"
                description="Upload your old resume or LinkedIn profile. We'll analyze it and tell you exactly what needs fixing."
                delay={0.4}
              />
              <FeatureCard
                icon={<Share2 className="h-12 w-12" />}
                title="Share & Track"
                description="Get a unique link to share your resume. Track who views it and when. Knowledge is power."
                delay={0.5}
              />
              <FeatureCard
                icon={<Code2 className="h-12 w-12" />}
                title="Developer Ready"
                description="Specialized templates for developers. Highlight your stack, GitHub projects, and technical skills effectively."
                delay={0.6}
              />
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-32 bg-muted/50 border-b-4 border-black dark:border-white overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2">
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-12 uppercase leading-tight">
                  Three Steps to <br />
                  <span className="bg-primary text-primary-foreground px-2">Employment</span>
                </h2>
                
                <div className="space-y-12">
                  <Step number="01" title="Import or Start Fresh" description="Upload your current resume or start from scratch. Our wizard guides you through every section." />
                  <Step number="02" title="AI Optimization" description="Let our AI polish your content, fix grammar, and optimize keywords for your target job." />
                  <Step number="03" title="Download & Apply" description="Choose a template, customize the colors, and download your production-ready resume." />
                </div>
              </div>
              
              <div className="lg:w-1/2 relative">
                <div className="absolute inset-0 bg-primary translate-x-4 translate-y-4 border-4 border-black dark:border-white rounded-none"></div>
                <NeoCard className="relative z-10 bg-background aspect-square flex items-center justify-center p-0 overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)] opacity-20"></div>
                  <Cpu className="w-64 h-64 text-foreground opacity-10 animate-pulse" />
                  <div className="text-center z-20">
                    <h3 className="text-4xl font-black mb-4">READY?</h3>
                    <Link href="/sign-in">
                      <NeoButton size="lg" className="w-full">
                        Let's Go
                      </NeoButton>
                    </Link>
                  </div>
                </NeoCard>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 bg-primary relative overflow-hidden">
           <div className="absolute inset-0 -z-10 opacity-20" style={{ backgroundImage: "radial-gradient(#000 2px, transparent 2px)", backgroundSize: "30px 30px" }}></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-5xl md:text-8xl font-black text-primary-foreground mb-8 uppercase tracking-tighter drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              Don't Be Boring.
            </h2>
            <p className="text-2xl md:text-3xl font-bold text-primary-foreground/90 mb-12 max-w-3xl mx-auto border-4 border-black bg-white/10 backdrop-blur-md p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              Join thousands of job seekers who stopped sending generic resumes and started getting hired.
            </p>
            <Link href={session ? "/dashboard" : "/sign-in"}>
              <button className="bg-background text-foreground text-2xl font-black uppercase px-12 py-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:shadow-none active:translate-x-2 active:translate-y-2">
                Build My Resume Now
              </button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-12 bg-background border-t-4 border-black dark:border-white">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-primary border-2 border-black dark:border-white p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-black text-xl uppercase tracking-widest">AI Resume</span>
          </div>
          
          <div className="flex gap-8 font-bold text-lg uppercase tracking-tight">
            <Link href="#" className="hover:underline decoration-wavy decoration-2 underline-offset-4">Privacy</Link>
            <Link href="#" className="hover:underline decoration-wavy decoration-2 underline-offset-4">Terms</Link>
            <Link href="#" className="hover:underline decoration-wavy decoration-2 underline-offset-4">Contact</Link>
          </div>

          <p className="text-sm font-bold opacity-50">
            © {new Date().getFullYear()} AI Resume Builder.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode; title: string; description: string; delay: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: delay }}
    >
      <NeoCard className="h-full flex flex-col items-start gap-4 hover:bg-accent transition-colors duration-300">
        <div className="bg-primary text-primary-foreground p-3 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] mb-2">
          {icon}
        </div>
        <h3 className="text-2xl font-black uppercase tracking-tight">{title}</h3>
        <p className="text-lg font-medium text-muted-foreground leading-relaxed">{description}</p>
      </NeoCard>
    </motion.div>
  );
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-6 group">
      <span className="text-6xl font-black text-transparent bg-clip-text text-black dark:text-white opacity-20 group-hover:opacity-100 transition-opacity duration-300" style={{ WebkitTextStroke: "2px currentColor" }}>
        {number}
      </span>
      <div>
        <h3 className="text-3xl font-black uppercase mb-2 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-xl font-medium text-muted-foreground border-l-4 border-black dark:border-white pl-4 py-1">
          {description}
        </p>
      </div>
    </div>
  );
}
