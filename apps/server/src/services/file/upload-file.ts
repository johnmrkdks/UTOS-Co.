import { env } from "cloudflare:workers";
import crypto from "node:crypto";

const SIZE_LIMIT = 1024 * 1024 * 5; // 5MB
const ALLOWED_TYPES = [
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/webp",
	"image/gif",
] as const;

const EXT_TO_MIME: Record<string, (typeof ALLOWED_TYPES)[number]> = {
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	png: "image/png",
	webp: "image/webp",
	gif: "image/gif",
};

/** Browsers (esp. Windows) often send an empty `type` for picked files; infer from extension. */
function resolveImageMimeType(fileName: string, reportedType: string): string {
	const trimmed = reportedType?.trim();
	if (trimmed && (ALLOWED_TYPES as readonly string[]).includes(trimmed)) {
		return trimmed;
	}
	const ext = fileName.split(".").pop()?.toLowerCase();
	if (ext && ext in EXT_TO_MIME) {
		return EXT_TO_MIME[ext];
	}
	return "";
}

export type UploadFileParams = {
	entityType: "cars" | "packages" | "bookings" | "users" | "blog";
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
	const effectiveType = resolveImageMimeType(fileName, fileType);
	if (!(ALLOWED_TYPES as readonly string[]).includes(effectiveType)) {
		throw new Error(
			"Invalid file type; use JPEG, PNG, WebP, or GIF (or rename the file with a correct extension).",
		);
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
		case "blog":
			key = `${entityType}/post-${randomSuffix}${extension ? `.${extension}` : ""}`;
			break;
	}

	const buffer =
		body instanceof ArrayBuffer
			? new Uint8Array(body)
			: new Uint8Array(await (body as Blob).arrayBuffer());

	// Use R2 binding directly (avoids AWS SDK's DOMParser which doesn't exist in Workers)
	await env.BUCKET.put(key, buffer, {
		httpMetadata: { contentType: effectiveType },
	});

	// Use proxy URL so images work even if R2 public access is disabled
	const baseUrl = env.BETTER_AUTH_URL?.replace(/\/$/, "") || "";
	const imageUrl = baseUrl
		? `${baseUrl}/api/images/${key}`
		: `${env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;

	return {
		imageUrl,
		key,
		bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
	};
}
