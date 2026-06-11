import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function daysUntil(date: Date | string): number {
  const now = new Date();
  const d = new Date(date);
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function generateContentHash(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const positive = Math.abs(hash);
  return positive.toString(36) + content.length.toString(36);
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    INTERNSHIP: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    CERTIFICATION:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    HACKATHON:
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    COMPETITION:
      "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    RESEARCH:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    OPEN_SOURCE:
      "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
    SCHOLARSHIP:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    COURSE:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    WORKSHOP:
      "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
    OTHER: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  };
  return colors[category] || colors.OTHER;
}

export function getDifficultyColor(difficulty: string): string {
  const colors: Record<string, string> = {
    BEGINNER:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    EASY: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
    MEDIUM:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    HARD: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    EXPERT: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };
  return colors[difficulty] || colors.MEDIUM;
}

export function matchScore(
  userSkills: string[],
  requiredSkills: string[]
): number {
  if (requiredSkills.length === 0) return 50;
  const matched = requiredSkills.filter((skill) =>
    userSkills.some(
      (us) =>
        us.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(us.toLowerCase())
    )
  );
  return Math.round((matched.length / requiredSkills.length) * 100);
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    INTERNSHIP: "💼",
    CERTIFICATION: "📜",
    HACKATHON: "🏆",
    COMPETITION: "🎯",
    RESEARCH: "🔬",
    OPEN_SOURCE: "🌐",
    SCHOLARSHIP: "🎓",
    COURSE: "📚",
    WORKSHOP: "🛠️",
    OTHER: "📌",
  };
  return icons[category] || icons.OTHER;
}
