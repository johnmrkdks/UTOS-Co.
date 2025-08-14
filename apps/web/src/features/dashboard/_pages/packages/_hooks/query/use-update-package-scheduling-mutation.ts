import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/trpc";
import { toast } from "sonner";

interface PackageScheduling {
	id: string;
	advanceBookingHours: number;
	cancellationHours: number;
	availableDays: string[];
	availableTimeStart: string;
	availableTimeEnd: string;
	isAvailable: boolean;
}

export const useUpdatePackageSchedulingMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.packages.update.mutationOptions({
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({
				queryKey: trpc.packages.list.queryKey()
			});
			queryClient.invalidateQueries({
				queryKey: trpc.packages.get.queryKey({ id: variables.id })
			});
			toast.success("Package scheduling updated successfully", {
				description: "Availability and booking rules have been saved.",
			});
		},
		onError: (error) => {
			toast.error("Failed to update package scheduling", {
				description: error.message,
			});
		},
	}));
};