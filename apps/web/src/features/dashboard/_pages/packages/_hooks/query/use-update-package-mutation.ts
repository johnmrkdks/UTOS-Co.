import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useUpdatePackageMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.packages.update.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.packages.list.queryKey() });
			toast.success("Package updated successfully", {
				description: `"${data?.name}" has been updated.`,
			});
		},
		onError: (error) => {
			toast.error("Failed to update package", {
				description: error.message,
			});
		},
	}));
};
