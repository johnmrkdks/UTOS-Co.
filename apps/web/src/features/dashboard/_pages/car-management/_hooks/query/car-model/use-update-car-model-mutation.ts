
import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useUpdateCarModelMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.carModels.update.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.carModels.list.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.carModels.listWithEnrichedData.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.carModels.listWithBrand.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.carModels.get.queryKey({ id: data?.id }) });

			toast.success(`Model ${data?.name} updated`);
		},
		onError: (error) => {
			toast.error("Error while updating model", {
				description: error.message,
			});
		},
	}));
};
