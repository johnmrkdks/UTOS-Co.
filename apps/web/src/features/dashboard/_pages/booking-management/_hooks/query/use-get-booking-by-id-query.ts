import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

interface UseGetBookingByIdQueryParams {
	id: string;
}

export const useGetBookingByIdQuery = (params: UseGetBookingByIdQueryParams, enabled = true) => {
	return useQuery({
		...trpc.bookings.get.queryOptions(params),
		enabled: enabled && !!params.id,
	});
};