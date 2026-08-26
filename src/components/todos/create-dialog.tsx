"use client";

import { PlusIcon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { Todo } from "@/db/todos";
import { defaultDue } from "@/lib/todo";
import { createTodo, updateTodo } from "@/lib/todo-actions";

export function CreateTodoDialog() {
  return (
    <TodoFormDialog>
      <DialogTrigger render={<Button />}>
        <PlusIcon data-icon="inline-start" />
        New todo
      </DialogTrigger>
    </TodoFormDialog>
  );
}

export function TodoFormDialog({
  children,
  onOpenChange,
  open,
  todo = null,
}: {
  children?: ReactNode;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  todo?: Todo | null;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priority, setPriority] = useState<string[]>([
    todo?.priority ?? "medium",
  ]);
  const [due, setDue] = useState(() =>
    todo
      ? { dueDate: todo.dueDate, dueTime: todo.dueTime.slice(0, 5) }
      : defaultDue(),
  );

  useEffect(() => {
    if (!isOpen) return;
    if (todo) {
      setDue({ dueDate: todo.dueDate, dueTime: todo.dueTime.slice(0, 5) });
      setPriority([todo.priority]);
    } else {
      setDue(defaultDue());
      setPriority(["medium"]);
    }
    setError(null);
  }, [isOpen, todo]);

  async function onSubmit(formData: FormData) {
    setError(null);
    setPending(true);
    const draft = {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      dueDate: String(formData.get("dueDate") ?? due.dueDate),
      dueTime: String(formData.get("dueTime") ?? due.dueTime),
      priority: priority[0] ?? "medium",
    };
    try {
      const result = todo
        ? await updateTodo(todo.id, draft)
        : await createTodo(draft);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast.success(todo ? "Todo updated" : "Todo created");
      setOpen(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog onOpenChange={setOpen} open={isOpen}>
      {children}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{todo ? "Edit todo" : "New todo"}</DialogTitle>
          <DialogDescription>
            {todo
              ? "Update the fields and save."
              : "Title is required. Date and time default to now if you leave them."}
          </DialogDescription>
        </DialogHeader>
        <form
          action={onSubmit}
          className="flex flex-col gap-4"
          key={`${todo?.id ?? "new"}-${isOpen}`}
        >
          <FieldGroup>
            <Field data-invalid={error ? true : undefined}>
              <FieldLabel htmlFor="todo-title">Title</FieldLabel>
              <Input
                defaultValue={todo?.title ?? ""}
                id="todo-title"
                maxLength={200}
                name="title"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="todo-description">Description</FieldLabel>
              <Textarea
                defaultValue={todo?.description ?? ""}
                id="todo-description"
                maxLength={2000}
                name="description"
                rows={3}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="todo-due-date">Date</FieldLabel>
                <Input
                  defaultValue={due.dueDate}
                  id="todo-due-date"
                  name="dueDate"
                  type="date"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="todo-due-time">Time</FieldLabel>
                <Input
                  defaultValue={due.dueTime}
                  id="todo-due-time"
                  name="dueTime"
                  type="time"
                />
              </Field>
            </div>
            <Field>
              <FieldLabel>Priority</FieldLabel>
              <ToggleGroup
                className="w-full"
                onValueChange={(next) => {
                  if (next.length > 0) setPriority(next);
                }}
                spacing={0}
                value={priority}
              >
                <ToggleGroupItem className="flex-1" value="low">
                  Low
                </ToggleGroupItem>
                <ToggleGroupItem className="flex-1" value="medium">
                  Medium
                </ToggleGroupItem>
                <ToggleGroupItem className="flex-1" value="high">
                  High
                </ToggleGroupItem>
              </ToggleGroup>
            </Field>
            {error ? <FieldError>{error}</FieldError> : null}
          </FieldGroup>
          <DialogFooter>
            <Button disabled={pending} type="submit">
              {pending ? <Spinner data-icon="inline-start" /> : null}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
