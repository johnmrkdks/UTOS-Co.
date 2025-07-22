import { verifications } from "@/db/sqlite/schema";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

export const VerificationSchema = createSelectSchema(verifications, {
	createdAt: z.union([z.date(), z.string()]),
	updatedAt: z.union([z.date(), z.string()]),
	expiresAt: z.union([z.date(), z.string()]),
});
export const InsertVerificationSchema = createInsertSchema(verifications);
export const UpdateVerificationSchema = createUpdateSchema(verifications);

export type Verification = z.infer<typeof VerificationSchema>;
export type InsertVerification = z.infer<typeof InsertVerificationSchema>;
export type UpdateVerification = z.infer<typeof UpdateVerificationSchema>;
