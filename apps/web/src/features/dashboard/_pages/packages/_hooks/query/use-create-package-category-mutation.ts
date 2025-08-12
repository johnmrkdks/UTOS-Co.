import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/trpc";
import { toast } from "sonner";

export const useCreatePackageCategoryMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.packageCategories.create.mutationOptions({
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: trpc.packageCategories.list.queryKey() });
			toast.success("Package category created successfully");
		},
		onError: (error) => {
			toast.error("Failed to create package category");
			console.error(error);
		},
	}));
};
