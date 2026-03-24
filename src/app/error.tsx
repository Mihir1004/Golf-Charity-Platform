"use client";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-start justify-center gap-4 px-4 py-12 sm:px-6">
      <p className="rounded-full bg-[#ffe7df] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#8a2b15]">
        Application Error
      </p>
      <h1 className="text-3xl font-bold text-[#083150]">Something unexpected happened.</h1>
      <p className="max-w-xl text-sm leading-6 text-[#456680]">
        The system captured the error and prevented a full crash. You can retry now or go
        back to the previous page.
      </p>
      <p className="max-w-xl rounded-xl bg-[#f4fbff] px-3 py-2 text-xs text-[#4a6c84]">
        {error.message || "Unexpected error"}
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-xl bg-[#0a74b5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#065a8f]"
      >
        Retry
      </button>
    </main>
  );
}
