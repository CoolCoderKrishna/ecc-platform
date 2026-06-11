"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Mail,
  Smartphone,
  Send,
  Settings,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  category: string;
  isRead: boolean;
  createdAt: string;
  sentVia: string[];
}

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState("all");

  React.useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  React.useEffect(() => {
    if (status === "authenticated") fetchNotifications();
  }, [status]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "read") return n.isRead;
    return true;
  });

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isRead: true }),
      });
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "NEW_OPPORTUNITY": return "🆕";
      case "DEADLINE_REMINDER": return "⏰";
      case "CERTIFICATION_EXPIRING": return "⚠️";
      case "WEEKLY_DIGEST": return "📊";
      case "APPLICATION_REMINDER": return "📝";
      default: return "📌";
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
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="mt-1 text-slate-500">Stay updated with the latest opportunities and reminders.</p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <CheckCheck className="mr-2 h-4 w-4" />Mark all read
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="space-y-4 lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{unreadCount}</p>
                <p className="text-sm text-slate-500">Unread</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-3xl font-bold">{notifications.length}</p>
                <p className="text-sm text-slate-500">Total</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <div className="mb-4 flex items-center gap-3">
            <Filter className="h-4 w-4 text-slate-500" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Filter" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={cn(
                  "transition-all duration-200 hover:shadow-md",
                  !notification.isRead && "border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10"
                )}
              >
                <CardContent className="flex items-start gap-4 p-4">
                  <span className="text-2xl">{getTypeIcon(notification.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={cn("font-semibold", !notification.isRead && "text-blue-700 dark:text-blue-400")}>{notification.title}</h3>
                      {!notification.isRead && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                    </div>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{notification.message}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-xs text-slate-500">{formatRelativeTime(notification.createdAt)}</span>
                      <div className="flex items-center gap-1">
                        {(notification.sentVia || []).map((channel) => (
                          <Badge key={channel} variant="secondary" className="text-[10px]">{channel}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!notification.isRead && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => markAsRead(notification.id)} title="Mark as read">
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => deleteNotification(notification.id)} title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredNotifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <Bell className="h-12 w-12 text-slate-300" />
              <h3 className="mt-4 text-lg font-semibold">No notifications</h3>
              <p className="mt-1 text-sm text-slate-500">
                {filter === "unread" ? "You're all caught up!" : "No notifications to show."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
