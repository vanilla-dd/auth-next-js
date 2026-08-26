import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { account, user } from "@/db/auth-schema";
import { todos } from "@/db/todos";
import { auth } from "@/lib/auth";
import { DEMO_USER } from "@/lib/auth-schemas";
import { defaultDue } from "@/lib/todo";

async function ensureDemoUserId() {
  const [existing] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, DEMO_USER.email))
    .limit(1);

  if (existing) {
    const [credentialAccount] = await db
      .select({ issuer: account.issuer })
      .from(account)
      .where(
        and(
          eq(account.userId, existing.id),
          eq(account.providerId, "credential"),
        ),
      )
      .limit(1);

    if (credentialAccount?.issuer) {
      return existing.id;
    }

    await db.delete(user).where(eq(user.id, existing.id));
  }

  const result = await auth.api.signUpEmail({
    body: {
      name: DEMO_USER.name,
      email: DEMO_USER.email,
      password: DEMO_USER.password,
    },
  });

  if (!result.user) {
    throw new Error("Demo user sign-up did not return a user");
  }

  return result.user.id;
}

export async function seedDemoUser() {
  const userId = await ensureDemoUserId();

  const [existingTodo] = await db
    .select({ id: todos.id })
    .from(todos)
    .where(eq(todos.userId, userId))
    .limit(1);

  if (existingTodo) return userId;

  const now = new Date();
  const due = defaultDue();
  await db.insert(todos).values([
    {
      id: crypto.randomUUID(),
      userId,
      title: "Review the assignment",
      description: "Check auth isolation, search, and filters.",
      dueDate: due.dueDate,
      dueTime: due.dueTime,
      priority: "high",
      completed: false,
      position: 0,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      userId,
      title: "Try creating a todo",
      description: "Title and description are enough; date defaults to now.",
      dueDate: due.dueDate,
      dueTime: due.dueTime,
      priority: "medium",
      completed: false,
      position: 1,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  return userId;
}

if (process.argv[1]?.endsWith("seed.ts")) {
  seedDemoUser().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
