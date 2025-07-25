
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import { ResourceListSchema } from "@/utils/query/resource-list";

export const useGetCarModelsWithEnrichedDataQuery = (options: ResourceListSchema) => {
	return useQuery(trpc.carModels.listWithEnrichedData.queryOptions(options));
};
