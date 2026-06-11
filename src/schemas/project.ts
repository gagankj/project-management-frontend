import { z } from 'zod';

export const projectSchema = z.object({
  name: z
    .string()
    .min(3, 'Project name must be at least 3 characters long')
    .max(55, 'Project name cannot exceed 55 characters'),
  category: z
    .string()
    .min(2, 'Category must be at least 2 characters long')
    .max(30, 'Category cannot exceed 30 characters'),
  members: z.array(z.string()),
});

export const taskSchema = z.object({
  name: z
    .string()
    .min(3, 'Task name must be at least 3 characters long')
    .max(100, 'Task name cannot exceed 100 characters'),
  deadline: z
    .string()
    .min(1, 'Please select a deadline date'),
  assignedTo: z
    .string()
    .min(1, 'Please assign this task to a member'),
});

export type ProjectInput = z.infer<typeof projectSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
