import { Router } from "express";
import { desc, eq, and, sql } from "drizzle-orm";
import { db, typingResultsTable } from "@workspace/db";
import { GetLeaderboardQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/leaderboard", async (req, res): Promise<void> => {
  const parsed = GetLeaderboardQueryParams.safeParse(req.query);
  const duration = parsed.success ? parsed.data.duration : undefined;
  const difficulty = parsed.success ? parsed.data.difficulty : undefined;
  const limit = parsed.success ? (parsed.data.limit ?? 20) : 20;

  // Get the best result per user, optionally filtered by duration and difficulty
  const conditions = [];
  if (duration) {
    conditions.push(eq(typingResultsTable.duration, duration));
  }
  if (difficulty) {
    conditions.push(eq(typingResultsTable.difficulty, difficulty));
  }

  // Build the query to get top distinct-user best WPM rows
  let query = db
    .select({
      userId: typingResultsTable.userId,
      displayName: typingResultsTable.displayName,
      avatarUrl: typingResultsTable.avatarUrl,
      wpm: sql<number>`MAX(${typingResultsTable.wpm})`.as("max_wpm"),
      accuracy: typingResultsTable.accuracy,
      duration: typingResultsTable.duration,
      difficulty: typingResultsTable.difficulty,
      createdAt: typingResultsTable.createdAt,
    })
    .from(typingResultsTable)
    .groupBy(
      typingResultsTable.userId,
      typingResultsTable.displayName,
      typingResultsTable.avatarUrl,
      typingResultsTable.accuracy,
      typingResultsTable.duration,
      typingResultsTable.difficulty,
      typingResultsTable.createdAt,
    );

  if (conditions.length > 0) {
    (query as any).where(and(...conditions));
  }

  const rows = await db
    .select()
    .from(typingResultsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(typingResultsTable.wpm))
    .limit(limit * 3); // get more, then deduplicate per user

  // Deduplicate: keep best per user
  const seen = new Set<string>();
  const deduped: typeof rows = [];
  for (const row of rows) {
    if (!seen.has(row.userId)) {
      seen.add(row.userId);
      deduped.push(row);
      if (deduped.length >= limit) break;
    }
  }

  res.json(
    deduped.map((r, idx) => ({
      rank: idx + 1,
      userId: r.userId,
      displayName: r.displayName,
      avatarUrl: r.avatarUrl,
      wpm: Math.round(r.wpm * 10) / 10,
      accuracy: Math.round(r.accuracy * 10) / 10,
      duration: r.duration,
      difficulty: r.difficulty,
      createdAt: r.createdAt.toISOString(),
    }))
  );
});

export default router;
