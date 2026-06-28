import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const achievementDefinitionsTable = pgTable("achievement_definitions", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
});

export const userAchievementsTable = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  achievementId: integer("achievement_id").notNull(),
  earnedAt: timestamp("earned_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAchievementDefinitionSchema = createInsertSchema(achievementDefinitionsTable).omit({ id: true });
export type InsertAchievementDefinition = z.infer<typeof insertAchievementDefinitionSchema>;
export type AchievementDefinition = typeof achievementDefinitionsTable.$inferSelect;

export const insertUserAchievementSchema = createInsertSchema(userAchievementsTable).omit({ id: true, earnedAt: true });
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type UserAchievement = typeof userAchievementsTable.$inferSelect;
