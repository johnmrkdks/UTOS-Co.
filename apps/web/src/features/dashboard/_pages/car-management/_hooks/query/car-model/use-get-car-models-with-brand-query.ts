import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";
import { trpc } from "@/trpc";

export const useGetCarModelsWithBrandQuery = (params: ResourceList) => {
	return useQuery(trpc.carModels.listWithBrand.queryOptions(params));
};
