"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, Mail, Lock, Loader2, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { skills as allSkills } from "@/lib/constants";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    academicYear: "",
    skills: [] as string[],
    interests: [] as string[],
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (form.password !== form.confirmPassword) {
        setError("Passwords don't match");
        return;
      }
      setStep(2);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          academicYear: form.academicYear,
          skills: form.skills,
          interests: form.interests,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      // Auto sign in
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        router.push("/login");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 px-4 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/20">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25">
              <Zap className="h-7 w-7 text-white" />
            </div>
            <span className="text-3xl font-bold">
              <span className="text-blue-600">ECC</span>
              <span className="text-slate-400">Hub</span>
            </span>
          </Link>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {step === 1 ? "Create your account" : "Tell us about yourself"}
            </CardTitle>
            <CardDescription>
              {step === 1
                ? "Join thousands of CS students building their careers"
                : "Help us personalize your experience"}
            </CardDescription>
            {/* Progress */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className={`h-2 w-12 rounded-full ${step >= 1 ? "bg-blue-600" : "bg-slate-200"}`} />
              <div className={`h-2 w-12 rounded-full ${step >= 2 ? "bg-blue-600" : "bg-slate-200"}`} />
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              {step === 1 && (
                <>
                  <div>
                    <label className="text-sm font-medium">Full Name</label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="John Doe"
                        className="pl-10"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        type="email"
                        placeholder="you@university.edu"
                        className="pl-10"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Password</label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        required
                        minLength={8}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Confirm Password</label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={form.confirmPassword}
                        onChange={(e) =>
                          setForm({ ...form, confirmPassword: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div>
                    <label className="text-sm font-medium">Academic Year</label>
                    <div className="mt-1">
                      <Select
                        value={form.academicYear}
                        onValueChange={(v) =>
                          setForm({ ...form, academicYear: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FRESHMAN">1st Year</SelectItem>
                          <SelectItem value="SOPHOMORE">2nd Year</SelectItem>
                          <SelectItem value="JUNIOR">3rd Year</SelectItem>
                          <SelectItem value="SENIOR">4th Year</SelectItem>
                          <SelectItem value="GRADUATE">Graduate</SelectItem>
                          <SelectItem value="ALUMNI">Alumni</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Select Your Skills</label>
                    <p className="text-xs text-slate-500 mt-1">
                      Choose skills you have or are learning
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {allSkills.slice(0, 20).map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                            form.skills.includes(skill)
                              ? "bg-blue-600 text-white shadow-sm"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                {step === 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                )}
                <Button
                  type="submit"
                  className="flex-1 h-12"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {step === 1 ? "Continue" : "Create Account"}
                </Button>
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
