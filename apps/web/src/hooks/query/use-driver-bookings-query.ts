import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";
import { trpc } from "@/trpc";

interface DriverBookingsParams extends ResourceList {
	driverId?: string;
}

export const useDriverBookingsQuery = (params: DriverBookingsParams) => {
	return useQuery(trpc.bookings.getDriverBookings.queryOptions(params));
};
