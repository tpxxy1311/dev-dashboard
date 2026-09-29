// src/server/queries/tasks.ts
import 'server-only';
import { asc, desc, eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { tasks } from '@/server/db/schema';
import { requireUser } from '@/server/session';
import type { Task } from '@/types/task';

/**
 * Returns all tasks of the signed-in user: open tasks first, newest first
 * within each group.
 */
export const getTasks = async (): Promise<Task[]> => {
  const user = await requireUser();

  return db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, user.id))
    .orderBy(asc(tasks.done), desc(tasks.createdAt));
};
