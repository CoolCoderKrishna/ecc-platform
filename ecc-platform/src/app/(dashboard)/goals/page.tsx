"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, CheckCircle2, Circle, TrendingUp, Star, Trash2, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Milestone {
  id: string;
  title: string;
  completed: boolean;
}

interface Goal {
  id: string;
  title: string;
  completed: boolean;
  progress: number;
  milestones: Milestone[];
}

const defaultGoals: { title: string; milestones: string[] }[] = [
  {
    title: "Land a FAANG Summer Internship",
    milestones: ["Update resume and LinkedIn", "Practice DSA (200+ problems)", "Prepare system design basics", "Apply to 10+ companies"],
  },
  {
    title: "Get AWS Cloud Practitioner Certification",
    milestones: ["Complete AWS training course", "Do 3 practice exams", "Schedule and pass the exam"],
  },
  {
    title: "Contribute to 5 Open Source Projects",
    milestones: ["Find beginner-friendly projects", "Make first contribution", "Contribute to 4 more projects"],
  },
];

export default function GoalsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [goals, setGoals] = React.useState<Goal[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [newGoal, setNewGoal] = React.useState("");
  const [showAdd, setShowAdd] = React.useState(false);

  React.useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  React.useEffect(() => {
    if (status === "authenticated") fetchGoals();
  }, [status]);

  const fetchGoals = async () => {
    try {
      const res = await fetch("/api/goals");
      if (res.ok) {
        const data = await res.json();
        if (data.goals && data.goals.length > 0) {
          setGoals(data.goals);
        } else {
          // Seed default goals for new users
          for (const dg of defaultGoals) {
            await fetch("/api/goals", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ title: dg.title, milestones: dg.milestones }),
            });
          }
          const retryRes = await fetch("/api/goals");
          if (retryRes.ok) {
            const retryData = await retryRes.json();
            setGoals(retryData.goals || []);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch goals:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMilestone = async (milestoneId: string, completed: boolean) => {
    try {
      await fetch("/api/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId, milestoneCompleted: completed }),
      });
      // Refresh goals to get updated progress
      fetchGoals();
    } catch (error) {
      console.error("Failed to toggle milestone:", error);
    }
  };

  const addGoal = async () => {
    if (!newGoal.trim()) return;
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newGoal }),
      });
      if (res.ok) {
        toast({ title: "Goal added" });
        setNewGoal("");
        setShowAdd(false);
        fetchGoals();
      }
    } catch {
      toast({ title: "Error", description: "Failed to add goal.", variant: "destructive" });
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      await fetch(`/api/goals?id=${id}`, { method: "DELETE" });
      setGoals(goals.filter((g) => g.id !== id));
      toast({ title: "Goal deleted" });
    } catch {
      toast({ title: "Error", description: "Failed to delete goal.", variant: "destructive" });
    }
  };

  const totalProgress = goals.length > 0 ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length) : 0;
  const completedGoals = goals.filter((g) => g.completed).length;
  const totalMilestones = goals.reduce((acc, g) => acc + g.milestones.length, 0);
  const completedMilestones = goals.reduce((acc, g) => acc + g.milestones.filter((m) => m.completed).length, 0);

  if (status === "loading" || loading) {
    return (<div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /></div>);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Career Goals</h1>
          <p className="mt-1 text-slate-500">Track your milestones and career roadmap.</p>
        </div>
        <Button onClick={() => setShowAdd(true)}><Plus className="mr-2 h-4 w-4" />Add Goal</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><p className="text-sm text-slate-500">Overall Progress</p><TrendingUp className="h-4 w-4 text-blue-500" /></div><p className="mt-1 text-3xl font-bold">{totalProgress}%</p><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500" style={{ width: `${totalProgress}%` }} /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><p className="text-sm text-slate-500">Goals Completed</p><CheckCircle2 className="h-4 w-4 text-green-500" /></div><p className="mt-1 text-3xl font-bold">{completedGoals}/{goals.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><p className="text-sm text-slate-500">Total Milestones</p><Star className="h-4 w-4 text-yellow-500" /></div><p className="mt-1 text-3xl font-bold">{completedMilestones}/{totalMilestones}</p></CardContent></Card>
      </div>

      {showAdd && (
        <Card><CardContent className="p-4"><div className="flex gap-2"><Input placeholder="Enter a new career goal..." value={newGoal} onChange={(e) => setNewGoal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addGoal()} /><Button onClick={addGoal}>Add</Button><Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button></div></CardContent></Card>
      )}

      <div className="space-y-4">
        {goals.map((goal) => (
          <Card key={goal.id} className={cn("transition-all hover:shadow-md", goal.completed && "border-green-200 dark:border-green-900")}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {goal.completed ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Circle className="h-5 w-5 text-slate-400" />}
                    <h3 className={cn("font-semibold", goal.completed && "text-green-600")}>{goal.title}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className={cn("text-2xl font-bold", goal.progress >= 80 ? "text-green-600" : goal.progress >= 40 ? "text-yellow-600" : "text-slate-600")}>{goal.progress}%</p>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => deleteGoal(goal.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="mt-4 ml-7 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className={cn("h-full rounded-full transition-all duration-500", goal.completed ? "bg-green-500" : "bg-blue-500")} style={{ width: `${goal.progress}%` }} />
              </div>
              <div className="mt-4 ml-7 space-y-2">
                {goal.milestones.map((m) => (
                  <button key={m.id} onClick={() => toggleMilestone(m.id, !m.completed)} className="flex items-center gap-2 text-sm transition-colors hover:text-blue-600">
                    {m.completed ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4 text-slate-300" />}
                    <span className={cn(m.completed && "text-slate-400 line-through")}>{m.title}</span>
                  </button>
                ))}
                {goal.milestones.length === 0 && <p className="text-xs text-slate-400">No milestones yet</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {goals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <Target className="h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold">No goals yet</h3>
          <p className="mt-1 text-sm text-slate-500">Set your first career goal to start tracking progress.</p>
        </div>
      )}
    </div>
  );
}
