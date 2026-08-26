# Todos

A small Next.js App Router todo app with **Better Auth** (email/password) and **SQLite via Drizzle**. Each user’s todos are isolated by `userId` on every query and mutation.

## Local setup

Requires [Bun](https://bun.sh) (this repo pins `packageManager: bun@1.4.0`).

```bash
bun install
bun run setup
```

`bun run setup` copies `.env.example` to `.env.local` if you don’t already have one. The example file includes a dev-only `BETTER_AUTH_SECRET` so you can start immediately; change it before any real deployment.

**Before the first `bun dev`, create the database and seed the demo user:**

```bash
bun run db:push
bun run db:seed
```

Then start the app:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in with the demo account:

- Email: `demo@example.com`
- Password: `demo1234`

The sign-in form is prefilled with those values. You can also create a new account at `/sign-up`.

If Next.js picks another port (e.g. 3001), set `BETTER_AUTH_URL` in `.env.local` to match, e.g. `http://localhost:3001`.

## Environment variables

| Name | Purpose |
| --- | --- |
| `BETTER_AUTH_SECRET` | Auth encryption/signing secret (never commit a production value) |
| `BETTER_AUTH_URL` | Public origin, e.g. `http://localhost:3000` |
| `DATABASE_URL` | SQLite path, e.g. `file:./data/app.db` |

## Layout

```
src/app            routes
src/components     auth + todos UI
src/db             SQLite, schema, seed
src/lib            auth, session, todo actions
```

- **Auth:** Better Auth with the Drizzle SQLite adapter, HTTP-only session cookies, cookie cache, database-backed rate limits on sign-in/sign-up, and `nextCookies()` so cookies work from Server Actions. Pages and mutations still call `auth.api.getSession`; `src/proxy.ts` only does an optimistic cookie check for redirects.
- **Data:** `todos.userId` references `user.id` with `ON DELETE CASCADE`. List/update always include `eq(todos.userId, session.user.id)`.
- **UI:** Server-rendered list plus client forms. Search, status, and priority are query params.

## Trade-offs

- SQLite is enough for the assignment and local demo; Postgres would be a better production default.
- Email verification and password reset are omitted to keep the scope to the brief.
- Completing or changing priority is a server action (no optimistic cache layer).
