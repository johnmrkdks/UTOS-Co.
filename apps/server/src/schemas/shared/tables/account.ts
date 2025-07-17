import { accounts } from "@/db/sqlite/schema";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

export const AccountSchema = createSelectSchema(accounts).omit({
	password: true,
});
export const InsertAccountSchema = createInsertSchema(accounts);
export const UpdateAccountSchema = createUpdateSchema(accounts);

export type Account = z.infer<typeof AccountSchema>;
export type InsertAccount = z.infer<typeof InsertAccountSchema>;
export type UpdateAccount = z.infer<typeof UpdateAccountSchema>;
