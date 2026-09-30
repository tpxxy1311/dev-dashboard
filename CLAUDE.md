@AGENTS.md

# Dev Dashboard

Personal developer dashboard. Users sign in with GitHub and manage tasks.

## Stack

- Next.js 16 (App Router, `src/proxy.ts` instead of `middleware.ts`), React 19, React Compiler enabled
- Better Auth (GitHub OAuth) with the Drizzle adapter
- Drizzle ORM 1.0 RC + PostgreSQL 17 (Docker)
- Zod for validation
- SCSS with CSS Modules (no Tailwind)

## Commands

```bash
docker compose up -d      # Postgres on localhost:5433
npm run dev               # dev server
npm run lint
npm run format            # Prettier (double quotes), format:check in CI
npm run db:push           # sync the schema to the local database (current workflow)
npm run db:studio         # browse the database
npm run db:generate       # create a migration (not used yet, see below)
npm run db:migrate        # apply migrations (not used yet, see below)
```

Database workflow: while prototyping, schema changes are applied locally with `db:push`, and there are no migration files. Before the first deployment (or once there is data worth keeping), switch to migrations: delete `drizzle/`, run `db:generate` once to create a baseline, then use `db:generate` → `db:migrate` from then on.

Env vars live in `.env.local`: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`. Never print or commit their values.

Ask before running `db:push`, `db:migrate` or anything else that changes the database.

## Structure

```
src/
├── app/
│   ├── (auth)/          # public: login
│   ├── (dashboard)/     # protected app
│   └── api/auth/        # Better Auth handler
├── components/
│   └── widgets/         # dashboard widgets (TaskWidget, TaskList, TaskItem)
├── lib/                 # client-safe code (auth-client)
│   └── validations/     # Zod schemas, shared by client and server
├── server/              # server-only code: auth, db, session
│   ├── actions/         # Server Actions (writes)
│   ├── queries/         # read functions for Server Components
│   └── db/schema/       # Drizzle tables, re-exported from index.ts
├── types/               # shared TS types (Task, ActionResult), type-only imports
├── proxy.ts             # redirects to /login when no session cookie
└── styles/              # all SCSS, see Styling
```

## Auth

- `proxy.ts` only checks that a session cookie exists. It is not a security check.
- Every protected page, server action and query must call `requireUser()` from `@/server/session`. Use `getSession()` only where signed-out users are allowed.
- Always scope task queries by the current user's `id`.

## Server code

- Files in `src/server/` must not be imported from Client Components. New server-only modules start with `import "server-only";`.
- Schema changes go in `src/server/db/schema/`, get exported from its `index.ts`, then `npm run db:push` (ask first).

## Data flow

Three paths, chosen by use case:

1. **Read:** a Server Component calls a function from `server/queries/` directly.
   No HTTP, no fetch.
2. **Write:** a Client Component calls a Server Action from `server/actions/`
   that ends with `revalidatePath()`. Use `useOptimistic` for instant UI feedback.
3. **Load dynamically:** only when the client decides when to load (polling,
   infinite scroll, search-as-you-type). Then Client Component → Route Handler →
   the same function from `queries/`.

Do not build Route Handlers for ordinary reads. Do not use Server Actions for
reading — they run as POST and are not cached.

## Security

The check in the data access layer is the security-relevant layer. `proxy.ts` is
UX only (it merely checks whether a cookie exists) and must never be the sole
protection.

Every function in `queries/`, `actions/` and every Route Handler starts with:

```ts
const user = await requireUser();
```

And every query additionally filters on `userId` — including mutations that take
an ID from the client:

```ts
.where(and(eq(tasks.id, id), eq(tasks.userId, user.id)))
```

Authentication without authorization is not enough.

## Server Actions

- Signature: `(input: unknown) => Promise<ActionResult<T>>`. Actions take a plain
  object, never `FormData`, so they work from forms, `startTransition` and anywhere else.
- Order: `requireUser()` → `schema.safeParse(input)` → query → `revalidatePath()` → return.
  Use only `parsed.data` after validation, never `input`.
- `userId` always comes from `requireUser()`, never from the input.
- Return `ActionResult<T>` from `@/types/action` for expected failures (invalid input,
  not found) instead of throwing. Put Zod field errors in `fieldErrors` via
  `z.flattenError(parsed.error).fieldErrors`.
- Mutations use `.returning()`. An empty result means the row does not exist or
  belongs to someone else: return `{ ok: false, error: "Task not found" }`.

## Client Components

- Forms use `useActionState` with a small adapter inside the component that turns
  `FormData` into the object the action expects.
- `useOptimistic` lives in the list component (e.g. `TaskList`), with a reducer over a
  discriminated union (`{ type: "add" | "toggle" | "delete", … }`). Optimistic calls
  outside `useActionState` go inside `startTransition`.
- Items (e.g. `TaskItem`) are presentational: they get data and callbacks as props
  and hold no server state.
- Optimistic rows get a temporary `crypto.randomUUID()` id and `pending: true`;
  disable actions on them until the real row arrives.
- Row types come from Drizzle `$inferSelect` in `src/types/` and are imported with
  `import type`, so Client Components can use them without pulling in server code.
- UI text is English.

## Conventions

- Server files start with `import "server-only"`.
- Zod schemas live in `lib/validations/`, since both client and server use them.
- Own tables: `timestamp(..., { withTimezone: true })`. The generated auth tables
  stay untouched.
- Column names snake_case in the DB, camelCase in the TypeScript object.
- No manual `useMemo` / `useCallback` / `React.memo` — the React Compiler handles it.
- The foreign key to `user.id` is **`text`**, not `uuid`.

## Styling

- Styles live in `src/styles/`, not next to the components.
  - `abstracts/`: variables, breakpoints and mixins. Must not output CSS.
  - `base/`: global CSS (reset, `:root` tokens, typography). Loaded only via `main.scss`, which is imported once in `src/app/layout.tsx`.
  - `layout/`: CSS Modules for the page frame (app, dashboard, auth, sidebar, header).
  - `components/`: CSS Modules for reusable components, mirroring `src/components/` (e.g. `components/widgets/tasks/TaskList.module.scss`, loaded with `@use "../../../abstracts" as *;`).
- Partials (only loaded via `@use`) start with `_`. Files imported from TSX end in `.module.scss` and have no `_`.
- Name modules after their component: `Sidebar.tsx` uses `styles/layout/Sidebar.module.scss`.
- In modules, load tools with `@use "../abstracts" as *;`. Use `@use`/`@forward`, never `@import`.
- Write CSS mobile-first: base styles for small screens, then `@include up("md")`. Use `down()` only for small-screen-only exceptions.
- Colors are semantic CSS custom properties from `base/_root.scss` (`--color-bg`, `--color-text`, `--color-accent`). Never hard-code colors in modules. Dark mode uses `prefers-color-scheme` and `[data-theme="dark"]`, with the dark values in the `dark-colors` mixin.
- Fonts come from `next/font/google` in the root layout: Be Vietnam Pro for body text (`--font-body`, only weights 300/400/500/700 are loaded), Doto for h1–h3 (`--font-display`, with `font-variation-settings: "ROND" 100`).
- Section comments in SCSS use the style `//Title Case Label` (no space, no numbering).
