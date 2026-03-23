import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useCreateCarModelMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(
		trpc.carModels.create.mutationOptions({
			onSuccess: (data) => {
				queryClient.invalidateQueries({
					queryKey: trpc.carModels.list.queryKey(),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.carModels.listWithEnrichedData.queryKey(),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.carModels.listWithBrand.queryKey(),
				});

				toast.success(`Model ${data?.name} added`);
			},
			onError: (error) => {
				toast.error("Error while adding model", {
					description: error.message,
				});
			},
		}),
	);
};
