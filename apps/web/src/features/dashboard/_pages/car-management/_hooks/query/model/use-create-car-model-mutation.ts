import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateCarModelMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.carModels.create.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.carModels.listWithEnrichedData.queryKey() });

			toast.success(`Model ${data?.name!} added`);
		},
		onError: (error) => {
			toast.error("Error while adding model", {
				description: error.message,
			});
		},
	}));
};
