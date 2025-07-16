import { sessions } from "@/db/sqlite/schema";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

export const SessionSchema = createSelectSchema(sessions);
export const InsertSessionSchema = createInsertSchema(sessions);
export const UpdateSessionSchema = createUpdateSchema(sessions);

export type Session = z.infer<typeof SessionSchema>;
export type InsertSession = z.infer<typeof InsertSessionSchema>;
export type UpdateSession = z.infer<typeof UpdateSessionSchema>;
