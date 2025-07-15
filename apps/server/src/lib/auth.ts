import { db } from "@/db";
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { env } from "cloudflare:workers";
import * as schema from "@/db/schema";
import { UserRoleEnum } from "@/db/enums";
import {
	ac,
	adminRole,
	driverRole,
	superAdminRole,
	userRole,
} from "./permissions";

const plugins: BetterAuthOptions["plugins"] = [
	admin({
		adminRoles: ["super_admin", "admin"],
		ac,
		roles: { userRole, driverRole, adminRole, superAdminRole },
	}),
];

const configs = {};

console.log(env.BETTER_AUTH_URL);

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "sqlite",
		schema,
		usePlural: true,
	}),
	trustedOrigins: [env.CORS_ORIGIN],
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		},
	},
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,
	plugins,
	configs,
});
