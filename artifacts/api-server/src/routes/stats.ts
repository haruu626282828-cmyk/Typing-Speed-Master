import { Router } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db, typingResultsTable } from "@workspace/db";
import { GetStatsHistoryQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/stats/me", async (req, res): Promise<void> => {
  const auth = (req as any).auth;
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const results = await db
    .select()
    .from(typingResultsTable)
    .where(eq(typingResultsTable.userId, auth.userId))
    .orderBy(desc(typingResultsTable.createdAt));

  if (results.length === 0) {
    res.json({
      totalTests: 0,
      bestWpm: 0,
      averageWpm: 0,
      averageAccuracy: 0,
      totalTimeSeconds: 0,
      currentStreak: 0,
      rank: null,
    });
    return;
  }

  const totalTests = results.length;
  const bestWpm = Math.max(...results.map((r) => r.wpm));
  const averageWpm = results.reduce((sum, r) => sum + r.wpm, 0) / totalTests;
  const averageAccuracy = results.reduce((sum, r) => sum + r.accuracy, 0) / totalTests;
  const totalTimeSeconds = results.reduce((sum, r) => sum + r.duration, 0);

  // Simple streak: count consecutive days with at least one test from today backwards
  const days = new Set(results.map((r) => r.createdAt.toISOString().slice(0, 10)));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (days.has(key)) {
      streak++;
    } else {
      break;
    }
  }

  // Rank: how many distinct users have a higher best WPM
  const rankResult = await db.execute(
    sql`SELECT COUNT(DISTINCT user_id) + 1 AS rank FROM typing_results WHERE user_id != ${auth.userId} AND wpm > ${bestWpm}`
  );
  const rank = Number((rankResult.rows[0] as any)?.rank ?? 1);

  res.json({
    totalTests,
    bestWpm: Math.round(bestWpm * 10) / 10,
    averageWpm: Math.round(averageWpm * 10) / 10,
    averageAccuracy: Math.round(averageAccuracy * 10) / 10,
    totalTimeSeconds,
    currentStreak: streak,
    rank,
  });
});

router.get("/stats/history", async (req, res): Promise<void> => {
  const auth = (req as any).auth;
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = GetStatsHistoryQueryParams.safeParse(req.query);
  const limit = parsed.success ? (parsed.data.limit ?? 30) : 30;

  const results = await db
    .select()
    .from(typingResultsTable)
    .where(eq(typingResultsTable.userId, auth.userId))
    .orderBy(desc(typingResultsTable.createdAt))
    .limit(limit);

  const history = results.reverse().map((r) => ({
    date: r.createdAt.toISOString(),
    wpm: Math.round(r.wpm * 10) / 10,
    accuracy: Math.round(r.accuracy * 10) / 10,
  }));

  res.json(history);
});

export default router;
