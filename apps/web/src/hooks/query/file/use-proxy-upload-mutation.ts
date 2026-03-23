import { useMutation } from "@tanstack/react-query";

const getServerUrl = () => import.meta.env.VITE_SERVER_URL || "";

export function useProxyUploadMutation() {
	return useMutation({
		mutationFn: async ({
			entityType,
			file,
		}: {
			entityType: "cars" | "packages" | "bookings" | "users";
			file: File;
		}) => {
			const formData = new FormData();
			formData.append("file", file);

			const response = await fetch(
				`${getServerUrl()}/api/upload/${entityType}`,
				{
					method: "POST",
					body: formData,
					credentials: "include",
				},
			);

			if (!response.ok) {
				const data = await response.json().catch(() => ({}));
				throw new Error(
					data.error ||
						`Upload failed: ${response.status} ${response.statusText}`,
				);
			}

			return response.json() as Promise<{
				imageUrl: string;
				key: string;
				bucket: string;
			}>;
		},
	});
}
