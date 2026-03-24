import { DRAW_CONFIG } from "@/lib/constants";
import {
  algorithmicWinningNumbersFromFrequencies,
  computeDrawTierPools,
  computeTierPayouts,
  countMatches,
  countTierWinners,
  evaluateParticipants,
  pickUniqueRandomNumbers,
} from "@/server/domain/draw-engine";

describe("draw-engine", () => {
  it("computes tier pools based on subscription value and rollover", () => {
    const pools = computeDrawTierPools(1000, 200);
    expect(pools.totalPool).toBeCloseTo(700);
    expect(pools.fiveMatchPool).toBeCloseTo(280);
    expect(pools.fourMatchPool).toBeCloseTo(245);
    expect(pools.threeMatchPool).toBeCloseTo(175);
  });

  it("counts unique matches only once", () => {
    expect(countMatches([10, 10, 20, 30, 40], [10, 20, 33, 44, 45])).toBe(2);
  });

  it("evaluates participants with complete tickets only", () => {
    const results = evaluateParticipants(
      [
        { userId: "u1", ticket: [1, 2, 3, 4, 5] },
        { userId: "u2", ticket: [1, 2, 3] },
      ],
      [1, 2, 3, 10, 11],
    );

    expect(results).toEqual([{ userId: "u1", matchedCount: 3 }]);
  });

  it("computes winner counts and payouts with rollover", () => {
    const winners = countTierWinners([
      { userId: "u1", matchedCount: 5 },
      { userId: "u2", matchedCount: 4 },
      { userId: "u3", matchedCount: 3 },
      { userId: "u4", matchedCount: 3 },
    ]);

    const payouts = computeTierPayouts(
      {
        totalPool: 1000,
        fiveMatchPool: 400,
        fourMatchPool: 350,
        threeMatchPool: 250,
      },
      winners,
    );

    expect(winners).toEqual({ five: 1, four: 1, three: 2 });
    expect(payouts.fivePrize).toBeCloseTo(400);
    expect(payouts.fourPrize).toBeCloseTo(350);
    expect(payouts.threePrize).toBeCloseTo(125);
    expect(payouts.rolloverToNextMonth).toBe(0);
  });

  it("returns rollover when no five-match winner exists", () => {
    const payouts = computeTierPayouts(
      {
        totalPool: 1000,
        fiveMatchPool: 400,
        fourMatchPool: 350,
        threeMatchPool: 250,
      },
      { five: 0, four: 2, three: 4 },
    );
    expect(payouts.rolloverToNextMonth).toBe(400);
  });

  it("algorithmic numbers prioritize frequent and infrequent values", () => {
    const frequencies = new Map<number, number>([
      [5, 20],
      [7, 18],
      [12, 17],
      [33, 2],
      [41, 1],
      [22, 12],
    ]);
    const numbers = algorithmicWinningNumbersFromFrequencies(frequencies);

    expect(numbers).toHaveLength(DRAW_CONFIG.drawNumbersCount);
    expect(numbers).toEqual(expect.arrayContaining([5, 7, 12, 33, 41]));
  });

  it("picks unique random numbers within range", () => {
    const numbers = pickUniqueRandomNumbers(5, 1, 45);
    expect(numbers).toHaveLength(5);
    expect(new Set(numbers).size).toBe(5);
    expect(numbers.every((n) => n >= 1 && n <= 45)).toBe(true);
  });

  it("throws when unique pick exceeds available range", () => {
    expect(() => pickUniqueRandomNumbers(50, 1, 45)).toThrow(
      "Cannot pick unique numbers outside available range.",
    );
  });
});
