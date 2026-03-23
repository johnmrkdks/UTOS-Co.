import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useDeleteCarConditionTypeMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(
		trpc.carConditionTypes.delete.mutationOptions({
			onSuccess: (data) => {
				queryClient.invalidateQueries({
					queryKey: trpc.carConditionTypes.list.queryKey(),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.carConditionTypes.listWithEnrichedData.queryKey(),
				});

				toast.success(`Condition type ${data?.name} deleted`);
			},
			onError: (error) => {
				toast.error("Error while deleting condition type", {
					description: error.message,
				});
			},
		}),
	);
};
