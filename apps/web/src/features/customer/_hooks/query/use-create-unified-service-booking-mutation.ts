import { trpc } from "@/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getOrCreateGuestSession } from "@/utils/auth";

/**
 * Unified service booking mutation that works for both authenticated and guest users
 */
export const useCreateUnifiedServiceBookingMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: {
			packageId: string;
			carId: string;
			originAddress: string;
			originLatitude?: number;
			originLongitude?: number;
			destinationAddress: string;
			destinationLatitude?: number;
			destinationLongitude?: number;
			scheduledPickupTime: Date;
			customerName: string;
			customerPhone: string;
			customerEmail?: string;
			passengerCount: number;
			specialRequests?: string;
		}) => {
			// Ensure we have a session (either authenticated or guest)
			await getOrCreateGuestSession();
			
			// Call the backend createPackageBooking endpoint which already handles both user types
			return await trpc.bookings.createPackageBooking.mutate(input);
		},
		onSuccess: (data) => {
			console.log("✅ Unified booking mutation successful:", data);
			
			// Invalidate relevant queries - handle both authenticated and guest scenarios
			queryClient.invalidateQueries({ queryKey: trpc.bookings.getUserBookings.queryKey() });
			
			toast.success("Service booked successfully", {
				description: `Your booking has been confirmed. We'll contact you shortly.`,
			});
		},
		onError: (error) => {
			console.error("❌ Unified booking mutation failed:", error);
			toast.error("Failed to book service", {
				description: error.message || "An unexpected error occurred. Please try again.",
			});
		},
		onMutate: (variables) => {
			console.log("🔄 Unified booking mutation starting with data:", variables);
		}
	});
};