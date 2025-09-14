import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";

export const useGetDriverBookingsQuery = (params: ResourceList = {}) => {
	return useQuery(trpc.bookings.getDriverBookings.queryOptions(params));
};