import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, putObject } from "@/lib/s3";
import { z } from "zod";
import { ErrorFactory } from "@/utils/error-factory";
import { env } from "cloudflare:workers";
import crypto from "node:crypto";

export const CreatePresignedUrlServiceSchema = z.object({
	fileName: z.string(),
	fileType: z.string(),
	fileSize: z.number(),
});

export type CreatePresignedUrlParams = z.infer<typeof CreatePresignedUrlServiceSchema>;

export async function createPresignedUrlService({ fileName, fileType, fileSize }: CreatePresignedUrlParams) {
    const randomSuffix = crypto.randomBytes(8).toString("hex");
    const key = `${randomSuffix}-${fileName}`;

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

		return {
			url,
			key,
			bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
		};
	} catch (error) {
		throw ErrorFactory.internal("Failed to create presigned URL.");
	}
}
