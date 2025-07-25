
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import { ResourceListSchema } from "@/utils/query/resource-list";

export const useGetCarTransmissionTypesWithEnrichedDataQuery = (options: ResourceListSchema) => {
	return useQuery(trpc.carTransmissionTypes.listWithEnrichedData.queryOptions(options));
};
