import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeleteCarFuelTypeMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.carFuelTypes.delete.mutationOptions({
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: trpc.carFuelTypes.list.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.carFuelTypes.listWithEnrichedData.queryKey() });

			toast.success("Fuel type deleted");
		},
		onError: (error) => {
			toast.error("Error while deleting fuel type", {
				description: error.message,
			});
		},
	}));
};
