
import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useUpdateCarFeatureMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.carFeatures.update.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.carFeatures.list.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.carFeatures.listWithEnrichedData.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.carFeatures.get.queryKey({ id: data?.id }) });

			toast.success(`Feature ${data?.name} updated`);
		},
		onError: (error) => {
			toast.error("Error while updating feature", {
				description: error.message,
			});
		},
	}));
};
