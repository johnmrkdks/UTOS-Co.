import { z } from "zod";
import type { DB } from "@/db";
import { accounts } from "@/db/sqlite/schema";
import { eq } from "drizzle-orm";

export const GetUserAccountsServiceSchema = z.object({
	userId: z.string(),
});

export type GetUserAccountsServiceInput = z.infer<typeof GetUserAccountsServiceSchema>;

export const getUserAccountsService = async (
	db: DB,
	input: GetUserAccountsServiceInput,
) => {
	try {
		console.log("=== DEBUG: Starting getUserAccountsService ===");
		console.log("Input data:", JSON.stringify(input, null, 2));

		// Get all accounts for the user
		console.log("DEBUG: Fetching accounts for user:", input.userId);
		const userAccounts = await db
			.select({
				id: accounts.id,
				accountId: accounts.accountId,
				providerId: accounts.providerId,
				userId: accounts.userId,
				createdAt: accounts.createdAt,
				updatedAt: accounts.updatedAt,
			})
			.from(accounts)
			.where(eq(accounts.userId, input.userId));

		console.log("DEBUG: Found accounts:", userAccounts.length);
		console.log("DEBUG: Accounts data:", JSON.stringify(userAccounts, null, 2));

		// Process accounts to determine what methods are available
		const hasGoogleAccount = userAccounts.some(account => account.providerId === 'google');
		const hasPasswordAccount = userAccounts.some(account => account.providerId === 'credential');

		console.log("DEBUG: hasGoogleAccount:", hasGoogleAccount);
		console.log("DEBUG: hasPasswordAccount:", hasPasswordAccount);

		console.log("=== DEBUG: getUserAccountsService completed successfully ===");
		return {
			success: true,
			accounts: userAccounts,
			accountInfo: {
				hasGoogleAccount,
				hasPasswordAccount,
			},
		};
	} catch (error) {
		console.error("=== ERROR in getUserAccountsService ===");
		console.error("Error type:", typeof error);
		console.error("Error name:", error instanceof Error ? error.name : "Unknown");
		console.error("Error message:", error instanceof Error ? error.message : error);
		console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
		console.error("Full error object:", error);
		console.error("=== END ERROR LOG ===");
		throw error;
	}
};