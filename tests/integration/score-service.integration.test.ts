type ScoreRow = {
  id: string;
  userId: string;
  score: number;
  playedOn: Date;
  createdAt: Date;
};

const { state, prismaMock } = vi.hoisted(() => {
  const stateValue: { rows: ScoreRow[] } = { rows: [] };

  return {
    state: stateValue,
    prismaMock: {
      scoreEntry: {
        findMany: vi.fn(async (args?: any) => {
          const userId = args?.where?.userId;
          const take = args?.take;
          const rows = stateValue.rows
            .filter((row) => (userId ? row.userId === userId : true))
            .sort((a, b) => {
              const played = b.playedOn.getTime() - a.playedOn.getTime();
              if (played !== 0) {
                return played;
              }
              return b.createdAt.getTime() - a.createdAt.getTime();
            });
          return typeof take === "number" ? rows.slice(0, take) : rows;
        }),
        create: vi.fn(async ({ data }: any) => {
          const row: ScoreRow = {
            id: `score-${stateValue.rows.length + 1}`,
            userId: data.userId,
            score: data.score,
            playedOn: new Date(data.playedOn),
            createdAt: new Date(),
          };
          stateValue.rows.push(row);
          return row;
        }),
        deleteMany: vi.fn(async ({ where }: any) => {
          const ids = new Set<string>(where.id.in);
          const before = stateValue.rows.length;
          stateValue.rows = stateValue.rows.filter((row) => !ids.has(row.id));
          return { count: before - stateValue.rows.length };
        }),
        updateMany: vi.fn(async ({ where, data }: any) => {
          let count = 0;
          stateValue.rows = stateValue.rows.map((row) => {
            if (row.id === where.id && row.userId === where.userId) {
              count += 1;
              return { ...row, score: data.score, playedOn: new Date(data.playedOn) };
            }
            return row;
          });
          return { count };
        }),
      },
    },
  };
});

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

import { addScore, getLatestScores, updateScore } from "@/server/services/score-service";

describe("score-service integration", () => {
  beforeEach(() => {
    state.rows = [];
    vi.clearAllMocks();
  });

  it("retains only the latest 5 scores", async () => {
    const userId = "user-1";
    const base = new Date("2026-01-01T00:00:00.000Z");

    for (let i = 0; i < 6; i += 1) {
      await addScore(userId, 10 + i, new Date(base.getTime() + i * 86400000));
    }

    const latest = await getLatestScores(userId);
    expect(latest).toHaveLength(5);
    expect(latest[0]?.score).toBe(15);
    expect(latest.at(-1)?.score).toBe(11);
    expect(latest.some((row) => row.score === 10)).toBe(false);
  });

  it("rejects invalid score range", async () => {
    await expect(addScore("user-1", 0, new Date("2026-02-01"))).rejects.toThrow(
      "Score must be between 1 and 45.",
    );
  });

  it("updates a score only for the owner", async () => {
    await addScore("user-1", 20, new Date("2026-02-01"));
    const latest = await getLatestScores("user-1");
    const id = latest[0]?.id;
    expect(id).toBeTruthy();

    await updateScore("user-1", id!, 25, new Date("2026-02-02"));
    const updated = await getLatestScores("user-1");
    expect(updated[0]?.score).toBe(25);

    await expect(updateScore("user-2", id!, 30, new Date("2026-02-03"))).rejects.toThrow(
      "Score not found.",
    );
  });
});
