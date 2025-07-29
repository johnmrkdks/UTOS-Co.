import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";

export function useCreatePresignedUrlMutation() {
	return useMutation(trpc.files.createPresignedUrl.mutationOptions());
}
