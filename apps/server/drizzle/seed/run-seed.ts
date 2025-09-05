import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/http";
import * as schema from "../../src/db/sqlite/schema";
import seed from "./seed";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// This script runs the seeder against your D1 database
async function runSeed() {
	console.log("🚀 Initializing seeder...");

	// Check for required environment variables
	const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
	const databaseId = process.env.CLOUDFLARE_DATABASE_ID;
	const token = process.env.CLOUDFLARE_D1_TOKEN;

	if (!accountId || !databaseId || !token) {
		console.error("❌ Missing required environment variables:");
		console.error("- CLOUDFLARE_ACCOUNT_ID");
		console.error("- CLOUDFLARE_DATABASE_ID");
		console.error("- CLOUDFLARE_D1_TOKEN");
		console.log("\nPlease add these to your .env file");
		process.exit(1);
	}

	// Create D1 HTTP client
	const client = createClient({
		url: `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
		authToken: token,
	});

	// Create Drizzle instance with D1 HTTP client
	const db = drizzle(client, { schema });

	try {
		await seed(db);
		console.log("🎉 Seeding completed successfully!");
		process.exit(0);
	} catch (error) {
		console.error("💥 Seeding failed:", error);
		console.error(error);
		process.exit(1);
	}
}

if (import.meta.url === `file://${process.argv[1]}`) {
	runSeed();
}

export default runSeed;
