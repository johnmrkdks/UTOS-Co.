/**
 * Creates a super_admin account via Better Auth signup API, then updates the role.
 * Run with: pnpm create-admin
 *
 * For local dev: Requires dev server (pnpm dev:server) on port 3000.
 * For staging: AUTH_URL=https://down-under-chauffeur-server-staging.downunderchauffeurs.workers.dev pnpm create-admin
 *             Then run the UPDATE in D1 Studio on my-dev-db (see output).
 */

import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin123";
const ADMIN_NAME = "Super Admin";
const AUTH_URL = process.env.AUTH_URL || "http://localhost:3000";
const USE_REMOTE = process.env.REMOTE === "1" || AUTH_URL.includes("workers.dev");

async function createAdmin() {
	console.log("Creating super_admin account...");
	console.log(`Email: ${ADMIN_EMAIL}`);
	console.log(`Auth URL: ${AUTH_URL}`);
	console.log("");

	const signUpRes = await fetch(`${AUTH_URL}/api/auth/sign-up/email`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			name: ADMIN_NAME,
			email: ADMIN_EMAIL,
			password: ADMIN_PASSWORD,
		}),
	});

	if (!signUpRes.ok) {
		const text = await signUpRes.text();
		if (text.includes("already") || text.includes("exists") || signUpRes.status === 409) {
			console.log("User already exists. Updating role to super_admin...");
		} else {
			console.error("Signup failed:", signUpRes.status, text);
			process.exit(1);
		}
	} else {
		console.log("Account created successfully.");
	}

	const escapedEmail = ADMIN_EMAIL.replace(/'/g, "''");
	const updateSql = `UPDATE users SET role = 'super_admin' WHERE email = '${escapedEmail}'`;

	const wranglerEnv = USE_REMOTE ? "staging" : "development";
	const remoteFlag = USE_REMOTE ? "--remote" : "--local";

	console.log("Updating role to super_admin...");
	try {
		execSync(
			`pnpm wrangler d1 execute DB ${remoteFlag} --env ${wranglerEnv} --command "${updateSql.replace(/"/g, '\\"')}"`,
			{
				cwd: join(__dirname, ".."),
				stdio: "inherit",
			}
		);
	} catch {
		if (USE_REMOTE) {
			console.log("");
			console.log("Remote update failed. Run this manually in D1 Studio (my-dev-db):");
			console.log(`  ${updateSql}`);
			console.log("");
		} else {
			throw new Error("Failed to update role");
		}
	}

	console.log("Super admin account ready!");
	console.log(`  Email: ${ADMIN_EMAIL}`);
	console.log(`  Password: ${ADMIN_PASSWORD}`);
}

createAdmin().catch((err) => {
	console.error(err);
	process.exit(1);
});
