import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function useDeletePackageCategoryMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: { id: string }) => {
			return await trpc.packageCategories.delete.mutate(data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["package-categories"] });
			toast.success("Package category deleted successfully");
		},
		onError: (error) => {
			toast.error("Failed to delete package category");
			console.error(error);
		},
	});
}