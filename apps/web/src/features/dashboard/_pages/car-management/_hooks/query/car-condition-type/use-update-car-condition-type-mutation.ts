
import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useUpdateCarConditionTypeMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.carConditionTypes.update.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.carConditionTypes.list.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.carConditionTypes.listWithEnrichedData.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.carConditionTypes.get.queryKey({ id: data?.id }) });

			toast.success(`Condition type ${data?.name} updated`);
		},
		onError: (error) => {
			toast.error("Error while updating condition type", {
				description: error.message,
			});
		},
	}));
};
