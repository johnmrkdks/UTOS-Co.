import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";
import { trpc } from "@/trpc";

export const useGetCarBrandsWithModelQuery = (params: ResourceList) => {
	return useQuery(trpc.carBrands.listWithModels.queryOptions(params));
};
