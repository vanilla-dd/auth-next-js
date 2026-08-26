import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as authSchema from "@/db/auth-schema";
import * as todoSchema from "@/db/todos";

const dbPath = (process.env.DATABASE_URL ?? "file:./data/app.db").replace(
  /^file:/,
  "",
);

fs.mkdirSync(path.dirname(path.resolve(dbPath)), { recursive: true });

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, {
  schema: { ...authSchema, ...todoSchema },
});
