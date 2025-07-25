
import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateCarTransmissionTypeMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.carTransmissionTypes.create.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.carTransmissionTypes.list.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.carTransmissionTypes.listWithEnrichedData.queryKey() });

			toast.success(`Transmission type ${data?.name} added`);
		},
		onError: (error) => {
			toast.error("Error while adding transmission type", {
				description: error.message,
			});
		},
	}));
};
