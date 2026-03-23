import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useUpdateContactMessageStatusMutation = (options?: {
	silent?: boolean;
}) => {
	const queryClient = useQueryClient();

	return useMutation(
		(trpc as any).contactMessages.updateStatus.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: (trpc as any).contactMessages.list.queryKey(),
				});
				if (!options?.silent) {
					toast.success("Message status updated");
				}
			},
			onError: (error: any) => {
				toast.error("Failed to update message status", {
					description: error.message,
				});
			},
		}),
	);
};
