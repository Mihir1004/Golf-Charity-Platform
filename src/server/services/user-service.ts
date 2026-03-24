import { PlanType, SubscriptionStatus, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { SUBSCRIPTION_CONFIG } from "@/lib/constants";

export async function registerUser(input: {
  fullName: string;
  email: string;
  password: string;
}) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });
  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const passwordHash = await hashPassword(input.password);
  const charities = await prisma.charity.findMany({
    where: { isActive: true },
    take: 1,
  });

  const user = await prisma.user.create({
    data: {
      fullName: input.fullName,
      email: input.email.toLowerCase(),
      passwordHash,
      role: UserRole.SUBSCRIBER,
      charityPreference: charities[0]
        ? {
            create: {
              charityId: charities[0].id,
              contributionPercent: SUBSCRIPTION_CONFIG.defaultCharityPercent,
            },
          }
        : undefined,
    },
  });

  return user;
}

export async function authenticateUser(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (!user) {
    return null;
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    return null;
  }

  return user;
}

export async function listUsersForAdmin() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      subscriptions: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      scores: {
        orderBy: [{ playedOn: "desc" }, { createdAt: "desc" }],
        take: 5,
      },
      charityPreference: {
        include: { charity: true },
      },
    },
    take: 200,
  });
}

export async function getUserDashboardSnapshot(userId: string) {
  const [user, activeSubscription, scores, preference, drawResults] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
    }),
    prisma.subscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.scoreEntry.findMany({
      where: { userId },
      orderBy: [{ playedOn: "desc" }, { createdAt: "desc" }],
      take: 5,
    }),
    prisma.charityPreference.findUnique({
      where: { userId },
      include: { charity: true },
    }),
    prisma.drawResult.findMany({
      where: { userId },
      include: { draw: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return {
    user,
    activeSubscription,
    scores,
    preference,
    drawResults,
    drawsEntered: drawResults.length,
    totalWon: drawResults.reduce((sum, row) => sum + Number(row.prizeAmount), 0),
  };
}

export async function setUserSubscriptionStatus(
  userId: string,
  status: SubscriptionStatus,
): Promise<void> {
  const latest = await prisma.subscription.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  if (!latest) {
    await prisma.subscription.create({
      data: {
        userId,
        plan: PlanType.MONTHLY,
        status,
        amount: SUBSCRIPTION_CONFIG.monthlyPrice,
        charityPercent: SUBSCRIPTION_CONFIG.defaultCharityPercent,
        renewalDate: new Date(),
      },
    });
    return;
  }

  await prisma.subscription.update({
    where: { id: latest.id },
    data: {
      status,
    },
  });
}
