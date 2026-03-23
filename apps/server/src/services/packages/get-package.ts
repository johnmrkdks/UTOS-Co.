import { env } from "cloudflare:workers";
import { z } from "zod";
import { getPackageById } from "@/data/packages/get-package-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import { toProxyImageUrl } from "@/utils/image-url";

export const GetPackageServiceSchema = z.object({
	id: z.string(),
});

export type GetPackageByIdParams = z.infer<typeof GetPackageServiceSchema>;

export async function getPackageService(db: DB, { id }: GetPackageByIdParams) {
	const packageItem = await getPackageById(db, id);

	if (!packageItem) {
		throw ErrorFactory.notFound("Package not found.");
	}

	const baseUrl = env.BETTER_AUTH_URL?.replace(/\/$/, "") || "";
	if (baseUrl && (packageItem as any).bannerImageUrl) {
		(packageItem as any).bannerImageUrl =
			toProxyImageUrl((packageItem as any).bannerImageUrl, baseUrl) ??
			(packageItem as any).bannerImageUrl;
	}

	return packageItem;
}
