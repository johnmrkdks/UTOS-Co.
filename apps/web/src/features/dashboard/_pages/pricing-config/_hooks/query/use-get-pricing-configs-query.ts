import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";
import { trpc } from "@/trpc";

export const useGetPricingConfigsQuery = (
	params: ResourceList & { staleTime?: number },
) => {
	const { staleTime, ...queryParams } = params;

	return useQuery({
		...trpc.pricingConfigs.list.queryOptions(queryParams),
		...(staleTime && { staleTime }),
	});
};
