import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc";

interface UseGetBookingByIdQueryParams {
	id: string;
}

export const useGetBookingByIdQuery = (
	params: UseGetBookingByIdQueryParams,
	enabled = true,
) => {
	return useQuery({
		...trpc.bookings.get.queryOptions(params),
		enabled: enabled && !!params.id,
	});
};
