"use client";

import * as React from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Mail,
  Smartphone,
  MessageSquare,
  Clock,
  Save,
  Loader2,
  Shield,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [deleting, setDeleting] = React.useState(false);
  const [verifying, setVerifying] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const [settings, setSettings] = React.useState({
    emailNotifications: true,
    pushNotifications: true,
    telegramBotEnabled: false,
    telegramChatId: "",
    smsEnabled: false,
    phoneNumber: "",
    whatsappEnabled: false,
    whatsappNumber: "",
    notificationFreq: "INSTANT",
    quietHoursStart: "22",
    quietHoursEnd: "8",
  });
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  React.useEffect(() => {
    if (status === "authenticated") fetchSettings();
  }, [status]);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setSettings({
            emailNotifications: data.user.emailNotifications ?? true,
            pushNotifications: data.user.pushNotifications ?? true,
            telegramBotEnabled: data.user.telegramBotEnabled ?? false,
            telegramChatId: data.user.telegramChatId || "",
            smsEnabled: data.user.smsEnabled ?? false,
            phoneNumber: data.user.phoneNumber || "",
            whatsappEnabled: data.user.whatsappEnabled ?? false,
            whatsappNumber: data.user.whatsappNumber || "",
            notificationFreq: data.user.notificationFreq || "INSTANT",
            quietHoursStart: "22",
            quietHoursEnd: "8",
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const requestVerification = async () => {
    setVerifying(true);
    try {
      const res = await fetch("/api/auth/request-verification", { method: "POST" });
      if (res.ok) {
        toast({ title: "Verification email sent", description: "Check your inbox for the verification link." });
      } else {
        const data = await res.json();
        toast({ title: "Error", description: data.error || "Failed to send verification.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    } finally {
      setVerifying(false);
    }
  };

  const confirmDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Account deleted" });
        signOut({ callbackUrl: "/" });
      } else {
        toast({ title: "Error", description: "Failed to delete account.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailNotifications: settings.emailNotifications,
          pushNotifications: settings.pushNotifications,
          telegramBotEnabled: settings.telegramBotEnabled,
          telegramChatId: settings.telegramChatId,
          smsEnabled: settings.smsEnabled,
          phoneNumber: settings.phoneNumber,
          whatsappEnabled: settings.whatsappEnabled,
          whatsappNumber: settings.whatsappNumber,
          notificationFreq: settings.notificationFreq,
        }),
      });

      if (res.ok) {
        toast({ title: "Settings saved", description: "Your notification preferences have been updated." });
      } else {
        toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

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
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="mt-1 text-slate-500">Manage your notification and display preferences.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Notification Channels</CardTitle>
            <CardDescription>Choose how you want to receive alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "emailNotifications", label: "Email", icon: Mail, desc: "Receive alerts via email" },
              { key: "pushNotifications", label: "Push Notifications", icon: Bell, desc: "Browser push notifications" },
              { key: "telegramBotEnabled", label: "Telegram", icon: MessageSquare, desc: "Get alerts via Telegram bot" },
              { key: "smsEnabled", label: "SMS", icon: Smartphone, desc: "Text message alerts" },
              { key: "whatsappEnabled", label: "WhatsApp", icon: MessageSquare, desc: "WhatsApp message alerts" },
            ].map((ch) => (
              <div key={ch.key} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <ch.icon className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium">{ch.label}</p>
                    <p className="text-xs text-slate-500">{ch.desc}</p>
                  </div>
                </div>
                <Switch checked={settings[ch.key as keyof typeof settings] as boolean} onCheckedChange={(v) => setSettings({ ...settings, [ch.key]: v })} />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Telegram Setup</CardTitle>
              <CardDescription>Connect your Telegram for instant alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Telegram Chat ID</Label>
                <Input placeholder="Enter your Telegram chat ID" value={settings.telegramChatId} onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })} className="mt-1" />
              </div>
              <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                💡 Message <span className="font-mono">@ECCAlertBot</span> on Telegram and send <span className="font-mono">/start</span> to get your chat ID.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Smartphone className="h-5 w-5" /> SMS & WhatsApp Setup</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Phone Number (for SMS)</Label>
                <Input placeholder="+1 234 567 8900" value={settings.phoneNumber} onChange={(e) => setSettings({ ...settings, phoneNumber: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>WhatsApp Number</Label>
                <Input placeholder="+1 234 567 8900" value={settings.whatsappNumber} onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })} className="mt-1" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> Notification Frequency</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>How often to receive alerts</Label>
              <Select value={settings.notificationFreq} onValueChange={(v) => setSettings({ ...settings, notificationFreq: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="INSTANT">Instant (as soon as found)</SelectItem>
                  <SelectItem value="HOURLY">Hourly digest</SelectItem>
                  <SelectItem value="DAILY">Daily digest</SelectItem>
                  <SelectItem value="WEEKLY">Weekly digest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600"><Shield className="h-5 w-5" /> Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-slate-100 p-3 dark:border-slate-800">
              <div>
                <p className="text-sm font-medium">Verify Email</p>
                <p className="text-xs text-slate-500">Confirm your email address to enable all features</p>
              </div>
              <Button variant="outline" size="sm" onClick={requestVerification} disabled={verifying}>
                {verifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send Verification
              </Button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-100 p-3 dark:border-slate-800">
              <div>
                <p className="text-sm font-medium">Terms of Service</p>
                <p className="text-xs text-slate-500">Review our terms and conditions</p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <a href="/terms">View</a>
              </Button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-100 p-3 dark:border-slate-800">
              <div>
                <p className="text-sm font-medium">Privacy Policy</p>
                <p className="text-xs text-slate-500">Review how we handle your data</p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <a href="/privacy">View</a>
              </Button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-red-100 p-3 dark:border-red-900/30">
              <div>
                <p className="text-sm font-medium text-red-600">Delete Account</p>
                <p className="text-xs text-slate-500">Permanently delete your account and all data</p>
              </div>
              <Button variant="destructive" size="sm" onClick={confirmDelete} disabled={deleting}>
                {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
