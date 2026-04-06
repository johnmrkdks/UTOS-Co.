import { env } from "cloudflare:workers";
import { z } from "zod";
import {
	getSyntheticHourlyTemplatePackageRow,
	SYSTEM_HOURLY_TEMPLATE_PACKAGE_ID,
} from "@/constants/system-hourly-template";
import { getPackageById } from "@/data/packages/get-package-by-id";
import type { DB } from "@/db";
import { ErrorFactory } from "@/utils/error-factory";
import { toProxyImageUrl } from "@/utils/image-url";

export const GetPackageServiceSchema = z.object({
	id: z.string(),
});

export type GetPackageByIdParams = z.infer<typeof GetPackageServiceSchema>;

export async function getPackageService(db: DB, { id }: GetPackageByIdParams) {
	const packageItem =
		id === SYSTEM_HOURLY_TEMPLATE_PACKAGE_ID
			? ((await getPackageById(db, id)) ??
				getSyntheticHourlyTemplatePackageRow())
			: await getPackageById(db, id);

	if (!packageItem) {
		throw ErrorFactory.notFound("Package not found.");
	}

	const baseUrl = env.BETTER_AUTH_URL?.replace(/\/$/, "") || "";
	if (baseUrl && (packageItem as any).bannerImageUrl) {
		(packageItem as any).bannerImageUrl =
			toProxyImageUrl((packageItem as any).bannerImageUrl, baseUrl) ??
			(packageItem as any).bannerImageUrl;
	}

	// Instant quote / vehicle hourly: unified booking page expects `serviceType.rateType`.
	// Always expose as published+available for getPublished (book by id), even if admin unpublishes
	// the DB row so it stays off the public services grid.
	if (packageItem.id === SYSTEM_HOURLY_TEMPLATE_PACKAGE_ID) {
		return {
			...packageItem,
			isPublished: true,
			isAvailable: true,
			packageServiceType: {
				id: "sys_hourly_iq_svc_type",
				name: "Hourly",
				rateType: "hourly",
			},
			serviceType: { rateType: "hourly" },
		} as typeof packageItem & {
			packageServiceType: { id: string; name: string; rateType: string };
			serviceType: { rateType: string };
		};
	}

	return packageItem;
}
