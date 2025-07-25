
import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useUpdateCarTransmissionTypeMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.carTransmissionTypes.update.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.carTransmissionTypes.list.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.carTransmissionTypes.listWithEnrichedData.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.carTransmissionTypes.get.queryKey({ id: data?.id }) });

			toast.success(`Transmission type ${data?.name} updated`);
		},
		onError: (error) => {
			toast.error("Error while updating transmission type", {
				description: error.message,
			});
		},
	}));
};
