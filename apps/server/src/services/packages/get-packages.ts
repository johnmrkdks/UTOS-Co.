import { env } from "cloudflare:workers";
import { getPackages } from "@/data/packages/get-packages";
import type { DB } from "@/db";
import { toProxyImageUrl } from "@/utils/image-url";
import type { ResourceList } from "@/utils/query/resource-list";

export async function getPackagesService(db: DB, params: ResourceList) {
	const result = await getPackages(db, params);
	const baseUrl = env.BETTER_AUTH_URL?.replace(/\/$/, "") || "";
	if (baseUrl && result?.data) {
		result.data = result.data.map((pkg: any) => ({
			...pkg,
			bannerImageUrl:
				toProxyImageUrl(pkg.bannerImageUrl, baseUrl) ?? pkg.bannerImageUrl,
		}));
	}
	return result;
}
