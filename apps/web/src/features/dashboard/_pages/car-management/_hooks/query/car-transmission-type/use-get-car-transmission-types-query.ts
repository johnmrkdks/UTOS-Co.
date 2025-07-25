
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import { ResourceListSchema } from "@/utils/query/resource-list";

export const useGetCarTransmissionTypesQuery = (options: ResourceListSchema) => {
	return useQuery(trpc.carTransmissionTypes.list.queryOptions(options));
};
