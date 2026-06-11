"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-200 dark:text-red-800">
          Error
        </h1>
        <p className="mt-4 text-xl font-semibold">Something went wrong</p>
        <p className="mt-2 max-w-md text-slate-500">
          {error.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={reset}
          className="mt-8 inline-block rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
