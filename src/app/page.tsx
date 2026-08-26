import { CheckSquareIcon } from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { CreateTodoDialog } from "@/components/todos/create-dialog";
import { TodoFilters } from "@/components/todos/filters";
import { TodoList } from "@/components/todos/list";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { requireUser } from "@/lib/session";
import { parseTodoFilters } from "@/lib/todo";
import { listTodos } from "@/lib/todo-actions";

export default async function Home({ searchParams }: PageProps<"/">) {
  const session = await requireUser();
  const filters = parseTodoFilters(await searchParams);
  const items = await listTodos(filters);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Todos
          </h1>
          <p className="text-sm text-muted-foreground">
            Signed in as {session.user.email}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CreateTodoDialog />
          <SignOutButton />
        </div>
      </header>
      <TodoFilters {...filters} />
      {items.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CheckSquareIcon />
            </EmptyMedia>
            <EmptyTitle>
              {filters.q ? "No matching todos" : "No todos yet"}
            </EmptyTitle>
            <EmptyDescription>
              {filters.q
                ? "Try a different search or clear the filters."
                : "Create a todo with a title or description. Date and time default to now."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-3">
          <Badge variant="secondary">{items.length} shown</Badge>
          <TodoList todos={items} />
        </div>
      )}
    </div>
  );
}
