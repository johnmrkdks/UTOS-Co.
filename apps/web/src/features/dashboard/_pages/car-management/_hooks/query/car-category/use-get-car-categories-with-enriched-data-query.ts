
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";

export const useGetCarCategoriesWithEnrichedDataQuery = (params: ResourceList) => {
	return useQuery(trpc.carCategories.listWithEnrichedData.queryOptions(params));
};
