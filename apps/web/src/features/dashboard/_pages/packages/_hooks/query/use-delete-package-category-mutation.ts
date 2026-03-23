import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useDeletePackageCategoryMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(
		trpc.packageCategories.delete.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.packageCategories.list.queryKey(),
				});
				toast.success("Package category deleted successfully");
			},
			onError: (error) => {
				toast.error("Failed to delete package category");
				console.error(error);
			},
		}),
	);
};
