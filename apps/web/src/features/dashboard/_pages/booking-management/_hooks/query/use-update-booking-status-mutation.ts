import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useUpdateBookingStatusMutation = () => {
	const queryClient = useQueryClient();

	return useMutation(trpc.bookings.updateStatus.mutationOptions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: trpc.bookings.list.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.bookings.listByType.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.bookings.get.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.bookings.getDriverBookings.queryKey() });

			// Shorter, mobile-friendly toast messages
			const statusDisplayNames: Record<string, string> = {
				'driver_en_route': 'En Route',
				'arrived_pickup': 'Arrived',
				'passenger_on_board': 'POB',
				'dropped_off': 'Dropped Off',
				'completed': 'Completed',
				'confirmed': 'Confirmed'
			};
			
			const displayName = statusDisplayNames[data?.status || ''] || data?.status?.replace("_", " ");
			toast.success(`Status: ${displayName}`, {
				duration: 2000, // Shorter duration for mobile
			});
		},
		onError: (error) => {
			toast.error("Update failed", {
				duration: 3000,
			});
		},
	}));
};