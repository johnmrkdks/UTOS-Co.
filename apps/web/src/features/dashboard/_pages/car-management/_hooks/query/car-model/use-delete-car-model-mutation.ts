
import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeleteCarModelMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.carModels.delete.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.carModels.list.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.carModels.listWithEnrichedData.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.carModels.listWithBrand.queryKey() });

			toast.success(`Model ${data?.name} deleted`);
		},
		onError: (error) => {
			toast.error("Error while deleting model", {
				description: error.message,
			});
		},
	}));
};
