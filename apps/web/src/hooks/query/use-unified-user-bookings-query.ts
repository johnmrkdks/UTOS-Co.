import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";
import { trpc } from "@/trpc";

export const useUnifiedUserBookingsQuery = (
	params?: ResourceList & { userId?: string },
) => {
	return useQuery(trpc.bookings.getUserBookings.queryOptions(params || {}));
};
