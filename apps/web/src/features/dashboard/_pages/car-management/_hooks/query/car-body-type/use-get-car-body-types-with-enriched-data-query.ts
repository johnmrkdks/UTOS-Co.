
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import { ResourceListSchema } from "@/utils/query/resource-list";

export const useGetCarBodyTypesWithEnrichedDataQuery = (options: ResourceListSchema) => {
	return useQuery(trpc.carBodyTypes.listWithEnrichedData.queryOptions(options));
};
