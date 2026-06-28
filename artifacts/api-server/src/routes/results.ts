import { Router } from "express";
import { desc, eq, sql } from "drizzle-orm";
import { db, typingResultsTable, achievementDefinitionsTable, userAchievementsTable } from "@workspace/db";
import {
  ListResultsQueryParams,
  CreateResultBody,
  GetResultParams,
} from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router = Router();

router.get("/results", async (req, res): Promise<void> => {
  const auth = (req as any).auth;
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = ListResultsQueryParams.safeParse(req.query);
  const limit = parsed.success ? (parsed.data.limit ?? 20) : 20;
  const offset = parsed.success ? (parsed.data.offset ?? 0) : 0;

  const results = await db
    .select()
    .from(typingResultsTable)
    .where(eq(typingResultsTable.userId, auth.userId))
    .orderBy(desc(typingResultsTable.createdAt))
    .limit(limit)
    .offset(offset);

  res.json(
    results.map((r) => ({
      id: r.id,
      userId: r.userId,
      wpm: r.wpm,
      cpm: r.cpm,
      accuracy: r.accuracy,
      duration: r.duration,
      difficulty: r.difficulty,
      mistakeCount: r.mistakeCount,
      passageId: r.passageId,
      createdAt: r.createdAt.toISOString(),
    }))
  );
});

router.post("/results", async (req, res): Promise<void> => {
  const auth = (req as any).auth;
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = CreateResultBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { wpm, cpm, accuracy, duration, difficulty, mistakeCount, passageId } = parsed.data;

  // Get user's display name from auth
  const displayName = auth.sessionClaims?.["name"] ?? auth.sessionClaims?.["email"] ?? "Typist";
  const avatarUrl = auth.sessionClaims?.["image_url"] ?? null;

  const [inserted] = await db
    .insert(typingResultsTable)
    .values({
      userId: auth.userId,
      displayName: String(displayName),
      avatarUrl: avatarUrl ? String(avatarUrl) : null,
      wpm,
      cpm,
      accuracy,
      duration,
      difficulty,
      mistakeCount,
      passageId: passageId ?? null,
    })
    .returning();

  // Check and award achievements
  await checkAndAwardAchievements(auth.userId, wpm, inserted.id);

  res.status(201).json({
    id: inserted.id,
    userId: inserted.userId,
    wpm: inserted.wpm,
    cpm: inserted.cpm,
    accuracy: inserted.accuracy,
    duration: inserted.duration,
    difficulty: inserted.difficulty,
    mistakeCount: inserted.mistakeCount,
    passageId: inserted.passageId,
    createdAt: inserted.createdAt.toISOString(),
  });
});

router.get("/results/:id", async (req, res): Promise<void> => {
  const auth = (req as any).auth;
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [result] = await db
    .select()
    .from(typingResultsTable)
    .where(eq(typingResultsTable.id, id))
    .limit(1);

  if (!result || result.userId !== auth.userId) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json({
    id: result.id,
    userId: result.userId,
    wpm: result.wpm,
    cpm: result.cpm,
    accuracy: result.accuracy,
    duration: result.duration,
    difficulty: result.difficulty,
    mistakeCount: result.mistakeCount,
    passageId: result.passageId,
    createdAt: result.createdAt.toISOString(),
  });
});

async function checkAndAwardAchievements(userId: string, wpm: number, resultId: number) {
  try {
    const allDefs = await db.select().from(achievementDefinitionsTable);
    const earned = await db
      .select()
      .from(userAchievementsTable)
      .where(eq(userAchievementsTable.userId, userId));
    const earnedKeys = new Set(earned.map((e) => e.achievementId));

    const results = await db
      .select()
      .from(typingResultsTable)
      .where(eq(typingResultsTable.userId, userId));

    const totalTests = results.length;
    const maxWpm = Math.max(...results.map((r) => r.wpm));

    const toAward: number[] = [];
    for (const def of allDefs) {
      if (earnedKeys.has(def.id)) continue;
      if (def.key === "first_test" && totalTests >= 1) toAward.push(def.id);
      if (def.key === "wpm_50" && maxWpm >= 50) toAward.push(def.id);
      if (def.key === "wpm_75" && maxWpm >= 75) toAward.push(def.id);
      if (def.key === "wpm_100" && maxWpm >= 100) toAward.push(def.id);
      if (def.key === "tests_10" && totalTests >= 10) toAward.push(def.id);
      if (def.key === "tests_50" && totalTests >= 50) toAward.push(def.id);
      if (def.key === "tests_100" && totalTests >= 100) toAward.push(def.id);
      if (def.key === "accuracy_95" && results.some((r) => r.accuracy >= 95)) toAward.push(def.id);
      if (def.key === "accuracy_100" && results.some((r) => r.accuracy >= 99.9)) toAward.push(def.id);
    }

    if (toAward.length > 0) {
      await db.insert(userAchievementsTable).values(
        toAward.map((achievementId) => ({ userId, achievementId }))
      );
    }
  } catch (err) {
    logger.error({ err }, "Failed to check achievements");
  }
}

export default router;
