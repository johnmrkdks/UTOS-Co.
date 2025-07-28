
import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useUpdateCarCategoryMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.carCategories.update.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.carCategories.list.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.carCategories.listWithEnrichedData.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.carCategories.get.queryKey({ id: data?.id }) });

			toast.success(`Category ${data?.name} updated`);
		},
		onError: (error) => {
			toast.error("Error while updating category", {
				description: error.message,
			});
		},
	}));
};
