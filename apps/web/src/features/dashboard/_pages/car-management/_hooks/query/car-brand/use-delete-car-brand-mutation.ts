import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useDeleteCarBrandMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(
		trpc.carBrands.delete.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.carBrands.list.queryKey(),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.carBrands.listWithEnrichedData.queryKey(),
				});

				toast.success("Brand deleted");
			},
			onError: (error) => {
				toast.error("Error while deleting brand", {
					description: error.message,
				});
			},
		}),
	);
};
