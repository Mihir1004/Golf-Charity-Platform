import { Prisma } from "@prisma/client";

export function isDatabaseConnectivityError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  if (error instanceof Error) {
    return (
      error.message.includes("Can't reach database server") ||
      error.message.includes("ECONNREFUSED") ||
      error.message.includes("P1001")
    );
  }

  return false;
}

export function isPlaceholderDatabaseUrl(): boolean {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_PRISMA_URL ?? "";
  return (
    url.includes("johndoe:randompassword@localhost:5432/mydb") ||
    url.includes("postgres:[password]@db.[project-ref].supabase.co") ||
    url.includes("username:password@ep-")
  );
}
