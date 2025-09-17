import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useUpdateContactMessageStatusMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.contactMessages.updateStatus.mutationOptions({
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: trpc.contactMessages.list.queryKey() });
			toast.success("Message status updated");
		},
		onError: (error) => {
			toast.error("Failed to update message status", {
				description: error.message,
			});
		},
	}));
};