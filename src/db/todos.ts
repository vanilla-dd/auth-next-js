import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "@/db/auth-schema";

export const todoPriorities = ["low", "medium", "high"] as const;
export type TodoPriority = (typeof todoPriorities)[number];

export const todos = sqliteTable(
  "todos",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    dueDate: text("due_date").notNull(),
    dueTime: text("due_time").notNull(),
    priority: text("priority", { enum: todoPriorities })
      .notNull()
      .default("medium"),
    completed: integer("completed", { mode: "boolean" })
      .notNull()
      .default(false),
    position: integer("position").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [index("todos_userId_idx").on(table.userId)],
);

export type Todo = typeof todos.$inferSelect;
