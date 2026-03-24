import { PayoutStatus, VerificationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getUserWinnings(userId: string) {
  return prisma.drawResult.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      draw: true,
      proof: true,
    },
  });
}

export async function submitWinnerProof(
  userId: string,
  drawResultId: string,
  proofUrl: string,
): Promise<void> {
  const drawResult = await prisma.drawResult.findUnique({
    where: { id: drawResultId },
  });

  if (!drawResult || drawResult.userId !== userId || drawResult.matchedCount < 3) {
    throw new Error("Invalid winner proof request.");
  }

  await prisma.winnerProof.upsert({
    where: { drawResultId },
    update: {
      proofUrl,
      status: VerificationStatus.PENDING,
      reviewNotes: null,
      reviewedAt: null,
      reviewedBy: null,
    },
    create: {
      drawResultId,
      userId,
      proofUrl,
      status: VerificationStatus.PENDING,
    },
  });

  await prisma.drawResult.update({
    where: { id: drawResultId },
    data: {
      verificationStatus: VerificationStatus.PENDING,
      payoutStatus: PayoutStatus.PENDING,
    },
  });
}

export async function listWinnersForAdmin() {
  return prisma.drawResult.findMany({
    where: {
      matchedCount: {
        gte: 3,
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      draw: true,
      user: true,
      proof: true,
    },
    take: 100,
  });
}

export async function reviewWinner(
  drawResultId: string,
  adminUserId: string,
  status: "APPROVED" | "REJECTED",
  reviewNotes?: string,
): Promise<void> {
  const drawResult = await prisma.drawResult.findUnique({
    where: { id: drawResultId },
    include: { proof: true },
  });

  if (!drawResult || drawResult.matchedCount < 3) {
    throw new Error("Winner record not found.");
  }

  const verificationStatus =
    status === "APPROVED" ? VerificationStatus.APPROVED : VerificationStatus.REJECTED;
  const cleanedNotes = reviewNotes?.trim() || null;

  if (status === "APPROVED" && !drawResult.proof?.proofUrl) {
    throw new Error("Proof is required before approval.");
  }

  if (!drawResult.proof) {
    await prisma.winnerProof.create({
      data: {
        drawResultId,
        userId: drawResult.userId,
        proofUrl: "manual-review-no-proof",
        status: verificationStatus,
        reviewNotes: cleanedNotes,
        reviewedBy: adminUserId,
        reviewedAt: new Date(),
      },
    });
  } else {
    await prisma.winnerProof.update({
      where: { drawResultId },
      data: {
        status: verificationStatus,
        reviewNotes: cleanedNotes,
        reviewedBy: adminUserId,
        reviewedAt: new Date(),
      },
    });
  }

  await prisma.drawResult.update({
    where: { id: drawResultId },
    data: {
      verificationStatus,
      payoutStatus:
        verificationStatus === VerificationStatus.APPROVED
          ? PayoutStatus.PENDING
          : null,
    },
  });
}

export async function markWinnerPaid(drawResultId: string): Promise<void> {
  const current = await prisma.drawResult.findUnique({
    where: { id: drawResultId },
  });

  if (!current) {
    throw new Error("Winner result not found.");
  }
  if (current.verificationStatus !== VerificationStatus.APPROVED) {
    throw new Error("Only approved winners can be marked paid.");
  }

  await prisma.drawResult.update({
    where: { id: drawResultId },
    data: {
      payoutStatus: PayoutStatus.PAID,
    },
  });
}
