import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

export const useHasBookingReviewQuery = (bookingId: string | undefined) => {
	return useQuery({
		...trpc.bookings.hasReview.queryOptions({ bookingId: bookingId ?? "" }),
		enabled: !!bookingId,
	});
};
