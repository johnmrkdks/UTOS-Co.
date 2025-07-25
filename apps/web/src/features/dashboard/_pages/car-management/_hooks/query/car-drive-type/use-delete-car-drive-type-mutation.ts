
import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeleteCarDriveTypeMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.carDriveTypes.delete.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.carDriveTypes.list.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.carDriveTypes.listWithEnrichedData.queryKey() });

			toast.success(`Drive type ${data?.name} deleted`);
		},
		onError: (error) => {
			toast.error("Error while deleting drive type", {
				description: error.message,
			});
		},
	}));
};
