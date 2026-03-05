import { db } from "@/db";
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { env } from "cloudflare:workers";
import * as schema from "@/db/sqlite/schema";
import {
	ac,
	adminRole,
	driverRole,
	superAdminRole,
	userRole,
} from "./permissions";
import { customVerify } from "./scrypt";
import {
	hashPassword as hashBetterAuthPassword,
	verifyPassword as verifyBetterAuthPassword,
} from "better-auth/crypto";

/** Supports both better-auth default format and our legacy customHash format for backward compatibility */
async function verifyPasswordCompat({
	password,
	hash,
}: {
	password: string;
	hash: string;
}): Promise<boolean> {
	// Better-auth format: "salt:key" (hex)
	if (hash.includes(":")) {
		return verifyBetterAuthPassword({ password, hash });
	}
	// Legacy customHash format (base64)
	return customVerify({ password, hash });
}

const plugins: BetterAuthOptions["plugins"] = [
	admin({
		adminRoles: ["super_admin", "admin"],
		ac,
		roles: { userRole, driverRole, adminRole, superAdminRole },
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
			hash: hashBetterAuthPassword,
			// Verify supports both better-auth format and legacy customHash for backward compatibility
			verify: verifyPasswordCompat,
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
			allowDifferentEmails: true, // Allow linking accounts with different emails
			updateUserInfoOnLink: true, // Update user info when linking
			trustedProviders: ["google"], // Trust Google for automatic linking
		},
	},
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,
	plugins,
	configs,
});
