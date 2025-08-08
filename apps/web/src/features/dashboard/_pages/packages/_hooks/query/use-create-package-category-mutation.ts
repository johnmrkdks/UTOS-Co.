import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function useCreatePackageCategoryMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: {
			name: string;
			description?: string;
			displayOrder?: number;
		}) => {
			return await trpc.packageCategories.create.mutate(data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["package-categories"] });
			toast.success("Package category created successfully");
		},
		onError: (error) => {
			toast.error("Failed to create package category");
			console.error(error);
		},
	});
}