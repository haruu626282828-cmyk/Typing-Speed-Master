import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const passagesTable = pgTable("passages", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  difficulty: text("difficulty").notNull(),
  wordCount: integer("word_count").notNull(),
});

export const insertPassageSchema = createInsertSchema(passagesTable).omit({ id: true });
export type InsertPassage = z.infer<typeof insertPassageSchema>;
export type Passage = typeof passagesTable.$inferSelect;
