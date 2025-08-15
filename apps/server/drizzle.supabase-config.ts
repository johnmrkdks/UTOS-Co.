import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/db/postres/schema",
	out: "./drizzle/migrations/postgres",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.SUPABASE_DB_URI!,
	},
});
