import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeleteDriverMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.drivers.delete.mutationOptions({
		onSuccess: () => {
			// Invalidate both drivers and users queries
			queryClient.invalidateQueries({ queryKey: trpc.drivers.list.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.users.list.queryKey() });
			toast.success("Driver deleted successfully", {
				description: "The driver account has been permanently removed.",
			});
		},
		onError: (error) => {
			toast.error("Failed to delete driver", {
				description: error.message,
			});
		},
	}));
};