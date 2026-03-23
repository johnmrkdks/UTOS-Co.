import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useUpdatePackageCategoryMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(
		trpc.packageCategories.update.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.packageCategories.list.queryKey(),
				});
				toast.success("Package category updated successfully");
			},
			onError: (error) => {
				toast.error("Failed to update package category");
				console.error(error);
			},
		}),
	);
};
