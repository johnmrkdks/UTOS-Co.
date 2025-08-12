import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useUpdateDriverMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.drivers.update.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.drivers.list.queryKey() });
			toast.success("Driver updated successfully", {
				description: `Driver information has been updated.`,
			});
		},
		onError: (error) => {
			toast.error("Failed to update driver", {
				description: error.message,
			});
		},
	}));
};
