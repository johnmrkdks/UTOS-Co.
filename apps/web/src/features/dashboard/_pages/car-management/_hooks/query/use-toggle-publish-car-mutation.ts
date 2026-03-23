import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useTogglePublishCarMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(
		trpc.cars.togglePublish.mutationOptions({
			onSuccess: (data) => {
				queryClient.invalidateQueries({ queryKey: trpc.cars.list.queryKey() });
				queryClient.invalidateQueries({
					queryKey: trpc.cars.listPublished.queryKey(),
				});

				const action = data.isPublished ? "published" : "unpublished";
				toast.success(`Car ${action} successfully`, {
					description: `"${data.name}" has been ${action}.`,
				});
			},
			onError: (error) => {
				toast.error("Failed to update car publication status", {
					description: error.message,
				});
			},
		}),
	);
};
