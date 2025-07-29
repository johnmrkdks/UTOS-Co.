import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "cloudflare:workers"

const SIZE_LIMIT = 1024 * 1024 * 5; // 5MB

export const s3Client = new S3Client({
	region: env.CLOUDFLARE_R2_REGION,
	endpoint: env.CLOUDFLARE_R2_S3_ENDPOINT,
	credentials: {
		accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID,
		secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
	}
});

export function getObject({ key }: { key: string }) {
	return new GetObjectCommand({
		Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
		Key: key
	});
}

type PutObjectBodyParams = {
	contentLength: number;
	contentType: string;
}

type PutObjectParams = {
	key: string;
	body: PutObjectBodyParams;
}
export function putObject({ key, body }: PutObjectParams) {

	if (body.contentType !== "image/jpeg" && body.contentType !== "image/jpg" && body.contentType !== "image/png") {
		throw new Error("Invalid file type, only jpeg and png are supported");
	}

	if (body.contentLength > SIZE_LIMIT) {
		throw new Error("File too large, max size is 5MB");
	}

	return new PutObjectCommand({
		Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
		Key: key,
		ContentLength: body.contentLength,
		ContentType: body.contentType,
	});
}

