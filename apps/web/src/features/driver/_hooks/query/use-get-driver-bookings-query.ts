import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";
import { trpc } from "@/trpc";

export const useGetDriverBookingsQuery = (params: ResourceList = {}) => {
	return useQuery(trpc.bookings.getDriverBookings.queryOptions(params));
};
