import { users } from "@/db/schema";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

export const UserSchema = createSelectSchema(users, {
	banExpires: z.union([z.date(), z.string()]),
	createdAt: z.union([z.date(), z.string()]),
	updatedAt: z.union([z.date(), z.string()]),
});
export const InsertUserSchema = createInsertSchema(users);
export const UpdateUserSchema = createUpdateSchema(users);

export type User = z.infer<typeof UserSchema>;
export type InsertUser = z.infer<typeof InsertUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
