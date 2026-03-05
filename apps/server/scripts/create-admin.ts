/**
 * Creates an admin account via Better Auth signup API, then updates the role.
 * Run with: pnpm create-admin
 * Requires the dev server to be running (pnpm dev) on port 3000.
 */

import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin123";
const ADMIN_NAME = "Admin";
const AUTH_URL = process.env.AUTH_URL || "http://localhost:3000";

async function createAdmin() {
	console.log("Creating admin account...");
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
			console.log("User already exists. Updating role to admin...");
		} else {
			console.error("Signup failed:", signUpRes.status, text);
			process.exit(1);
		}
	} else {
		console.log("Account created successfully.");
	}

	console.log("Updating role to admin...");
	const escapedEmail = ADMIN_EMAIL.replace(/'/g, "''");
	execSync(
		`pnpm wrangler d1 execute DB --local --env development --command "UPDATE users SET role = 'admin' WHERE email = '${escapedEmail}'"`,
		{
			cwd: join(__dirname, ".."),
			stdio: "inherit",
		}
	);
	console.log("");
	console.log("Admin account ready!");
	console.log(`  Email: ${ADMIN_EMAIL}`);
	console.log(`  Password: ${ADMIN_PASSWORD}`);
}

createAdmin().catch((err) => {
	console.error(err);
	process.exit(1);
});
