import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/trpc";

export const useCreateBookingReviewMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: {
			bookingId: string;
			serviceRating: number;
			driverRating: number;
			vehicleRating: number;
			review?: string;
		}) => trpc.bookings.createReview.mutate(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [["analytics"]] });
			queryClient.invalidateQueries({ queryKey: [["bookings"]] });
			queryClient.invalidateQueries({
				queryKey: [["analytics", "getReviewsForCar"]],
			});
			toast.success("Thank you for your review!");
		},
		onError: (error) => {
			toast.error(error.message ?? "Failed to submit review");
		},
	});
};
