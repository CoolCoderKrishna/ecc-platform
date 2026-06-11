"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Search,
  Bookmark,
  ExternalLink,
  Clock,
  MapPin,
  SlidersHorizontal,
  Grid3X3,
  List,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getCategoryColor,
  getDifficultyColor,
  getCategoryIcon,
  daysUntil,
  matchScore,
} from "@/lib/utils";
import { categories, difficulties, locations } from "@/lib/constants";

interface Opportunity {
  id: string;
  title: string;
  description: string;
  company: string | null;
  category: string;
  difficulty: string;
  skillsRequired: string[];
  location: string | null;
  isRemote: boolean;
  deadline: string | null;
  stipend: string | null;
  sourceUrl: string | null;
  createdAt: string;
  matchScore?: number;
}

export default function OpportunitiesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [opportunities, setOpportunities] = React.useState<Opportunity[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = React.useState("all");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = React.useState("newest");

  React.useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Single useEffect: fetch on auth + whenever filters change
  React.useEffect(() => {
    if (status === "authenticated") {
      setLoading(true);
      fetchOpportunities();
    }
  }, [status, selectedCategory, selectedDifficulty, searchQuery]);

  const fetchOpportunities = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      if (selectedDifficulty !== "all") params.set("difficulty", selectedDifficulty);
      if (searchQuery) params.set("search", searchQuery);
      params.set("limit", "50");

      const res = await fetch(`/api/opportunities?${params}`);
      if (res.ok) {
        const data = await res.json();
        const userSkills = (session?.user as any)?.skills || [];
        const opps = (data.opportunities || []).map((opp: any) => ({
          ...opp,
          matchScore: matchScore(userSkills, opp.skillsRequired || []),
        }));
        setOpportunities(opps);
      }
    } catch (error) {
      console.error("Failed to fetch opportunities:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOpportunities = opportunities
    .sort((a, b) => {
      if (sortBy === "matchScore") return (b.matchScore || 0) - (a.matchScore || 0);
      if (sortBy === "deadline") {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  if (status === "loading" || loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Opportunities</h1>
        <p className="mt-1 text-slate-500">Discover and track the best opportunities for your career.</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input placeholder="Search by title, company, or skill..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <Button variant={viewMode === "grid" ? "default" : "ghost"} size="icon" onClick={() => setViewMode("grid")}><Grid3X3 className="h-4 w-4" /></Button>
                <Button variant={viewMode === "list" ? "default" : "ghost"} size="icon" onClick={() => setViewMode("list")}><List className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-500">Filters:</span>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (<SelectItem key={cat.value} value={cat.value}>{cat.icon} {cat.label}</SelectItem>))}
                </SelectContent>
              </Select>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Difficulty" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {difficulties.map((diff) => (<SelectItem key={diff.value} value={diff.value}>{diff.label}</SelectItem>))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="matchScore">Match Score</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
              {(selectedCategory !== "all" || selectedDifficulty !== "all") && (
                <Button variant="ghost" size="sm" onClick={() => { setSelectedCategory("all"); setSelectedDifficulty("all"); }}>Clear filters</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Showing {filteredOpportunities.length} opportunities</p>
      </div>

      {viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredOpportunities.map((opp) => (
            <Card key={opp.id} className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg">
              {opp.matchScore && opp.matchScore >= 80 && (
                <div className="absolute right-3 top-3 z-10">
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">{opp.matchScore}% match</Badge>
                </div>
              )}
              <CardContent className="p-6">
                <div className="mb-3 flex items-start gap-3">
                  <span className="text-2xl">{getCategoryIcon(opp.category)}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold leading-tight group-hover:text-blue-600 transition-colors">{opp.title}</h3>
                    <p className="text-sm text-slate-500">{opp.company || "Unknown"}</p>
                  </div>
                </div>
                <p className="mb-4 text-sm text-slate-600 line-clamp-2 dark:text-slate-400">{opp.description}</p>
                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin className="h-3 w-3" />{opp.location || "TBD"}
                    {opp.isRemote && <Badge variant="secondary" className="text-[10px]">Remote</Badge>}
                  </div>
                  {opp.deadline && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="h-3 w-3" />{daysUntil(opp.deadline)} days left
                      {daysUntil(opp.deadline) <= 7 && <Badge variant="destructive" className="text-[10px]">Urgent</Badge>}
                    </div>
                  )}
                  {opp.stipend && <p className="text-xs font-medium text-green-600">💰 {opp.stipend}</p>}
                </div>
                <div className="mb-4 flex flex-wrap gap-1">
                  {(opp.skillsRequired || []).slice(0, 4).map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getCategoryColor(opp.category)}>{opp.category.replace("_", " ")}</Badge>
                  <Badge className={getDifficultyColor(opp.difficulty)}>{opp.difficulty}</Badge>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a href={opp.sourceUrl || "#"} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-1 h-3 w-3" />Apply
                    </a>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Bookmark className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOpportunities.map((opp) => (
            <Card key={opp.id} className="group transition-all duration-200 hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-4">
                <span className="text-2xl">{getCategoryIcon(opp.category)}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold group-hover:text-blue-600 transition-colors">{opp.title}</h3>
                    {opp.matchScore && opp.matchScore >= 80 && (
                      <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px]">{opp.matchScore}% match</Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">
                    {opp.company || "Unknown"} · {opp.location || "TBD"}
                    {opp.deadline && ` · ${daysUntil(opp.deadline)} days left`}
                    {opp.stipend && ` · ${opp.stipend}`}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {(opp.skillsRequired || []).slice(0, 5).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getCategoryColor(opp.category)}>{opp.category.replace("_", " ")}</Badge>
                  <Badge className={getDifficultyColor(opp.difficulty)}>{opp.difficulty}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={opp.sourceUrl || "#"} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-1 h-3 w-3" />Apply
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredOpportunities.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <Search className="h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold">No opportunities found</h3>
          <p className="mt-1 text-sm text-slate-500">Try adjusting your filters or check back later for new listings.</p>
        </div>
      )}
    </div>
  );
}
