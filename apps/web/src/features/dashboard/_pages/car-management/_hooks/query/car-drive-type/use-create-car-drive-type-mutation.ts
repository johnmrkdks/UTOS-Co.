
import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateCarDriveTypeMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.carDriveTypes.create.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.carDriveTypes.list.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.carDriveTypes.listWithEnrichedData.queryKey() });

			toast.success(`Drive type ${data?.name} added`);
		},
		onError: (error) => {
			toast.error("Error while adding drive type", {
				description: error.message,
			});
		},
	}));
};
