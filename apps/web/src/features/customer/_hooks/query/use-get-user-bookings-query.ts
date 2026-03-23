import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";
import { trpc } from "@/trpc";

export const useGetUserBookingsQuery = (
	params: ResourceList & { userId?: string },
) => {
	return useQuery(trpc.bookings.getUnifiedUserBookings.queryOptions(params));
};
