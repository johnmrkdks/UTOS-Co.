import { useMutation } from "@tanstack/react-query";

function getApiBaseUrl(): string {
	const raw = import.meta.env.VITE_SERVER_URL?.trim() ?? "";
	return raw.replace(/\/$/, "");
}

function parseUploadJson(raw: unknown): {
	imageUrl: string;
	key: string;
	bucket: string;
} {
	if (raw === null || typeof raw !== "object") {
		throw new Error("Invalid upload response: expected JSON object");
	}
	const o = raw as Record<string, unknown>;
	const imageUrl = o.imageUrl;
	if (typeof imageUrl !== "string" || !imageUrl.trim()) {
		throw new Error(
			"Invalid upload response: missing imageUrl. Check API / R2 binding and redeploy the server worker.",
		);
	}
	try {
		new URL(imageUrl);
	} catch {
		throw new Error(
			`Invalid upload response: not a URL (${imageUrl.slice(0, 80)}…)`,
		);
	}
	return {
		imageUrl: imageUrl.trim(),
		key: typeof o.key === "string" ? o.key : "",
		bucket: typeof o.bucket === "string" ? o.bucket : "",
	};
}

export function useProxyUploadMutation() {
	return useMutation({
		mutationFn: async ({
			entityType,
			file,
		}: {
			entityType: "cars" | "packages" | "bookings" | "users" | "blog";
			file: File;
		}) => {
			const base = getApiBaseUrl();
			if (!base) {
				throw new Error(
					"VITE_SERVER_URL is not set — uploads must target the API. Add it to apps/web/.env (e.g. http://localhost:3000).",
				);
			}

			const formData = new FormData();
			formData.append("file", file);

			const response = await fetch(`${base}/api/upload/${entityType}`, {
				method: "POST",
				body: formData,
				credentials: "include",
			});

			const text = await response.text();
			if (!response.ok) {
				let message = `Upload failed (${response.status} ${response.statusText})`;
				try {
					const parsed = JSON.parse(text) as { error?: string };
					if (parsed.error) message = parsed.error;
				} catch {
					if (text.length > 0 && text.length < 200) {
						message = `${message}: ${text}`;
					}
				}
				if (response.status === 401) {
					message = `${message} — sign in again, or ensure the API URL matches your site (VITE_SERVER_URL).`;
				}
				throw new Error(message);
			}

			let json: unknown;
			try {
				json = text ? JSON.parse(text) : {};
			} catch {
				throw new Error(
					`Upload succeeded but response was not JSON (${text.slice(0, 120)}…)`,
				);
			}

			return parseUploadJson(json);
		},
	});
}
