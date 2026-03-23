import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

/**
 * Create custom booking from quote mutation for authenticated users
 */
export const useCreateCustomBookingFromQuoteMutation = () => {
	return useMutation(
		trpc.bookings.createCustomBookingFromQuote.mutationOptions({
			onMutate: (variables) => {
				console.log(
					"🔄 Custom booking from quote starting with data:",
					variables,
				);
			},
			onSuccess: (data) => {
				console.log("✅ Custom booking from quote successful:", data);

				toast.success("Booking created successfully", {
					description:
						"Your custom booking has been confirmed. We'll contact you shortly.",
				});
			},
			onError: (error) => {
				console.error("❌ Custom booking from quote failed:", error);
				toast.error("Failed to create booking", {
					description:
						error.message || "An unexpected error occurred. Please try again.",
				});
			},
		}),
	);
};

/**
 * Create custom booking from quote as guest (no account required)
 */
export const useCreateCustomBookingFromQuoteAsGuestMutation = () => {
	return useMutation(
		trpc.bookings.createCustomBookingFromQuoteAsGuest.mutationOptions({
			onSuccess: (data) => {
				toast.success("Booking created successfully", {
					description:
						"Your booking has been confirmed. We'll contact you shortly.",
				});
			},
			onError: (error) => {
				toast.error("Failed to create booking", {
					description:
						error.message || "An unexpected error occurred. Please try again.",
				});
			},
		}),
	);
};
