"use server";

import { PlanType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { redirectWithError } from "@/lib/action-helpers";
import { requireUser } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import {
  charityPreferenceSchema,
  independentDonationSchema,
  proofSchema,
  scoreSchema,
  subscriptionSchema,
} from "@/lib/validators";
import {
  addIndependentDonation,
  setUserCharityPreference,
} from "@/server/services/charity-service";
import { addScore, updateScore } from "@/server/services/score-service";
import {
  cancelActiveSubscription,
  getActiveSubscription,
  startSubscription,
} from "@/server/services/subscription-service";
import { submitWinnerProof } from "@/server/services/winner-service";

async function requireActiveSubscriptionOrRedirect(userId: string): Promise<void> {
  const active = await getActiveSubscription(userId);
  if (!active) {
    redirect(`${ROUTES.dashboardSubscription}?error=subscription_required`);
  }
}

export async function addScoreAction(formData: FormData) {
  const session = await requireUser();
  await requireActiveSubscriptionOrRedirect(session.userId);

  const parsed = scoreSchema.safeParse({
    score: formData.get("score"),
    playedOn: formData.get("playedOn"),
  });
  if (!parsed.success) {
    redirect(`${ROUTES.dashboardScores}?error=invalid_score`);
  }

  try {
    await addScore(session.userId, parsed.data.score, parsed.data.playedOn);
  } catch (error) {
    redirectWithError(ROUTES.dashboardScores, error);
  }

  revalidatePath(ROUTES.dashboard);
  revalidatePath(ROUTES.dashboardScores);
  redirect(`${ROUTES.dashboardScores}?success=score_saved`);
}

export async function updateScoreAction(formData: FormData) {
  const session = await requireUser();
  await requireActiveSubscriptionOrRedirect(session.userId);

  const scoreId = String(formData.get("scoreId") || "");
  const parsed = scoreSchema.safeParse({
    score: formData.get("score"),
    playedOn: formData.get("playedOn"),
  });

  if (!scoreId || !parsed.success) {
    redirect(`${ROUTES.dashboardScores}?error=invalid_score_update`);
  }

  try {
    await updateScore(session.userId, scoreId, parsed.data.score, parsed.data.playedOn);
  } catch (error) {
    redirectWithError(ROUTES.dashboardScores, error);
  }

  revalidatePath(ROUTES.dashboardScores);
  revalidatePath(ROUTES.dashboard);
  redirect(`${ROUTES.dashboardScores}?success=score_updated`);
}

export async function updateCharityPreferenceAction(formData: FormData) {
  const session = await requireUser();
  const parsed = charityPreferenceSchema.safeParse({
    charityId: formData.get("charityId"),
    contributionPercent: formData.get("contributionPercent"),
  });
  if (!parsed.success) {
    redirect(`${ROUTES.dashboardCharity}?error=invalid_charity`);
  }

  try {
    await setUserCharityPreference(
      session.userId,
      parsed.data.charityId,
      parsed.data.contributionPercent,
    );
  } catch (error) {
    redirectWithError(ROUTES.dashboardCharity, error);
  }

  revalidatePath(ROUTES.dashboard);
  revalidatePath(ROUTES.dashboardCharity);
  redirect(`${ROUTES.dashboardCharity}?success=charity_updated`);
}

export async function donateIndependentlyAction(formData: FormData) {
  const session = await requireUser();
  const parsed = independentDonationSchema.safeParse({
    charityId: formData.get("charityId"),
    amount: formData.get("amount"),
  });
  if (!parsed.success) {
    redirect(`${ROUTES.dashboardCharity}?error=invalid_donation`);
  }

  try {
    await addIndependentDonation(session.userId, parsed.data.charityId, parsed.data.amount);
  } catch (error) {
    redirectWithError(ROUTES.dashboardCharity, error);
  }

  revalidatePath(ROUTES.dashboardCharity);
  revalidatePath(ROUTES.dashboard);
  redirect(`${ROUTES.dashboardCharity}?success=donation_added`);
}

export async function subscribeAction(formData: FormData) {
  const session = await requireUser();
  const parsed = subscriptionSchema.safeParse({
    plan: formData.get("plan"),
  });

  if (!parsed.success) {
    redirect(`${ROUTES.dashboardSubscription}?error=invalid_plan`);
  }

  const plan = parsed.data.plan === "YEARLY" ? PlanType.YEARLY : PlanType.MONTHLY;
  try {
    await startSubscription(session.userId, plan);
  } catch (error) {
    redirectWithError(ROUTES.dashboardSubscription, error);
  }

  revalidatePath(ROUTES.dashboardSubscription);
  revalidatePath(ROUTES.dashboard);
  redirect(`${ROUTES.dashboardSubscription}?success=subscribed`);
}

export async function cancelSubscriptionAction() {
  const session = await requireUser();
  try {
    await cancelActiveSubscription(session.userId);
  } catch (error) {
    redirectWithError(ROUTES.dashboardSubscription, error);
  }

  revalidatePath(ROUTES.dashboardSubscription);
  revalidatePath(ROUTES.dashboard);
  redirect(`${ROUTES.dashboardSubscription}?success=canceled`);
}

export async function submitProofAction(formData: FormData) {
  const session = await requireUser();
  await requireActiveSubscriptionOrRedirect(session.userId);

  const parsed = proofSchema.safeParse({
    drawResultId: formData.get("drawResultId"),
    proofUrl: formData.get("proofUrl"),
  });

  if (!parsed.success) {
    redirect(`${ROUTES.dashboardWinnings}?error=invalid_proof`);
  }

  try {
    await submitWinnerProof(session.userId, parsed.data.drawResultId, parsed.data.proofUrl);
  } catch (error) {
    redirectWithError(ROUTES.dashboardWinnings, error);
  }

  revalidatePath(ROUTES.dashboardWinnings);
  revalidatePath(ROUTES.adminWinners);
  redirect(`${ROUTES.dashboardWinnings}?success=proof_uploaded`);
}
