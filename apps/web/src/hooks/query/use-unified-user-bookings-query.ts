import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";
import { getOrCreateGuestSession } from "@/utils/auth";

/**
 * Unified user bookings query that works for both authenticated and guest users
 */
export const useUnifiedUserBookingsQuery = (params?: ResourceList & { userId?: string }) => {
	return useQuery({
		queryKey: trpc.bookings.getUnifiedUserBookings.queryKey(params || {}),
		queryFn: async () => {
			// Ensure we have a session (either authenticated or guest)
			await getOrCreateGuestSession();
			
			// Call the unified endpoint
			return await trpc.bookings.getUnifiedUserBookings.query(params || {});
		},
		staleTime: 30 * 1000, // 30 seconds
		refetchOnWindowFocus: false,
	});
};