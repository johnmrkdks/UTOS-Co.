import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreatePackageMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.packages.create.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.packages.list.queryKey() });
			toast.success("Package created successfully", {
				description: `"${data?.name}" has been added to your packages.`,
			});
		},
		onError: (error) => {
			toast.error("Failed to create package", {
				description: error.message,
			});
		},
	}));
};
