import { type TodoPriority, todoPriorities } from "@/db/todos";

export type Result = { ok: true } | { ok: false; error: string };

export type TodoFilters = {
  q: string;
  status: "all" | "open" | "done";
  priority: "all" | TodoPriority;
};

export type TodoDraft = {
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  priority: string;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

export function defaultDue(now = new Date()) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    dueDate: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
    dueTime: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
  };
}

export function parseTodoFilters(searchParams: {
  q?: string | string[];
  status?: string | string[];
  priority?: string | string[];
}): TodoFilters {
  const one = (value?: string | string[]) =>
    Array.isArray(value) ? value[0] : value;
  const q = one(searchParams.q)?.trim() ?? "";
  const status = one(searchParams.status);
  const priority = one(searchParams.priority);

  return {
    q,
    status: status === "open" || status === "done" ? status : "all",
    priority: todoPriorities.includes(priority as TodoPriority)
      ? (priority as TodoPriority)
      : "all",
  };
}

export function parseTodoDraft(
  input: TodoDraft,
):
  | { ok: true; data: Omit<TodoDraft, "priority"> & { priority: TodoPriority } }
  | { ok: false; error: string } {
  const title = input.title.trim();
  const description = input.description.trim();
  const fallback = defaultDue();
  const dueDate = input.dueDate.trim() || fallback.dueDate;
  const dueTime =
    (input.dueTime.trim().match(/^(\d{2}:\d{2})/)?.[1] ?? "") ||
    fallback.dueTime;
  const priority = input.priority.trim() || "medium";

  if (!title) return { ok: false, error: "Title is required." };
  if (title.length > 200) {
    return { ok: false, error: "Title must be 200 characters or fewer." };
  }
  if (description.length > 2000) {
    return {
      ok: false,
      error: "Description must be 2000 characters or fewer.",
    };
  }
  if (!DATE_RE.test(dueDate))
    return { ok: false, error: "A valid date is required." };
  if (!TIME_RE.test(dueTime))
    return { ok: false, error: "A valid time is required." };
  if (!todoPriorities.includes(priority as TodoPriority)) {
    return { ok: false, error: "Priority must be Low, Medium, or High." };
  }

  return {
    ok: true,
    data: {
      title,
      description,
      dueDate,
      dueTime,
      priority: priority as TodoPriority,
    },
  };
}
