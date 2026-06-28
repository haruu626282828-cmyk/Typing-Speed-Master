import { Router } from "express";
import { eq, sql } from "drizzle-orm";
import { db, passagesTable, typingResultsTable } from "@workspace/db";
import { ListPassagesQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/passages", async (req, res): Promise<void> => {
  const parsed = ListPassagesQueryParams.safeParse(req.query);
  const difficulty = parsed.success ? parsed.data.difficulty : undefined;
  const count = parsed.success ? (parsed.data.count ?? 3) : 3;

  let query = db.select().from(passagesTable).orderBy(sql`RANDOM()`).limit(count);

  if (difficulty) {
    query = db
      .select()
      .from(passagesTable)
      .where(eq(passagesTable.difficulty, difficulty))
      .orderBy(sql`RANDOM()`)
      .limit(count) as typeof query;
  }

  const rows = await query;

  res.json(
    rows.map((r) => ({
      id: r.id,
      text: r.text,
      difficulty: r.difficulty,
      wordCount: r.wordCount,
    }))
  );
});

export default router;
