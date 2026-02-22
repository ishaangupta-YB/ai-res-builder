"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Brain,
  Briefcase,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  FileText,
  GripVertical,
  Image,
  Layers,
  LayoutDashboard,
  Linkedin,
  MessageSquareText,
  Plus,
  ScanSearch,
  Shield,
  Sparkles,
  Star,
  Upload,
  Zap,
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

// GitHub icon (lucide doesn't have one)
const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

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

// Stats Counter Component
function StatItem({ value, label, delay }: { value: string; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-center gap-2 p-6"
    >
      <span className="text-4xl md:text-5xl font-black text-primary">{value}</span>
      <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
    </motion.div>
  );
}

// FAQ Item Component
function FAQItem({ question, answer, delay }: { question: string; answer: string; delay: number }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-4 p-6 rounded-xl border-2 border-foreground bg-card text-left shadow-[4px_4px_0px_0px_var(--color-foreground)] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_var(--color-foreground)]"
      >
        <span className="text-lg font-bold">{question}</span>
        {isOpen ? <ChevronUp className="h-5 w-5 shrink-0" /> : <ChevronDown className="h-5 w-5 shrink-0" />}
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <p className="px-6 pt-4 pb-2 text-muted-foreground font-medium leading-relaxed">
          {answer}
        </p>
      </motion.div>
    </motion.div>
  );
}

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
                Stop wrestling with Word docs. Our AI-powered builder crafts ATS-friendly resumes that scream &quot;HIRE ME&quot; in seconds.
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
              <div key={`marquee-${i}`} className="flex items-center mx-8 text-primary-foreground font-black text-2xl uppercase italic">
                <Zap className="mr-2 h-6 w-6 fill-current" />
                AI POWERED
                <span className="mx-8 text-4xl">•</span>
                ATS FRIENDLY
                <span className="mx-8 text-4xl">•</span>
                INSTANT PDF
                <span className="mx-8 text-4xl">•</span>
                13 SECTIONS
                <span className="mx-8 text-4xl">•</span>
                DRAG &amp; DROP
                <span className="mx-8 text-4xl">•</span>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-background border-b-2 border-foreground">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatItem value="13+" label="Resume Sections" delay={0} />
              <StatItem value="∞" label="Resumes Created" delay={0.1} />
              <StatItem value="<30s" label="AI Generation" delay={0.2} />
              <StatItem value="100%" label="ATS Compatible" delay={0.3} />
            </div>
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
                Everything you need to build, optimize, and land the job. No fluff.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureItem
                icon={<Brain className="h-8 w-8" />}
                title="AI Resume Recreator"
                description="Upload any existing PDF resume and our AI extracts all data into a fully editable, structured resume instantly."
                delay={0.05}
              />
              <FeatureItem
                icon={<ScanSearch className="h-8 w-8" />}
                title="AI Resume Analyzer"
                description="Get a detailed score and section-by-section review of your resume with actionable improvement suggestions."
                delay={0.1}
              />
              <FeatureItem
                icon={<Sparkles className="h-8 w-8" />}
                title="AI Content Writer"
                description="Generate professional summaries, bullet points, and skill descriptions with a single click using Gemini AI."
                delay={0.15}
              />
              <FeatureItem
                icon={<GripVertical className="h-8 w-8" />}
                title="Drag & Drop Sections"
                description="Reorder your 13 resume sections with intuitive drag-and-drop. Toggle visibility on any section instantly."
                delay={0.2}
              />
              <FeatureItem
                icon={<Eye className="h-8 w-8" />}
                title="Live A4 Preview"
                description="See your resume update in real-time on a pixel-perfect A4 preview panel as you type and edit."
                delay={0.25}
              />
              <FeatureItem
                icon={<Image className="h-8 w-8" />}
                title="Photo Crop & Upload"
                description="Upload a profile photo, crop it with a circular cropper, and embed it directly into your resume."
                delay={0.3}
              />
            </div>
          </div>
        </section>

        {/* Detailed Sections Showcase */}
        <section className="py-24 bg-muted/20 border-y-2 border-foreground">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-6 uppercase">
                Every Section <span className="bg-foreground text-background px-2">Covered</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                13 fully customizable resume sections. Add, remove, reorder, and toggle any of them.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto"
            >
              {[
                { label: "Personal Info", icon: "👤" },
                { label: "Profile Summary", icon: "📝" },
                { label: "Experience", icon: "💼" },
                { label: "Education", icon: "🎓" },
                { label: "Skills", icon: "⚡" },
                { label: "Projects", icon: "🚀" },
                { label: "Awards", icon: "🏆" },
                { label: "Publications", icon: "📄" },
                { label: "Certificates", icon: "📜" },
                { label: "Languages", icon: "🌍" },
                { label: "Courses", icon: "📚" },
                { label: "References", icon: "🤝" },
                { label: "Interests", icon: "🎯" },
              ].map((section, i) => (
                <motion.div
                  key={section.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border-2 border-foreground bg-card font-bold text-sm shadow-[3px_3px_0px_0px_var(--color-foreground)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_var(--color-foreground)] transition-all cursor-default"
                >
                  <span className="text-lg">{section.icon}</span>
                  {section.label}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <div className="sticky top-24">
                <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                  3 STEPS TO <br />
                  <span className="bg-foreground text-background px-2">SUCCESS</span>
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  We&apos;ve simplified the process so you can focus on preparing for the interview.
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
                  description="Upload your existing PDF resume for AI recreation, or start from scratch with our guided editor. Sign in with Google to get started in seconds."
                />
                <StepCard
                  number="02"
                  title="AI Enhancement"
                  description="Let our Gemini-powered AI polish your content, generate professional summaries, suggest stronger action verbs, and optimize for ATS keywords. Drag and drop sections to perfect your layout."
                />
                <StepCard
                  number="03"
                  title="Download & Apply"
                  description="Export as a perfectly formatted A4 PDF with one click. Your resume is ATS-tested and ready to land interviews instantly."
                />
              </div>
            </div>
          </div>
        </section>

        {/* AI Features Deep-dive */}
        <section className="py-24 bg-muted/30 border-t-2 border-foreground">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-6 uppercase">
                AI That <span className="text-primary underline decoration-wavy underline-offset-4">Actually Works</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Fast, reliable, and smart.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <NeoCard className="h-full p-0">
                  <div className="bg-primary p-6 border-b-2 border-foreground">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full border-2 border-foreground bg-primary-foreground flex items-center justify-center shadow-[3px_3px_0px_0px_var(--color-foreground)]">
                        <Upload className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-primary-foreground">RECREATE</h3>
                        <p className="text-sm font-bold text-primary-foreground/80">PDF → Editable Resume</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    {[
                      "Upload any existing PDF resume",
                      "AI extracts all structured data",
                      "Creates fully editable resume",
                      "Preserves all sections & formatting",
                      "Redirects straight to the editor",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full border-2 border-foreground bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="h-3 w-3 text-secondary-foreground" />
                        </div>
                        <span className="font-medium text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </NeoCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <NeoCard className="h-full p-0">
                  <div className="bg-secondary p-6 border-b-2 border-foreground">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full border-2 border-foreground bg-secondary-foreground flex items-center justify-center shadow-[3px_3px_0px_0px_var(--color-foreground)]">
                        <ScanSearch className="h-6 w-6 text-secondary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-secondary-foreground">ANALYZE</h3>
                        <p className="text-sm font-bold text-secondary-foreground/80">Score & Improve</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    {[
                      "Upload your resume PDF for review",
                      "Get a detailed overall score",
                      "Section-by-section breakdown",
                      "Actionable improvement tips",
                      "Results cached — no redundant calls",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full border-2 border-foreground bg-primary flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                        <span className="font-medium text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </NeoCard>
              </motion.div>
            </div>
          </div>
        </section>


        {/* FAQ Section */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-6 uppercase">
                Got <span className="text-primary underline decoration-wavy underline-offset-4">Questions?</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                We&apos;ve got answers. No BS.
              </p>
            </div>

            <div className="space-y-4">
              <FAQItem
                question="Is this really free?"
                answer="Yes! You can create, edit, and export resumes for free. Sign in with your Google account and start building immediately — no credit card required."
                delay={0.05}
              />
              <FAQItem
                question="How does the AI resume recreator work?"
                answer="Upload any existing PDF resume to our uploads page. Our Gemini AI reads and extracts all structured data — work experience, education, skills, and more — then creates a fully editable resume you can customize in our drag-and-drop editor."
                delay={0.1}
              />
              <FAQItem
                question="What resume sections are supported?"
                answer="We support 13 sections: Personal Info, Profile Summary, Experience, Education, Skills, Projects, Awards, Publications, Certificates, Languages, Courses, References, and Interests. Each can be reordered, toggled visible/hidden, or removed entirely."
                delay={0.15}
              />
              <FAQItem
                question="Are the exported PDFs ATS-friendly?"
                answer="Absolutely. Our resume templates are tested against major Applicant Tracking Systems. The exported A4 PDFs use clean formatting that ATS software can parse correctly, ensuring your application gets seen by recruiters."
                delay={0.2}
              />
              <FAQItem
                question="Can I upload a profile photo?"
                answer="Yes! Upload any image, crop it with our built-in circular cropper, and it'll be embedded directly in your resume. Photos are stored securely on Cloudflare R2."
                delay={0.25}
              />
              <FAQItem
                question="What AI model powers this?"
                answer="We use Google Gemini Flash through Cloudflare AI Gateway via the Vercel AI SDK. This gives you fast, reliable AI generation for content writing, resume recreation, and analysis features."
                delay={0.3}
              />
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
                Join thousands of professionals who have accelerated their careers with AI Resume. Build your first resume in under 2 minutes.
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
              © {new Date().getFullYear()} AI Resume Builder. Built by Ishaan Gupta.
            </p>
          </div>

          <div className="flex items-center gap-5">
            <a
              href="https://www.linkedin.com/in/ishaangupta1201"
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 w-10 rounded-lg border-2 border-foreground bg-card flex items-center justify-center shadow-[3px_3px_0px_0px_var(--color-foreground)] hover:shadow-[1px_1px_0px_0px_var(--color-foreground)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all hover:bg-primary hover:text-primary-foreground"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="https://github.com/ishaangupta-YB"
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 w-10 rounded-lg border-2 border-foreground bg-card flex items-center justify-center shadow-[3px_3px_0px_0px_var(--color-foreground)] hover:shadow-[1px_1px_0px_0px_var(--color-foreground)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all hover:bg-primary hover:text-primary-foreground"
              aria-label="GitHub"
            >
              <GithubIcon className="h-5 w-5" />
            </a>
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
