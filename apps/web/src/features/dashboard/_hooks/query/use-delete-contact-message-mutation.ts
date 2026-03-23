import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useDeleteContactMessageMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(
		(trpc as any).contactMessages.delete.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: (trpc as any).contactMessages.list.queryKey(),
				});
				toast.success("Message deleted successfully");
			},
			onError: (error: any) => {
				toast.error("Failed to delete message", {
					description: error.message,
				});
			},
		}),
	);
};
