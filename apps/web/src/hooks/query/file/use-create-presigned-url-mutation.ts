import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/trpc";

export function useCreatePresignedUrlMutation() {
	return useMutation(trpc.files.createPresignedUrl.mutationOptions());
}
