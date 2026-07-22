"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Camera, Mic, FileText, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo, ThemeToggle } from "@/components/layout/theme-toggle";
import { PageTransition } from "@/components/ui/motion";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Questions",
    description: "Dynamic interview questions tailored to your resume and domain",
  },
  {
    icon: Mic,
    title: "Voice Interviews",
    description: "Practice speaking with real-time speech recognition and transcription",
  },
  {
    icon: Camera,
    title: "Camera Monitoring",
    description: "Track eye contact, confidence, and body language during interviews",
  },
  {
    icon: FileText,
    title: "ATS Resume Checker",
    description: "Optimize your resume for applicant tracking systems",
  },
  {
    icon: Shield,
    title: "Detailed Feedback",
    description: "Get comprehensive scores and improvement recommendations",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border/50 glass-strong">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Logo />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button variant="gradient">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <PageTransition>
        <main>
          <section className="container mx-auto px-4 py-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                AI-Powered Interview Preparation
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl mx-auto">
                Ace Your Next Interview with{" "}
                <span className="gradient-text">Intelligent Practice</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
                Simulate real interview experiences with AI-generated questions, voice interaction,
                camera monitoring, and detailed feedback — all in one platform.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button variant="gradient" size="lg" className="gap-2 w-full sm:w-auto">
                    Start Free <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Sign In
                  </Button>
                </Link>
              </div>
            </motion.div>
          </section>

          <section className="container mx-auto px-4 py-16">
            <h2 className="text-2xl font-bold text-center mb-12">Everything you need to prepare</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white mb-4">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </section>
        </main>

        <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
          <p>AI Interviewer Platform — Phase 1: Authentication Complete</p>
        </footer>
      </PageTransition>
    </div>
  );
}
