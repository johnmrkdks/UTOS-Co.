import { trpc } from "@/lib/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useDeletePackageMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: trpc.packages.delete.mutate,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["packages"] });
			toast.success("Package deleted successfully");
		},
		onError: (error) => {
			toast.error("Failed to delete package", {
				description: error.message,
			});
		},
	});
}