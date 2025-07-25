
import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeleteCarImageMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.carImages.delete.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.carImages.list.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.cars.listWithEnrichedData.queryKey() });

			toast.success(`Image ${data?.id} deleted`);
		},
		onError: (error) => {
			toast.error("Error while deleting image", {
				description: error.message,
			});
		},
	}));
};
