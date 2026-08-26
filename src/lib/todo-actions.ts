"use server";

import { and, asc, eq, like, max, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { todos } from "@/db/todos";
import { requireUser } from "@/lib/session";
import {
  parseTodoDraft,
  type Result,
  type TodoDraft,
  type TodoFilters,
} from "@/lib/todo";

export async function listTodos(filters: TodoFilters) {
  const { user } = await requireUser();
  const conditions = [eq(todos.userId, user.id)];

  const q = filters.q.replace(/[%_]/g, "").trim();
  if (q) {
    const pattern = `%${q}%`;
    const match = or(
      like(todos.title, pattern),
      like(todos.description, pattern),
    );
    if (match) conditions.push(match);
  }

  if (filters.status === "open") conditions.push(eq(todos.completed, false));
  if (filters.status === "done") conditions.push(eq(todos.completed, true));
  if (filters.priority !== "all") {
    conditions.push(eq(todos.priority, filters.priority));
  }

  return db
    .select()
    .from(todos)
    .where(and(...conditions))
    .orderBy(asc(todos.position), asc(todos.createdAt));
}

export async function createTodo(input: TodoDraft): Promise<Result> {
  const { user } = await requireUser();
  const parsed = parseTodoDraft(input);
  if (!parsed.ok) return parsed;

  const now = new Date();
  const [row] = await db
    .select({ maxPosition: max(todos.position) })
    .from(todos)
    .where(eq(todos.userId, user.id));

  await db.insert(todos).values({
    id: crypto.randomUUID(),
    userId: user.id,
    title: parsed.data.title,
    description: parsed.data.description || null,
    dueDate: parsed.data.dueDate,
    dueTime: parsed.data.dueTime,
    priority: parsed.data.priority,
    completed: false,
    position: (row?.maxPosition ?? -1) + 1,
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath("/");
  return { ok: true };
}

export async function updateTodo(id: string, input: TodoDraft): Promise<Result> {
  const { user } = await requireUser();
  const parsed = parseTodoDraft(input);
  if (!parsed.ok) return parsed;

  const rows = await db
    .update(todos)
    .set({
      title: parsed.data.title,
      description: parsed.data.description || null,
      dueDate: parsed.data.dueDate,
      dueTime: parsed.data.dueTime,
      priority: parsed.data.priority,
      updatedAt: new Date(),
    })
    .where(and(eq(todos.id, id), eq(todos.userId, user.id)))
    .returning({ id: todos.id });

  if (rows.length === 0) return { ok: false, error: "Todo not found." };
  revalidatePath("/");
  return { ok: true };
}

export async function setTodoCompleted(id: string, completed: boolean) {
  const { user } = await requireUser();
  const rows = await db
    .update(todos)
    .set({ completed, updatedAt: new Date() })
    .where(and(eq(todos.id, id), eq(todos.userId, user.id)))
    .returning({ id: todos.id });

  if (rows.length === 0) return { ok: false, error: "Todo not found." };
  revalidatePath("/");
  return { ok: true };
}

export async function deleteTodo(id: string): Promise<Result> {
  const { user } = await requireUser();
  const rows = await db
    .delete(todos)
    .where(and(eq(todos.id, id), eq(todos.userId, user.id)))
    .returning({ id: todos.id });

  if (rows.length === 0) return { ok: false, error: "Todo not found." };
  revalidatePath("/");
  return { ok: true };
}
