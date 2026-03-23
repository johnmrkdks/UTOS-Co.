import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { accounts } from "@/db/sqlite/schema";

export const AccountSchema = createSelectSchema(accounts, {
	createdAt: z.union([z.date(), z.string()]),
	accessTokenExpiresAt: z.union([z.date(), z.string()]),
	refreshTokenExpiresAt: z.union([z.date(), z.string()]),
	updatedAt: z.union([z.date(), z.string()]),
}).omit({
	password: true,
});
export const InsertAccountSchema = createInsertSchema(accounts);
export const UpdateAccountSchema = createUpdateSchema(accounts);

export type Account = z.infer<typeof AccountSchema>;
export type InsertAccount = z.infer<typeof InsertAccountSchema>;
export type UpdateAccount = z.infer<typeof UpdateAccountSchema>;
