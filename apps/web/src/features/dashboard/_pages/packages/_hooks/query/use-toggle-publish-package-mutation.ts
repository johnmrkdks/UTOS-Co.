import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useTogglePublishPackageMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.packages.togglePublish.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.packages.list.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.packages.listPublished.queryKey() });
			
			const action = data.isPublished ? "published" : "unpublished";
			toast.success(`Package ${action} successfully`, {
				description: `"${data.name}" has been ${action}.`,
			});
		},
		onError: (error) => {
			toast.error("Failed to update package publication status", {
				description: error.message,
			});
		},
	}));
};