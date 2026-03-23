import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useDeleteCarCategoryMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(
		trpc.carCategories.delete.mutationOptions({
			onSuccess: (data) => {
				queryClient.invalidateQueries({
					queryKey: trpc.carCategories.list.queryKey(),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.carCategories.listWithEnrichedData.queryKey(),
				});

				toast.success(`Category ${data?.name} deleted`);
			},
			onError: (error) => {
				toast.error("Error while deleting category", {
					description: error.message,
				});
			},
		}),
	);
};
