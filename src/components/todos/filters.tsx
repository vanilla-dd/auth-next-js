"use client";

import { SearchIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TodoFilters as FilterState } from "@/lib/todo";

const STATUS_OPTIONS = [
  { label: "All statuses", value: "all" },
  { label: "Open", value: "open" },
  { label: "Done", value: "done" },
] as const;

const PRIORITY_OPTIONS = [
  { label: "All priorities", value: "all" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
] as const;

function hrefFor(pathname: string, next: FilterState) {
  const params = new URLSearchParams();
  const q = next.q.trim();
  if (q) params.set("q", q);
  if (next.status !== "all") params.set("status", next.status);
  if (next.priority !== "all") params.set("priority", next.priority);
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function TodoFilters({ q, status, priority }: FilterState) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(q);

  useEffect(() => {
    setQuery(q);
  }, [q]);

  function apply(next: FilterState) {
    startTransition(() => {
      router.replace(hrefFor(pathname, next));
    });
  }

  useEffect(() => {
    if (query === q) return;
    const timeout = window.setTimeout(() => {
      apply({ q: query, status, priority });
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [query, q, status, priority, pathname]);

  return (
    <div
      aria-busy={isPending}
      className="flex items-center gap-2"
    >
      <Field className="min-w-0 flex-1">
        <FieldLabel className="sr-only" htmlFor="q">
          Search
        </FieldLabel>
        <InputGroup className="w-full">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            id="q"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title or description"
            value={query}
          />
        </InputGroup>
      </Field>
      <FilterSelect
        items={STATUS_OPTIONS}
        label="Status"
        onValueChange={(value) => apply({ q: query, status: value, priority })}
        value={status}
      />
      <FilterSelect
        items={PRIORITY_OPTIONS}
        label="Priority"
        onValueChange={(value) => apply({ q: query, status, priority: value })}
        value={priority}
      />
    </div>
  );
}

function FilterSelect<T extends string>({
  label,
  items,
  value,
  onValueChange,
}: {
  label: string;
  items: readonly { label: string; value: T }[];
  value: T;
  onValueChange: (value: T) => void;
}) {
  const id = label.toLowerCase();

  return (
    <Field className="w-40 shrink-0">
      <FieldLabel className="sr-only" htmlFor={id}>
        {label}
      </FieldLabel>
      <Select
        items={[...items]}
        onValueChange={(next) => {
          if (typeof next === "string") onValueChange(next as T);
        }}
        value={value}
      >
        <SelectTrigger className="w-full" id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          <SelectGroup>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}
