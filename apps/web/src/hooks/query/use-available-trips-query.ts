import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";
import { trpc } from "@/trpc";

interface AvailableTripsParams extends ResourceList {
	// Available trips are bookings that need drivers but haven't been assigned yet
	status?: "confirmed" | "pending";
}

export const useAvailableTripsQuery = (
	params: AvailableTripsParams = { limit: 50 },
) => {
	return useQuery(
		trpc.bookings.getAvailableTrips.queryOptions({
			...params,
			status: params.status || "confirmed",
		}),
	);
};
