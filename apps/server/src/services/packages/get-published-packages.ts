import { env } from "cloudflare:workers";
import { getPublishedPackages } from "@/data/packages/get-published-packages";
import type { DB } from "@/db";
import type { ResourceList } from "@/utils/query/resource-list";
import { toProxyImageUrl } from "@/utils/image-url";

export async function getPublishedPackagesService(db: DB, params: ResourceList) {
	const result = await getPublishedPackages(db, params);
	const baseUrl = env.BETTER_AUTH_URL?.replace(/\/$/, "") || "";
	if (baseUrl && result?.data) {
		result.data = result.data.map((pkg: any) => ({
			...pkg,
			bannerImageUrl: toProxyImageUrl(pkg.bannerImageUrl, baseUrl) ?? pkg.bannerImageUrl,
		}));
	}
	return result;
}