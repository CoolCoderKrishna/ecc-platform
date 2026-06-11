"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Zap,
  ArrowRight,
  Bell,
  Search,
  Target,
  Briefcase,
  Trophy,
  CheckCircle2,
  Star,
  Globe,
  Shield,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Search,
    title: "Real-Time Tracking",
    description:
      "Monitor 100+ sources for internships, certifications, hackathons, and competitions. New opportunities detected within minutes.",
    color: "text-blue-600",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    icon: Bell,
    title: "Instant Alerts",
    description:
      "Get notified instantly via Email, Telegram, SMS, WhatsApp, or Push notifications. Never miss a deadline again.",
    color: "text-purple-600",
    bg: "bg-purple-100 dark:bg-purple-900/30",
  },
  {
    icon: Target,
    title: "Smart Matching",
    description:
      "AI-powered matching based on your skills, interests, and career goals. See your match score for every opportunity.",
    color: "text-green-600",
    bg: "bg-green-100 dark:bg-green-900/30",
  },
  {
    icon: Briefcase,
    title: "Portfolio Dashboard",
    description:
      "Track certifications, projects, and achievements. Get personalized recommendations to strengthen your resume.",
    color: "text-orange-600",
    bg: "bg-orange-100 dark:bg-orange-900/30",
  },
  {
    icon: Trophy,
    title: "Career Roadmap",
    description:
      "Set career goals, track milestones, and visualize your path to landing your dream internship.",
    color: "text-yellow-600",
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
  },
  {
    icon: Shield,
    title: "Admin Control",
    description:
      "Full admin dashboard to manage sources, monitor scraping health, and review analytics.",
    color: "text-red-600",
    bg: "bg-red-100 dark:bg-red-900/30",
  },
];

const stats = [
  { value: "Real-Time", label: "Opportunity Tracking" },
  { value: "Multi-Channel", label: "Instant Alerts" },
  { value: "Smart", label: "Skill Matching" },
  { value: "Free", label: "For Students" },
];

const categories = [
  { name: "Internships", icon: "💼", count: "Live" },
  { name: "Certifications", icon: "📜", count: "Live" },
  { name: "Hackathons", icon: "🏆", count: "Live" },
  { name: "Competitions", icon: "🎯", count: "Live" },
  { name: "Open Source", icon: "🌐", count: "Live" },
  { name: "Scholarships", icon: "🎓", count: "Live" },
];

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">
              <span className="text-blue-600">ECC</span>
              <span className="text-slate-400">Hub</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {status === "authenticated" ? (
              <Button asChild>
                <Link href="/dashboard">
                  Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNCAxMHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 text-center lg:py-32">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5">
            <Sparkles className="mr-1 h-3 w-3" />
            Built for CS Engineering Students
          </Badge>
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Never Miss a
            <span className="gradient-text"> Career Opportunity</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-500 dark:text-slate-400">
            Real-time tracking of internships, certifications, hackathons,
            competitions, and open source programs. Get instant alerts and build
            a stronger portfolio with intelligent recommendations.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="xl" asChild className="shadow-lg shadow-blue-500/25">
              <Link href="/register">
                Start Tracking Opportunities
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <Link href="/login">
                Sign In
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-20 grid max-w-3xl grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Track Every Category
            </h2>
            <p className="mt-3 text-slate-500">
              From internships to open source, we cover all CS career
              opportunities.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Card
                key={cat.name}
                className="group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <CardContent className="flex items-center gap-4 p-6">
                  <span className="text-4xl">{cat.icon}</span>
                  <div>
                    <h3 className="font-semibold group-hover:text-blue-600 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {cat.count} opportunities
                    </p>
                  </div>
                  <ArrowRight className="ml-auto h-5 w-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-20 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Everything You Need
            </h2>
            <p className="mt-3 text-slate-500">
              A complete career intelligence platform designed for CS students.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="transition-all hover:shadow-lg"
                >
                  <CardContent className="p-6">
                    <div className={`inline-flex rounded-xl p-3 ${feature.bg}`}>
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
            <p className="mt-3 text-slate-500">
              Get started in 3 simple steps.
            </p>
          </div>
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {[
              {
                step: "1",
                title: "Create Your Profile",
                desc: "Tell us about your skills, interests, and career goals.",
              },
              {
                step: "2",
                title: "Set Your Preferences",
                desc: "Choose which opportunities to track and how to get alerts.",
              },
              {
                step: "3",
                title: "Stay Updated",
                desc: "Receive instant notifications and track your career growth.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-2xl font-bold text-white shadow-lg shadow-blue-500/25">
                  {item.step}
                </div>
                <h3 className="mt-6 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-2xl">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold">
                Ready to Accelerate Your Career?
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-blue-100">
                Join thousands of CS students who are already tracking
                opportunities and building stronger portfolios.
              </p>
              <Button
                size="xl"
                className="mt-8 bg-white text-blue-600 hover:bg-blue-50"
                asChild
              >
                <Link href="/register">
                  Get Started for Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-12 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold">
                <span className="text-blue-600">ECC</span>
                <span className="text-slate-400">Hub</span>
              </span>
            </div>
            <p className="text-sm text-slate-500">
              © 2026 ECC Hub. Built for CS Engineering Students.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
