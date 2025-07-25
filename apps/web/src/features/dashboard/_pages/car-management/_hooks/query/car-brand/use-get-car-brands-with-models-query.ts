import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";

export const useGetCarBrandsWithModelQuery = (params: ResourceList) => {
	return useQuery(trpc.carBrands.listWithModels.queryOptions(params));
};
