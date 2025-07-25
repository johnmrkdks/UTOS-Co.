
import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useUpdateCarImageMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.carImages.update.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.carImages.list.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.carImages.get.queryKey({ id: data?.id }) });
			queryClient.invalidateQueries({ queryKey: trpc.cars.listWithEnrichedData.queryKey() });

			toast.success(`Image ${data?.id} updated`);
		},
		onError: (error) => {
			toast.error("Error while updating image", {
				description: error.message,
			});
		},
	}));
};
