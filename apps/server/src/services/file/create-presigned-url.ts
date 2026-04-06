import { env } from "cloudflare:workers";
import crypto from "node:crypto";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";
import { putObject, s3Client } from "@/lib/s3";
import { ErrorFactory } from "@/utils/error-factory";

export const CreatePresignedUrlServiceSchema = z.object({
	entityType: z.enum(["cars", "packages", "bookings", "users", "blog"]), // e.g "cars", "package"
	fileName: z.string(),
	fileType: z.string(),
	fileSize: z.number(),
});

export type CreatePresignedUrlParams = z.infer<
	typeof CreatePresignedUrlServiceSchema
>;

export async function createPresignedUrlService({
	entityType,
	fileName,
	fileType,
	fileSize,
}: CreatePresignedUrlParams) {
	const randomSuffix = crypto.randomBytes(8).toString("hex");
	const extension = fileName.split(".").pop();
	let key = "";

	switch (entityType) {
		case "cars":
			key = `${entityType}/car-${randomSuffix}${extension ? `.${extension}` : ""}`;
			break;
		case "packages":
			key = `${entityType}/package-${randomSuffix}${extension ? `.${extension}` : ""}`;
			break;
		case "bookings":
			key = `${entityType}/booking-${randomSuffix}${extension ? `.${extension}` : ""}`;
			break;
		case "users":
			key = `${entityType}/user-${randomSuffix}${extension ? `.${extension}` : ""}`;
			break;
		case "blog":
			key = `${entityType}/post-${randomSuffix}${extension ? `.${extension}` : ""}`;
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

		// Use proxy URL so images load even if R2 public access is disabled
		const baseUrl = env.BETTER_AUTH_URL?.replace(/\/$/, "") || "";
		const imageUrl = baseUrl
			? `${baseUrl}/api/images/${key}`
			: `${env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;

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
