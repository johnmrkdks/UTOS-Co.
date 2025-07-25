
import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useUpdateCarMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.cars.update.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.cars.list.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.cars.get.queryKey({ id: data?.id }) });

			toast.success(`Car ${data?.name} updated`);
		},
		onError: (error) => {
			toast.error("Error while updating car", {
				description: error.message,
			});
		},
	}));
};
