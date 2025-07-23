import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateCarBrandMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.carBrands.create.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.carBrands.listWithEnrichedData.queryKey() });

			toast.success(`Brand ${data?.name!} added`);
		},
		onError: (error) => {
			toast.error("Error while adding brand", {
				description: error.message,
			});
		},
	}));
};
