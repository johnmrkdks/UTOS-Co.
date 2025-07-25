
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import type { ResourceList } from "server/types";

export const useGetCarFeaturesWithEnrichedDataQuery = (params: ResourceList) => {
	return useQuery(trpc.carFeatures.listWithEnrichedData.queryOptions(params));
};
