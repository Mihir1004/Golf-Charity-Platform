import { DRAW_CONFIG, SUBSCRIPTION_CONFIG } from "@/lib/constants";

export type DrawTierPools = {
  totalPool: number;
  fiveMatchPool: number;
  fourMatchPool: number;
  threeMatchPool: number;
};

export type DrawTierWinners = {
  five: number;
  four: number;
  three: number;
};

export type DrawParticipant = {
  userId: string;
  ticket: number[];
};

export function pickUniqueRandomNumbers(
  count: number,
  min: number,
  max: number,
): number[] {
  if (count <= 0) {
    return [];
  }
  if (count > max - min + 1) {
    throw new Error("Cannot pick unique numbers outside available range.");
  }

  const result = new Set<number>();
  while (result.size < count) {
    const random = Math.floor(Math.random() * (max - min + 1)) + min;
    result.add(random);
  }
  return [...result].sort((a, b) => a - b);
}

export function countMatches(ticket: number[], winningNumbers: number[]): number {
  const winningSet = new Set(winningNumbers);
  const ticketSet = new Set(ticket);
  let matches = 0;
  for (const score of ticketSet) {
    if (winningSet.has(score)) {
      matches += 1;
    }
  }
  return matches;
}

export function computeDrawTierPools(
  totalSubscriptionValue: number,
  rolloverFromPrevious: number,
): DrawTierPools {
  const totalPool =
    totalSubscriptionValue * SUBSCRIPTION_CONFIG.prizePoolPercent + rolloverFromPrevious;
  const fiveMatchPool = totalPool * DRAW_CONFIG.tierSplit.five;
  const fourMatchPool = totalPool * DRAW_CONFIG.tierSplit.four;
  const threeMatchPool = totalPool * DRAW_CONFIG.tierSplit.three;

  return {
    totalPool,
    fiveMatchPool,
    fourMatchPool,
    threeMatchPool,
  };
}

export function evaluateParticipants(
  participants: DrawParticipant[],
  winningNumbers: number[],
): Array<{ userId: string; matchedCount: number }> {
  return participants
    .map((participant) => {
      if (participant.ticket.length < DRAW_CONFIG.requiredScoreCount) {
        return null;
      }
      return {
        userId: participant.userId,
        matchedCount: countMatches(participant.ticket, winningNumbers),
      };
    })
    .filter((value): value is { userId: string; matchedCount: number } => value !== null);
}

export function countTierWinners(
  participantResults: Array<{ userId: string; matchedCount: number }>,
): DrawTierWinners {
  return {
    five: participantResults.filter((entry) => entry.matchedCount === 5).length,
    four: participantResults.filter((entry) => entry.matchedCount === 4).length,
    three: participantResults.filter((entry) => entry.matchedCount === 3).length,
  };
}

export function computeTierPayouts(
  pools: DrawTierPools,
  winners: DrawTierWinners,
): {
  fivePrize: number;
  fourPrize: number;
  threePrize: number;
  rolloverToNextMonth: number;
} {
  const fivePrize = winners.five > 0 ? pools.fiveMatchPool / winners.five : 0;
  const fourPrize = winners.four > 0 ? pools.fourMatchPool / winners.four : 0;
  const threePrize = winners.three > 0 ? pools.threeMatchPool / winners.three : 0;
  const rolloverToNextMonth = winners.five === 0 ? pools.fiveMatchPool : 0;

  return {
    fivePrize,
    fourPrize,
    threePrize,
    rolloverToNextMonth,
  };
}

export function algorithmicWinningNumbersFromFrequencies(
  frequencies: Map<number, number>,
): number[] {
  if (frequencies.size < DRAW_CONFIG.drawNumbersCount) {
    return pickUniqueRandomNumbers(
      DRAW_CONFIG.drawNumbersCount,
      DRAW_CONFIG.scoreMin,
      DRAW_CONFIG.scoreMax,
    );
  }

  const sorted = [...frequencies.entries()].sort((a, b) => b[1] - a[1]);
  const mostFrequent = sorted.slice(0, 3).map(([score]) => score);
  const leastFrequent = sorted.slice(-2).map(([score]) => score);

  const combined = [...new Set([...mostFrequent, ...leastFrequent])];
  if (combined.length < DRAW_CONFIG.drawNumbersCount) {
    const randomFill = pickUniqueRandomNumbers(
      DRAW_CONFIG.drawNumbersCount,
      DRAW_CONFIG.scoreMin,
      DRAW_CONFIG.scoreMax,
    );
    for (const value of randomFill) {
      if (!combined.includes(value)) {
        combined.push(value);
      }
      if (combined.length === DRAW_CONFIG.drawNumbersCount) {
        break;
      }
    }
  }

  return combined.slice(0, DRAW_CONFIG.drawNumbersCount).sort((a, b) => a - b);
}
