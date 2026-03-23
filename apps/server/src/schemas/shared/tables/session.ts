import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { sessions } from "@/db/sqlite/schema";

export const SessionSchema = createSelectSchema(sessions, {
	createdAt: z.union([z.date(), z.string()]),
	updatedAt: z.union([z.date(), z.string()]),
	expiresAt: z.union([z.date(), z.string()]),
});
export const InsertSessionSchema = createInsertSchema(sessions);
export const UpdateSessionSchema = createUpdateSchema(sessions);

export type Session = z.infer<typeof SessionSchema>;
export type InsertSession = z.infer<typeof InsertSessionSchema>;
export type UpdateSession = z.infer<typeof UpdateSessionSchema>;
