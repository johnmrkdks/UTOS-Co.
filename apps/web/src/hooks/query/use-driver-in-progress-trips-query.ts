import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";

interface DriverInProgressTripsParams extends ResourceList {
	driverId?: string;
}

export const useDriverInProgressTripsQuery = (params: DriverInProgressTripsParams = { limit: 50 }) => {
	return useQuery(
		trpc.bookings.getDriverBookings.queryOptions({
			...params,
			filters: {
				...params.filters,
				// Only show trips that are currently in progress for this driver
				status: ["driver_assigned", "driver_en_route", "in_progress"],
			},
		})
	);
};