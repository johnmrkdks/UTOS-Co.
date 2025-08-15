import type { DB } from "@/db";
import type { InsertPackage } from "@/schemas/shared";
import { packages } from "@/db/schema";

type CreatePackageParams = InsertPackage;

export async function createPackage(db: DB, params: CreatePackageParams) {
	console.log("🗄️ createPackage - Database insertion starting");
	console.log("📋 Insert params:", JSON.stringify(params, null, 2));
	
	try {
		const [record] = await db.insert(packages).values(params).returning();
		console.log("✅ Database record created:", JSON.stringify(record, null, 2));
		return record;
	} catch (error) {
		console.error("❌ Database insertion error:", error);
		console.error("📊 Error details:", {
			message: error instanceof Error ? error.message : 'Unknown error',
			params: JSON.stringify(params, null, 2)
		});
		throw error;
	}
}
