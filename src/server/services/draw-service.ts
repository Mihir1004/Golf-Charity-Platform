import {
  DrawMode,
  DrawStatus,
  PayoutStatus,
  Prisma,
  type PrismaClient,
  SubscriptionStatus,
  VerificationStatus,
} from "@prisma/client";
import { DRAW_CONFIG } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import {
  algorithmicWinningNumbersFromFrequencies,
  computeDrawTierPools,
  computeTierPayouts,
  countTierWinners,
  evaluateParticipants,
  pickUniqueRandomNumbers,
} from "@/server/domain/draw-engine";

type DrawRunResult = {
  drawId: string;
  winningNumbers: number[];
  totals: {
    totalPool: number;
    fiveMatchPool: number;
    fourMatchPool: number;
    threeMatchPool: number;
    rolloverFromPrevious: number;
    rolloverToNextMonth: number;
  };
  winners: {
    five: number;
    four: number;
    three: number;
  };
  status: DrawStatus;
};

function toDecimal(value: number): Prisma.Decimal {
  return new Prisma.Decimal(value.toFixed(2));
}

async function getRolloverFromPreviousDraw(): Promise<number> {
  const previousDraw = await prisma.draw.findFirst({
    where: { status: DrawStatus.PUBLISHED },
    orderBy: { monthKey: "desc" },
    select: {
      id: true,
      fiveMatchPool: true,
    },
  });

  if (!previousDraw) {
    return 0;
  }

  const fiveWinners = await prisma.drawResult.count({
    where: {
      drawId: previousDraw.id,
      matchedCount: 5,
    },
  });

  if (fiveWinners > 0) {
    return 0;
  }

  return Number(previousDraw.fiveMatchPool);
}

type ActiveSubscriptionsWithScores = Awaited<
  ReturnType<typeof getActiveSubscriptionsWithScores>
>;

function generateWinningNumbers(
  mode: DrawMode,
  activeSubscriptions: ActiveSubscriptionsWithScores,
): number[] {
  if (mode === DrawMode.RANDOM) {
    return pickUniqueRandomNumbers(
      DRAW_CONFIG.drawNumbersCount,
      DRAW_CONFIG.scoreMin,
      DRAW_CONFIG.scoreMax,
    );
  }

  const frequencies = new Map<number, number>();

  for (const subscription of activeSubscriptions) {
    for (const scoreEntry of subscription.user.scores) {
      const current = frequencies.get(scoreEntry.score) ?? 0;
      frequencies.set(scoreEntry.score, current + 1);
    }
  }

  return algorithmicWinningNumbersFromFrequencies(frequencies);
}

function getActiveSubscriptionsWithScores(
  db: PrismaClient | Prisma.TransactionClient = prisma,
) {
  return db.subscription.findMany({
    where: { status: SubscriptionStatus.ACTIVE },
    include: {
      user: {
        include: {
          scores: {
            orderBy: [{ playedOn: "desc" }, { createdAt: "desc" }],
            take: DRAW_CONFIG.requiredScoreCount,
          },
        },
      },
    },
  });
}

export async function runDraw(input: {
  monthKey: string;
  mode: DrawMode;
  publishNow?: boolean;
}): Promise<DrawRunResult> {
  if (!/^\d{4}-\d{2}$/.test(input.monthKey)) {
    throw new Error("Invalid month key format. Use YYYY-MM.");
  }

  const [activeSubscriptions, rolloverFromPrevious] = await Promise.all([
    getActiveSubscriptionsWithScores(),
    getRolloverFromPreviousDraw(),
  ]);
  const winningNumbers = generateWinningNumbers(input.mode, activeSubscriptions);

  const totalSubscriptionValue = activeSubscriptions.reduce((sum, subscription) => {
    const amount = Number(subscription.amount);
    return Number.isFinite(amount) ? sum + amount : sum;
  }, 0);
  const pools = computeDrawTierPools(totalSubscriptionValue, rolloverFromPrevious);

  const participantResults = evaluateParticipants(
    activeSubscriptions.map((subscription) => ({
      userId: subscription.userId,
      ticket: subscription.user.scores.map((entry) => entry.score),
    })),
    winningNumbers,
  );
  const winners = countTierWinners(participantResults);
  const payouts = computeTierPayouts(pools, winners);
  const status = input.publishNow ? DrawStatus.PUBLISHED : DrawStatus.SIMULATED;

  const draw = await prisma.$transaction(async (tx) => {
    await tx.drawResult.deleteMany({
      where: {
        draw: {
          monthKey: input.monthKey,
        },
      },
    });

    await tx.draw.deleteMany({
      where: {
        monthKey: input.monthKey,
      },
    });

    const createdDraw = await tx.draw.create({
      data: {
        monthKey: input.monthKey,
        mode: input.mode,
        status,
        winningNumbers,
        totalPool: toDecimal(pools.totalPool),
        fiveMatchPool: toDecimal(pools.fiveMatchPool),
        fourMatchPool: toDecimal(pools.fourMatchPool),
        threeMatchPool: toDecimal(pools.threeMatchPool),
        rolloverFromPrevious: toDecimal(rolloverFromPrevious),
        simulatedAt: new Date(),
        publishedAt: input.publishNow ? new Date() : null,
      },
    });

    const resultRows = participantResults
      .filter((entry) => entry.matchedCount >= 3)
      .map((entry) => {
        const amount =
          entry.matchedCount === 5
            ? payouts.fivePrize
            : entry.matchedCount === 4
              ? payouts.fourPrize
              : payouts.threePrize;
        return {
          drawId: createdDraw.id,
          userId: entry.userId,
          matchedCount: entry.matchedCount,
          prizeAmount: toDecimal(amount),
          verificationStatus: VerificationStatus.PENDING,
          payoutStatus: PayoutStatus.PENDING,
        };
      });

    if (resultRows.length > 0) {
      await tx.drawResult.createMany({
        data: resultRows,
      });
    }

    return createdDraw;
  });

  return {
    drawId: draw.id,
    winningNumbers,
    totals: {
      totalPool: pools.totalPool,
      fiveMatchPool: pools.fiveMatchPool,
      fourMatchPool: pools.fourMatchPool,
      threeMatchPool: pools.threeMatchPool,
      rolloverFromPrevious,
      rolloverToNextMonth: payouts.rolloverToNextMonth,
    },
    winners: {
      five: winners.five,
      four: winners.four,
      three: winners.three,
    },
    status,
  };
}

export async function listRecentDraws() {
  return prisma.draw.findMany({
    orderBy: { monthKey: "desc" },
    take: 8,
    include: {
      results: {
        orderBy: [{ matchedCount: "desc" }, { prizeAmount: "desc" }],
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      },
    },
  });
}
