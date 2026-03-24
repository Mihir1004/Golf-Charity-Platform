import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-start justify-center gap-4 px-4 py-12 sm:px-6">
      <p className="rounded-full bg-[#e4f4ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#0b4d78]">
        404
      </p>
      <h1 className="text-3xl font-bold text-[#083150]">Page not found.</h1>
      <p className="max-w-xl text-sm leading-6 text-[#456680]">
        The page you requested does not exist or may have been moved.
      </p>
      <Link
        href={ROUTES.home}
        className="rounded-xl bg-[#0a74b5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#065a8f]"
      >
        Return Home
      </Link>
    </main>
  );
}
