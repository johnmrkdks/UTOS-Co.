import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";

interface GetCarsParams extends ResourceList {
	enabled?: boolean;
}

export const useGetCarsQuery = (params: GetCarsParams) => {
	const { enabled, ...queryParams } = params;
	return useQuery({
		...trpc.cars.list.queryOptions(queryParams),
		enabled: enabled !== false  // Default to true unless explicitly false
	});
};
