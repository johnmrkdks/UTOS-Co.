import { db } from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { env } from "cloudflare:workers";
import * as schema from "../db/schema";
import { UserRoleEnum } from "@/db/enums";

const plugins = [
	admin({
		adminRoles: ["ADMIN", "SUPER_ADMIN"],
	}),
];

const configs = {
	user: {
		modelName: "users",
		fields: {
			role: UserRoleEnum,
		},
	},
	account: {
		modelName: "accounts",
	},
	session: {
		modelName: "sessions",
	},
	verification: {
		modelName: "verifications",
	},
};

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "sqlite",
		usePlural: true,
		schema: {
			...schema,
			users: schema.users,
			sessions: schema.sessions,
			verifications: schema.verifications,
			accounts: schema.accounts,
		},
	}),
	trustedOrigins: [env.CORS_ORIGIN],
	emailAndPassword: {
		enabled: true,
	},
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,
	plugins,
	configs,
});
