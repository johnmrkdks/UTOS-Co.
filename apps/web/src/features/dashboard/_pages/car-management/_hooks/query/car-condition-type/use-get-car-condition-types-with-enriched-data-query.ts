
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";

export const useGetCarConditionTypesWithEnrichedDataQuery = (params: ResourceList) => {
	return useQuery(trpc.carConditionTypes.listWithEnrichedData.queryOptions(params));
};
