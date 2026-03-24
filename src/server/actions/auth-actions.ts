"use server";

import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { redirectWithError } from "@/lib/action-helpers";
import { clearSessionCookie, createSessionCookie } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import { isDatabaseConnectivityError } from "@/lib/prisma-errors";
import { loginSchema, registerSchema } from "@/lib/validators";
import { authenticateUser, registerUser } from "@/server/services/user-service";

const DATABASE_UNAVAILABLE_MESSAGE =
  "Database unavailable. Start PostgreSQL or set valid POSTGRES_PRISMA_URL and POSTGRES_URL_NON_POOLING values.";

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect(`${ROUTES.register}?error=invalid_input`);
  }

  try {
    const user = await registerUser(parsed.data);
    await createSessionCookie({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });
  } catch (error) {
    const message = isDatabaseConnectivityError(error)
      ? DATABASE_UNAVAILABLE_MESSAGE
      : error instanceof Error
        ? error.message
        : "register_failed";
    redirect(`${ROUTES.register}?error=${encodeURIComponent(message)}`);
  }

  revalidatePath(ROUTES.dashboard);
  redirect(ROUTES.dashboard);
}

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect(`${ROUTES.login}?error=invalid_credentials`);
  }

  let user: Awaited<ReturnType<typeof authenticateUser>>;
  try {
    user = await authenticateUser(parsed.data);
  } catch (error) {
    if (isDatabaseConnectivityError(error)) {
      redirect(`${ROUTES.login}?error=${encodeURIComponent(DATABASE_UNAVAILABLE_MESSAGE)}`);
    }
    redirectWithError(ROUTES.login, error);
  }

  if (!user) {
    redirect(`${ROUTES.login}?error=invalid_credentials`);
  }

  try {
    await createSessionCookie({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });
  } catch (error) {
    redirectWithError(ROUTES.login, error);
  }

  if (user.role === UserRole.ADMIN) {
    redirect(ROUTES.admin);
  }

  redirect(ROUTES.dashboard);
}

export async function logoutAction() {
  try {
    await clearSessionCookie();
  } catch {
    // Best effort cleanup.
  }
  revalidatePath(ROUTES.home);
  redirect(ROUTES.home);
}
