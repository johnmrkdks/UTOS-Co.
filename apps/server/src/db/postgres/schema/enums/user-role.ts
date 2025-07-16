import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
	"super_admin",
	"admin",
	"driver",
	"user",
]);
