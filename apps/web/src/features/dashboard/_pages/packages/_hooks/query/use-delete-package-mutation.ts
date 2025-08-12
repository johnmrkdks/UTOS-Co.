import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeletePackageMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.packages.delete.mutationOptions({
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: trpc.packages.list.queryKey()
			});
			toast.success("Package deleted successfully");
		},
		onError: () => {
			toast.error("Failed to delete package");
		},
	}));
};
