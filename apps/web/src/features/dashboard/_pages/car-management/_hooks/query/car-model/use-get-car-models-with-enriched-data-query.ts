
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";

export const useGetCarModelsWithEnrichedDataQuery = (params: ResourceList) => {
	return useQuery(trpc.carModels.listWithEnrichedData.queryOptions(params));
};
