
import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateCarConditionTypeMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.carConditionTypes.create.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.carConditionTypes.list.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.carConditionTypes.listWithEnrichedData.queryKey() });

			toast.success(`Condition type ${data?.name} added`);
		},
		onError: (error) => {
			toast.error("Error while adding condition type", {
				description: error.message,
			});
		},
	}));
};
