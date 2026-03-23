import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useDeleteCarBodyTypeMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(
		trpc.carBodyTypes.delete.mutationOptions({
			onSuccess: (data) => {
				queryClient.invalidateQueries({
					queryKey: trpc.carBodyTypes.list.queryKey(),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.carBodyTypes.listWithEnrichedData.queryKey(),
				});

				toast.success(`Body type ${data?.name} deleted`);
			},
			onError: (error) => {
				toast.error("Error while deleting body type", {
					description: error.message,
				});
			},
		}),
	);
};
