"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Award,
  Target,
  TrendingUp,
  Plus,
  ExternalLink,
  Star,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  type: string;
  skills: string[];
  url: string | null;
  featured: boolean;
  createdAt: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string | null;
  date: string;
  category: string;
  url: string | null;
}

export default function PortfolioPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState("overview");
  const [portfolioItems, setPortfolioItems] = React.useState<PortfolioItem[]>([]);
  const [achievements, setAchievements] = React.useState<Achievement[]>([]);
  const [certifications, setCertifications] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAddItem, setShowAddItem] = React.useState(false);
  const [newItem, setNewItem] = React.useState({ title: "", description: "", type: "PROJECT", url: "", skills: "" });

  React.useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  React.useEffect(() => {
    if (status === "authenticated") fetchData();
  }, [status]);

  const fetchData = async () => {
    try {
      const [portRes, achRes, certRes] = await Promise.all([
        fetch("/api/portfolio"),
        fetch("/api/achievements"),
        fetch("/api/certifications"),
      ]);
      if (portRes.ok) { const d = await portRes.json(); setPortfolioItems(d.items || []); }
      if (achRes.ok) { const d = await achRes.json(); setAchievements(d.achievements || []); }
      if (certRes.ok) { const d = await certRes.json(); setCertifications(d.certifications || []); }
    } catch (e) { console.error("Failed to fetch portfolio data:", e); }
    finally { setLoading(false); }
  };

  const addItem = async () => {
    if (!newItem.title) { toast({ title: "Error", description: "Title is required.", variant: "destructive" }); return; }
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newItem, skills: newItem.skills.split(",").map((s) => s.trim()).filter(Boolean) }),
      });
      if (res.ok) { toast({ title: "Item added" }); setShowAddItem(false); setNewItem({ title: "", description: "", type: "PROJECT", url: "", skills: "" }); fetchData(); }
    } catch { toast({ title: "Error", description: "Failed to add item.", variant: "destructive" }); }
  };

  const portfolioScore = React.useMemo(() => {
    const projectScore = Math.min(30, portfolioItems.length * 6);
    const certScore = Math.min(25, certifications.length * 8);
    const internScore = portfolioItems.filter((i) => i.type === "INTERNSHIP").length > 0 ? 15 : 0;
    const achScore = Math.min(15, achievements.length * 5);
    const skillScore = Math.min(15, [...new Set(portfolioItems.flatMap((i) => i.skills))].length * 3);
    const total = projectScore + certScore + internScore + achScore + skillScore;
    return {
      overall: total,
      breakdown: {
        projects: projectScore,
        certifications: certScore,
        experience: internScore + skillScore,
        skills: skillScore + (certifications.length > 0 ? 10 : 0),
        achievements: achScore + (portfolioItems.length > 0 ? 10 : 0),
      },
    };
  }, [portfolioItems, certifications, achievements]);

  const recommendations = [
    ...(certifications.length < 3 ? [{ title: "Add more certifications", description: "You have " + certifications.length + " certifications. Consider adding more.", priority: "high", impact: "+8%" }] : []),
    ...(portfolioItems.filter((i) => i.type === "INTERNSHIP").length < 2 ? [{ title: "Gain more work experience", description: "Apply to more internships to strengthen your experience section.", priority: "high", impact: "+12%" }] : []),
    ...(portfolioItems.length < 5 ? [{ title: "Add more projects", description: "Showcase your best 3-5 projects with live demos.", priority: "medium", impact: "+5%" }] : []),
    ...(achievements.length < 3 ? [{ title: "Track your achievements", description: "Add hackathon wins, academic honors, and open source contributions.", priority: "medium", impact: "+3%" }] : []),
  ];

  if (status === "loading" || loading) {
    return (<div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /></div>);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
          <p className="mt-1 text-slate-500">Track your projects, certifications, and career achievements.</p>
        </div>
        <Button onClick={() => setShowAddItem(true)}><Plus className="mr-2 h-4 w-4" />Add Item</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Object.entries(portfolioScore.breakdown).map(([key, value]) => (
          <Card key={key}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium capitalize text-slate-500">{key}</p>
                <span className={cn("text-lg font-bold", value >= 80 ? "text-green-600" : value >= 60 ? "text-yellow-600" : "text-red-600")}>{value}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className={cn("h-full rounded-full transition-all duration-500", value >= 80 ? "bg-green-500" : value >= 60 ? "bg-yellow-500" : "bg-red-500")} style={{ width: `${value}%` }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-950">
        {["overview", "projects", "certifications", "achievements"].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={cn("flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors", activeTab === tab ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "text-slate-500 hover:text-slate-900 dark:hover:text-white")}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><TrendingUp className="h-5 w-5 text-blue-500" />Recommendations to Improve</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendations.length > 0 ? recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg border border-slate-100 p-4 dark:border-slate-800">
                      <div className={cn("mt-0.5 h-2 w-2 shrink-0 rounded-full", rec.priority === "high" ? "bg-red-500" : "bg-yellow-500")} />
                      <div className="flex-1"><h4 className="font-medium">{rec.title}</h4><p className="mt-1 text-sm text-slate-500">{rec.description}</p></div>
                      <Badge variant="success" className="shrink-0">{rec.impact}</Badge>
                    </div>
                  )) : <p className="text-sm text-slate-500">Great job! Keep building your portfolio.</p>}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30"><FileText className="h-5 w-5 text-blue-600" /></div><div><p className="text-2xl font-bold">{portfolioItems.length}</p><p className="text-sm text-slate-500">Projects</p></div></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30"><Award className="h-5 w-5 text-purple-600" /></div><div><p className="text-2xl font-bold">{certifications.length}</p><p className="text-sm text-slate-500">Certifications</p></div></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30"><Star className="h-5 w-5 text-green-600" /></div><div><p className="text-2xl font-bold">{achievements.length}</p><p className="text-sm text-slate-500">Achievements</p></div></div></CardContent></Card>
          </div>
        </div>
      )}

      {activeTab === "projects" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {portfolioItems.map((item) => (
            <Card key={item.id} className="group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <Badge variant="secondary">{item.type}</Badge>
                  {item.featured && <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white"><Star className="mr-1 h-3 w-3" />Featured</Badge>}
                </div>
                <h3 className="mt-3 font-semibold group-hover:text-blue-600 transition-colors">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-500 line-clamp-2">{item.description}</p>
                <div className="mt-3 flex flex-wrap gap-1">{item.skills.map((skill) => <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>)}</div>
                {item.url && <div className="mt-4"><Button variant="outline" size="sm" asChild><a href={item.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-1 h-3 w-3" />View</a></Button></div>}
              </CardContent>
            </Card>
          ))}
          {portfolioItems.length === 0 && <p className="col-span-full py-8 text-center text-sm text-slate-500">No projects yet. Add your first project!</p>}
        </div>
      )}

      {activeTab === "certifications" && (
        <div className="space-y-3">
          {certifications.map((cert: any) => (
            <Card key={cert.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30"><Award className="h-6 w-6 text-purple-600" /></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2"><h3 className="font-semibold">{cert.name}</h3>{cert.verified && <CheckCircle2 className="h-4 w-4 text-green-500" />}</div>
                  <p className="text-sm text-slate-500">{cert.provider}</p>
                  <div className="mt-1 flex flex-wrap gap-1">{(cert.skills || []).map((skill: string) => <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>)}</div>
                </div>
              </CardContent>
            </Card>
          ))}
          {certifications.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No certifications yet.</p>}
        </div>
      )}

      {activeTab === "achievements" && (
        <div className="space-y-3">
          {achievements.map((ach) => (
            <Card key={ach.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/30"><Star className="h-6 w-6 text-green-600" /></div>
                <div className="flex-1">
                  <h3 className="font-semibold">{ach.title}</h3>
                  <p className="text-sm text-slate-500">{ach.description}</p>
                </div>
                <div className="text-right text-sm text-slate-500">
                  <Badge variant="secondary">{ach.category}</Badge>
                  <p className="mt-1">{ach.date}</p>
                </div>
              </CardContent>
            </Card>
          ))}
          {achievements.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No achievements yet.</p>}
        </div>
      )}

      <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Portfolio Item</DialogTitle>
            <DialogDescription>Add a project, internship, or other achievement.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Title" value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} />
            <Textarea placeholder="Description" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
            <Input placeholder="URL (optional)" value={newItem.url} onChange={(e) => setNewItem({ ...newItem, url: e.target.value })} />
            <Input placeholder="Skills (comma-separated)" value={newItem.skills} onChange={(e) => setNewItem({ ...newItem, skills: e.target.value })} />
            <Button onClick={addItem} className="w-full">Add Item</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
