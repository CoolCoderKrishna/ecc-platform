"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Award, BookOpen, CheckCircle2, Clock, ExternalLink, Plus, Search, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn, formatDate, daysUntil } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";


interface Cert {
  id: string;
  name: string;
  provider: string;
  url?: string | null;
  completedAt: string | null;
  expiresAt: string | null;
  skills: string[];
  verified: boolean;
}

export default function CertificationsPage() {
  const { status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [search, setSearch] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<"my" | "recommended">("my");
  const [certs, setCerts] = React.useState<Cert[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAdd, setShowAdd] = React.useState(false);
  const [newCert, setNewCert] = React.useState({ name: "", provider: "", url: "", skills: [] as string[] });

  React.useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const fetchCerts = React.useCallback(async () => {
    try {
      const res = await fetch("/api/certifications");
      if (res.ok) {
        const data = await res.json();
        setCerts(data.certifications || []);
      }
    } catch (error) {
      console.error("Failed to fetch certifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (status === "authenticated") fetchCerts();
  }, [status, fetchCerts]);

  const addCert = async () => {
    if (!newCert.name || !newCert.provider) {
      toast({ title: "Error", description: "Name and provider are required.", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch("/api/certifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newCert, completedAt: new Date().toISOString() }),
      });
      if (res.ok) {
        toast({ title: "Certification added", description: "Your certification has been saved." });
        setShowAdd(false);
        setNewCert({ name: "", provider: "", url: "", skills: [] });
        fetchCerts();
      }
    } catch {
      toast({ title: "Error", description: "Failed to add certification.", variant: "destructive" });
    }
  };

  const deleteCert = async (id: string) => {
    try {
      await fetch(`/api/certifications?id=${id}`, { method: "DELETE" });
      setCerts(certs.filter((c) => c.id !== id));
      toast({ title: "Deleted", description: "Certification removed." });
    } catch {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  const filteredCerts = certs.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.provider.toLowerCase().includes(search.toLowerCase())
  );

  const recommendedCerts = [
    { name: "AWS Developer Associate", provider: "Amazon", reason: "Complements your Solutions Architect cert", difficulty: "Medium", estimatedTime: "3 months", skills: ["AWS", "CI/CD", "DynamoDB"] },
    { name: "Google Cloud Professional Cloud Architect", provider: "Google", reason: "Diversifies your cloud certifications", difficulty: "Hard", estimatedTime: "4 months", skills: ["GCP", "Cloud Architecture", "Kubernetes"] },
    { name: "Certified Kubernetes Administrator", provider: "CNCF", reason: "Essential for DevOps and cloud-native roles", difficulty: "Hard", estimatedTime: "3 months", skills: ["Kubernetes", "Docker", "Linux"] },
    { name: "Deep Learning Specialization", provider: "Stanford / Coursera", reason: "Advances your ML knowledge for AI roles", difficulty: "Medium", estimatedTime: "3 months", skills: ["Deep Learning", "Neural Networks"] },
  ];

  if (status === "loading" || loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Certifications</h1>
          <p className="mt-1 text-slate-500">Track completed certifications and discover new ones.</p>
        </div>
        <Button onClick={() => setShowAdd(true)}><Plus className="mr-2 h-4 w-4" />Add Certification</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30"><Award className="h-5 w-5 text-purple-600" /></div><div><p className="text-2xl font-bold">{certs.length}</p><p className="text-sm text-slate-500">Completed</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30"><Clock className="h-5 w-5 text-orange-600" /></div><div><p className="text-2xl font-bold">{certs.filter((c) => c.expiresAt && daysUntil(c.expiresAt) < 365).length}</p><p className="text-sm text-slate-500">Expiring Soon</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30"><BookOpen className="h-5 w-5 text-blue-600" /></div><div><p className="text-2xl font-bold">{recommendedCerts.length}</p><p className="text-sm text-slate-500">Recommended</p></div></CardContent></Card>
      </div>

      <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-950">
        {(["my", "recommended"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={cn("flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors", activeTab === tab ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "text-slate-500 hover:text-slate-900")}>
            {tab === "my" ? "My Certifications" : "Recommended"}
          </button>
        ))}
      </div>

      {activeTab === "my" && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search certifications..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="space-y-3">
            {filteredCerts.map((cert) => {
              const expiring = cert.expiresAt && daysUntil(cert.expiresAt) < 180;
              return (
                <Card key={cert.id} className={cn("transition-all hover:shadow-md", expiring && "border-l-4 border-l-orange-500")}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className={cn("rounded-lg p-3", expiring ? "bg-orange-100 dark:bg-orange-900/30" : "bg-purple-100 dark:bg-purple-900/30")}>
                      {expiring ? <AlertTriangle className="h-6 w-6 text-orange-600" /> : <Award className="h-6 w-6 text-purple-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{cert.name}</h3>
                        {cert.verified && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      </div>
                      <p className="text-sm text-slate-500">{cert.provider}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {cert.skills.map((s) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                      </div>
                    </div>
                    <div className="text-right text-sm text-slate-500">
                      <p>Completed: {cert.completedAt ? formatDate(cert.completedAt) : "N/A"}</p>
                      {cert.expiresAt && <p className={cn("font-medium", expiring ? "text-orange-600" : "")}>Expires: {formatDate(cert.expiresAt)}</p>}
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => deleteCert(cert.id)}>Delete</Button>
                  </CardContent>
                </Card>
              );
            })}
            {filteredCerts.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No certifications found. Add one to get started!</p>}
          </div>
        </>
      )}

      {activeTab === "recommended" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recommendedCerts.map((cert, i) => (
            <Card key={i} className="group transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <Badge variant="secondary" className="mb-3">{cert.difficulty}</Badge>
                <h3 className="font-semibold group-hover:text-blue-600 transition-colors">{cert.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{cert.provider}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{cert.reason}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {cert.skills.map((s) => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                </div>
                <p className="mt-3 text-xs text-slate-500">⏱️ ~{cert.estimatedTime}</p>
                <Button variant="outline" size="sm" className="mt-4 w-full">Learn More <ExternalLink className="ml-1 h-3 w-3" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Certification</DialogTitle>
            <DialogDescription>Track a certification you&apos;ve earned or are working towards.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Certification name" value={newCert.name} onChange={(e) => setNewCert({ ...newCert, name: e.target.value })} />
            <Input placeholder="Provider (e.g., AWS, Google, Coursera)" value={newCert.provider} onChange={(e) => setNewCert({ ...newCert, provider: e.target.value })} />
            <Input placeholder="URL (optional)" value={newCert.url} onChange={(e) => setNewCert({ ...newCert, url: e.target.value })} />
            <Button onClick={addCert} className="w-full">Add Certification</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
