const { state, prismaMock } = vi.hoisted(() => {
  const stateValue = {
    drawResults: [
      {
        id: "draw-result-1",
        userId: "user-1",
        matchedCount: 4,
        verificationStatus: "PENDING",
        payoutStatus: "PENDING",
      },
      {
        id: "draw-result-2",
        userId: "user-2",
        matchedCount: 3,
        verificationStatus: "PENDING",
        payoutStatus: "PENDING",
      },
    ],
    proofs: [
      {
        drawResultId: "draw-result-1",
        userId: "user-1",
        proofUrl: "https://example.com/proof.png",
        status: "PENDING",
      },
    ],
  };

  return {
    state: stateValue,
    prismaMock: {
      drawResult: {
        findMany: vi.fn(async () => []),
        findUnique: vi.fn(async ({ where }: any) => {
          const row = stateValue.drawResults.find((item) => item.id === where.id);
          if (!row) {
            return null;
          }
          const proof = stateValue.proofs.find((item) => item.drawResultId === row.id) ?? null;
          return { ...row, proof };
        }),
        update: vi.fn(async ({ where, data }: any) => {
          const idx = stateValue.drawResults.findIndex((item) => item.id === where.id);
          if (idx < 0) {
            throw new Error("missing");
          }
          stateValue.drawResults[idx] = { ...stateValue.drawResults[idx], ...data };
          return stateValue.drawResults[idx];
        }),
      },
      winnerProof: {
        upsert: vi.fn(async ({ where, update, create }: any) => {
          const idx = stateValue.proofs.findIndex(
            (item) => item.drawResultId === where.drawResultId,
          );
          if (idx >= 0) {
            stateValue.proofs[idx] = { ...stateValue.proofs[idx], ...update };
            return stateValue.proofs[idx];
          }
          stateValue.proofs.push(create);
          return create;
        }),
        create: vi.fn(async ({ data }: any) => {
          stateValue.proofs.push(data);
          return data;
        }),
        update: vi.fn(async ({ where, data }: any) => {
          const idx = stateValue.proofs.findIndex(
            (item) => item.drawResultId === where.drawResultId,
          );
          if (idx < 0) {
            throw new Error("missing");
          }
          stateValue.proofs[idx] = { ...stateValue.proofs[idx], ...data };
          return stateValue.proofs[idx];
        }),
      },
    },
  };
});

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

import { markWinnerPaid, reviewWinner } from "@/server/services/winner-service";

describe("winner-service integration", () => {
  beforeEach(() => {
    state.drawResults = [
      {
        id: "draw-result-1",
        userId: "user-1",
        matchedCount: 4,
        verificationStatus: "PENDING",
        payoutStatus: "PENDING",
      },
      {
        id: "draw-result-2",
        userId: "user-2",
        matchedCount: 3,
        verificationStatus: "PENDING",
        payoutStatus: "PENDING",
      },
    ];
    state.proofs = [
      {
        drawResultId: "draw-result-1",
        userId: "user-1",
        proofUrl: "https://example.com/proof.png",
        status: "PENDING",
      },
    ];
    vi.clearAllMocks();
  });

  it("does not approve winners without proof", async () => {
    await expect(
      reviewWinner("draw-result-2", "admin-1", "APPROVED", "ok"),
    ).rejects.toThrow("Proof is required before approval.");
  });

  it("approves winner with proof and allows payout marking", async () => {
    await reviewWinner("draw-result-1", "admin-1", "APPROVED", "Verified");
    const approved = state.drawResults.find((row) => row.id === "draw-result-1");
    expect(approved?.verificationStatus).toBe("APPROVED");
    expect(approved?.payoutStatus).toBe("PENDING");

    await markWinnerPaid("draw-result-1");
    const paid = state.drawResults.find((row) => row.id === "draw-result-1");
    expect(paid?.payoutStatus).toBe("PAID");
  });

  it("prevents payout on unapproved winner", async () => {
    await expect(markWinnerPaid("draw-result-2")).rejects.toThrow(
      "Only approved winners can be marked paid.",
    );
  });
});
