import { env } from "cloudflare:workers";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/db/sqlite/schema",
	out: "./src/db/migrations/sqlite",
	dialect: "sqlite",
	driver: "d1-http",
	dbCredentials: {
		accountId: env.CLOUDFLARE_ACCOUNT_ID!,
		databaseId: env.CLOUDFLARE_DATABASE_ID!,
		token: env.CLOUDFLARE_D1_TOKEN!,
	},
});
