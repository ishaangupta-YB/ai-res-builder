"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Sparkles,
  User,
  Wand2,
  Share2,
  Download,
} from "lucide-react";

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="bg-primary text-primary-foreground p-1 rounded-md">
              <FileText className="h-5 w-5" />
            </div>
            <span>AI Resume</span>
          </Link>

          <nav className="flex items-center gap-4">
            <ModeToggle />
            {session ? (
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <Link href="/sign-in">
                <Button>Sign In</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
          
          <div className="container mx-auto px-4 md:px-6 text-center">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-6">
              <Sparkles className="mr-2 h-3 w-3" />
              Powered by Advanced AI
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight lg:text-7xl mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Craft Your Perfect Resume <br className="hidden md:block" />
              in Minutes, Not Hours.
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground text-lg md:text-xl mb-8">
              Let our AI analyze your profile and generate professional, ATS-friendly resumes tailored to your dream job description.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={session ? "/dashboard" : "/sign-in"}>
                <Button size="lg" className="h-12 px-8 text-base group">
                  Get Started for Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                View Examples
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
                Everything you need to get hired
              </h2>
              <p className="text-muted-foreground text-lg max-w-[600px] mx-auto">
                Our platform provides powerful tools to help you stand out from the competition.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={<Wand2 className="h-10 w-10 text-primary" />}
                title="AI Content Generation"
                description="Stuck on what to write? Our AI suggests professional bullet points and summaries tailored to your role."
              />
              <FeatureCard
                icon={<CheckCircle2 className="h-10 w-10 text-primary" />}
                title="ATS Optimization"
                description="Ensure your resume gets past applicant tracking systems with our optimized formatting and keyword suggestions."
              />
              <FeatureCard
                icon={<Download className="h-10 w-10 text-primary" />}
                title="Instant PDF Export"
                description="Download your polished resume in standard PDF format, ready to be sent to recruiters immediately."
              />
              <FeatureCard
                icon={<User className="h-10 w-10 text-primary" />}
                title="Smart Profile Analysis"
                description="Import your LinkedIn profile or existing resume and let us restructure it for maximum impact."
              />
              <FeatureCard
                icon={<Share2 className="h-10 w-10 text-primary" />}
                title="Easy Sharing"
                description="Create a unique link to your resume to share directly with hiring managers or on social media."
              />
              <FeatureCard
                icon={<Sparkles className="h-10 w-10 text-primary" />}
                title="Cover Letter Builder"
                description="Generate matching cover letters that perfectly complement your resume and the job description."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="bg-primary text-primary-foreground rounded-3xl p-8 md:p-12 lg:p-16 text-center relative overflow-hidden">
              <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
                  Ready to boost your career?
                </h2>
                <p className="text-primary-foreground/80 text-lg mb-8">
                  Join thousands of job seekers who have successfully landed interviews using our AI resume builder.
                </p>
                <Link href={session ? "/dashboard" : "/sign-in"}>
                  <Button size="lg" variant="secondary" className="h-12 px-8 text-base">
                    Build My Resume Now
                  </Button>
                </Link>
              </div>
              {/* Decorative circles */}
              <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1 rounded-md">
              <FileText className="h-4 w-4" />
            </div>
            <span className="font-semibold text-lg">AI Resume</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AI Resume Builder. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="border-none shadow-sm bg-background/60 backdrop-blur hover:bg-background/80 transition-colors">
      <CardHeader>
        <div className="mb-4">{icon}</div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
