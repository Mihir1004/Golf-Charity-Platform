import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required."),
  JWT_SECRET: z
    .string()
    .min(16, "JWT_SECRET must be at least 16 characters for secure signing."),
  APP_URL: z.string().url().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

type AppEnv = z.infer<typeof envSchema>;

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

  cachedEnv = parsed.data;
  return cachedEnv;
}
