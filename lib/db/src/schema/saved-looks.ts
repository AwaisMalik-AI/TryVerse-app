import {
  pgTable,
  serial,
  integer,
  text,
  boolean,
  bigint,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const savedLooksTable = pgTable(
  "saved_looks",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    lookId: text("look_id").notNull(),
    favorite: boolean("favorite").notNull().default(false),
    createdAt: bigint("created_at", { mode: "number" }).notNull(),
    data: jsonb("data").notNull(),
  },
  (table) => [uniqueIndex("saved_looks_user_look_idx").on(table.userId, table.lookId)],
);

export const insertSavedLookSchema = createInsertSchema(savedLooksTable).omit({
  id: true,
});
export type InsertSavedLook = z.infer<typeof insertSavedLookSchema>;
export type SavedLookRow = typeof savedLooksTable.$inferSelect;
