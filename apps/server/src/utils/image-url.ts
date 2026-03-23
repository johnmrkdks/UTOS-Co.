/**
 * Transform R2 image URLs to proxy URLs so images load even when R2 public access is disabled.
 */
export function toProxyImageUrl(
	url: string | null | undefined,
	baseUrl: string,
): string | null | undefined {
	if (!url || !baseUrl) return url;
	const base = baseUrl.replace(/\/$/, "");
	if (url.startsWith(`${base}/api/images/`)) return url;
	try {
		const urlObj = new URL(url);
		if (
			urlObj.hostname.includes("r2.dev") ||
			urlObj.hostname.includes("r2.cloudflarestorage")
		) {
			const key = urlObj.pathname.replace(/^\//, "");
			return `${base}/api/images/${key}`;
		}
	} catch {
		// ignore invalid URLs
	}
	return url;
}

export function transformCarImages<T extends Record<string, unknown>>(
	car: T,
	baseUrl: string,
): T {
	const carWithImages = car as unknown as {
		images?: Array<{ url?: string | null }>;
	};
	if (
		!car ||
		!Array.isArray(carWithImages?.images) ||
		carWithImages.images.length === 0
	)
		return car;
	const images = carWithImages.images;
	const transformedImages = images.map((img) => ({
		...img,
		url: toProxyImageUrl(img.url, baseUrl) ?? img.url,
	}));
	const firstUrl = transformedImages[0]?.url;
	return {
		...car,
		images: transformedImages,
		...(firstUrl !== undefined && { imageUrl: firstUrl }),
	} as T;
}
