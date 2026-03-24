"use server";

import { DrawMode, SubscriptionStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { redirectWithError } from "@/lib/action-helpers";
import { requireAdmin } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import {
  charityUpsertSchema,
  drawRunSchema,
  reviewWinnerSchema,
} from "@/lib/validators";
import {
  deleteCharity,
  upsertCharity,
} from "@/server/services/charity-service";
import { runDraw } from "@/server/services/draw-service";
import { setUserSubscriptionStatus } from "@/server/services/user-service";
import { markWinnerPaid, reviewWinner } from "@/server/services/winner-service";

export async function runDrawAction(formData: FormData) {
  await requireAdmin();

  const parsed = drawRunSchema.safeParse({
    monthKey: formData.get("monthKey"),
    mode: formData.get("mode"),
    publishNow: formData.get("publishNow") === "on",
  });

  if (!parsed.success) {
    redirect(`${ROUTES.adminDraws}?error=invalid_draw_input`);
  }

  try {
    await runDraw({
      monthKey: parsed.data.monthKey,
      mode: parsed.data.mode === "ALGORITHMIC" ? DrawMode.ALGORITHMIC : DrawMode.RANDOM,
      publishNow: parsed.data.publishNow,
    });
  } catch (error) {
    redirectWithError(ROUTES.adminDraws, error);
  }

  revalidatePath(ROUTES.adminDraws);
  revalidatePath(ROUTES.admin);
  revalidatePath(ROUTES.dashboardWinnings);
  redirect(`${ROUTES.adminDraws}?success=draw_processed`);
}

export async function upsertCharityAction(formData: FormData) {
  await requireAdmin();

  const parsed = charityUpsertSchema.safeParse({
    id: String(formData.get("id") || "").trim() || undefined,
    name: String(formData.get("name") || ""),
    slug: String(formData.get("slug") || ""),
    description: String(formData.get("description") || ""),
    imageUrl: String(formData.get("imageUrl") || ""),
    upcomingEvents: String(formData.get("upcomingEvents") || ""),
    isFeatured: formData.get("isFeatured") === "on",
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) {
    redirect(`${ROUTES.adminCharities}?error=invalid_charity_input`);
  }

  try {
    await upsertCharity(parsed.data);
  } catch (error) {
    redirectWithError(ROUTES.adminCharities, error);
  }

  revalidatePath(ROUTES.adminCharities);
  revalidatePath(ROUTES.home);
  redirect(`${ROUTES.adminCharities}?success=charity_saved`);
}

export async function archiveCharityAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (id) {
    try {
      await deleteCharity(id);
    } catch (error) {
      redirectWithError(ROUTES.adminCharities, error);
    }
  }
  revalidatePath(ROUTES.adminCharities);
  redirect(`${ROUTES.adminCharities}?success=charity_archived`);
}

export async function reviewWinnerAction(formData: FormData) {
  const session = await requireAdmin();
  const parsed = reviewWinnerSchema.safeParse({
    drawResultId: String(formData.get("drawResultId") || ""),
    decision: String(formData.get("decision") || ""),
    reviewNotes: String(formData.get("reviewNotes") || ""),
  });

  if (!parsed.success) {
    redirect(`${ROUTES.adminWinners}?error=invalid_review`);
  }

  try {
    await reviewWinner(
      parsed.data.drawResultId,
      session.userId,
      parsed.data.decision,
      parsed.data.reviewNotes,
    );
  } catch (error) {
    redirectWithError(ROUTES.adminWinners, error);
  }

  revalidatePath(ROUTES.adminWinners);
  revalidatePath(ROUTES.dashboardWinnings);
  redirect(`${ROUTES.adminWinners}?success=winner_reviewed`);
}

export async function markPaidAction(formData: FormData) {
  await requireAdmin();
  const drawResultId = String(formData.get("drawResultId") || "");
  if (drawResultId) {
    try {
      await markWinnerPaid(drawResultId);
    } catch (error) {
      redirectWithError(ROUTES.adminWinners, error);
    }
  }
  revalidatePath(ROUTES.adminWinners);
  revalidatePath(ROUTES.dashboardWinnings);
  redirect(`${ROUTES.adminWinners}?success=payout_marked`);
}

export async function updateUserSubscriptionStatusAction(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("userId") || "");
  const status = String(formData.get("status") || "ACTIVE");
  if (!userId) {
    redirect(`${ROUTES.adminUsers}?error=invalid_user`);
  }

  const parsedStatus =
    status === "LAPSED"
      ? SubscriptionStatus.LAPSED
      : status === "CANCELED"
        ? SubscriptionStatus.CANCELED
        : SubscriptionStatus.ACTIVE;
  try {
    await setUserSubscriptionStatus(userId, parsedStatus);
  } catch (error) {
    redirectWithError(ROUTES.adminUsers, error);
  }

  revalidatePath(ROUTES.adminUsers);
  revalidatePath(ROUTES.admin);
  redirect(`${ROUTES.adminUsers}?success=user_updated`);
}
