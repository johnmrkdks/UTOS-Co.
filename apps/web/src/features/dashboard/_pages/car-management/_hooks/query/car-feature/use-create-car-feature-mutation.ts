
import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateCarFeatureMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.carFeatures.create.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.carFeatures.list.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.carFeatures.listWithEnrichedData.queryKey() });

			toast.success(`Feature ${data?.name} added`);
		},
		onError: (error) => {
			toast.error("Error while adding feature", {
				description: error.message,
			});
		},
	}));
};
