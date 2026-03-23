import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/trpc";

export const useGetCarImagesPresignedUrlsMutation = () => {
	return useMutation(trpc.carImages.getPresignedUrls.mutationOptions());
};
