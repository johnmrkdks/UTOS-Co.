import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";
import { trpc } from "@/trpc";

export const useGetCarConditionTypesWithEnrichedDataQuery = (
	params: ResourceList,
) => {
	return useQuery(
		trpc.carConditionTypes.listWithEnrichedData.queryOptions(params),
	);
};
