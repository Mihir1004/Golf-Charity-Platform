import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ROUTES, SESSION_COOKIE } from "@/lib/constants";
import { getEnv } from "@/lib/env";

export type AppSession = {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
};

function getJwtSecret(): string {
  return getEnv().JWT_SECRET;
}

export async function createSessionCookie(session: AppSession): Promise<void> {
  const token = jwt.sign(session, getJwtSecret(), {
    expiresIn: "7d",
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: getEnv().NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function readSession(): Promise<AppSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, getJwtSecret()) as AppSession;
    return payload;
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<AppSession> {
  const session = await readSession();
  if (!session) {
    redirect(ROUTES.login);
  }
  return session;
}

export async function requireSubscriber(): Promise<AppSession> {
  const session = await requireUser();
  if (session.role === UserRole.ADMIN) {
    redirect(ROUTES.admin);
  }
  return session;
}

export async function requireAdmin(): Promise<AppSession> {
  const session = await requireUser();
  if (session.role !== UserRole.ADMIN) {
    redirect(ROUTES.dashboard);
  }
  return session;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
