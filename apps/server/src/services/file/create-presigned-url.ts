import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, putObject } from "@/lib/s3";
import { z } from "zod";
import { ErrorFactory } from "@/utils/error-factory";
import { env } from "cloudflare:workers";
import crypto from "node:crypto";

export const CreatePresignedUrlServiceSchema = z.object({
	entityType: z.enum(["cars", "packages", "bookings", "users"]), // e.g "cars", "package"
	fileName: z.string(),
	fileType: z.string(),
	fileSize: z.number(),
});

export type CreatePresignedUrlParams = z.infer<typeof CreatePresignedUrlServiceSchema>;

export async function createPresignedUrlService({ entityType, fileName, fileType, fileSize }: CreatePresignedUrlParams) {
	const randomSuffix = crypto.randomBytes(8).toString("hex");
	let key = ""

	switch (entityType) {
		case "cars":
			key = `${entityType}/car-${randomSuffix}`;
			break;
		case "packages":
			key = `${entityType}/package-${randomSuffix}`;
			break;
		case "bookings":
			key = `${entityType}/booking-${randomSuffix}`;
			break;
		case "users":
			key = `${entityType}/user-${randomSuffix}`;
			break;
	}

	const putCommand = putObject({
		key,
		body: {
			contentType: fileType,
			contentLength: fileSize,
		},
	});

	try {
		const url = await getSignedUrl(s3Client, putCommand, {
			expiresIn: 60 * 5, // 5 minutes
		});

		const imageUrl = `${env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;

		return {
			url,
			imageUrl,
			key,
			bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
		};
	} catch (error) {
		throw ErrorFactory.internal("Failed to create presigned URL.");
	}
}
