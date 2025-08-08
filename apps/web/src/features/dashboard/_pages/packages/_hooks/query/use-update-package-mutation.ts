import { trpc } from "@/lib/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUpdatePackageMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: trpc.packages.update.mutate,
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["packages"] });
			toast.success("Package updated successfully", {
				description: `"${data.name}" has been updated.`,
			});
		},
		onError: (error) => {
			toast.error("Failed to update package", {
				description: error.message,
			});
		},
	});
}