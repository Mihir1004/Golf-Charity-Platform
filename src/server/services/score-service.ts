import { prisma } from "@/lib/prisma";
import { DRAW_CONFIG } from "@/lib/constants";

export async function getLatestScores(userId: string) {
  return prisma.scoreEntry.findMany({
    where: { userId },
    orderBy: [{ playedOn: "desc" }, { createdAt: "desc" }],
    take: DRAW_CONFIG.requiredScoreCount,
  });
}

export async function addScore(
  userId: string,
  score: number,
  playedOn: Date,
): Promise<void> {
  if (score < DRAW_CONFIG.scoreMin || score > DRAW_CONFIG.scoreMax) {
    throw new Error("Score must be between 1 and 45.");
  }

  await prisma.scoreEntry.create({
    data: { userId, score, playedOn },
  });

  const overflow = await prisma.scoreEntry.findMany({
    where: { userId },
    orderBy: [{ playedOn: "desc" }, { createdAt: "desc" }],
    skip: DRAW_CONFIG.requiredScoreCount,
    select: { id: true },
  });

  if (overflow.length > 0) {
    await prisma.scoreEntry.deleteMany({
      where: {
        id: { in: overflow.map((entry) => entry.id) },
      },
    });
  }
}

export async function updateScore(
  userId: string,
  scoreId: string,
  score: number,
  playedOn: Date,
): Promise<void> {
  if (score < DRAW_CONFIG.scoreMin || score > DRAW_CONFIG.scoreMax) {
    throw new Error("Score must be between 1 and 45.");
  }

  const result = await prisma.scoreEntry.updateMany({
    where: {
      id: scoreId,
      userId,
    },
    data: { score, playedOn },
  });

  if (result.count === 0) {
    throw new Error("Score not found.");
  }
}

export async function getUserScoreTicket(userId: string): Promise<number[]> {
  const latest = await getLatestScores(userId);
  return latest.map((entry) => entry.score);
}
