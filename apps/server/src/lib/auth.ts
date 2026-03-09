import { db } from "@/db";
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import * as schema from "@/db/sqlite/schema";
import {
	ac,
	adminRole,
	driverRole,
	superAdminRole,
	userRole,
} from "./permissions";
import { hashPasswordPbkdf2, verifyPasswordPbkdf2 } from "./pbkdf2-password";
import { customVerify } from "./scrypt";
import { verifyPassword as verifyBetterAuthPassword } from "better-auth/crypto";

/** Supports PBKDF2 (Workers-friendly), better-auth scrypt, and legacy customHash for backward compatibility */
async function verifyPasswordCompat({
	password,
	hash,
}: {
	password: string;
	hash: string;
}): Promise<boolean> {
	// PBKDF2 format (fast, stays within Workers free tier CPU limit)
	if (hash.startsWith("pbkdf2$")) {
		return verifyPasswordPbkdf2({ password, hash });
	}
	// Better-auth format: "salt:key" (hex, scrypt - may exceed CPU on free tier)
	if (hash.includes(":")) {
		return verifyBetterAuthPassword({ password, hash });
	}
	// Legacy customHash format (base64, scrypt)
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
	hooks: {
		after: createAuthMiddleware(async (ctx) => {
			// Ensure new users get role "user" so dashboard loads (Better Auth admin plugin doesn't set default on sign-up)
			const newSession = ctx.context.newSession;
			if (newSession?.user) {
				const user = newSession.user;
				if (!user.role) {
					await db
						.update(schema.users)
						.set({ role: "user" })
						.where(eq(schema.users.id, user.id));
				}
			}
		}),
	},
	trustedOrigins: [
		...(env.CORS_ORIGIN || "").split(",").map((o) => o.trim()).filter(Boolean),
		env.BETTER_AUTH_URL || "",
		"https://*.downunderchauffeurs.workers.dev",
	].filter(Boolean),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false, // Allow login without verification, but encourage verification
		password: {
			hash: hashPasswordPbkdf2,
			// Verify: PBKDF2 (fast), better-auth scrypt, legacy customHash
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
	advanced: {
		// Safari ITP: share cookies across subdomains so email/password login works on Safari iOS
		// Only when API is on workers.dev or production domain (not localhost)
		...(env.BETTER_AUTH_URL && !env.BETTER_AUTH_URL.includes("localhost") && {
			crossSubDomainCookies: {
				enabled: true,
				domain:
					env.COOKIE_DOMAIN ||
					(env.BETTER_AUTH_URL.includes("workers.dev") ? "downunderchauffeurs.workers.dev" : "downunderchauffeurs.com"),
			},
			useSecureCookies: true,
		}),
		// In development, relax CSRF for cross-origin
		...(env.NODE_ENV === "development" && { disableCSRFCheck: true }),
	},
});
