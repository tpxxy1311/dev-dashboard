// src/lib/validations/tasks.ts
import { z } from "zod";

export const taskIdSchema = z.uuid();

const taskTitleSchema = z
  .string()
  .trim()
  .min(1, "Title can't be empty")
  .max(200, "Max. 200 characters");

export const createTaskSchema = z.object({
  title: taskTitleSchema,
});

export const updateTaskSchema = z.object({
  id: taskIdSchema,
  title: taskTitleSchema,
});

export const toggleTaskSchema = z.object({
  id: taskIdSchema,
  done: z.boolean(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ToggleTaskInput = z.infer<typeof toggleTaskSchema>;
