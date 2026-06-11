"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  Briefcase,
  BookOpen,
  Clock,
  ArrowRight,
  Flame,
  Target,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getCategoryColor,
  getDifficultyColor,
  daysUntil,
  getCategoryIcon,
} from "@/lib/utils";

interface DashboardStats {
  totalOpportunities: number;
  totalCertifications: number;
  upcomingDeadlines: number;
  unreadNotifications: number;
}

interface RecentOpportunity {
  id: string;
  title: string;
  company: string | null;
  category: string;
  difficulty: string;
  deadline: string | null;
  location: string | null;
  skillsRequired: string[];
  createdAt: string;
}

interface DeadlineItem {
  id: string;
  title: string;
  deadline: string;
  category: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = React.useState<DashboardStats>({
    totalOpportunities: 0,
    totalCertifications: 0,
    upcomingDeadlines: 0,
    unreadNotifications: 0,
  });
  const [recentOpps, setRecentOpps] = React.useState<RecentOpportunity[]>([]);
  const [deadlines, setDeadlines] = React.useState<DeadlineItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  React.useEffect(() => {
    if (status === "authenticated") fetchDashboardData();
  }, [status]);

  const fetchDashboardData = async () => {
    try {
      const [oppRes, certRes, notifRes] = await Promise.all([
        fetch("/api/opportunities?limit=20"),
        fetch("/api/certifications"),
        fetch("/api/notifications"),
      ]);

      if (oppRes.ok) {
        const oppData = await oppRes.json();
        const opps: RecentOpportunity[] = oppData.opportunities || [];
        setRecentOpps(opps.slice(0, 5));

        // Compute deadlines directly from fetched data (not from state)
        const deadlineItems = opps
          .filter((o) => o.deadline)
          .slice(0, 5)
          .map((o) => ({
            id: o.id,
            title: o.title,
            deadline: o.deadline!,
            category: o.category,
          }));
        setDeadlines(deadlineItems);

        const upcomingCount = deadlineItems.filter(
          (d) => {
            const days = daysUntil(d.deadline);
            return days <= 7 && days > 0;
          }
        ).length;

        setStats((prev) => ({
          ...prev,
          totalOpportunities: oppData.pagination?.total || opps.length,
          upcomingDeadlines: upcomingCount,
        }));
      }

      if (certRes.ok) {
        const certData = await certRes.json();
        setStats((prev) => ({
          ...prev,
          totalCertifications: certData.certifications?.length || 0,
        }));
      }

      if (notifRes.ok) {
        const notifData = await notifRes.json();
        const unread = (notifData.notifications || []).filter(
          (n: any) => !n.isRead
        ).length;
        setStats((prev) => ({
          ...prev,
          unreadNotifications: unread,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: "Active Opportunities",
      value: stats.totalOpportunities,
      icon: Briefcase,
      color: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Certifications Tracked",
      value: stats.totalCertifications,
      icon: BookOpen,
      color: "text-purple-600",
      bg: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      label: "Upcoming Deadlines",
      value: stats.upcomingDeadlines,
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-100 dark:bg-orange-900/30",
    },
    {
      label: "Unread Notifications",
      value: stats.unreadNotifications,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-100 dark:bg-green-900/30",
    },
  ];

  if (status === "loading" || loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {session?.user?.name?.split(" ")[0] || "Student"} 👋
          </h1>
          <p className="mt-1 text-slate-500">
            Here&apos;s what&apos;s happening with your career opportunities today.
          </p>
        </div>
        <Button asChild className="hidden sm:flex">
          <Link href="/opportunities">
            Browse Opportunities
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`rounded-xl p-3 ${stat.bg}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Opportunities */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Flame className="h-5 w-5 text-orange-500" />
                Latest Opportunities
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/opportunities">
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentOpps.length > 0 ? (
                <div className="space-y-4">
                  {recentOpps.map((opp) => (
                    <div
                      key={opp.id}
                      className="flex items-start justify-between rounded-lg border border-slate-100 p-4 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {getCategoryIcon(opp.category)}
                          </span>
                          <h3 className="font-semibold">{opp.title}</h3>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          {opp.company || "Unknown"} · {opp.location || "TBD"}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {(opp.skillsRequired || []).slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getCategoryColor(opp.category)}>
                          {opp.category.replace("_", " ")}
                        </Badge>
                        <Badge className={getDifficultyColor(opp.difficulty)}>
                          {opp.difficulty}
                        </Badge>
                        {opp.deadline && (
                          <p className="text-xs text-slate-500">
                            {daysUntil(opp.deadline)} days left
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-slate-500">
                  No opportunities yet. They&apos;ll appear here once scraped.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-orange-500" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deadlines.length > 0 ? (
                <div className="space-y-3">
                  {deadlines.map((item) => {
                    const days = daysUntil(item.deadline);
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-lg border border-slate-100 p-3 dark:border-slate-800"
                      >
                        <div>
                          <p className="text-sm font-medium">{item.title}</p>
                          <Badge
                            className={getCategoryColor(item.category)}
                            variant="secondary"
                          >
                            {item.category.replace("_", " ")}
                          </Badge>
                        </div>
                        <div
                          className={`rounded-lg px-2 py-1 text-xs font-bold ${
                            days <= 7
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {days}d
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-slate-500">
                  No upcoming deadlines.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-blue-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/portfolio">
                  <Zap className="mr-2 h-4 w-4" /> View Portfolio
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/certifications">
                  <BookOpen className="mr-2 h-4 w-4" /> My Certifications
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/goals">
                  <Target className="mr-2 h-4 w-4" /> Career Goals
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/settings">
                  <Zap className="mr-2 h-4 w-4" /> Notification Settings
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
