import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useUpdateCarDriveTypeMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(
		trpc.carDriveTypes.update.mutationOptions({
			onSuccess: (data) => {
				queryClient.invalidateQueries({
					queryKey: trpc.carDriveTypes.list.queryKey(),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.carDriveTypes.listWithEnrichedData.queryKey(),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.carDriveTypes.get.queryKey({ id: data?.id }),
				});

				toast.success(`Drive type ${data?.name} updated`);
			},
			onError: (error) => {
				toast.error("Error while updating drive type", {
					description: error.message,
				});
			},
		}),
	);
};
