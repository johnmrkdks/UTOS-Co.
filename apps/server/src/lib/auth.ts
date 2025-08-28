import { db } from "@/db";
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, anonymous } from "better-auth/plugins";
import { env } from "cloudflare:workers";
import * as schema from "@/db/sqlite/schema";
import {
	ac,
	adminRole,
	driverRole,
	superAdminRole,
	userRole,
} from "./permissions";
import { customHash, customVerify } from "./scrypt";

const plugins: BetterAuthOptions["plugins"] = [
	admin({
		adminRoles: ["super_admin", "admin"],
		ac,
		roles: { userRole, driverRole, adminRole, superAdminRole },
	}),
	anonymous({
		emailDomainName: "downunderchauffeur.com"
	}),
];

const configs = {};

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "sqlite",
		schema,
		usePlural: true,
	}),
	trustedOrigins: [env.CORS_ORIGIN],
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false, // Allow login without verification, but encourage verification
		password: {
			hash: customHash,
			verify: customVerify,
		},
	},
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
		},
	},
	account: {
		accountLinking: {
			enabled: true,
		},
	},
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,
	plugins,
	configs,
});
