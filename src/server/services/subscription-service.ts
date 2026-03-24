import {
  DonationType,
  PlanType,
  SubscriptionStatus,
  type Subscription,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  isDatabaseConnectivityError,
  isPlaceholderDatabaseUrl,
} from "@/lib/prisma-errors";
import { SUBSCRIPTION_CONFIG } from "@/lib/constants";
import { addMonths, addYears } from "@/lib/utils";

function getPlanAmount(plan: PlanType): number {
  if (plan === PlanType.YEARLY) {
    return SUBSCRIPTION_CONFIG.yearlyPrice;
  }
  return SUBSCRIPTION_CONFIG.monthlyPrice;
}

function getRenewalDate(plan: PlanType): Date {
  const now = new Date();
  return plan === PlanType.YEARLY ? addYears(now, 1) : addMonths(now, 1);
}

export async function getActiveSubscription(
  userId: string,
): Promise<Subscription | null> {
  return prisma.subscription.findFirst({
    where: {
      userId,
      status: SubscriptionStatus.ACTIVE,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function startSubscription(
  userId: string,
  plan: PlanType,
): Promise<Subscription> {
  const charityPreference = await prisma.charityPreference.findUnique({
    where: { userId },
  });

  const charityPercent =
    charityPreference?.contributionPercent ??
    SUBSCRIPTION_CONFIG.defaultCharityPercent;
  const amount = getPlanAmount(plan);
  const renewalDate = getRenewalDate(plan);

  await prisma.subscription.updateMany({
    where: {
      userId,
      status: SubscriptionStatus.ACTIVE,
    },
    data: {
      status: SubscriptionStatus.CANCELED,
      canceledAt: new Date(),
    },
  });

  const subscription = await prisma.subscription.create({
    data: {
      userId,
      plan,
      status: SubscriptionStatus.ACTIVE,
      amount,
      charityPercent,
      renewalDate,
      provider: "manual-demo",
      providerRef: `local-${Date.now()}`,
    },
  });

  if (charityPreference?.charityId) {
    await prisma.donation.create({
      data: {
        userId,
        charityId: charityPreference.charityId,
        subscriptionId: subscription.id,
        type: DonationType.SUBSCRIPTION,
        amount: Number((amount * (charityPercent / 100)).toFixed(2)),
      },
    });
  }

  return subscription;
}

export async function cancelActiveSubscription(userId: string): Promise<void> {
  await prisma.subscription.updateMany({
    where: {
      userId,
      status: SubscriptionStatus.ACTIVE,
    },
    data: {
      status: SubscriptionStatus.CANCELED,
      canceledAt: new Date(),
    },
  });
}

export async function getSubscriptionSummary(userId: string): Promise<{
  active: Subscription | null;
  history: Subscription[];
}> {
  const history = await prisma.subscription.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
  return {
    active: history.find((entry) => entry.status === SubscriptionStatus.ACTIVE) ?? null,
    history,
  };
}

export async function getActiveSubscriberCount(): Promise<number> {
  if (isPlaceholderDatabaseUrl()) {
    return 0;
  }

  try {
    return await prisma.subscription.count({
      where: {
        status: SubscriptionStatus.ACTIVE,
      },
    });
  } catch (error) {
    if (isDatabaseConnectivityError(error)) {
      return 0;
    }
    throw error;
  }
}

export async function getActiveSubscriptionValue(): Promise<number> {
  const rows = await prisma.subscription.findMany({
    where: { status: SubscriptionStatus.ACTIVE },
    select: { amount: true },
  });
  return rows.reduce((sum, row) => sum + Number(row.amount), 0);
}
