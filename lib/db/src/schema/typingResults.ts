import { pgTable, text, serial, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const typingResultsTable = pgTable("typing_results", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  displayName: text("display_name").notNull().default("Anonymous"),
  avatarUrl: text("avatar_url"),
  wpm: real("wpm").notNull(),
  cpm: real("cpm").notNull(),
  accuracy: real("accuracy").notNull(),
  duration: integer("duration").notNull(),
  difficulty: text("difficulty").notNull(),
  mistakeCount: integer("mistake_count").notNull().default(0),
  passageId: integer("passage_id"),
  isDailyChallenge: text("is_daily_challenge").notNull().default("false"),
  dailyDate: text("daily_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTypingResultSchema = createInsertSchema(typingResultsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertTypingResult = z.infer<typeof insertTypingResultSchema>;
export type TypingResult = typeof typingResultsTable.$inferSelect;
