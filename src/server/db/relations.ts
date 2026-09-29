// src/server/db/relations.ts
// Drizzle-only metadata for `db.query` + `with`. Creates no SQL; the foreign
// keys in the schema files are what the database enforces.
import { defineRelations } from 'drizzle-orm';
import * as schema from './schema';

export const relations = defineRelations(schema, (r) => ({
  user: {
    // A user owns many tasks (resolved via tasks.user below).
    tasks: r.many.tasks(),
    // A user can be signed in on several devices at once.
    sessions: r.many.session(),
    // One account row per linked login provider (currently GitHub).
    accounts: r.many.account(),
  },
  tasks: {
    // Every task belongs to exactly one user.
    user: r.one.user({
      from: r.tasks.userId,
      to: r.user.id,
      optional: false,
    }),
  },
  session: {
    // Every session belongs to exactly one user.
    user: r.one.user({
      from: r.session.userId,
      to: r.user.id,
      optional: false,
    }),
  },
  account: {
    // Every provider account belongs to exactly one user.
    user: r.one.user({
      from: r.account.userId,
      to: r.user.id,
      optional: false,
    }),
  },
}));
