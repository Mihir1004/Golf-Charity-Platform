import { redirect } from "next/navigation";

export function redirectWithError(path: string, error: unknown): never {
  const message =
    error instanceof Error && error.message ? error.message : "Unexpected error";
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}
