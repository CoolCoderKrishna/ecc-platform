"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  User,
  Calendar,
  MapPin,
  Briefcase,
  Target,
  Save,
  Pencil,
  Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { skills as allSkills } from "@/lib/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const [profile, setProfile] = React.useState({
    name: "",
    email: "",
    academicYear: "",
    location: "",
    bio: "",
    skills: [] as string[],
    interests: [] as string[],
    careerGoals: [] as string[],
    preferredTechs: [] as string[],
  });

  React.useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  React.useEffect(() => {
    if (status === "authenticated") fetchProfile();
  }, [status]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setProfile({
            name: data.user.name || "",
            email: data.user.email || "",
            academicYear: data.user.academicYear || "",
            location: data.user.location || "",
            bio: data.user.bio || "",
            skills: data.user.skills || [],
            interests: data.user.interests || [],
            careerGoals: data.user.careerGoals || [],
            preferredTechs: data.user.preferredTechs || [],
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          academicYear: profile.academicYear,
          location: profile.location,
          bio: profile.bio,
          skills: profile.skills,
          interests: profile.interests,
          careerGoals: profile.careerGoals,
          preferredTechs: profile.preferredTechs,
        }),
      });

      if (res.ok) {
        toast({ title: "Profile updated", description: "Your profile has been saved." });
        setIsEditing(false);
      } else {
        toast({ title: "Error", description: "Failed to save profile.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const addSkill = (skill: string) => {
    if (skill && !profile.skills.includes(skill)) {
      setProfile({ ...profile, skills: [...profile.skills, skill] });
    }
  };

  const removeSkill = (skill: string) => {
    setProfile({ ...profile, skills: profile.skills.filter((s) => s !== skill) });
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const profileScore = Math.min(100, Math.round(
    (profile.skills.length > 0 ? 20 : 0) +
    (profile.interests.length > 0 ? 15 : 0) +
    (profile.careerGoals.length > 0 ? 20 : 0) +
    (profile.preferredTechs.length > 0 ? 15 : 0) +
    (profile.bio ? 15 : 0) +
    (profile.academicYear ? 10 : 0) +
    (profile.location ? 5 : 0)
  ));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="mt-1 text-slate-500">Manage your profile and career preferences.</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />{saving ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}><Pencil className="mr-2 h-4 w-4" />Edit Profile</Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={(session?.user as any)?.image || ""} />
                <AvatarFallback className="text-2xl">{profile.name.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-xl font-bold">{profile.name || "Your Name"}</h2>
              <p className="text-sm text-slate-500">{profile.email}</p>
              <div className="mt-2 flex items-center gap-1 text-sm text-slate-500">
                <Calendar className="h-3.5 w-3.5" />{profile.academicYear || "Not set"}
              </div>
              <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                <MapPin className="h-3.5 w-3.5" />{profile.location || "Not set"}
              </div>
            </div>
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-medium text-slate-500">Bio</h3>
              {isEditing ? (
                <Textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} rows={3} placeholder="Tell us about yourself..." />
              ) : (
                <p className="text-sm">{profile.bio || "No bio added yet."}</p>
              )}
            </div>
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-medium text-slate-500">Profile Score</h3>
              <div className="relative h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500" style={{ width: `${profileScore}%` }} />
              </div>
              <p className="mt-1 text-xs text-slate-500">{profileScore}% complete</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><User className="h-5 w-5" />Academic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-500">Full Name</label>
                  {isEditing ? <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="mt-1" /> : <p className="mt-1">{profile.name}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Email</label>
                  <p className="mt-1 text-slate-500">{profile.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Academic Year</label>
                  {isEditing ? (
                    <Select value={profile.academicYear} onValueChange={(v) => setProfile({ ...profile, academicYear: v })}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select year" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FRESHMAN">1st Year</SelectItem>
                        <SelectItem value="SOPHOMORE">2nd Year</SelectItem>
                        <SelectItem value="JUNIOR">3rd Year</SelectItem>
                        <SelectItem value="SENIOR">4th Year</SelectItem>
                        <SelectItem value="GRADUATE">Graduate</SelectItem>
                        <SelectItem value="ALUMNI">Alumni</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : <p className="mt-1">{profile.academicYear || "Not set"}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Location</label>
                  {isEditing ? <Input value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} className="mt-1" placeholder="City, Country" /> : <p className="mt-1">{profile.location || "Not set"}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Briefcase className="h-5 w-5" />Skills</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="cursor-pointer px-3 py-1.5 text-sm hover:bg-red-100 hover:text-red-700 transition-colors" onClick={() => isEditing && removeSkill(skill)}>
                    {skill}{isEditing && <span className="ml-1 text-red-400">×</span>}
                  </Badge>
                ))}
                {profile.skills.length === 0 && <p className="text-sm text-slate-500">No skills added yet.</p>}
              </div>
              {isEditing && (
                <div className="mt-3">
                  <Select onValueChange={addSkill}>
                    <SelectTrigger className="w-[200px]"><SelectValue placeholder="Add a skill..." /></SelectTrigger>
                    <SelectContent>
                      {allSkills.filter((s) => !profile.skills.includes(s)).map((skill) => (<SelectItem key={skill} value={skill}>{skill}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Target className="h-5 w-5" />Career Goals</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile.careerGoals.map((goal, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">{i + 1}</div>
                    <p className="flex-1 text-sm">{goal}</p>
                    {isEditing && (
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600" onClick={() => setProfile({ ...profile, careerGoals: profile.careerGoals.filter((_, idx) => idx !== i) })}>×</Button>
                    )}
                  </div>
                ))}
                {profile.careerGoals.length === 0 && <p className="text-sm text-slate-500">No career goals set yet.</p>}
              </div>
              {isEditing && (
                <Button variant="outline" className="mt-3" size="sm" onClick={() => setProfile({ ...profile, careerGoals: [...profile.careerGoals, "New career goal"] })}>+ Add Goal</Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Award className="h-5 w-5" />Preferred Technologies</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.preferredTechs.map((tech) => (
                  <Badge key={tech} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1.5">{tech}</Badge>
                ))}
                {profile.preferredTechs.length === 0 && <p className="text-sm text-slate-500">No preferred technologies set.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
