
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import { ResourceListSchema } from "@/utils/query/resource-list";

export const useGetCarFeaturesWithEnrichedDataQuery = (options: ResourceListSchema) => {
	return useQuery(trpc.carFeatures.listWithEnrichedData.queryOptions(options));
};
