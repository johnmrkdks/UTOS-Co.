
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import { ResourceListSchema } from "@/utils/query/resource-list";

export const useGetCarModelsWithBrandQuery = (options: ResourceListSchema) => {
	return useQuery(trpc.carModels.listWithBrand.queryOptions(options));
};
