import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useCreateCarBodyTypeMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(
		trpc.carBodyTypes.create.mutationOptions({
			onSuccess: (data) => {
				queryClient.invalidateQueries({
					queryKey: trpc.carBodyTypes.list.queryKey(),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.carBodyTypes.listWithEnrichedData.queryKey(),
				});

				toast.success(`Body type ${data?.name} added`);
			},
			onError: (error) => {
				toast.error("Error while adding body type", {
					description: error.message,
				});
			},
		}),
	);
};
