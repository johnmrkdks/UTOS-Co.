
import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeleteCarMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.cars.delete.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.cars.list.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.cars.listWithEnrichedData.queryKey() });

			toast.success(`Car ${data?.name} deleted`);
		},
		onError: (error) => {
			toast.error("Error while deleting car", {
				description: error.message,
			});
		},
	}));
};
