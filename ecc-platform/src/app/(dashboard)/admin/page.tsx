"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Database,
  Activity,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Play,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatRelativeTime } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface DataSource {
  id: string;
  name: string;
  url: string;
  type: string;
  category: string;
  isActive: boolean;
  lastScraped: string | null;
  lastError: string | null;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState<"overview" | "sources" | "logs">("overview");
  const [sources, setSources] = React.useState<DataSource[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [runningScrape, setRunningScrape] = React.useState(false);
  const [healthStatus, setHealthStatus] = React.useState<{ api: boolean; database: boolean; notifications: boolean } | null>(null);

  React.useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && (session?.user as Record<string, unknown>)?.role !== "ADMIN") router.push("/dashboard");
  }, [status, session, router]);

  const fetchSources = React.useCallback(async () => {
    try {
      const res = await fetch("/api/data-sources");
      if (res.ok) {
        const data = await res.json();
        setSources(data.sources || []);
      }
    } catch (error) {
      console.error("Failed to fetch data sources:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (status === "authenticated" && (session?.user as Record<string, unknown>)?.role === "ADMIN") {
      fetchSources();
    }
  }, [status, session, fetchSources]);

  const checkHealth = async () => {
    try {
      const res = await fetch("/api/health");
      const healthy = res.ok;
      const data = healthy ? await res.json() : null;
      setHealthStatus({
        api: healthy,
        database: data?.database === "connected",
        notifications: !!process.env.NEXT_PUBLIC_APP_URL,
      });
    } catch {
      setHealthStatus({ api: false, database: false, notifications: false });
    }
  };

  React.useEffect(() => {
    if (status === "authenticated" && (session?.user as Record<string, unknown>)?.role === "ADMIN") {
      checkHealth();
    }
  }, [status, session]);


  const runAllScrapers = async () => {
    setRunningScrape(true);
    try {
      const res = await fetch("/api/admin/run-scrapers", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        toast({ title: "Scraping complete", description: `Found ${data.scrapeResults?.newItems || 0} new items.` });
        fetchSources();
      } else {
        toast({ title: "Scraping failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to run scrapers.", variant: "destructive" });
    } finally {
      setRunningScrape(false);
    }
  };

  const toggleSource = async (id: string, isActive: boolean) => {
    try {
      await fetch("/api/data-sources", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive }),
      });
      setSources(sources.map((s) => s.id === id ? { ...s, isActive } : s));
    } catch (error) {
      console.error("Failed to toggle source:", error);
    }
  };

  const stats = [
    { label: "Total Sources", value: sources.length, icon: Database, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
    { label: "Active Sources", value: sources.filter((s) => s.isActive).length, icon: Activity, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
    { label: "Failed Sources", value: sources.filter((s) => s.lastError).length, icon: XCircle, color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30" },
    { label: "Total Scraped", value: sources.filter((s) => s.lastScraped).length, icon: CheckCircle2, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },
  ];

  if (status === "loading" || loading) {
    return (<div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /></div>);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8 text-purple-600" />Admin Dashboard
          </h1>
          <p className="mt-1 text-slate-500">Manage data sources, scraping processes, and system health.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={runAllScrapers} disabled={runningScrape}>
            <RefreshCw className={cn("mr-2 h-4 w-4", runningScrape && "animate-spin")} />
            {runningScrape ? "Running..." : "Run All Scrapers"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm text-slate-500">{stat.label}</p><p className="text-2xl font-bold">{stat.value}</p></div>
                  <div className={cn("rounded-lg p-2", stat.bg)}><Icon className={cn("h-5 w-5", stat.color)} /></div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-950">
        {(["overview", "sources"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={cn("flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors", activeTab === tab ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "text-slate-500 hover:text-slate-900")}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-lg">Sources by Category</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["INTERNSHIP", "CERTIFICATION", "HACKATHON", "COMPETITION", "OPEN_SOURCE", "RESEARCH", "SCHOLARSHIP"].map((cat) => {
                  const count = sources.filter((s) => s.category === cat).length;
                  const active = sources.filter((s) => s.category === cat && s.isActive).length;
                  if (count === 0) return null;
                  return (
                    <div key={cat} className="flex items-center justify-between">
                      <span className="text-sm">{cat.replace("_", " ")}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{count} sources</Badge>
                        <Badge variant={active === count ? "success" : "outline"}>{active} active</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">System Health</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className={cn("flex items-center justify-between rounded-lg p-3", healthStatus?.api ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20")}>
                <div className="flex items-center gap-2">{healthStatus?.api ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}<span className="text-sm">API Server</span></div>
                <Badge variant={healthStatus?.api ? "success" : "destructive"}>{healthStatus?.api ? "Healthy" : "Unhealthy"}</Badge>
              </div>
              <div className={cn("flex items-center justify-between rounded-lg p-3", healthStatus?.database !== false ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20")}>
                <div className="flex items-center gap-2">{healthStatus?.database ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}<span className="text-sm">Database</span></div>
                <Badge variant={healthStatus?.database ? "success" : "destructive"}>{healthStatus?.database ? "Connected" : "Disconnected"}</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-900/20">
                <div className="flex items-center gap-2"><Activity className="h-4 w-4 text-slate-500" /><span className="text-sm">Notification Service</span></div>
                <Badge variant="outline">{sources.filter((s) => s.lastError).length === 0 ? "Operational" : "Check Sources"}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "sources" && (
        <div className="space-y-3">
          {sources.map((source) => (
            <Card key={source.id} className="transition-all hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-4">
                <div className={cn("rounded-lg p-2", source.isActive ? "bg-green-100 dark:bg-green-900/30" : "bg-slate-100 dark:bg-slate-800")}>
                  {source.isActive ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-slate-400" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{source.name}</h3>
                    <Badge variant="secondary">{source.type}</Badge>
                    <Badge variant="outline">{source.category}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{source.url}</p>
                  {source.lastError && <p className="mt-1 text-xs text-red-500">⚠️ {source.lastError}</p>}
                </div>
                <div className="text-right text-sm">
                  {source.lastScraped && <p className="text-xs text-slate-400">Last: {formatRelativeTime(source.lastScraped)}</p>}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleSource(source.id, !source.isActive)}>
                    {source.isActive ? <XCircle className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {sources.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No data sources configured yet.</p>}
        </div>
      )}
    </div>
  );
}
