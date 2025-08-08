import { trpc } from "@/lib/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUpdateDriverMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: trpc.drivers.update.mutate,
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["drivers"] });
			toast.success("Driver updated successfully", {
				description: `Driver information has been updated.`,
			});
		},
		onError: (error) => {
			toast.error("Failed to update driver", {
				description: error.message,
			});
		},
	});
}