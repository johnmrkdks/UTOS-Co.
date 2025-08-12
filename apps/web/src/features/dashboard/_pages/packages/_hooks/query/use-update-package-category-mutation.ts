import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/trpc";
import { toast } from "sonner";

export const useUpdatePackageCategoryMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.packageCategories.update.mutationOptions({
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: trpc.packageCategories.list.queryKey() });
			toast.success("Package category updated successfully");
		},
		onError: (error) => {
			toast.error("Failed to update package category");
			console.error(error);
		},
	}));
};
