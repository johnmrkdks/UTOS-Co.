
import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useUpdateCarBodyTypeMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.carBodyTypes.update.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.carBodyTypes.list.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.carBodyTypes.listWithEnrichedData.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.carBodyTypes.get.queryKey({ id: data?.id }) });

			toast.success(`Body type ${data?.name} updated`);
		},
		onError: (error) => {
			toast.error("Error while updating body type", {
				description: error.message,
			});
		},
	}));
};
