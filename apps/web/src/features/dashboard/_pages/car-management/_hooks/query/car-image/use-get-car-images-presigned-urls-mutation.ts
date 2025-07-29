import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";

export const useGetCarImagesPresignedUrlsMutation = () => {
	return useMutation(trpc.carImages.getPresignedUrls.mutationOptions());
};
