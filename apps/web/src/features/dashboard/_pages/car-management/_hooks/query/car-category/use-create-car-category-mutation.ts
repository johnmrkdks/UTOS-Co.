
import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateCarCategoryMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.carCategories.create.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.carCategories.list.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.carCategories.listWithEnrichedData.queryKey() });

			toast.success(`Category ${data?.name} added`);
		},
		onError: (error) => {
			toast.error("Error while adding category", {
				description: error.message,
			});
		},
	}));
};
