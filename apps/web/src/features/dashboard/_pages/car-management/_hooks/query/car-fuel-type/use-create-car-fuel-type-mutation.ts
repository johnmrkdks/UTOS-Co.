import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useCreateCarFuelTypeMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(
		trpc.carFuelTypes.create.mutationOptions({
			onSuccess: (data) => {
				queryClient.invalidateQueries({
					queryKey: trpc.carFuelTypes.list.queryKey(),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.carFuelTypes.listWithEnrichedData.queryKey(),
				});

				toast.success(`Fuel type ${data?.name} added`);
			},
			onError: (error) => {
				toast.error("Error while adding fuel type", {
					description: error.message,
				});
			},
		}),
	);
};
