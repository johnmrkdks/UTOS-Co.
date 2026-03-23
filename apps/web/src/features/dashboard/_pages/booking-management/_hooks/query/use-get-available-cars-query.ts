import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";
import { trpc } from "@/trpc";

interface AvailableCarsParams extends ResourceList {
	scheduledPickupTime?: string;
	estimatedDuration?: number;
	enabled?: boolean;
}

export const useGetAvailableCarsQuery = (params: AvailableCarsParams) => {
	const { enabled, ...queryParams } = params;
	return useQuery({
		...trpc.cars.listAvailable.queryOptions(queryParams),
		enabled: enabled !== false, // Default to true unless explicitly false
	});
};
