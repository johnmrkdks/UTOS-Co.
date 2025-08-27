import { trpc } from "@/trpc";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { getOrCreateGuestSession } from "@/utils/auth";

/**
 * Create custom booking from quote mutation for both authenticated and guest users
 */
export const useCreateCustomBookingFromQuoteMutation = () => {
	return useMutation({
		mutationFn: async (input: {
			userId: string;
			originAddress: string;
			destinationAddress: string;
			scheduledPickupTime: Date;
			estimatedDuration?: number;
			estimatedDistance?: number;
			baseFare: number;
			distanceFare: number;
			timeFare?: number;
			extraCharges: number;
			quotedAmount: number;
			customerName: string;
			customerPhone: string;
			customerEmail?: string;
			passengerCount: number;
			specialRequests?: string;
			preferredCategoryId?: string;
		}) => {
			// Ensure we have a session (either authenticated or guest)
			await getOrCreateGuestSession();
			
			// Call the backend createCustomBookingFromQuote endpoint
			return await trpc.bookings.createCustomBookingFromQuote.mutate(input);
		},
		onSuccess: (data) => {
			console.log("✅ Custom booking from quote successful:", data);
			
			toast.success("Booking created successfully", {
				description: "Your custom booking has been confirmed. We'll contact you shortly.",
			});
		},
		onError: (error) => {
			console.error("❌ Custom booking from quote failed:", error);
			toast.error("Failed to create booking", {
				description: error.message || "An unexpected error occurred. Please try again.",
			});
		},
		onMutate: (variables) => {
			console.log("🔄 Custom booking from quote starting with data:", variables);
		}
	});
};