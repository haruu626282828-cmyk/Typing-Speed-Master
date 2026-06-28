import { Router } from "express";
import { eq, desc, and, sql } from "drizzle-orm";
import { db, passagesTable, typingResultsTable } from "@workspace/db";

const router = Router();

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getDailyPassageIndex(date: string, total: number): number {
  // Deterministic seed from date string
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    hash = (hash * 31 + date.charCodeAt(i)) >>> 0;
  }
  return hash % total;
}

router.get("/daily-challenge", async (req, res): Promise<void> => {
  const today = getTodayKey();

  // Pick today's passage deterministically
  const allPassages = await db
    .select()
    .from(passagesTable)
    .where(eq(passagesTable.difficulty, "medium"));

  if (allPassages.length === 0) {
    res.status(404).json({ error: "No passages available" });
    return;
  }

  const idx = getDailyPassageIndex(today, allPassages.length);
  const passage = allPassages[idx];

  // Get today's leaderboard for this passage
  const leaderboardRows = await db
    .select()
    .from(typingResultsTable)
    .where(
      and(
        eq(typingResultsTable.passageId, passage.id),
        eq(typingResultsTable.isDailyChallenge, "true"),
        eq(typingResultsTable.dailyDate, today)
      )
    )
    .orderBy(desc(typingResultsTable.wpm))
    .limit(20);

  // Deduplicate per user (best only)
  const seen = new Set<string>();
  const deduped: typeof leaderboardRows = [];
  for (const row of leaderboardRows) {
    if (!seen.has(row.userId)) {
      seen.add(row.userId);
      deduped.push(row);
    }
  }

  res.json({
    date: today,
    passage: {
      id: passage.id,
      text: passage.text,
      difficulty: passage.difficulty,
      wordCount: passage.wordCount,
    },
    leaderboard: deduped.map((r, idx) => ({
      rank: idx + 1,
      userId: r.userId,
      displayName: r.displayName,
      avatarUrl: r.avatarUrl,
      wpm: Math.round(r.wpm * 10) / 10,
      accuracy: Math.round(r.accuracy * 10) / 10,
      duration: r.duration,
      difficulty: r.difficulty,
      createdAt: r.createdAt.toISOString(),
    })),
  });
});

export default router;
