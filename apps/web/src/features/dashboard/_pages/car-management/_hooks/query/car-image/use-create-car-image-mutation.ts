
import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateCarImageMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.carImages.create.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.carImages.list.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.cars.listWithEnrichedData.queryKey() });

			toast.success(`Image ${data?.id} added`);
		},
		onError: (error) => {
			toast.error("Error while adding image", {
				description: error.message,
			});
		},
	}));
};
