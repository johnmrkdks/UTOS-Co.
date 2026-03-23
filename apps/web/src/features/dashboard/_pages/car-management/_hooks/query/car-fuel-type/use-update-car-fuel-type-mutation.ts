import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useUpdateCarFuelTypeMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(
		trpc.carFuelTypes.update.mutationOptions({
			onSuccess: (data) => {
				queryClient.invalidateQueries({
					queryKey: trpc.carFuelTypes.list.queryKey(),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.carFuelTypes.listWithEnrichedData.queryKey(),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.carFuelTypes.get.queryKey({ id: data?.id }),
				});

				toast.success(`Fuel type ${data?.name} updated`);
			},
			onError: (error) => {
				toast.error("Error while updating fuel type", {
					description: error.message,
				});
			},
		}),
	);
};
