import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function useUpdatePackageCategoryMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: {
			id: string;
			name: string;
			description?: string;
			displayOrder?: number;
		}) => {
			return await trpc.packageCategories.update.mutate(data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["package-categories"] });
			toast.success("Package category updated successfully");
		},
		onError: (error) => {
			toast.error("Failed to update package category");
			console.error(error);
		},
	});
}