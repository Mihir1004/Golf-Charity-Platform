import {
  charityUpsertSchema,
  drawRunSchema,
  proofSchema,
  scoreSchema,
} from "@/lib/validators";

describe("validators", () => {
  it("validates score bounds", () => {
    expect(scoreSchema.safeParse({ score: 22, playedOn: "2026-03-01" }).success).toBe(true);
    expect(scoreSchema.safeParse({ score: 0, playedOn: "2026-03-01" }).success).toBe(false);
    expect(scoreSchema.safeParse({ score: 46, playedOn: "2026-03-01" }).success).toBe(false);
  });

  it("validates month key format and month range", () => {
    expect(drawRunSchema.safeParse({ monthKey: "2026-03", mode: "RANDOM" }).success).toBe(true);
    expect(drawRunSchema.safeParse({ monthKey: "2026-13", mode: "RANDOM" }).success).toBe(false);
    expect(drawRunSchema.safeParse({ monthKey: "bad", mode: "RANDOM" }).success).toBe(false);
  });

  it("requires valid URL in proof schema", () => {
    expect(proofSchema.safeParse({ drawResultId: "x1", proofUrl: "https://example.com/p.png" }).success).toBe(true);
    expect(proofSchema.safeParse({ drawResultId: "x1", proofUrl: "invalid-url" }).success).toBe(false);
  });

  it("enforces slug and description constraints for charities", () => {
    expect(
      charityUpsertSchema.safeParse({
        name: "Good Cause",
        slug: "good-cause",
        description: "A".repeat(20),
      }).success,
    ).toBe(true);

    expect(
      charityUpsertSchema.safeParse({
        name: "Bad Slug",
        slug: "Bad Slug",
        description: "A".repeat(20),
      }).success,
    ).toBe(false);
  });
});
