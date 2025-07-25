
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import { ResourceListSchema } from "@/utils/query/resource-list";

export const useGetCarConditionTypesWithEnrichedDataQuery = (options: ResourceListSchema) => {
	return useQuery(trpc.carConditionTypes.listWithEnrichedData.queryOptions(options));
};
