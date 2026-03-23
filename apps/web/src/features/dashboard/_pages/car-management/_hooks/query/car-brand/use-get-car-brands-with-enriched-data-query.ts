import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";
import { trpc } from "@/trpc";

export const useGetCarBrandsWithEnrichedDataQuery = (params: ResourceList) => {
	return useQuery(trpc.carBrands.listWithEnrichedData.queryOptions(params));
};
