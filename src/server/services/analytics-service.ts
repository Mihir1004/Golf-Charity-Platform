import { DrawStatus, SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCharityContributionTotals } from "@/server/services/charity-service";

export async function getAdminAnalytics() {
  const [totalUsers, activeSubscribers, totalPrizePoolRows, totalDraws, charityTotals] =
    await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({
        where: { status: SubscriptionStatus.ACTIVE },
      }),
      prisma.draw.findMany({
        where: { status: DrawStatus.PUBLISHED },
        select: { totalPool: true },
      }),
      prisma.draw.count(),
      getCharityContributionTotals(),
    ]);

  const totalPrizePool = totalPrizePoolRows.reduce(
    (sum, row) => sum + Number(row.totalPool),
    0,
  );
  const totalCharityContributions = charityTotals.reduce(
    (sum, row) => sum + row.total,
    0,
  );

  return {
    totalUsers,
    activeSubscribers,
    totalDraws,
    totalPrizePool,
    totalCharityContributions,
    charityTotals,
  };
}
