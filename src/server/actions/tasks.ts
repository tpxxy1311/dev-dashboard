// src/server/actions/tasks.ts
'use server';

import 'server-only';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/server/db';
import { tasks } from '@/server/db/schema';
import { requireUser } from '@/server/session';
import { createTaskSchema, updateTaskSchema } from '@/lib/validations/tasks';
import type { ActionResult } from '@/types/action';
import type { Task } from '@/types/task';

/**
 * Creates a task for the signed-in user. `input` is `unknown` on purpose:
 * Server Actions are public POST endpoints, so everything is validated here.
 */
export const createTask = async (input: unknown): Promise<ActionResult<Task>> => {
  const user = await requireUser();

  const parsed = createTaskSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Invalid input',
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  // userId always comes from the session, never from the client.
  const [task] = await db
    .insert(tasks)
    .values({ title: parsed.data.title, userId: user.id })
    .returning();

  revalidatePath('/');
  return { ok: true, data: task };
};

/**
 * Renames a task. Filters on id AND userId, so a task id belonging to another
 * user matches no row and is reported as not found.
 */
export const updateTask = async (input: unknown): Promise<ActionResult<Task>> => {
  const user = await requireUser();

  const parsed = updateTaskSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Invalid input',
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const [task] = await db
    .update(tasks)
    .set({ title: parsed.data.title })
    .where(and(eq(tasks.id, parsed.data.id), eq(tasks.userId, user.id)))
    .returning();

  if (!task) return { ok: false, error: 'Task not found' };

  revalidatePath('/');
  return { ok: true, data: task };
};
