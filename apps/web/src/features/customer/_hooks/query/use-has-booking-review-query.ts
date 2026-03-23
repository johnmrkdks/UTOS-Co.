import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc";

export const useHasBookingReviewQuery = (bookingId: string | undefined) => {
	return useQuery({
		...trpc.bookings.hasReview.queryOptions({ bookingId: bookingId ?? "" }),
		enabled: !!bookingId,
	});
};
