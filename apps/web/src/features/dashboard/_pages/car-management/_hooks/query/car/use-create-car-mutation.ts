import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useCreateCarMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(
		trpc.cars.create.mutationOptions({
			onSuccess: (data) => {
				queryClient.invalidateQueries({ queryKey: trpc.cars.list.queryKey() });

				toast.success(`Car ${data?.name} added`);
			},
			onError: (error) => {
				toast.error("Error while adding car", {
					description: error.message,
				});
			},
		}),
	);
};
