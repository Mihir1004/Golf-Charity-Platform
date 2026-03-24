import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL cannot be empty.").optional(),
  POSTGRES_PRISMA_URL: z.string().min(1, "POSTGRES_PRISMA_URL cannot be empty.").optional(),
  DIRECT_URL: z.string().min(1, "DIRECT_URL cannot be empty.").optional(),
  POSTGRES_URL_NON_POOLING: z
    .string()
    .min(1, "POSTGRES_URL_NON_POOLING cannot be empty.")
    .optional(),
  JWT_SECRET: z
    .string()
    .min(16, "JWT_SECRET must be at least 16 characters for secure signing."),
  APP_URL: z.string().url().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

type ParsedEnv = z.infer<typeof envSchema>;

type AppEnv = ParsedEnv & {
  DATABASE_URL: string;
  DIRECT_URL: string;
};

let cachedEnv: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const messages = parsed.error.issues.map((issue) => issue.message).join(" | ");
    throw new Error(`Invalid environment configuration: ${messages}`);
  }

  const databaseUrl = parsed.data.DATABASE_URL ?? parsed.data.POSTGRES_PRISMA_URL;
  const directUrl = parsed.data.DIRECT_URL ?? parsed.data.POSTGRES_URL_NON_POOLING;

  if (!databaseUrl || !directUrl) {
    throw new Error(
      "Invalid environment configuration: set DATABASE_URL/DIRECT_URL or POSTGRES_PRISMA_URL/POSTGRES_URL_NON_POOLING.",
    );
  }

  cachedEnv = {
    ...parsed.data,
    DATABASE_URL: databaseUrl,
    DIRECT_URL: directUrl,
  };
  return cachedEnv;
}
