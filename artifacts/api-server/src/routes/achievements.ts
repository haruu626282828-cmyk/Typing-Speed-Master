import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, achievementDefinitionsTable, userAchievementsTable } from "@workspace/db";

const router = Router();

router.get("/achievements", async (req, res): Promise<void> => {
  const auth = (req as any).auth;
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const allDefs = await db.select().from(achievementDefinitionsTable).orderBy(achievementDefinitionsTable.id);
  const earned = await db
    .select()
    .from(userAchievementsTable)
    .where(eq(userAchievementsTable.userId, auth.userId));

  const earnedMap = new Map(earned.map((e) => [e.achievementId, e.earnedAt]));

  res.json(
    allDefs.map((def) => ({
      id: def.id,
      key: def.key,
      title: def.title,
      description: def.description,
      icon: def.icon,
      earned: earnedMap.has(def.id),
      earnedAt: earnedMap.has(def.id) ? earnedMap.get(def.id)!.toISOString() : null,
    }))
  );
});

export default router;
