import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useDeleteCarFeatureMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(
		trpc.carFeatures.delete.mutationOptions({
			onSuccess: (data) => {
				queryClient.invalidateQueries({
					queryKey: trpc.carFeatures.list.queryKey(),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.carFeatures.listWithEnrichedData.queryKey(),
				});

				toast.success(`Feature ${data?.name} deleted`);
			},
			onError: (error) => {
				toast.error("Error while deleting feature", {
					description: error.message,
				});
			},
		}),
	);
};
