
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";

export const useGetCarModelsWithBrandQuery = (params: ResourceList) => {
	return useQuery(trpc.carModels.listWithBrand.queryOptions(params));
};
