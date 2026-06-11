import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ECC Platform - Career Intelligence for CS Students",
  description:
    "Real-time tracking of internships, certifications, hackathons, and career opportunities for Computer Science Engineering students.",
  keywords: [
    "internships",
    "certifications",
    "hackathons",
    "career",
    "computer science",
    "opportunities",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.className} min-h-screen bg-slate-50 dark:bg-slate-950 antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
