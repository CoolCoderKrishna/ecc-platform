import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-200 dark:text-slate-800">
          404
        </h1>
        <p className="mt-4 text-xl font-semibold">Page Not Found</p>
        <p className="mt-2 text-slate-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
