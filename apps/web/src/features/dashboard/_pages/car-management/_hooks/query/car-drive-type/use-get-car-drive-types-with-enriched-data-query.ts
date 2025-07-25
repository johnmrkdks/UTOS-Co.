
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import { ResourceListSchema } from "@/utils/query/resource-list";

export const useGetCarDriveTypesWithEnrichedDataQuery = (options: ResourceListSchema) => {
	return useQuery(trpc.carDriveTypes.listWithEnrichedData.queryOptions(options));
};
