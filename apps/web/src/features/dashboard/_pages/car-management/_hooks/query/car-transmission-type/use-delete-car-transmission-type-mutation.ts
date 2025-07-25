
import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeleteCarTransmissionTypeMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.carTransmissionTypes.delete.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.carTransmissionTypes.list.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.carTransmissionTypes.listWithEnrichedData.queryKey() });

			toast.success(`Transmission type ${data?.name} deleted`);
		},
		onError: (error) => {
			toast.error("Error while deleting transmission type", {
				description: error.message,
			});
		},
	}));
};
