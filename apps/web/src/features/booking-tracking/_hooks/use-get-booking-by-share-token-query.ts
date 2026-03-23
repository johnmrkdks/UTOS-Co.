import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc";

export const useGetBookingByShareTokenQuery = (
	shareToken: string | undefined,
) => {
	return useQuery({
		...trpc.bookings.getByShareToken.queryOptions({
			shareToken: shareToken ?? "",
		}),
		enabled: !!shareToken && shareToken.length > 0,
	});
};
