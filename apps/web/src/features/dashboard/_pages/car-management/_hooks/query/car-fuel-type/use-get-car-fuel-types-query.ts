
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import { ResourceListSchema } from "@/utils/query/resource-list";

export const useGetCarFuelTypesQuery = (options: ResourceListSchema) => {
	return useQuery(trpc.carFuelTypes.list.queryOptions(options));
};
