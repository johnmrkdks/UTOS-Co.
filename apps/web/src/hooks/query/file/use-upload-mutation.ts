import { useMutation } from "@tanstack/react-query";

export function useUploadMutation() {
	return useMutation({
		mutationFn: async ({ url, file }: { url: string; file: File }) => {
			const response = await fetch(url, {
				method: "PUT",
				body: file,
				headers: {
					"Content-Type": file.type,
				},
			});
			if (!response.ok) {
				throw new Error(
					`Upload failed: ${response.status} ${response.statusText}`,
				);
			}
			return response;
		},
	});
}
