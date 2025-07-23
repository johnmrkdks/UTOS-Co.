import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useUpdateCarBrandMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.carBrands.update.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.carBrands.list.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.carBrands.listWithEnrichedData.queryKey() });

			toast.success(`Brand ${data?.name} updated`);
		},
		onError: (error) => {
			toast.error("Error while updating brand", {
				description: error.message,
			});
		},
	}));
};
