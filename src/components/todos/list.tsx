"use client";

import { PencilIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { TodoFormDialog } from "@/components/todos/create-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { Todo } from "@/db/todos";
import { deleteTodo, setTodoCompleted } from "@/lib/todo-actions";
import { cn } from "@/lib/utils";

const PRIORITY_LABEL = {
  low: "Low",
  medium: "Medium",
  high: "High",
} as const;

export function TodoList({ todos }: { todos: Todo[] }) {
  const [editing, setEditing] = useState<Todo | null>(null);

  return (
    <>
      <ul className="flex flex-col gap-3">
        {todos.map((todo) => (
          <li
            className="rounded-xl border bg-card text-card-foreground"
            key={todo.id}
          >
            <TodoRow onEdit={() => setEditing(todo)} todo={todo} />
          </li>
        ))}
      </ul>
      <TodoFormDialog
        onOpenChange={(next) => {
          if (!next) setEditing(null);
        }}
        open={editing !== null}
        todo={editing}
      />
    </>
  );
}

function TodoRow({
  onEdit,
  todo,
}: {
  onEdit: () => void;
  todo: Todo;
}) {
  const [pending, setPending] = useState(false);

  async function onCompletedChange(checked: boolean) {
    setPending(true);
    try {
      const result = await setTodoCompleted(todo.id, checked);
      if (!result.ok) toast.error(result.error);
    } finally {
      setPending(false);
    }
  }

  async function onDelete() {
    setPending(true);
    try {
      const result = await deleteTodo(todo.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Todo deleted");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-start gap-2 p-4">
      <Checkbox
        aria-label={`Mark ${todo.title} complete`}
        checked={todo.completed}
        className="mt-1"
        disabled={pending}
        onCheckedChange={(checked) => onCompletedChange(checked === true)}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p
          className={cn(
            "min-w-0 truncate",
            todo.completed
              ? "font-medium text-muted-foreground line-through"
              : "font-medium",
          )}
        >
          {todo.title}
        </p>
        {todo.description ? (
          <p className="text-sm text-muted-foreground">{todo.description}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>
            Due {todo.dueDate} at {todo.dueTime.slice(0, 5)}
          </span>
          <Badge variant="secondary">{PRIORITY_LABEL[todo.priority]}</Badge>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Button
          aria-label={`Edit ${todo.title}`}
          onClick={onEdit}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <PencilIcon data-icon="inline-start" />
        </Button>
        <Button
          aria-label={`Delete ${todo.title}`}
          disabled={pending}
          onClick={onDelete}
          size="icon-sm"
          type="button"
          variant="destructive"
        >
          <TrashIcon data-icon="inline-start" />
        </Button>
      </div>
    </div>
  );
}
