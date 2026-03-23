import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";
import { trpc } from "@/trpc";

export const useGetCarModelsWithEnrichedDataQuery = (params: ResourceList) => {
	return useQuery(trpc.carModels.listWithEnrichedData.queryOptions(params));
};
