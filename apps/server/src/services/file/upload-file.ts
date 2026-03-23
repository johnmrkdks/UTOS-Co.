import { env } from "cloudflare:workers";
import crypto from "node:crypto";

const SIZE_LIMIT = 1024 * 1024 * 5; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

export type UploadFileParams = {
	entityType: "cars" | "packages" | "bookings" | "users";
	fileName: string;
	fileType: string;
	fileSize: number;
	body: ArrayBuffer | Blob;
};

export async function uploadFileService({
	entityType,
	fileName,
	fileType,
	fileSize,
	body,
}: UploadFileParams) {
	if (!ALLOWED_TYPES.includes(fileType)) {
		throw new Error("Invalid file type, only jpeg and png are supported");
	}
	if (fileSize > SIZE_LIMIT) {
		throw new Error("File too large, max size is 5MB");
	}

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
	}

	const buffer = body instanceof ArrayBuffer ? new Uint8Array(body) : new Uint8Array(await (body as Blob).arrayBuffer());

	// Use R2 binding directly (avoids AWS SDK's DOMParser which doesn't exist in Workers)
	await env.BUCKET.put(key, buffer, {
		httpMetadata: { contentType: fileType },
	});

	// Use proxy URL so images work even if R2 public access is disabled
	const baseUrl = env.BETTER_AUTH_URL?.replace(/\/$/, "") || "";
	const imageUrl = baseUrl ? `${baseUrl}/api/images/${key}` : `${env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;

	return {
		imageUrl,
		key,
		bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
	};
}
